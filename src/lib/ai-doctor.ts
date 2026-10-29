import { DiagnosisRequest, DiagnosisResponse } from '@/types/diagnosis';

/**
 * Diagnostic Knowledge Engine (Demo Service)
 *
 * In production, this service forwards requests to a server-side vision/LLM
 * endpoint (e.g. Gemini 1.5 Pro / Flash with multimodal vision).
 *
 * Here, it provides realistic agronomic heuristics and symptom matching while
 * transparently declaring its demonstration status and uncertainty warnings.
 */
export async function diagnosePlantIssue(request: DiagnosisRequest): Promise<DiagnosisResponse> {
  const query = (request.symptoms || '').toLowerCase();
  const plantName = request.plantName || (request.plantSlug ? request.plantSlug.replace('-', ' ') : 'your plant');

  // Match common horticultural symptom patterns
  let issue = 'Nutritional or Watering Stress';
  let probableCauses = [
    'Erratic moisture cycles (root drying followed by heavy watering)',
    'Low nitrogen or micronutrient deficiency (e.g., magnesium or iron)',
    'Insufficient light exposure causing pale foliage',
  ];
  let recommendedChecks = [
    'Insert a wooden chopstick 5 cm into the soil to check true moisture depth',
    'Examine underside of leaves with a 10x hand lens or smartphone zoom for minute pests',
    'Check pot drainage holes for roots circling or water sitting in the saucer',
  ];
  let immediateSteps = [
    'Allow top 3 cm of soil to dry before the next watering session',
    'Relocate container to receive 4–6 hours of gentle morning sunshine',
    'Prune off heavily dead or withered lower leaves with clean, sterilized shears',
  ];
  let organicTreatments = [
    'Apply diluted liquid kelp or balanced organic worm casting tea (1:10 dilution)',
    'Ensure proper drainage holes are clear and unobstructed',
  ];

  if (query.includes('yellow') || query.includes('yellowing') || query.includes('pale')) {
    issue = 'Chlorosis (Yellowing Leaves) & Moisture Imbalance';
    probableCauses = [
      'Overwatering causing oxygen depletion around root hair zones',
      'Nitrogen deficiency if yellowing starts on oldest lower leaves first',
      'Iron or micronutrient lockout caused by alkaline tap water (pH > 7.2)',
    ];
    recommendedChecks = [
      'Check if lower leaves are soft and floppy (overwatering) or dry and crispy (underwatering)',
      'Inspect root color through drainage holes: healthy roots are pearly white, rotted roots are brown and soft',
    ];
    immediateSteps = [
      'Pause watering until top 50% of the pot dries out',
      'Ensure the pot is not standing in stagnant saucer runoff water',
    ];
    organicTreatments = [
      'Apply light foliar spray of organic cold-pressed seaweed extract',
      'Top-dress with 1 tablespoon of aged worm castings',
    ];
  } else if (query.includes('white') || query.includes('powder') || query.includes('mold') || query.includes('mildew')) {
    issue = 'Fungal Powdery Mildew';
    probableCauses = [
      'Poor air circulation combined with warm humid microclimate around leaves',
      'Overhead evening watering leaving water droplets on leaf surfaces overnight',
    ];
    recommendedChecks = [
      'Wipe leaf with a damp finger: if the white coating easily rubs off, it is active powdery mildew',
      'Check spacing between vertical rack tiers to ensure airflow',
    ];
    immediateSteps = [
      'Isolate the infected plant from neighboring vertical planters',
      'Prune the most severely coated leaves and discard in household trash (not compost)',
    ];
    organicTreatments = [
      'Spray early morning with a solution of 1/2 tsp baking soda + 1/2 tsp mild castile soap in 1 liter water',
      'Alternative: 1 part milk to 9 parts water spray exposed to direct morning sun',
    ];
  } else if (query.includes('brown') || query.includes('spot') || query.includes('crispy') || query.includes('dry')) {
    issue = 'Leaf Tip Burn or Fungal Leaf Spot';
    probableCauses = [
      'Dry ambient indoor air or low relative humidity (< 40%)',
      'Chlorine, chloramines, or mineral salts from municipal tap water',
      'Underwatering or excessive synthetic fertilizer salts',
    ];
    recommendedChecks = [
      'Check if crispy edges are confined to leaf tips (salts/humidity) or random spots (pathogen)',
      'Observe if room has direct air vents or air conditioning drafts blowing on foliage',
    ];
    immediateSteps = [
      'Let municipal tap water sit open in an uncovered pitcher for 24 hours before watering',
      'Flush container with generous fresh water if salt crust is visible on soil surface',
    ];
    organicTreatments = [
      'Increase local humidity using a pebble tray with water beneath the pot',
      'Apply gentle neem oil spray (cold-pressed, 0.5% concentration) in the evening',
    ];
  } else if (query.includes('bug') || query.includes('pest') || query.includes('web') || query.includes('mite') || query.includes('aphid')) {
    issue = 'Foliage Insect Infestation (Aphids or Spider Mites)';
    probableCauses = [
      'Dry indoor microclimate favoring spider mite reproduction',
      'Tender succulent new growth attracting sap-sucking insects',
    ];
    recommendedChecks = [
      'Check leaf axils and undersides for tiny green/black aphids or fine silk webbing',
      'Shake a suspect leaf over a white paper sheet to see if minute specks walk around',
    ];
    immediateSteps = [
      'Take plant to shower or sink and rinse stems with a steady, gentle spray of lukewarm water',
      'Physically wipe away visible bug clusters with a damp cotton swab',
    ];
    organicTreatments = [
      'Spray thoroughly with insecticidal soap (potassium salts of fatty acids)',
      'Apply cold-pressed organic neem oil spray once every 5 days for 3 cycles',
    ];
  }

  return {
    id: `diag-${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    status: 'completed',
    isDemoMode: true,
    summary: `Heuristic evaluation for ${plantName} based on described symptoms: "${request.symptoms}".`,
    findings: [
      {
        issue,
        confidence: 'Moderate',
        probableCauses,
        recommendedChecks,
        immediateSteps,
        preventiveMeasures: [
          'Maintain 10–15 cm spacing between container pots for continuous air circulation',
          'Always water container soil directly at the base rather than showering foliage from above',
          'Clean pruning snips with 70% rubbing alcohol between plant cuts',
        ],
        organicTreatments,
        chemicalWarnings: 'GrowAI recommends biological and mechanical remedies first. Avoid broad-spectrum synthetic pesticides on edible kitchen herbs.',
      },
    ],
    disclaimer:
      'Demonstration Mode: This diagnostic report is generated using an agronomic symptom heuristic rulebase for demonstration and educational purposes. A live multimodal vision AI model will be connected in Phase 2 via server API keys. Always consult your local agricultural extension service for laboratory-grade pathology confirmation.',
    suggestedFollowUp: 'Re-inspect your plant in 5 to 7 days after completing the immediate steps.',
  };
}
