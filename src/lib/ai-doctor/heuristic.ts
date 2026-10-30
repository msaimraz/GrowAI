import { DiagnosisInput, DiagnosisResponse, PossibleCondition } from '@/types/diagnosis';

/**
 * Educational Agronomic Heuristic Diagnostic Engine
 *
 * Serves as an offline/fallback botanical reasoning engine when
 * external AI vision services are unconfigured, unreachable, or
 * when the grower explicitly opts for heuristic symptom matching.
 */
export async function diagnoseWithHeuristics(
  input: DiagnosisInput,
  hasPhoto: boolean = false
): Promise<DiagnosisResponse> {
  const query = (input.symptoms || '').toLowerCase();
  const plantName =
    input.plantName || (input.plantSlug ? input.plantSlug.replace('-', ' ') : 'Botanical specimen');

  let conditionName = 'Nutritional or Watering Stress';
  let explanation =
    'Erratic moisture cycles or mild macronutrient imbalance impacting healthy cellular turgor and chlorophyll synthesis.';
  let confidence: 'high' | 'moderate' | 'low' | 'uncertain' = 'moderate';
  let supportingEvidence = [
    'General foliage loss of vigor or mild discoloration reported by grower',
    input.wateringFrequency ? `Watering routine reported: ${input.wateringFrequency}` : 'Irregular moisture depth',
  ];
  let alternativeCauses = [
    'Low nitrogen or micronutrient deficiency (magnesium or iron lockout)',
    'Substrate compaction preventing root oxygen exchange',
    'Insufficient light exposure causing pale foliage',
  ];
  let likelyCauses = [
    'Root drying followed by heavy saturating water',
    'Nutrient depletion in shallow container volume',
    'Suboptimal light photoperiod',
  ];
  let recommendedChecks = [
    'Insert a clean wooden chopstick 5 cm into the soil to check moisture depth',
    'Examine underside of leaves with 10x smartphone magnification for minute mites or thrips',
    'Inspect container drainage holes to ensure roots are not waterlogged or circling',
  ];
  let immediateActions = [
    'Allow top 3 cm of soil to dry before the next watering session',
    'Relocate container to receive 4–6 hours of gentle morning sunshine',
    'Gently prune heavily withered lower leaves with sterilized shears',
  ];
  let longTermCare = [
    'Establish consistent bottom-watering or moisture-monitoring routine',
    'Ensure vertical shelf airflow prevents air stagnation around lower tiers',
  ];
  let prevention = [
    'Use well-aerated potting mix containing 20% perlite or coarse pumice',
    'Avoid letting pots sit in stagnant saucer drainage water',
  ];
  let health: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown' = 'mild_stress';

  // Pattern matching on user symptoms
  if (query.includes('yellow') || query.includes('yellowing') || query.includes('pale')) {
    conditionName = 'Foliage Chlorosis (Moisture Imbalance / Nitrogen)';
    explanation =
      'Loss of green chlorophyll pigment causing yellowing leaves. In container and vertical gardens, this is most frequently caused by over-saturation suffocating root hairs, or nitrogen mobility.';
    confidence = 'high';
    supportingEvidence = [
      'Reported yellowing or pale foliage',
      'Lower leaf chlorosis characteristic of mobile nutrient or root oxygen deficiency',
    ];
    alternativeCauses = [
      'Overwatering causing root hair asphyxiation',
      'Nitrogen deficiency if oldest lower leaves yellow first',
      'Iron or magnesium lockout caused by hard municipal tap water (pH > 7.2)',
    ];
    likelyCauses = ['Overwatering / oxygen starvation', 'Nitrogen or micronutrient lockout'];
    immediateActions = [
      'Pause watering until top 50% of the pot depth dries out',
      'Empty any runoff water collected in bottom catchment trays',
    ];
    longTermCare = [
      'Water thoroughly only when top 3 cm is dry to the touch',
      'Top-dress with 1 tablespoon of aged organic worm castings',
    ];
    health = 'moderate_issue';
  } else if (
    query.includes('white') ||
    query.includes('powder') ||
    query.includes('mold') ||
    query.includes('mildew')
  ) {
    conditionName = 'Fungal Powdery Mildew';
    explanation =
      'Superficial fungal infection producing white powdery spore colonies across leaf surfaces, accelerated by warm stagnant air and humid microclimates.';
    confidence = 'high';
    supportingEvidence = [
      'Powdery white or flour-like coating reported on foliage',
      'Common in sheltered balconies or dense vertical rack tiers with low air circulation',
    ];
    alternativeCauses = [
      'Mineral residue from hard tap water misting',
      'Diatomaceous earth or foliar spray residue',
    ];
    likelyCauses = ['Poor air circulation combined with warm humid microclimates', 'Overhead evening watering'];
    recommendedChecks = [
      'Gently wipe leaf with a damp finger: active powdery mildew easily wipes off',
      'Check spacing between vertical rack tiers to ensure horizontal breeze',
    ];
    immediateActions = [
      'Isolate the infected plant from neighboring vertical planters immediately',
      'Prune severely coated leaves and dispose of in household trash (not compost)',
    ];
    longTermCare = [
      'Apply gentle morning foliar spray of 1/2 tsp baking soda + 2 drops castile soap in 1L water',
      'Never water foliage from overhead in the evening',
    ];
    health = 'moderate_issue';
  } else if (
    query.includes('brown') ||
    query.includes('spot') ||
    query.includes('crispy') ||
    query.includes('dry')
  ) {
    conditionName = 'Leaf Tip Burn or Osmotic Stress';
    explanation =
      'Desiccation of leaf margins caused by low ambient humidity, tap water mineral salts (chlorine/fluoride), or root dehydration.';
    confidence = 'high';
    supportingEvidence = [
      'Brown, dry, or crispy margins reported by grower',
      'Characteristic pattern of osmotic moisture tension in container botany',
    ];
    alternativeCauses = [
      'Low indoor humidity (< 40% RH)',
      'Chlorine/chloramine salts in tap water',
      'Fertilizer salt accumulation in potting medium',
    ];
    likelyCauses = ['Low relative humidity or tap water mineral accumulation', 'Temporary severe underwatering'];
    immediateActions = [
      'Let municipal tap water sit open in a pitcher for 24 hours before use',
      'Flush container thoroughly with fresh water if salt crust is visible on soil surface',
    ];
    longTermCare = [
      'Increase local humidity using a pebble tray with water beneath the pot',
      'Prune dead brown tips with clean shears, leaving a thin margin of dry tissue',
    ];
    health = 'mild_stress';
  } else if (
    query.includes('bug') ||
    query.includes('pest') ||
    query.includes('web') ||
    query.includes('mite') ||
    query.includes('aphid')
  ) {
    conditionName = 'Foliage Pest Infestation (Aphids / Spider Mites)';
    explanation =
      'Sap-sucking arthropods infesting tender new growth, causing stippling, leaf distortion, and sticky honeydew secretions.';
    confidence = 'high';
    supportingEvidence = [
      'Visible insect activity, webbing, or crawling specks reported',
      'Common in warm balcony microclimates with low natural predator presence',
    ];
    alternativeCauses = [
      'Dust or environmental debris settling in leaf axils',
      'Harmless soil fungus gnats',
    ];
    likelyCauses = ['Dry indoor microclimate favoring rapid mite reproduction', 'Succulent soft new growth attracting aphids'];
    recommendedChecks = [
      'Tap an affected leaf over a white sheet of paper: crawling dots indicate spider mites',
      'Inspect stem joints and growing tips for clusters of green or black aphids',
    ];
    immediateActions = [
      'Rinse foliage thoroughly with a gentle stream of room-temperature water at the sink',
      'Isolate the container from other vertical shelf plants',
    ];
    longTermCare = [
      'Apply organic cold-pressed neem oil spray (0.5% concentration) or mild insecticidal soap in evening',
      'Repeat application every 5–7 days for 3 cycles to interrupt pest lifecycle',
    ];
    health = 'moderate_issue';
  }

  const possibleCondition: PossibleCondition = {
    name: conditionName,
    explanation,
    confidenceCategory: confidence,
    supportingEvidence,
    alternativeCauses,
  };

  const id = `diag_heur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const analyzedAt = new Date().toISOString();

  return {
    id,
    analyzedAt,
    status: 'completed',
    engine: 'agronomic-heuristic',
    isPlantRecognized: true,
    plantIdentification: plantName,
    plantIdentificationConfidence: 'medium',
    overallHealth: health,
    visibleSymptoms: [input.symptoms || 'Grower-reported symptoms'],
    possibleConditions: [possibleCondition],
    likelyCauses,
    recommendedChecks,
    immediateActions,
    longTermCare,
    prevention,
    uncertainties: [
      'Visual pathology not verified by multimodal computer vision in heuristic mode',
      'Root zone pathology cannot be confirmed without physical soil probe',
    ],
    requiresExpertReview: false,
    summary: `Agronomic heuristic analysis evaluated ${plantName}: likely ${conditionName} based on described symptoms.`,
    disclaimer:
      'GrowAI Heuristic Diagnostic Engine provides educational horticultural guidance based on rule-based symptom matching. It does not replace a certified agricultural extension diagnosis.',
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
    suggestedFollowUp: 'Apply recommended low-risk cultural adjustments and monitor new growth for 48–72 hours.',
  };
}
