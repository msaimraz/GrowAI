import {
  DiagnosisInput,
  DiagnosisResponse,
  PossibleCondition,
  PrimaryClassification,
  FollowUpQuestion,
} from '@/types/diagnosis';
import {
  PLANT_HEALTH_KB,
  getConditionById,
  getConditionsForPlantSlug,
  searchConditionsBySymptom,
} from '@/data/plant-health-kb';
import type { PlantHealthCondition } from '@/types/health';

/**
 * Educational Agronomic Heuristic Diagnostic Engine
 *
 * Grounded in the GrowAI Plant Health Knowledge Base.
 * Serves as an offline/fallback botanical reasoning engine when
 * external AI vision services are unconfigured, unreachable, or
 * when the grower explicitly opts for heuristic symptom matching.
 */
export async function diagnoseWithHeuristics(
  input: DiagnosisInput,
  hasPhoto: boolean = false
): Promise<DiagnosisResponse> {
  const query = (input.symptoms || '').toLowerCase().trim();
  const plantName =
    input.plantName || (input.plantSlug ? input.plantSlug.replace('-', ' ') : 'Botanical specimen');

  const envText = [
    input.wateringFrequency,
    input.sunlight,
    input.temperature,
    input.soilInfo,
    input.environment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 1. Gather potential matches from Knowledge Base with relevance scoring
  const scores = new Map<string, number>();

  function addScore(id: string, points: number) {
    const cur = scores.get(id) || 0;
    scores.set(id, cur + points);
  }

  // A. Hallmark symptom patterns (high diagnostic specificity)
  if (
    query.includes('web') ||
    query.includes('mite') ||
    query.includes('stipple') ||
    query.includes('silk') ||
    query.includes('speck')
  ) {
    addScore('pest-spider-mites', 40);
    addScore('pest-thrips', 18);
    addScore('pest-aphids', 10);
  }

  if (
    query.includes('powder') ||
    query.includes('flour') ||
    query.includes('white coating') ||
    query.includes('mildew') ||
    (query.includes('white') && query.includes('dust'))
  ) {
    addScore('disease-powdery-mildew', 40);
    addScore('disease-downy-mildew', 16);
    addScore('pest-mealybugs', 10);
  }

  if (
    query.includes('mushy') ||
    query.includes('black stem') ||
    query.includes('decay') ||
    (query.includes('root') && query.includes('rot'))
  ) {
    addScore('disease-root-rot', 40);
    addScore('abiotic-overwatering-stress', 25);
    addScore('disease-fusarium-wilt', 15);
  }

  if (
    query.includes('interveinal') ||
    (query.includes('vein') && query.includes('green') && query.includes('yellow'))
  ) {
    addScore('abiotic-iron-deficiency', 35);
    addScore('abiotic-magnesium-deficiency', 30);
    addScore('abiotic-nitrogen-deficiency', 10);
  }

  if (
    query.includes('crispy') ||
    query.includes('tip burn') ||
    query.includes('brown edge') ||
    query.includes('scorched tip')
  ) {
    addScore('abiotic-tipburn', 35);
    addScore('abiotic-potassium-deficiency', 20);
    addScore('abiotic-sun-scorch', 18);
  }

  if (
    query.includes('aphid') ||
    query.includes('honeydew') ||
    query.includes('sticky') ||
    query.includes('cluster')
  ) {
    addScore('pest-aphids', 40);
    addScore('pest-whiteflies', 20);
    addScore('pest-mealybugs', 15);
  }

  if (
    query.includes('concentric') ||
    query.includes('bullseye') ||
    query.includes('target') ||
    query.includes('early blight')
  ) {
    addScore('disease-early-blight', 40);
    addScore('disease-septoria-leaf-spot', 25);
    addScore('disease-bacterial-leaf-spot', 20);
  }

  // B. Secondary / non-specific symptoms (moderate diagnostic weight)
  if (query.includes('yellow') || query.includes('chlorosis') || query.includes('pale')) {
    if (
      envText.includes('frequent') ||
      envText.includes('daily') ||
      envText.includes('wet') ||
      envText.includes('soggy') ||
      envText.includes('waterlog')
    ) {
      addScore('abiotic-overwatering-stress', 18);
      addScore('disease-root-rot', 14);
      addScore('abiotic-nitrogen-deficiency', 10);
    } else {
      addScore('abiotic-nitrogen-deficiency', 12);
      addScore('abiotic-iron-deficiency', 10);
      addScore('abiotic-overwatering-stress', 8);
    }
  }

  if (query.includes('wilt') || query.includes('droop') || query.includes('collapse')) {
    if (envText.includes('dry') || envText.includes('rare') || envText.includes('drought')) {
      addScore('abiotic-underwatering-stress', 25);
      addScore('pest-spider-mites', 12);
    } else {
      addScore('disease-fusarium-wilt', 20);
      addScore('disease-root-rot', 18);
      addScore('abiotic-overwatering-stress', 15);
    }
  }

  if (query.includes('spot') || query.includes('lesion') || query.includes('speckle')) {
    if (input.plantSlug?.includes('tomato')) {
      addScore('disease-early-blight', 18);
      addScore('disease-septoria-leaf-spot', 15);
      addScore('disease-bacterial-leaf-spot', 12);
    } else {
      addScore('disease-bacterial-leaf-spot', 15);
      addScore('disease-anthracnose', 15);
      addScore('disease-botrytis-gray-mold', 12);
    }
  }

  // C. Environmental triggers (high priority grower context)
  if (
    envText.includes('soggy') ||
    envText.includes('daily') ||
    envText.includes('wet') ||
    envText.includes('frequent') ||
    envText.includes('saucer') ||
    envText.includes('standing water')
  ) {
    addScore('abiotic-overwatering-stress', 15);
    addScore('disease-root-rot', 12);
    addScore('pest-fungus-gnats', 8);
    addScore('abiotic-edema', 8);
  }

  if (
    envText.includes('dry') ||
    envText.includes('rare') ||
    envText.includes('drought') ||
    envText.includes('windowsill')
  ) {
    addScore('abiotic-underwatering-stress', 15);
    addScore('pest-spider-mites', 12);
  }

  if (
    envText.includes('sun') ||
    envText.includes('scorch') ||
    envText.includes('balcony') ||
    envText.includes('hot') ||
    envText.includes('heat')
  ) {
    addScore('abiotic-sun-scorch', 15);
    addScore('abiotic-heat-stress', 12);
  }

  // D. Query symptom search if few matches
  if (scores.size < 3 && query.length > 2) {
    const searchMatches = searchConditionsBySymptom(query);
    for (let i = 0; i < searchMatches.length; i++) {
      addScore(searchMatches[i].id, Math.max(3, 10 - i));
    }
  }

  // E. Fallback baseline if still empty or vague
  if (scores.size === 0) {
    addScore('abiotic-overwatering-stress', 5);
    addScore('abiotic-nitrogen-deficiency', 4);
    addScore('pest-aphids', 3);
  }

  // F. Host species relationship weighting
  if (input.plantSlug) {
    for (const [id] of scores) {
      const kb = getConditionById(id);
      if (!kb) continue;
      const isHost = kb.confirmedHostSlugs.some(
        (h) =>
          h.plantSlug === input.plantSlug &&
          (h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family')
      );
      if (isHost) {
        addScore(id, 4);
      } else {
        addScore(id, -3);
      }
    }
  }

  // Sort candidate conditions by calculated score descending
  const rankedKbIds = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  // Filter to verified conditions from KB, taking top 3
  const candidateConditions: PossibleCondition[] = [];
  const candidateKbList: PlantHealthCondition[] = [];

  for (const id of rankedKbIds) {
    if (candidateConditions.length >= 3) break;
    const kb = getConditionById(id);
    if (!kb) continue;
    candidateKbList.push(kb);

    // Determine confidence
    let confidenceCategory: 'high' | 'moderate' | 'low' | 'inconclusive' = 'moderate';
    if (query.length < 5) {
      confidenceCategory = 'inconclusive';
    } else if (
      query.includes(kb.commonName.toLowerCase().split(' ')[0]) ||
      query.includes('web') && id === 'pest-spider-mites' ||
      query.includes('powder') && id === 'disease-powdery-mildew' ||
      query.includes('aphid') && id === 'pest-aphids'
    ) {
      confidenceCategory = 'high';
    }

    // Check host suitability
    let contradictingEvidence: string[] = [];
    if (input.plantSlug) {
      const isHost = kb.confirmedHostSlugs.some(
        (h) =>
          h.plantSlug === input.plantSlug &&
          (h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family')
      );
      if (!isHost) {
        contradictingEvidence.push(
          `Species "${plantName}" is not currently documented as a primary host in verified extension records.`
        );
        if (confidenceCategory === 'high') {
          confidenceCategory = 'moderate';
        }
      }
    }

    candidateConditions.push({
      name: kb.commonName,
      kbConditionId: kb.id,
      category: kb.category,
      explanation: kb.shortDescription,
      confidenceCategory,
      supportingEvidence: [
        `Grower reported symptoms: "${input.symptoms}"`,
        `Typical symptoms match: ${kb.observableSymptoms.slice(0, 2).join('; ')}`,
      ],
      contradictingEvidence,
      alternativeCauses: kb.similarConditions.map(
        (s) => `${s.conditionId}: ${s.distinguishingFeature}`
      ),
      recommendedNextObservation:
        kb.category === 'pest'
          ? 'Check leaf undersides with 10x magnification or tap foliage over white paper'
          : kb.category === 'abiotic'
          ? 'Probe substrate moisture 5 cm deep with a clean wooden dowel'
          : 'Inspect for active spore structures, water-soaked halos, or stem girdling',
      groundedTreatment: {
        culturalCorrections: kb.treatment.culturalControls,
        mechanicalPhysicalControls: kb.treatment.physicalControls,
        biologicalOrLowRiskControls: kb.treatment.biologicalControls,
        prohibitedPractices: kb.treatment.prohibitedPractices,
        cureDisclaimer: kb.treatment.cureGuaranteeDisclaimer,
      },
    });
  }

  // Determine primary classification
  const categories = candidateConditions.map((c) => c.category);
  const leadingCandidate = candidateConditions[0];
  const hasBiotic = categories.includes('pest') || categories.includes('disease');
  const hasAbiotic = categories.includes('abiotic');

  let primaryClassification: PrimaryClassification = 'undetermined';

  if (!leadingCandidate || candidateConditions.length === 0) {
    primaryClassification = 'undetermined';
  } else if (
    leadingCandidate.confidenceCategory === 'high' ||
    (leadingCandidate.category === 'pest' &&
      (query.includes('web') || query.includes('mite') || query.includes('aphid') || query.includes('stipple'))) ||
    (leadingCandidate.category === 'disease' &&
      (query.includes('powder') || query.includes('mildew') || query.includes('mushy')))
  ) {
    // When the leading candidate has strong diagnostic hallmark confidence, primary classification follows the leading diagnosis
    primaryClassification =
      leadingCandidate.category === 'pest' || leadingCandidate.category === 'disease'
        ? 'biotic'
        : 'abiotic';
  } else if (hasBiotic && hasAbiotic) {
    primaryClassification = 'mixed';
  } else if (hasBiotic) {
    primaryClassification = 'biotic';
  } else if (hasAbiotic) {
    primaryClassification = 'abiotic';
  }

  // Generate context-aware follow up questions
  const followUpQuestions: FollowUpQuestion[] = [];
  if (hasBiotic && !query.includes('underside') && !query.includes('web')) {
    followUpQuestions.push({
      question: 'Do you see minute silk webbing, crawling specks, or cottony residue on the undersides of leaves or stem joints?',
      targetConditionId: candidateConditions.find((c) => c.category === 'pest')?.kbConditionId,
      rationale: 'Distinguishes arthropod pest infestation from physiological chlorosis or fungal leaf spot.',
    });
  }

  if (hasAbiotic && !input.wateringFrequency) {
    followUpQuestions.push({
      question: 'How frequently is the container watered, and does water drain freely out the bottom holes within 30 seconds?',
      targetConditionId: 'abiotic-overwatering-stress',
      rationale: 'Differentiates root asphyxiation from dry-cycle underwatering or mobile nutrient deficiency.',
    });
  }

  if (followUpQuestions.length < 3) {
    followUpQuestions.push({
      question: 'Are the newest top leaves affected first, or are the oldest lower leaves yellowing and dropping?',
      rationale: 'Mobile nutrient deficiencies (nitrogen, magnesium) affect lower leaves first; immobile elements (iron, calcium) affect apical growth.',
    });
  }

  // Synthesize treatment actions from the primary candidate
  const primaryKb = candidateKbList[0] || getConditionById('abiotic-overwatering-stress');
  const immediateActions = primaryKb ? primaryKb.treatment.physicalControls.slice(0, 3) : [
    'Inspect soil moisture depth before re-watering',
    'Ensure container drainage holes are clear',
  ];
  const longTermCare = primaryKb ? primaryKb.treatment.culturalControls.slice(0, 3) : [
    'Maintain appropriate light and airflow',
    'Avoid letting container sit in saucer runoff',
  ];
  const prevention = primaryKb ? primaryKb.preventionGuidance.slice(0, 3) : [
    'Use well-aerated potting mix with 20% perlite',
    'Sanitize pruning tools between plants',
  ];

  const overallHealth = candidateConditions.some((c) => c.confidenceCategory === 'high')
    ? 'moderate_issue'
    : 'mild_stress';

  const id = `diag_heur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const analyzedAt = new Date().toISOString();

  const primaryName = candidateConditions[0]?.name || 'Horticultural Stress';
  const summary = `Offline agronomic evaluation of ${plantName}: identified differential possibilities including ${primaryName} (${primaryClassification}).`;

  return {
    id,
    analyzedAt,
    status: 'completed',
    engine: 'agronomic-heuristic',
    primaryClassification,
    isPlantRecognized: true,
    plantIdentification: plantName,
    plantIdentificationConfidence: 'medium',
    overallHealth,
    evidenceSeparation: {
      observedEvidence: [
        input.symptoms ? `Grower stated symptoms: "${input.symptoms}"` : 'Grower-reported symptoms',
        input.wateringFrequency ? `Watering routine: ${input.wateringFrequency}` : 'Watering routine unstated',
        input.sunlight ? `Sunlight: ${input.sunlight}` : 'Sunlight unstated',
      ],
      diagnosticInterpretation: candidateConditions.map(
        (c) => `${c.name}: ${c.explanation}`
      ),
      unknownInformation: [
        'Visual leaf pathology not verified by multimodal computer vision in offline heuristic mode',
        'Subsurface root zone health and microscopic pathogens cannot be confirmed without physical inspection',
      ],
    },
    visibleSymptoms: [input.symptoms || 'Grower-reported symptoms'],
    possibleConditions: candidateConditions,
    followUpQuestions: followUpQuestions.slice(0, 3),
    likelyCauses: primaryKb ? primaryKb.possibleCauses.slice(0, 3) : ['Cultural or environmental stress'],
    recommendedChecks: [
      'Insert a clean wooden probe 5 cm into the soil to verify moisture depth',
      'Examine leaf undersides with 10x magnification for minute insects or webbing',
      'Verify container drainage holes are unobstructed and empty standing saucer water',
    ],
    immediateActions,
    longTermCare,
    prevention,
    uncertainties: [
      'Heuristic mode performs rule-based matching and lacks computer vision verification',
      'Root zone pathology and micronutrient balance cannot be confirmed without physical probe or soil assay',
    ],
    requiresExpertReview: false,
    summary,
    disclaimer:
      'GrowAI Heuristic Diagnostic Engine provides educational horticultural guidance based on rule-based symptom matching grounded in verified agricultural extension data. It does not replace visual pathology or laboratory testing.',
    userContextProvided: {
      plantName: input.plantName,
      reportedSymptoms: input.symptoms,
      watering: input.wateringFrequency,
      sunlight: input.sunlight,
      environment: input.environment,
      temperature: input.temperature,
      soil: input.soilInfo,
    },
    hasPhoto,
    suggestedFollowUp: 'Apply low-risk cultural adjustments, check follow-up observations, and monitor plant response for 48–72 hours.',
  };
}
