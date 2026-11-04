/**
 * GrowAI Plant Health & Phytopathology Knowledge Base
 * Phase 8.2 — Comprehensive Curated Plant Health Dataset
 *
 * Grounding reference for urban plant pests, infectious pathogens (fungal,
 * bacterial, viral, oomycete), and abiotic physiological disorders.
 * All entries are backed by agricultural extension services (UC IPM, RHS,
 * Cornell, Purdue, Penn State) and prioritize Integrated Pest Management (IPM).
 */

import {
  PlantHealthCondition,
  PestCondition,
  DiseaseCondition,
  AbioticCondition,
  ConditionCategory,
  HealthKbFilterOptions,
} from '@/types/health';

// ==============================================================================
// 1. URBAN PLANT PESTS (9 Conditions)
// ==============================================================================

const PEST_CONDITIONS: PestCondition[] = [
  // 1. Aphids
  {
    id: 'pest-aphids',
    category: 'pest',
    pestType: 'sap_sucking_insect',
    commonName: 'Aphids (Greenfly / Blackfly)',
    scientificName: 'Aphis gossypii, Myzus persicae (Aphidoidea)',
    shortDescription:
      'Small, soft-bodied, sap-sucking insects clustering on tender new shoots and leaf undersides, excreting sticky honeydew.',
    observableSymptoms: [
      'Clusters of tiny pear-shaped insects on new terminal shoots, buds, and leaf undersides',
      'Curled, puckered, or stunted young foliage',
      'Sticky, clear honeydew droplets coating leaves and stems',
      'Secondary black sooty mold growing on honeydew deposits',
      'Cast white translucent shed skins (exuviae) visible on leaf surfaces',
    ],
    affectedPlantParts: ['leaves', 'growing_tips', 'stems', 'flowers'],
    possibleCauses: [
      'Excessive nitrogen fertilization producing succulent vegetative tissue',
      'Sheltered microclimates lacking natural predatory beneficial insects',
      'Indoor overwintering or contaminated nursery transplants',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 18, max: 28, optimal: '20°C–25°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Heavy high-nitrogen liquid feeding', 'Absence of natural predators on balconies'],
    },
    visualIdentification: {
      sizeMm: { min: 1.5, max: 3.5 },
      colorDescription: 'Translucent green, yellow, brown, or black depending on host and species',
      morphology: 'Pear-shaped soft bodies with prominent posterior tail (cauda) and paired cornicles (exhaust tubes)',
      lifeStagesVisible: ['Wingless nymphs', 'Apterous adult females', 'Occasional winged alate dispersers'],
    },
    damagePatterns: [
      'Phloem sap extraction leading to reduced plant vigor',
      'Distortion and downward curling of apical growing tips',
      'Vectoring of plant pathogenic viruses (e.g., Cucumber Mosaic Virus)',
    ],
    favoredPlantGroups: ['Solanaceae (Tomatoes)', 'Brassicaceae (Radish, Greens)', 'Lamiaceae (Basil)', 'Asteraceae (Marigold, Zinnia)'],
    similarConditions: [
      {
        conditionId: 'pest-whiteflies',
        distinguishingFeature: 'Whiteflies fly up in white clouds when disturbed; aphids remain clustered on stems and crawl slowly.',
      },
      {
        conditionId: 'pest-spider-mites',
        distinguishingFeature: 'Spider mites produce fine silk webbing and micro-stippling rather than sticky honeydew and curled shoots.',
      },
    ],
    preventionGuidance: [
      'Inspect leaf undersides and apical buds before bringing new plants home',
      'Avoid excessive synthetic nitrogen feeds that stimulate flush succulent growth',
      'Companion-plant flowering umbellifers (coriander, marigold) to attract hoverflies and lacewings',
    ],
    treatment: {
      culturalControls: [
        'Prune and discard heavily colonized shoot tips if infestation is localized',
        'Reduce nitrogen feeding until plant recovers normal growth balance',
      ],
      physicalControls: [
        'Dislodge clusters with a firm jet of room-temperature tap water at the sink or hose',
        'Manually crush small colonies on stems with gloved fingers',
      ],
      biologicalControls: [
        'Encourage or release generalist predators: ladybird beetles (Hippodamia convergens), green lacewings (Chrysoperla carnea)',
        'Apply biological potassium salts of fatty acids (insecticidal soap) to smother soft bodies',
      ],
      registeredChemicalNotes: [
        'Apply commercial cold-pressed neem oil or certified horticultural soap spray strictly adhering to the manufacturer product label for crop-specific dilution rates and safety intervals', 'Apply in late evening to avoid leaf scorch and protect active daytime pollinators',
      ],
      prohibitedPractices: [
        'Do not mix household dish detergent or laundry soap (phytotoxic striping of leaf cuticular wax)',
        'Do not spray oil treatments in direct midday sunlight (>32°C)',
        'Do not mix chemical pesticides with household bleach or ammonia',
      ],
      preHarvestIntervalGuidance:
        'Specific pre-harvest interval (PHI) depends on the exact registered commercial label and jurisdiction. For home food crops, verify the product container label before harvest. If the label lacks edible crop registration or PHI information, withhold harvest and rinse thoroughly.',
      cureGuaranteeDisclaimer:
        'IPM treatments suppress aphid populations and manage damage; biological and cultural controls cannot guarantee 100% permanent eradication.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Aphids and honeydew are non-toxic to humans but aesthetically unpalatable. Wash produce thoroughly before consumption.',
      harvestPrecaution: 'Wash harvested leafy greens in a basin of cold salted water to float off any remaining insects.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Aphids are entirely non-toxic to humans, dogs, and cats.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Clusters on floral clusters and young suckers' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Potato aphid and green peach aphid host' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Common on apical growing tips' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Nasonovia ribisnigri colonizes inner head' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Green peach aphid vectoring mosaic' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Cabbage aphid colonizes foliage' },
      { plantSlug: 'french-marigold', relationshipType: 'confirmed_host', notes: 'Feed on tender stems' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Clusters below floral buds' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Fibrous waxy cuticle resists aphid stylets' },
      { plantSlug: 'aloe-vera', relationshipType: 'rarely_affected', notes: 'Thick succulence rarely attacked by common aphids' },
    ],
    references: [
      {
        title: 'Aphids: Integrated Pest Management in the Home and Landscape',
        organization: 'University of California Statewide IPM Program (UC IPM)',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7404.html',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Aphids on Container Vegetables and Herbs',
        organization: 'Purdue University Extension Entomology',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 2. Spider Mites
  {
    id: 'pest-spider-mites',
    category: 'pest',
    pestType: 'mite',
    commonName: 'Two-Spotted Spider Mites',
    scientificName: 'Tetranychus urticae (Tetranychidae)',
    shortDescription:
      'Microscopic arachnids infesting leaf undersides in warm, dry microclimates, producing fine stippling and delicate webbing.',
    observableSymptoms: [
      'Minute, pale yellow or white stippling (chlorotic speckling) on upper leaf surfaces',
      'Fine silky webbing stretched across leaf axils, petiole joints, and shoot tips',
      'Bronzed, dusty, or dirty appearance of foliage',
      'Premature leaf yellowing, drying, and defoliation in severe infestations',
    ],
    affectedPlantParts: ['leaves', 'stems', 'growing_tips'],
    possibleCauses: [
      'Low ambient humidity (< 40% RH) combined with elevated indoor or balcony temperatures',
      'Drought stress weakening natural plant tissue resistance',
      'Dust accumulation on leaf surfaces deterring predatory mites',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 24, max: 35, optimal: '27°C–32°C' },
      favorableHumidity: 'low_humidity',
      culturalTriggers: ['Dry indoor air from air conditioning or heating', 'Underwatering causing moisture tension'],
    },
    visualIdentification: {
      sizeMm: { min: 0.3, max: 0.5 },
      colorDescription: 'Translucent greenish-yellow to reddish-brown with two distinct dark lateral spots',
      morphology: 'Oval microscopic eight-legged arachnids; require 10x hand lens or paper-tap test to resolve legs',
      lifeStagesVisible: ['Microscopic spherical translucent eggs', 'Six-legged larvae', 'Eight-legged nymphs and adults'],
    },
    damagePatterns: [
      'Individual plant cell puncture and chlorophyll extraction',
      'Coalescence of feeding punctures into necrotic papery patches',
      'Terminal web envelopment trapping dust and suffocating foliage',
    ],
    favoredPlantGroups: ['Solanaceae', 'Asteraceae', 'Araceae (Pothos)', 'Ornamental Flowering'],
    similarConditions: [
      {
        conditionId: 'abiotic-osmotic-stress',
        distinguishingFeature: 'Osmotic/salt stress causes crisp leaf edges without fine silk webbing or underside crawling mites.',
      },
      {
        conditionId: 'pest-thrips',
        distinguishingFeature: 'Thrips leave silvery bleached patches with black tar-like fecal drops; spider mites leave fine stippling and silk webbing.',
      },
    ],
    preventionGuidance: [
      'Maintain ambient relative humidity above 45% using humidity trays or room humidifiers',
      'Regularly rinse dust from foliage during routine watering',
      'Avoid dry microclimates near radiator grills or hot south-facing glass panes without air movement',
    ],
    treatment: {
      culturalControls: [
        'Move plant to a cooler, more humid area away from hot draft sources',
        'Prune heavily webbed individual leaves and bag in household waste immediately',
      ],
      physicalControls: [
        'Rinse foliage undersides thoroughly with a lukewarm spray in the shower or sink to break webs',
        'Wipe smooth leaves with a damp microfiber cloth to remove eggs and adults',
      ],
      biologicalControls: [
        'Introduce predatory mites: Phytoseiulus persimilis (high humidity) or Neoseiulus californicus (drier microclimates)',
        'Apply insecticidal soap or refined narrow-range horticultural paraffinic oil to coat and smother mites',
      ],
      registeredChemicalNotes: [
        'Commercial cold-pressed neem oil or wettable sulfur applied strictly per product label instructions (never apply sulfur within 30 days of oil-based sprays)',
      ],
      prohibitedPractices: [
        'Do not spray synthetic pyrethroids or broad-spectrum chemical insecticides (triggers severe spider mite flare-ups by eliminating natural predators)', 'Do not mix chemical pesticides or household bleach/detergent',
        'Do not apply horticultural oil when foliage is water-stressed or temperature exceeds 32°C',
      ],
      preHarvestIntervalGuidance:
        'Check specific manufacturer product label for registered pre-harvest interval on edible crops. Rinse all produce thoroughly in clean water before preparation.',
      cureGuaranteeDisclaimer: 'Spider mites reproduce rapidly (generation time under 7 days at 30°C); consistent multiple treatments over 3 weeks are necessary to manage newly hatched eggs. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Spider mites and webbing do not produce human toxins; wash edible herbs and tomatoes prior to culinary use.',
      harvestPrecaution: 'Discard heavily webbed foliage from culinary harvests.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Plant-feeding spider mites do not bite humans or domestic animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'spearmint', relationshipType: 'confirmed_host', notes: 'Two-spotted spider mites colonize undersides of mint leaves in warm dry weather' },
      { plantSlug: 'french-marigold', relationshipType: 'confirmed_host', notes: 'Highly susceptible in dry balcony heat' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Stippling starts on lower foliage' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Severe webbing can coat upper clusters' },
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Indoor low-humidity foliage stippling' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Rapid bronzing of flower stems' },
      { plantSlug: 'spinach', relationshipType: 'susceptible_family', notes: 'Attacked during warm dry spells' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Thick cuticle provides mechanical resistance' },
    ],
    references: [
      {
        title: 'Spider Mites: Home & Landscape Guidelines',
        organization: 'University of California IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7405.html',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Twospotted Spider Mite Management in Greenhouse & Interiorscapes',
        organization: 'University of Florida IFAS Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 3. Fungus Gnats
  {
    id: 'pest-fungus-gnats',
    category: 'pest',
    pestType: 'fly_larva',
    commonName: 'Fungus Gnats (Dark-Winged Fungus Gnats)',
    scientificName: 'Bradysia spp. (Sciaridae)',
    shortDescription:
      'Small, weak-flying dark gnats running across damp soil surfaces; subterranean larvae graze on soil fungi and fine plant root hairs.',
    observableSymptoms: [
      'Tiny black or grey mosquito-like flies hovering erratically near soil level or crawling on pot rims',
      'Slowed seedling growth and loss of seedling vigor without visible foliage pests',
      'Sudden collapse of young seedlings due to root grazing (often compounding damping-off)',
      'Subsurface semi-transparent larvae with distinct black head capsules visible in top 2 cm of soil',
    ],
    affectedPlantParts: ['roots', 'seedlings'],
    possibleCauses: [
      'Chronically overwatered potting substrate with persistent surface saturation',
      'Potting soils rich in uncomposted bark, peat, or decaying organic mulch',
      'Pots standing in stagnant drainage saucer water',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 18, max: 26, optimal: '21°C–24°C' },
      favorableHumidity: 'high_humidity',
      culturalTriggers: ['Frequent shallow watering keeping topsoil constantly wet', 'Poor container drainage'],
    },
    visualIdentification: {
      sizeMm: { min: 2.0, max: 4.0 },
      colorDescription: 'Adults dark grey to black with smoky wings; larvae translucent white with black head capsules',
      morphology: 'Slender, fragile flies with long legs and segmented antennae; weak, erratic fliers compared to fruit flies',
      lifeStagesVisible: ['Adult flies around rim', 'Translucent cylindrical larvae in upper moist soil matrix'],
    },
    damagePatterns: [
      'Root hair abrasion on young container plants and microgreens',
      'Transmission of fungal pathogens (Pythium, Fusarium) into root wounds',
      'Primarily an aesthetic indoor nuisance for established plants, but lethal to young seedlings',
    ],
    favoredPlantGroups: ['Seedlings & Microgreens', 'Moist Tropicals (Pothos)', 'Herb Starters'],
    similarConditions: [
      {
        conditionId: 'disease-damping-off',
        distinguishingFeature: 'Damping off rots seedling stems at soil line via fungi; fungus gnat larvae mechanically chew root tips and are visible in substrate.',
      },
      {
        conditionId: 'pest-whiteflies',
        distinguishingFeature: 'Whiteflies fly when foliage is disturbed and colonize leaf undersides; fungus gnats emerge from wet soil and fly erratically around the base.',
      },
    ],
    preventionGuidance: [
      'Allow the top 2–3 cm of container potting mix to dry completely before re-watering',
      'Water plants from the bottom (sub-irrigation) to keep the upper soil surface dry',
      'Cover topsoil with a 1 cm layer of coarse horticultural sand to deter adult egg deposition',
    ],
    treatment: {
      culturalControls: [
        'Strictly reduce watering frequency to desiccate fragile larvae in the upper soil layer',
        'Empty drainage catch-trays immediately after runoff ceases',
      ],
      physicalControls: [
        'Place yellow sticky cards horizontally right above the soil line to trap adult egg-layers',
        'Repot severely infested pots into fresh, well-aerated potting mix containing 25% perlite',
      ],
      biologicalControls: [
        'Apply biological larvicide Bacillus thuringiensis israelensis (Bti) drench to kill larvae safely in root zone',
        'Incorporate beneficial entomopathogenic nematodes (Steinernema feltiae) into soil',
      ],
      registeredChemicalNotes: [
        'Target larvae biologically (Bti) rather than spraying chemical aerosols at flying adults',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not pour bleach, vinegar, or boiling water into container soil (destroys beneficial soil microbes and burns plant roots)',
        'Do not spray aerosol household bug sprays directly onto edible container herbs',
      ],
      preHarvestIntervalGuidance:
        'Bacillus thuringiensis israelensis (Bti) carries no chemical pre-harvest interval when used as directed, but always consult local agricultural product label.',
      cureGuaranteeDisclaimer: 'Adult gnats live 7–10 days; breaking the lifecycle requires targeting the larval generation over 2–3 consecutive watering cycles. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'low',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Fungus gnats do not contaminate edible foliage; larvae remain in soil.',
      harvestPrecaution: 'Rinse microgreens to ensure no flying gnats are trapped in harvested greens.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Fungus gnats do not bite, carry human diseases, or harm pets.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'broccoli-microgreens', relationshipType: 'confirmed_host', notes: 'High density moisture invites larvae' },
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Common in overwatered indoor potting mix' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Seedlings susceptible to root grazing' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Seedling stage vulnerable' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Moist seedling trays frequently attacked' },
      { plantSlug: 'aloe-vera', relationshipType: 'rarely_affected', notes: 'Dry succulent soil cannot sustain larvae' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Infrequent watering naturally prevents gnat cycles' },
    ],
    references: [
      {
        title: 'Fungus Gnats Management Guidelines',
        organization: 'University of California Statewide IPM Program',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7448.html',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Biology and Control of Fungus Gnats in Greenhouses',
        organization: 'Penn State Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 4. Thrips
  {
    id: 'pest-thrips',
    category: 'pest',
    pestType: 'sap_sucking_insect',
    commonName: 'Thrips (Western Flower Thrips / Onion Thrips)',
    scientificName: 'Frankliniella occidentalis, Thrips tabaci (Thysanoptera)',
    shortDescription:
      'Slender, minute fringed-wing insects rasping plant epidermis and feeding on released cellular sap, leaving silvery bleached patches and black frass dots.',
    observableSymptoms: [
      'Silvery, bleached, or metallic patches on upper leaf surfaces where epidermal cells have been emptied',
      'Tiny, distinct black tar-like frass droplets peppered over the silvery feeding patches',
      'Crinkled, deformed, or asymmetrical young leaves and scarred flower petals',
      'Slender, fast-crawling yellow, brown, or black narrow insects visible upon jarring foliage over paper',
    ],
    affectedPlantParts: ['leaves', 'flowers', 'fruit', 'growing_tips'],
    possibleCauses: [
      'Warm indoor or sheltered balcony environments with dry air',
      'Introducing infested floral arrangements or uninspected nursery stock',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 30, optimal: '25°C–28°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Stagnant indoor air', 'Dry atmospheric conditions accelerating generation cycles'],
    },
    visualIdentification: {
      sizeMm: { min: 0.8, max: 1.5 },
      colorDescription: 'Translucent yellow-white (nymphs) to dark brown or black (adults)',
      morphology: 'Extremely slender, elongated body with hair-fringed wings folded flat along back; agile crawlers',
      lifeStagesVisible: ['Pale yellow wingless nymphs', 'Dark slender winged adults crawling in floral cups or leaf folds'],
    },
    damagePatterns: [
      'Rasping-sucking cell emptying producing silvery sheen',
      'Vectoring Tomato Spotted Wilt Virus (TSWV) and Impatiens Necrotic Spot Virus (INSV)',
      'Bud abortion and petal browning on flowering crops',
    ],
    favoredPlantGroups: ['Solanaceae', 'Asteraceae (Marigold, Zinnia)', 'Alliums', 'Lamiaceae'],
    similarConditions: [
      {
        conditionId: 'pest-spider-mites',
        distinguishingFeature: 'Thrips leave dark tar-like fecal dots and silvery patches; spider mites leave fine stippling and silk webbing.',
      },
      {
        conditionId: 'abiotic-sun-scorch',
        distinguishingFeature: 'Sun scorch bleaches paper-thin dead patches without black tar fecal spots or mobile insects.',
      },
    ],
    preventionGuidance: [
      'Hang blue or yellow sticky cards near plant canopy level for early detection',
      'Isolate new nursery plants for 14 days before introducing to vertical racks',
      'Eliminate weeds and spent blooms where adult thrips congregate',
    ],
    treatment: {
      culturalControls: [
        'Prune and dispose of heavily scarred flowers and terminal shoot tips',
        'Maintain clean rack surfaces free of fallen plant debris where prepupae drop',
      ],
      physicalControls: [
        'Wash plants with a firm water stream to knock nymphs from leaf folds',
        'Use blue sticky cards (thrips are phototactically attracted to blue spectrum)',
      ],
      biologicalControls: [
        'Apply biological Spinosad (derived from soil actinomycete Saccharopolyspora spinosa) where registered',
        'Deploy predatory mites: Amblyseius swirskii or Neoseiulus cucumeris in sheltered spaces',
      ],
      registeredChemicalNotes: [
        'Insecticidal soap and horticultural oil offer contact suppression of nymphs',
        'Rotate modes of action to prevent rapid thrips resistance development',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not apply broad-spectrum organophosphates or synthetic pyrethroids (high resistance and kills beneficials)',
        'Never spray Spinosad during daytime when bees or pollinating insects are foraging (toxic to active bees; safe once dried)',
      ],
      preHarvestIntervalGuidance:
        'Follow exact product label in your country for pre-harvest intervals. Thoroughly wash edible produce before eating.',
      cureGuaranteeDisclaimer: 'Part of the thrips lifecycle (pupation) takes place in the soil or leaf litter; soil-level management and repeated foliage treatments are essential. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Thrips feeding causes cosmetic scarring; wash foliage before culinary preparation.',
      harvestPrecaution: 'Inspect basil and herbs thoroughly; discard heavily scarred, distorted leaves.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Thrips do not transmit human or veterinary pathogens.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Foliage and blossoms heavily targeted' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Vector of spotted wilt virus' },
      { plantSlug: 'french-marigold', relationshipType: 'confirmed_host', notes: 'Floral feeding causes petal browning' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Petal scarring and flower distortion' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Silvery feeding sheen on upper leaves' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Foliage bleaching' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Tough fibrous cuticle rarely penetrated' },
    ],
    references: [
      {
        title: 'Thrips: Integrated Pest Management for Home and Garden',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7429.html',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Western Flower Thrips in Greenhouses & Urban Agriculture',
        organization: 'Cornell University Cooperative Extension',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 5. Whiteflies
  {
    id: 'pest-whiteflies',
    category: 'pest',
    pestType: 'sap_sucking_insect',
    commonName: 'Whiteflies (Silverleaf / Greenhouse Whitefly)',
    scientificName: 'Bemisia tabaci, Trialeurodes vaporariorum (Aleyrodidae)',
    shortDescription:
      'Tiny, powdery-white moth-like insects that flutter up in clouds when foliage is disturbed; nymphs feed passively on leaf undersides.',
    observableSymptoms: [
      'Small white moth-like insects fluttering up into the air when foliage is shaken or brushed',
      'Semi-transparent, scale-like oval nymphs fixed to the underside of middle and lower leaves',
      'General leaf yellowing (chlorosis) and early leaf drop from sap depletion',
      'Sticky honeydew coating lower foliage, accompanied by black sooty mold growth',
    ],
    affectedPlantParts: ['leaves', 'stems'],
    possibleCauses: [
      'Warm, sheltered vertical rack or greenhouse environments lacking air movement and natural predators',
      'Overwintering populations on indoor houseplants',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 21, max: 32, optimal: '24°C–29°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Stagnant air on lower vertical shelves', 'High density container arrangements'],
    },
    visualIdentification: {
      sizeMm: { min: 1.0, max: 2.0 },
      colorDescription: 'Powdery, chalky white with pale yellow bodies under wings',
      morphology: 'Tiny moth-like winged adults with four powdery wings held roof-like over the body; immobile flat oval nymphs',
      lifeStagesVisible: ['Tiny stalked pale eggs on leaf underside', 'Translucent flat nymphs', 'Powdery white adults'],
    },
    damagePatterns: [
      'Phloem sap extraction leading to unthrifty growth and leaf drop',
      'Copious honeydew production facilitating sooty mold covering photosynthetic area',
      'Transmission of devastating geminiviruses (e.g. Tomato Yellow Leaf Curl Virus)',
    ],
    favoredPlantGroups: ['Solanaceae (Tomatoes)', 'Asteraceae', 'Lamiaceae', 'Herbs'],
    similarConditions: [
      {
        conditionId: 'pest-aphids',
        distinguishingFeature: 'Aphids do not fly in white clouds when shaken; whitefly adults have powdery white wings and immediately flutter up.',
      },
      {
        conditionId: 'disease-powdery-mildew',
        distinguishingFeature: 'Powdery mildew is a static fungal dusting on the leaf surface; whiteflies are living mobile insects.',
      },
    ],
    preventionGuidance: [
      'Carefully inspect the undersides of leaves before bringing new plants into an indoor or balcony setup',
      'Install yellow sticky cards near canopy level to intercept migrating adult females',
      'Ensure adequate ventilation fan airflow around vertical shelving tiers',
    ],
    treatment: {
      culturalControls: [
        'Prune lower leaves that are heavily encrusted with immobile nymphs and pupae',
        'Vacuum adult flies with a handheld low-power cordless vacuum in early cool mornings when insects are sluggish',
      ],
      physicalControls: [
        'Hang yellow sticky traps directly above canopy level to capture flying adults',
        'Spray leaf undersides with a forceful water rinse to dislodge adults',
      ],
      biologicalControls: [
        'Deploy parasitic wasps: Encarsia formosa or Eretmocerus eremicus in greenhouse or indoor setups',
        'Apply biological Beauveria bassiana (entomopathogenic fungus) spray',
      ],
      registeredChemicalNotes: [
        'Insecticidal soap or 1% horticultural mineral oil directed thoroughly at leaf undersides to coat immobile nymphs',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not apply broad-spectrum pyrethroids (whiteflies have widespread resistance and it triggers worse secondary outbreaks)',
        'Do not spray oils in hot direct sunlight (>32°C)',
      ],
      preHarvestIntervalGuidance:
        'Consult commercial product label for exact pre-harvest interval on culinary crops. Always wash edible greens thoroughly in potable water.',
      cureGuaranteeDisclaimer: 'Nymph stages develop waxy coverings that resist sprays; treatments must be repeated every 5–7 days across 3 weeks to break the lifecycle. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Whiteflies and honeydew are non-toxic to humans; wash foliage thoroughly before eating.',
      harvestPrecaution: 'Rinse harvested tomatoes and herbs thoroughly to remove honeydew residue.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Whiteflies do not bite or harm humans or domestic pets.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Primary target; clusters under canopy' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Severe honeydew and sooty mold risk' },
      { plantSlug: 'holy-basil-tulsi', relationshipType: 'confirmed_host', notes: 'Frequently attacked on balcony shelves' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Under-leaf colonization' },
      { plantSlug: 'french-marigold', relationshipType: 'confirmed_host', notes: 'Favored host plant' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for common greenhouse or silverleaf whiteflies; thick fibrous cuticle is unsuited for whitefly stylet feeding' },
    ],
    references: [
      {
        title: 'Whiteflies Management Guidelines',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7401.html',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Greenhouse Whitefly Biology & Control',
        organization: 'RHS (Royal Horticultural Society)',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 6. Mealybugs
  {
    id: 'pest-mealybugs',
    category: 'pest',
    pestType: 'sap_sucking_insect',
    commonName: 'Mealybugs (Citrus & Long-Tailed Mealybugs)',
    scientificName: 'Planococcus citri, Pseudococcus longispinus (Pseudococcidae)',
    shortDescription:
      'Slow-moving unarmored scale insects covered in white cottony wax secretions, hiding in leaf axils, stem crotches, and container rims.',
    observableSymptoms: [
      'White cottony or flour-like fuzzy tufts clustered in leaf axils, stem joints, and underside veins',
      'Stunted terminal growth with yellowing, wilted foliage despite adequate soil moisture',
      'Copious sticky honeydew attracting ants and supporting black sooty mold',
      'White waxy masses visible around pot drainage holes and root balls upon unpotting',
    ],
    affectedPlantParts: ['stems', 'leaves', 'roots', 'crown'],
    possibleCauses: [
      'Introducing unquarantined houseplants into container collections',
      'Warm indoor temperatures without natural seasonal diebacks or predators',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 30, optimal: '25°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Crowded indoor shelving', 'Over-fertilization stimulating succulent stem growth'],
    },
    visualIdentification: {
      sizeMm: { min: 2.0, max: 5.0 },
      colorDescription: 'Pinkish-white body completely obscured by a thick white powdery or filamentous wax coating',
      morphology: 'Segmented oval bodies fringed with short waxy filaments; long-tailed mealybugs feature two elongated caudal filaments',
      lifeStagesVisible: ['Mobile yellow crawlers', 'Wax-covered feeding adult females', 'Cottony egg sacs (ovisacs)'],
    },
    damagePatterns: [
      'Heavy phloem sap extraction causing premature foliage senescence',
      'Injection of toxic saliva causing localized chlorosis and shoot distortion',
      'Sooty mold colonization obstructing light absorption',
    ],
    favoredPlantGroups: ['Araceae (Pothos)', 'Succulents (Aloe, Sansevieria)', 'Solanaceae', 'Tropical Ornamentals'],
    similarConditions: [
      {
        conditionId: 'disease-powdery-mildew',
        distinguishingFeature: 'Powdery mildew produces a superficial flat white film across the leaf blade; mealybugs form distinct three-dimensional cottony tufts in stem joints.',
      },
      {
        conditionId: 'pest-scale-insects',
        distinguishingFeature: 'Armored and soft scale insects form rigid, immobile dome-shaped shells adhering tightly to stems; mealybugs secrete fluffy, unarmored cottony wax and remain slowly mobile.',
      },
    ],
    preventionGuidance: [
      'Thoroughly inspect leaf axils, petiole joints, and drainage holes before purchasing houseplants',
      'Isolate all new additions for a minimum of 3 weeks',
      'Clean plant staging shelves with soap and water between crops',
    ],
    treatment: {
      culturalControls: [
        'Isolate the infested container immediately to prevent crawlers moving to neighboring pots',
        'Prune heavily infested stems and double-bag for household trash disposal',
      ],
      physicalControls: [
        'Spot-treat individual mealybugs using a cotton swab dipped in 70% isopropyl rubbing alcohol (dissolves the protective wax and desiccates insect instantly)',
        'Wash plants with a firm warm water spray to dislodge nymphs',
      ],
      biologicalControls: [
        'Deploy the mealybug destroyer ladybird (Cryptolaemus montrouzieri) in enclosed spaces',
        'Apply biological insecticidal soap spray to target young crawlers before they secrete heavy wax',
      ],
      registeredChemicalNotes: [
        'Horticultural neem oil or mineral oil applied with complete coverage into tight stem crevices',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not pour neat undiluted alcohol over the entire plant or root ball (causes severe chemical leaf burn)',
        'Do not mix chemical insecticides with household cleaners',
      ],
      preHarvestIntervalGuidance:
        'Consult product label for exact pre-harvest interval if treating edible plants. Wash produce thoroughly before consumption.',
      cureGuaranteeDisclaimer: 'Mealybugs hide deep inside crown crevices and root collars; repeat inspections and spot-treatments weekly for at least a month. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Mealybugs are non-toxic to humans but render edible herbs unmarketable and unpalatable.',
      harvestPrecaution: 'Inspect stem axils of herbs; discard stems with waxy deposits.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Mealybugs are non-toxic and do not bite humans or animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Hides in petiole sheaths and leaf nodes' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'Colonizes base of leaves down into soil level' },
      { plantSlug: 'aloe-vera', relationshipType: 'confirmed_host', notes: 'Hides deep inside the basal rosette' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Attacks stem joints in sheltered balconies' },
      { plantSlug: 'broccoli-microgreens', relationshipType: 'rarely_affected', notes: 'Harvest cycle too rapid for mealybug establishment' },
    ],
    references: [
      {
        title: 'Mealybugs: Pest Notes for Home & Landscape',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn74174.html',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Mealybugs on Indoor Houseplants',
        organization: 'University of Minnesota Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 7. Scale Insects
  {
    id: 'pest-scale-insects',
    category: 'pest',
    pestType: 'sap_sucking_insect',
    commonName: 'Scale Insects (Soft & Armored Scale)',
    scientificName: 'Coccus hesperidum, Saissetia coffeae (Coccoidea)',
    shortDescription:
      'Immobile, waxy or shell-like bumps encrusting woody stems and leaf veins, sucking phloem sap and debilitating long-lived container plants.',
    observableSymptoms: [
      'Hard or waxy, raised oval bumps clustered along main stems, petiole ribs, and leaf undersides',
      'Bumps that can be gently scraped off with a thumbnail (distinguishing them from plant tissue)',
      'Yellow chlorotic haloing on the leaf surface directly surrounding feeding scale insects',
      'Sticky honeydew (soft scale only) and associated sooty mold coating foliage',
    ],
    affectedPlantParts: ['stems', 'leaves'],
    possibleCauses: [
      'Bringing untreated nursery foliage indoors',
      'Long-term indoor cultivation without natural biological control agents',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 18, max: 28, optimal: '22°C–26°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Stagnant indoor air', 'Perennial woody or thick-leaved container plants'],
    },
    visualIdentification: {
      sizeMm: { min: 2.0, max: 6.0 },
      colorDescription: 'Glossy brown, amber, tan, or black shell-like domes',
      morphology: 'Immobile flattened or hemispherical shields covering the insect body; armored scales have a detached shell, soft scales have a smooth waxy integument',
      lifeStagesVisible: ['Microscopic mobile yellow crawlers', 'Immobile feeding adult female shells'],
    },
    damagePatterns: [
      'Continuous phloem extraction causing progressive branch dieback',
      'Yellow chlorotic leaf spot halos over each feeding puncture',
      'General decline and gradual defoliation of perennial specimens',
    ],
    favoredPlantGroups: ['Araceae', 'Dracaenaceae', 'Succulents', 'Woody Herbs (Rosemary, Bay)'],
    similarConditions: [
      {
        conditionId: 'abiotic-edema',
        distinguishingFeature: 'Edema blisters are integral corky plant cells that cannot be scraped off; scale shells pop off easily with a thumbnail.',
      },
      {
        conditionId: 'pest-mealybugs',
        distinguishingFeature: 'Mealybugs are soft and covered in fluffy white cotton; scale insects have a distinct rigid or smooth waxy shell.',
      },
    ],
    preventionGuidance: [
      'Scrutinize woody stems, leaf petioles, and leaf undersides before acquiring perennial houseplants',
      'Prune and isolate any branch exhibiting initial scale encrustations immediately',
    ],
    treatment: {
      culturalControls: [
        'Isolate the infested container from other plants immediately',
        'Prune severely encrusted stems and discard in municipal trash',
      ],
      physicalControls: [
        'Manually scrape scales off stems using a soft toothbrush dipped in soapy water',
        'Dab individual shells with a cotton swab dipped in 70% isopropyl alcohol',
      ],
      biologicalControls: [
        'Release parasitic wasps (Metaphycus luteolus) in enclosed botanical collections',
        'Target the mobile crawler stage with horticultural insecticidal soap',
      ],
      registeredChemicalNotes: [
        'Thoroughly spray with 1–2% refined horticultural paraffinic oil during the crawler emergence phase to smother shells',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not scrape aggressively with knives or metal tools (damages stem cambium and opens entry wounds for fungi)',
        'Do not apply horticultural oil when plants are in direct hot sun (>30°C)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Verify product label for harvest withholding if treating edible herbs. Rinse stems and leaves thoroughly before consumption.',
      cureGuaranteeDisclaimer: 'Mature waxy scale shells protect adults and eggs from contact sprays; treatments must target the crawler stage repeatedly over 4–6 weeks. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Scale insects do not produce human toxins; scrape off or discard encrusted culinary stems.',
      harvestPrecaution: 'Discard heavily encrusted herb stems.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Scale insects are completely harmless to humans and domestic animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Common brown soft scale on climbing stems' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'Encrustations along leaf margins' },
      { plantSlug: 'aloe-vera', relationshipType: 'confirmed_host', notes: 'Scale insects attach to lower leaf bases' },
      { plantSlug: 'cherry-tomato', relationshipType: 'susceptible_family', notes: 'Occasionally colonizes mature woody stems' },
      { plantSlug: 'broccoli-microgreens', relationshipType: 'not_known_host', notes: 'Not a known host for scale insects; 10–14 day harvest cycle prevents sessile scale crawler settlement and adult maturation' },
    ],
    references: [
      {
        title: 'Scale Management Guidelines: Home & Landscape',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7408.html',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Soft Scale Insects in the Home and Greenhouse',
        organization: 'University of Florida IFAS Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 8. Caterpillars
  {
    id: 'pest-caterpillars',
    category: 'pest',
    pestType: 'chewing_insect',
    commonName: 'Leaf-Chewing Caterpillars (Cabbage Looper / Hornworm)',
    scientificName: 'Trichoplusia ni, Manduca quinquemaculata, Pieris rapae (Lepidoptera)',
    shortDescription:
      'Voracious chewing larvae of moths and butterflies causing irregular holes, ragged leaf margins, and dark pellet-like frass on foliage.',
    observableSymptoms: [
      'Irregular large ragged holes chewed into leaf blades, often leaving only main veins (skeletonizing)',
      'Chewed flower buds, young green fruits with deep round bore cavities',
      'Dark green or black barrel-shaped frass (fecal pellets) deposited on lower leaves and soil surface',
      'Camouflaged green or striped caterpillars clinging to the undersides of leaves or along petioles',
    ],
    affectedPlantParts: ['leaves', 'fruit', 'growing_tips', 'flowers'],
    possibleCauses: [
      'Night-flying adult moths or daytime butterflies laying eggs on outdoor balcony or patio gardens',
      'Sheltered outdoor vertical racks providing warm protection from insectivorous birds',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 18, max: 32, optimal: '22°C–28°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Outdoor open balconies during warm summer months', 'Nearby weeds hosting adult lepidoptera'],
    },
    visualIdentification: {
      sizeMm: { min: 10.0, max: 55.0 },
      colorDescription: 'Pale green, yellow-green with white longitudinal stripes, or bright green with horn-like tail spines',
      morphology: 'Cylindrical fleshy bodies with 3 pairs of true thoracic legs and up to 5 pairs of fleshy abdominal prolegs',
      lifeStagesVisible: ['Tiny spherical white/green eggs on leaf underside', 'Chewing larvae of various instars', 'Pupae in silken cocoons'],
    },
    damagePatterns: [
      'Rapid consumption of foliage surface area within 24–48 hours',
      'Boring into developing tomato fruits leading to secondary fruit rots',
      'Defoliation of brassica and leafy green crops',
    ],
    favoredPlantGroups: ['Brassicaceae (Radish, Microgreens)', 'Solanaceae (Tomatoes)', 'Herbs'],
    similarConditions: [
      {
        conditionId: 'pest-leafminers',
        distinguishingFeature: 'Leafminers produce winding translucent serpentine mines within the leaf blade; caterpillars chew full-thickness ragged holes and defoliate leaf edges.',
      },
      {
        conditionId: 'abiotic-sun-scorch',
        distinguishingFeature: 'Sun scorch produces paper-thin bleached translucent patches without chewed holes or dark fecal droppings.',
      },
    ],
    preventionGuidance: [
      'Cover outdoor edible vertical racks with fine insect barrier netting (mesh size < 1.2 mm) to prevent adult moths laying eggs',
      'Inspect leaf undersides weekly for tiny solitary eggs or young newly hatched loopers',
      'Remove broadleaf weeds near balcony containers',
    ],
    treatment: {
      culturalControls: [
        'Handpick caterpillars off foliage and drop into a bucket of soapy water (most effective for urban home gardens)',
        'Check plants at dusk or night with a flashlight (many hornworms and armyworms feed actively at night)',
      ],
      physicalControls: [
        'Install physical exclusion netting over young brassicas and greens',
        'Prune leaves bearing egg clusters and discard',
      ],
      biologicalControls: [
        'Apply biological Bacillus thuringiensis kurstaki (Btk) spray: target young feeding larvae; safe for humans and pets',
        'Protect naturally occurring parasitic braconid wasps (tiny white cocoons on a hornworm back indicates natural parasitization; leave intact!)',
      ],
      registeredChemicalNotes: [
        'Apply registered spinosad or Btk spray strictly according to the commercial product label for target edible crops',
      ],
      prohibitedPractices: [
        'Do not apply broad-spectrum chemical neurotoxins (carbaryl, synthetic pyrethroids) on culinary herbs and tomatoes',
        'Do not crush caterpillars with bare hands if sensitive (some hairy species cause mild contact skin irritation)',
      ],
      preHarvestIntervalGuidance:
        'Bacillus thuringiensis kurstaki (Btk) can be applied up to the day of harvest on most vegetable crops, but check regional commercial product label. Wash all produce thoroughly.',
      cureGuaranteeDisclaimer: 'Handpicking and Btk effectively manage existing larvae; exclusion netting is required to prevent new moth flights from laying subsequent batches. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Foliage chewing is mechanical; caterpillars do not poison the remaining plant. Wash produce thoroughly to remove frass.',
      harvestPrecaution: 'Inspect leaves for frass; wash greens in cold water.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Smooth garden loopers and hornworms are non-toxic to dogs and cats.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Tomato hornworm feeds voraciously on foliage' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Fruit boring cavities and leaf skeletonizing' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Cabbage looper and imported cabbageworm host' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Beet armyworm and cabbage looper target leaves' },
      { plantSlug: 'broccoli-microgreens', relationshipType: 'susceptible_family', notes: 'Indoor microgreens protected if screened' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for common vegetable loopers or hornworms' },
    ],
    references: [
      {
        title: 'Caterpillars on Tomatoes and Vegetables',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/GARDEN/VEGES/PESTS/caterpillars.html',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Bacillus thuringiensis (Bt) for Garden Caterpillar Management',
        organization: 'Colorado State University Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 9. Leafminers
  {
    id: 'pest-leafminers',
    category: 'pest',
    pestType: 'fly_larva',
    commonName: 'Serpentine Leafminers',
    scientificName: 'Liriomyza spp. (Agromyzidae)',
    shortDescription:
      'Tiny fly larvae tunneling within the interior mesophyll of leaf tissue, leaving winding serpentine white or translucent trails.',
    observableSymptoms: [
      'Winding, serpentine, translucent or white mines (trails) meandering across the leaf blade',
      'Mines that widen progressively as the concealed larva grows inside the leaf mesophyll',
      'Small white circular stippling punctures on upper leaf surfaces caused by adult female feeding/oviposition',
      'Brown, dried-out papery patches where dense multiple mines merge together',
    ],
    affectedPlantParts: ['leaves'],
    possibleCauses: [
      'Adult agromyzid flies laying eggs inside leaf tissue on warm balconies or greenhouses',
      'Absence of micro-hymenopteran parasitic wasps that naturally regulate leafminer populations',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 30, optimal: '24°C–28°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Over-application of synthetic pesticides killing beneficial parasitic wasps'],
    },
    visualIdentification: {
      sizeMm: { min: 1.5, max: 2.5 },
      colorDescription: 'Adults tiny black flies with a bright yellow dot on the thorax; larvae translucent yellow maggots inside the leaf',
      morphology: 'Headless, legless cylindrical maggots feeding exclusively between the upper and lower leaf epidermises',
      lifeStagesVisible: ['Tiny black-and-yellow flies', 'Internal translucent maggots inside mines', 'Brown pupal cases on soil surface'],
    },
    damagePatterns: [
      'Destruction of photosynthetic palisade and spongy parenchyma cells',
      'Cosmetic ruining of edible leafy greens (spinach, chard, lettuce)',
      'Leaf desiccation and early leaf drop under dense infestation',
    ],
    favoredPlantGroups: ['Chenopodiaceae (Spinach)', 'Asteraceae (Lettuce)', 'Solanaceae (Tomatoes)', 'Brassicaceae'],
    similarConditions: [
      {
        conditionId: 'disease-early-blight',
        distinguishingFeature: 'Early blight produces concentric dark brown circular target rings; leafminers leave narrow, winding white hollow tunnels.',
      },
      {
        conditionId: 'abiotic-salt-accumulation',
        distinguishingFeature: 'Salt burn creates dry margins; leafminers produce distinct winding serpentine tracks inside the green blade.',
      },
    ],
    preventionGuidance: [
      'Install fine insect barrier mesh netting (< 0.8 mm) over susceptible leafy greens (spinach, lettuce)',
      'Regularly scout lower foliage and pinch off early leaves showing single initial mines',
      'Avoid broad-spectrum chemical sprays that decimate native Diglyphus isaea parasitic wasps',
    ],
    treatment: {
      culturalControls: [
        'Pick off and crush or destroy mined leaves while the larva is still visible inside the tunnel',
        'Do not compost heavily mined leaves in cold home compost bins (larvae may complete pupation)',
      ],
      physicalControls: [
        'Physically crush the larva inside the mine by pressing firmly with thumb and forefinger without tearing the leaf',
        'Use yellow sticky cards to intercept adult agromyzid flies',
      ],
      biologicalControls: [
        'Conserve or release parasitic wasps (Diglyphus isaea or Dacnusa sibirica), which parasitize larvae inside mines',
        'Apply biological Spinosad spray where registered; Spinosad penetrates leaf cuticles via translaminar movement',
      ],
      registeredChemicalNotes: [
        'Surface contact sprays (soaps, standard pyrethrins) are ineffective against larvae protected inside the leaf',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not spray systemic organophosphates on edible greens',
        'Do not apply broad-spectrum insecticides that worsen outbreaks by killing parasitic wasps',
      ],
      preHarvestIntervalGuidance:
        'Verify product label for translaminar Spinosad pre-harvest interval on leafy vegetables. Thoroughly wash all edible leaves.',
      cureGuaranteeDisclaimer: 'Existing white serpentine tunnels are permanent physical damage to leaf tissue and will not turn green; management targets stopping new mine generation. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Leafminer tunnels are unpalatable cosmetically but non-toxic. Discard mined portions during kitchen prep.',
      harvestPrecaution: 'Sort and trim mined leaves from spinach and salad greens.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Leafminers are completely non-toxic and do not bite or harm humans or pets.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Primary target; serpentine mines ruin leaves' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Colonizes outer lower wrapper leaves' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Common in lower tomato canopy' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Liriomyza trifolii host' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Radish foliage attacked' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for agricultural Liriomyza leafminers' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Leafminers: Integrated Pest Management in Gardens',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7494.html',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Vegetable Leafminers: Biology and Biological Control',
        organization: 'University of Florida IFAS Extension',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },
];

// ==============================================================================
// 2. PLANT DISEASES (11 Conditions: Fungal, Oomycete, Bacterial, Viral)
// ==============================================================================

const DISEASE_CONDITIONS: DiseaseCondition[] = [
  // 10. Powdery Mildew
  {
    id: 'disease-powdery-mildew',
    category: 'disease',
    pathogenType: 'fungal',
    commonName: 'Powdery Mildew',
    scientificName: 'Podosphaera, Erysiphe, Golovinomyces spp. (Erysiphaceae)',
    shortDescription:
      'Widespread superficial fungal disease producing patches of white, powdery talcum-like spore growth across upper leaf surfaces and stems.',
    observableSymptoms: [
      'Circular white or light grey powdery spots appearing on upper leaf blades',
      'White fungal mycelium expanding to coat entire leaves, petioles, and flower buds like flour',
      'Foliage yellowing beneath fungal mats, becoming dry, brittle, and curling upward',
      'Premature leaf senescence and reduced bloom or fruit set',
    ],
    affectedPlantParts: ['leaves', 'stems', 'flowers'],
    possibleCauses: [
      'Airborne fungal conidia germinating in warm, humid microclimates with low light',
      'Dense vertical shelf arrangements with stagnant air circulation',
      'Over-fertilization with nitrogen creating dense, shaded foliage',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 15, max: 28, optimal: '20°C–24°C' },
      favorableHumidity: 'stagnant_air',
      moistureConditions: 'Does NOT require free standing water on leaves (unlike downy mildew); high ambient RH with dry leaf surfaces favors spore germination',
      culturalTriggers: ['Stagnant indoor air', 'Shaded lower shelves on vertical stands'],
    },
    transmissionVectors: [
      'Wind and indoor ventilation air currents carrying dry powdery conidia',
      'Hands, clothing, and pruning tools transferring spores between shelves',
    ],
    isolationGuidance:
      'Isolate infected containers to a well-ventilated location immediately. Fungal conidia travel easily on indoor drafts.',
    overwinteringMechanism: 'Survives as dormant mycelium in buds or as cleistothecia (chasmothecia) fruiting bodies in plant debris.',
    similarConditions: [
      {
        conditionId: 'disease-downy-mildew',
        distinguishingFeature: 'Downy mildew produces yellow angular patches on upper leaf surfaces and purple-grey fuzz strictly on the underside; powdery mildew forms white flour-like dusting on the upper surface.',
      },
      {
        conditionId: 'pest-mealybugs',
        distinguishingFeature: 'Mealybugs are three-dimensional cottony insects in stem joints; powdery mildew is a flat superficial white spore film across the leaf blade.',
      },
    ],
    preventionGuidance: [
      'Space vertical rack containers to ensure continuous horizontal airflow around every tier',
      'Locate sun-loving plants (zinnia, tomato) on upper shelves receiving direct light',
      'Avoid overhead watering late in the day',
    ],
    treatment: {
      culturalControls: [
        'Prune and destroy heavily coated leaves promptly to lower local spore load',
        'Improve vertical shelf airflow with a gentle oscillating fan set on low speed',
      ],
      physicalControls: [
        'Expose plants to direct morning sunlight (UV radiation inhibits powdery mildew spore viability)',
      ],
      biologicalControls: [
        'Foliar spray of biological Bacillus amyloliquefaciens (strain D747) or Bacillus subtilis',
        'Bio-fungicide potassium bicarbonate spray (0.3% solution: 3 g per liter water with drop of castile soap)',
      ],
      registeredChemicalNotes: [
        'Sulfur-based fungicides or copper fungicides (never apply sulfur within 30 days of oil-based sprays or when temperatures exceed 30°C)',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not apply sulfur in temperatures above 30°C (causes severe chemical phytotoxic leaf scorch)',
        'Do not mix chemical sulfur or copper with household bleach, hydrogen peroxide, or vinegar',
      ],
      preHarvestIntervalGuidance:
        'Verify registered commercial fungicide label for harvest withholding intervals. Wash culinary herbs and tomatoes thoroughly before preparation.',
      cureGuaranteeDisclaimer: 'Fungicides act primarily as protectants; severely damaged yellowed leaf tissue will not regain health and should be pruned. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Powdery mildew is non-toxic to humans but spoils culinary flavor and appearance. Wash produce before consumption.',
      harvestPrecaution: 'Discard heavily coated leaves from culinary harvests.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Plant powdery mildews do not infect humans or animals. Sensitive individuals should avoid inhaling dry spore dust.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'spearmint', relationshipType: 'confirmed_host', notes: 'Mint powdery mildew (Golovinomyces biocellatus) attacks foliage under dry canopy conditions' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Extremely susceptible host; leaves turn powdery white rapidly' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Leveillula taurica and Oidium neolycopersici host' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Upper and middle canopy foliage affected' },
      { plantSlug: 'genovese-basil', relationshipType: 'susceptible_family', notes: 'Occasional host under low light' },
      { plantSlug: 'coriander', relationshipType: 'susceptible_family', notes: 'Attacks flowering stems and foliage' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Powdery Mildew on Vegetables and Ornamentals',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7406.html',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Powdery Mildew in the Urban Garden',
        organization: 'Purdue University Extension Plant Pathology',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 11. Downy Mildew
  {
    id: 'disease-downy-mildew',
    category: 'disease',
    pathogenType: 'oomycete',
    commonName: 'Downy Mildew',
    scientificName: 'Peronospora belbahrii (Basil), Peronospora effusa (Spinach)',
    shortDescription:
      'Aggressive water-mold (oomycete) pathogen producing angular chlorotic yellow patches delimited by leaf veins on upper leaf surfaces, with purplish-grey sporulation underneath.',
    observableSymptoms: [
      'Angular, blocky yellow chlorotic patches on the upper surface of leaves, strictly bounded by leaf veins',
      'Purplish-grey to dark brown downy, felt-like spore growth on the corresponding lower leaf surface',
      'Rapid downward curling, wilting, and blighting of foliage in humid weather',
      'Total defoliation of sweet basil within 3–5 days of symptom onset',
    ],
    affectedPlantParts: ['leaves', 'stems'],
    possibleCauses: [
      'Prolonged leaf wetness (> 4–6 hours) combined with cool to warm nights and high ambient humidity (> 85% RH)',
      'Seed-borne oospores or infected commercial transplants',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 15, max: 24, optimal: '18°C–22°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Requires free standing water or continuous dew condensation on leaf surfaces for spore germination and infection',
      culturalTriggers: ['Overhead evening watering', 'Dense unventilated vertical racks'],
    },
    transmissionVectors: [
      'Wind-blown sporangia travelling long distances outdoors',
      'Splashing water droplets from overhead watering or rain',
      'Contaminated seed batches (seed-borne transmission in sweet basil)',
    ],
    isolationGuidance:
      'Immediately isolate or destroy infected basil and spinach plants. Spores spread aggressively across humid shared spaces.',
    overwinteringMechanism: 'Overwinters in living host tissue, greenhouse environments, or as resistant oospores in soil and seed.',
    similarConditions: [
      {
        conditionId: 'abiotic-nitrogen-deficiency',
        distinguishingFeature: 'Nitrogen deficiency causes uniform gradual yellowing of oldest lower leaves without dark felt-like fungal fuzz on the underside; downy mildew has vein-bounded angular yellow blocks with purple-grey fuzz beneath.',
      },
      {
        conditionId: 'disease-powdery-mildew',
        distinguishingFeature: 'Powdery mildew produces white talcum-like dust on the upper leaf surface; downy mildew produces yellow patches on top and purplish-grey growth underneath.',
      },
    ],
    preventionGuidance: [
      'Plant downy-mildew-resistant cultivars where available (e.g., Rutgers Passion DMR basil)',
      'Never water foliage in late afternoon or evening; water strictly at soil level early in the morning',
      'Ensure high light intensity and constant air circulation in vertical shelving systems',
    ],
    treatment: {
      culturalControls: [
        'Bag and remove infected plants immediately; do not compost in home bins',
        'Reduce plant density and thin stands to accelerate leaf drying',
      ],
      physicalControls: [
        'Expose plants to low humidity (< 60% RH) and continuous airflow to halt sporangial production',
        'Avoid overhead misting or splashing completely',
      ],
      biologicalControls: [
        'Preventive bio-fungicide drenches or sprays of Bacillus amyloliquefaciens',
        'Copper octanoate (copper soap) applied strictly preventively before symptoms emerge',
      ],
      registeredChemicalNotes: [
        'Downy mildews are oomycetes (water molds), not true fungi; standard powdery mildew fungicides (e.g. sulfur) are completely ineffective',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not apply sulfur expecting downy mildew control (ineffective and causes phytotoxicity)',
        'Do not compost infected basil foliage',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Verify registered label for copper fungicide pre-harvest intervals on culinary herbs. Wash all produce thoroughly.',
      cureGuaranteeDisclaimer:
        'Once downy mildew is established internally inside systemic basil tissue, curative eradication is impossible; management focuses on sanitation and prevention.',
    },
    severity: 'critical',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Non-toxic to humans, but destroys culinary herb flavor, producing an off-taste and brown decay.',
      harvestPrecaution: 'Harvest healthy uninfected upper shoots immediately before infection spreads.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Downy mildew oomycetes are strictly plant pathogens and harmless to humans and animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Peronospora belbahrii; devastating host susceptibility' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Peronospora effusa; major agricultural and garden disease' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Bremia lactucae; angular vein-delimited lesions' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Hyaloperonospora brassicae host' },
      { plantSlug: 'holy-basil-tulsi', relationshipType: 'resistant', notes: 'Exhibits significantly higher genetic resistance than sweet basil' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Basil Downy Mildew: Management Guidelines',
        organization: 'Cornell University Cooperative Extension',
        url: 'https://www.vegetables.cornell.edu/pest-management-disease-factsheets/basil-downy-mildew/',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Spinach Downy Mildew (Peronospora effusa)',
        organization: 'University of California Agriculture & Natural Resources',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 12. Early Blight
  {
    id: 'disease-early-blight',
    category: 'disease',
    pathogenType: 'fungal',
    commonName: 'Early Blight',
    scientificName: 'Alternaria solani (Pleosporaceae)',
    shortDescription:
      'Destructive fungal disease of tomatoes producing dark brown circular leaf lesions characterized by distinct concentric rings (target board pattern) surrounded by chlorotic yellow halos.',
    observableSymptoms: [
      'Lower oldest leaves develop dark brown or black circular spots with concentric target-board rings',
      'Bright yellow chlorotic halo surrounding each circular necrotic lesion',
      'Infected leaves yellow entirely, wither, dry to a crisp, and drop from the plant (bottom-up defoliation)',
      'Dark sunken leathery lesions at the stem end of green and ripe tomato fruits',
      'Dark collar rot lesions girdling seedling stems near the soil surface',
    ],
    affectedPlantParts: ['leaves', 'stems', 'fruit'],
    possibleCauses: [
      'Soil-borne Alternaria spores splashed onto lower leaves during watering or rain',
      'Warm humid weather (24°C–29°C) with frequent wet-dry foliage cycles',
      'Stressed or heavily fruiting tomato vines with depleted lower foliage nitrogen',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 32, optimal: '24°C–29°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Requires alternating wet periods (rain, heavy dew) followed by warm dry sunny conditions for sporulation',
      culturalTriggers: ['Water splashing from container soil onto bottom leaves', 'Pruning wounds left wet'],
    },
    transmissionVectors: [
      'Water droplets splashing soil fungal spores up onto foliage',
      'Wind-blown spores moving between balconies',
      'Contaminated shears, stakes, or infected seed',
    ],
    isolationGuidance:
      'Isolate infected tomato containers. Remove lower leaves up to 25 cm from the soil surface to break the splash infection ladder.',
    overwinteringMechanism: 'Overwinters in infected crop debris, volunteer solanaceous weeds, and potting soil.',
    similarConditions: [
      {
        conditionId: 'disease-septoria-leaf-spot',
        distinguishingFeature: 'Septoria spots are smaller (2–3 mm), more numerous, and have dark margins with distinct grey-white centers containing tiny black specks (pycnidia); Early blight spots are larger with concentric target rings.',
      },
      {
        conditionId: 'disease-bacterial-leaf-spot',
        distinguishingFeature: 'Bacterial spots appear water-soaked initially and do not develop concentric target-board rings.',
      },
    ],
    preventionGuidance: [
      'Prune all lower leaves touching or within 20 cm of the soil surface once the vine is 45 cm tall',
      'Mulch the container soil surface with clean straw, perlite, or coconut coir to prevent water-splash',
      'Water strictly at the base of the container using a watering can or drip tube; never wet leaves',
    ],
    treatment: {
      culturalControls: [
        'Prune off infected lower leaves immediately upon first sign of target spots and dispose in trash',
        'Disinfect pruning shears in 70% isopropyl alcohol between every pruning cut',
      ],
      physicalControls: [
        'Increase vertical spacing between plants to maximize air circulation and rapid canopy drying',
      ],
      biologicalControls: [
        'Preventive bio-fungicide sprays of Bacillus subtilis or Bacillus amyloliquefaciens',
        'Copper octanoate (copper soap) fungicide applied at the earliest sign of disease',
      ],
      registeredChemicalNotes: [
        'Apply fixed copper fungicides strictly adhering to the manufacturer product label instructions before lesions become widespread',
      ],
      prohibitedPractices: [
        'Do not spray foliage with overhead water or mix unregistered chemicals/bleach',
        'Do not work in tomato foliage when leaves are wet from dew or rain',
        'Do not compost diseased tomato foliage in home compost heaps',
      ],
      preHarvestIntervalGuidance:
        'Check specific commercial copper fungicide label for pre-harvest interval on tomatoes (typically 0–1 days for copper soap, but verify). Wash fruit thoroughly before eating.',
      cureGuaranteeDisclaimer: 'Fungicides protect uninfected green tissue; they cannot cure leaves that already exhibit necrotic target lesions. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Alternaria produces mycotoxins in rotting fruit tissue. Discard fruits with sunken black leathery rot lesions; do not can or eat rotted fruit.',
      harvestPrecaution: 'Harvest undamaged fruit above the infection zone. Discard fruits exhibiting stem-end rot.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Inhaling heavy Alternaria fungal dust can aggravate respiratory allergies in sensitive individuals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Primary host; bottom-up defoliation' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Target spots on foliage and stem collar rot' },
      { plantSlug: 'french-radish', relationshipType: 'rarely_affected', notes: 'Alternaria brassicae is a distinct brassica species' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Early Blight of Tomato and Potato',
        organization: 'University of Minnesota Extension',
        url: 'https://extension.umn.edu/diseases/early-blight-tomato',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Tomato Disease Management: Early Blight (Alternaria solani)',
        organization: 'Penn State Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 13. Septoria Leaf Spot
  {
    id: 'disease-septoria-leaf-spot',
    category: 'disease',
    pathogenType: 'fungal',
    commonName: 'Septoria Leaf Spot',
    scientificName: 'Septoria lycopersici (Mycosphaerellaceae)',
    shortDescription:
      'Destructive foliar disease of tomatoes causing numerous small circular spots with dark brown margins and sunken greyish-white centres dotted with tiny black fruiting bodies (pycnidia).',
    observableSymptoms: [
      'Numerous small (1.5–3 mm) circular water-soaked spots appearing first on lower leaves',
      'Lesions mature into circular spots with dark brown borders and distinctly pale grey or tan centers',
      'Tiny, black pin-prick specks (pycnidia fruiting bodies) visible in the pale center under magnification',
      'Heavily spotted leaves turn completely yellow, wither, curl brown, and drop prematurely',
      'Progressive upward defoliation exposing green tomato fruits to sunscald',
    ],
    affectedPlantParts: ['leaves', 'stems', 'calyx'],
    possibleCauses: [
      'Splashing water carrying fungal spores from contaminated soil or crop residue onto lower leaves',
      'Extended periods of warm, wet, or humid weather (20°C–25°C) with persistent leaf wetness',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 18, max: 28, optimal: '20°C–25°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Requires prolonged relative humidity (> 80%) and free water on leaves for spore release and infection',
      culturalTriggers: ['Overhead irrigation', 'Unpruned dense tomato foliage touching soil'],
    },
    transmissionVectors: [
      'Water droplets splashing conidia from pycnidia onto adjacent foliage',
      'Gardener hands, tools, and clothing moving through wet tomato vines',
      'Insects such as flea beetles and aphids mechanically carrying spores',
    ],
    isolationGuidance:
      'Isolate affected tomato containers. Remove lower spotted leaves immediately to arrest upward progression.',
    overwinteringMechanism: 'Overwinters on infected solanaceous crop debris, stakes, and perennial nightshade weeds.',
    similarConditions: [
      {
        conditionId: 'disease-early-blight',
        distinguishingFeature: 'Early blight lesions are larger (5–15 mm) with concentric target-board rings; Septoria spots are smaller, much more numerous, and have pale centers with tiny black specks.',
      },
      {
        conditionId: 'disease-bacterial-leaf-spot',
        distinguishingFeature: 'Bacterial spots do not develop black pin-prick pycnidia in their centers.',
      },
    ],
    preventionGuidance: [
      'Stake or cage tomato plants and prune suckers to keep foliage well above the container soil',
      'Mulch the container substrate with clean perlite, straw, or coco coir to prevent splash',
      'Water strictly at root level early in the morning so accidental splashes dry quickly',
    ],
    treatment: {
      culturalControls: [
        'Pinch off and discard infected lower leaves as soon as the first spots appear',
        'Sterilize pruning shears between plants with 70% isopropyl alcohol',
      ],
      physicalControls: [
        'Increase spacing between containers on vertical stands to promote rapid foliage drying',
      ],
      biologicalControls: [
        'Apply bio-fungicides containing Bacillus subtilis or Bacillus amyloliquefaciens preventively',
        'Copper soap (copper octanoate) fungicide applied at 7–10 day intervals during wet periods',
      ],
      registeredChemicalNotes: [
        'Apply registered copper fungicide protectant sprays strictly per product label directions to both upper and lower leaf surfaces',
      ],
      prohibitedPractices: [
        'Do not spray unregistered chemical mixtures or homemade bleach washes', 'Never handle or prune tomato vines when foliage is wet (rapidly spreads Septoria spores across all plants)',
        'Do not compost infected foliage in home compost bins',
      ],
      preHarvestIntervalGuidance:
        'Verify registered label for copper fungicide pre-harvest intervals on tomatoes. Wash fruit thoroughly.',
      cureGuaranteeDisclaimer: 'Infected leaves cannot be cured; treatment halts the spread of spores to healthy upper foliage. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Septoria does not directly rot tomato fruits (unlike early blight); however, defoliation causes severe fruit sunscald.',
      harvestPrecaution: 'Harvest fruit promptly; shade fruit if defoliation exposes it to intense sun.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Septoria lycopersici is exclusively a plant pathogen and harmless to humans and animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Severe lower canopy spotting' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Rapid bottom-up defoliation' },
      { plantSlug: 'genovese-basil', relationshipType: 'not_known_host', notes: 'Not a known host (Septoria lycopersici is host-specific to Solanaceae, especially tomato)' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Septoria Leaf Spot of Tomato',
        organization: 'University of Minnesota Extension',
        url: 'https://extension.umn.edu/diseases/septoria-leaf-spot-tomato',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Septoria Leaf Spot in the Home Vegetable Garden',
        organization: 'Cornell University Cooperative Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 14. Anthracnose
  {
    id: 'disease-anthracnose',
    category: 'disease',
    pathogenType: 'fungal',
    commonName: 'Anthracnose',
    scientificName: 'Colletotrichum coccodes, Colletotrichum dematium (Glomerellaceae)',
    shortDescription:
      'Fungal disease causing circular, sunken, water-soaked necrotic lesions on ripe and ripening fruits and dark angular leaf spots with salmon-pink spore masses in wet conditions.',
    observableSymptoms: [
      'Circular, sunken, water-soaked depressions on ripening and ripe tomato fruits',
      'Concentric rings of dark specks developing within the sunken fruit lesion',
      'Gelatinous, salmon-pink or orange spore masses oozing from fruit lesions under high humidity',
      'Tan or dark brown circular leaf spots, sometimes causing premature leaf drop',
    ],
    affectedPlantParts: ['fruit', 'leaves', 'stems'],
    possibleCauses: [
      'Infection by Colletotrichum fungi present in soil or on decaying organic residue',
      'Overripe fruits left hanging on the vine in warm wet conditions',
      'Rain or overhead irrigation splashing spores onto ripening fruit clusters',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 30, optimal: '25°C–28°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Requires free water on fruit surfaces for spore germination; prolonged wetness greatly accelerates rotting',
      culturalTriggers: ['Leaving overripe fruits on vines', 'Fruit touching container soil or saucer water'],
    },
    transmissionVectors: [
      'Splashing water from irrigation or rain',
      'Contaminated seed or infected transplants',
      'Garden tools and insect movement',
    ],
    isolationGuidance:
      'Immediately remove and discard all fruits showing circular sunken spots. Keep surrounding fruit dry.',
    overwinteringMechanism: 'Overwinters as microsclerotia in soil, on infected stakes, and within crop residue.',
    similarConditions: [
      {
        conditionId: 'abiotic-calcium-disorders',
        distinguishingFeature: 'Blossom end rot occurs strictly at the blossom end (bottom) of the fruit while green; anthracnose can appear anywhere on the fruit surface, especially on ripening or ripe tomatoes, with sunken circular lesions.',
      },
      {
        conditionId: 'disease-early-blight',
        distinguishingFeature: 'Early blight fruit rot is dark, leathery, and concentrated around the stem calyx; anthracnose produces circular sunken lesions that ooze salmon-pink spores.',
      },
    ],
    preventionGuidance: [
      'Harvest tomato fruits promptly as soon as they achieve ripe color; do not leave overripe fruit on vines',
      'Ensure tomato vines are staked so fruits never touch the soil surface or pot rim',
      'Water at the base of the container early in the morning so fruit surfaces dry rapidly',
    ],
    treatment: {
      culturalControls: [
        'Pick off and discard all infected fruit immediately in municipal trash',
        'Prune lower leaves to ensure rapid airflow around ripening fruit clusters',
      ],
      physicalControls: [
        'Clean stakes and containers with soapy water before replanting',
      ],
      biologicalControls: [
        'Preventive application of Bacillus amyloliquefaciens bio-fungicide',
        'Copper soap fungicide sprays applied to fruit clusters before disease takes hold',
      ],
      registeredChemicalNotes: [
        'Copper fungicides act as protectants on developing fruit; once fruit exhibits sunken circular rots, chemical sprays cannot reverse rot',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not compost anthracnose-rotted fruits in home compost bins (microsclerotia survive)',
        'Do not leave infected fruit rotting on container soil',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Verify registered copper product label for exact pre-harvest interval on tomatoes. Wash fruit thoroughly in clean water.',
      cureGuaranteeDisclaimer: 'Sunken fruit lesions represent irreversible internal tissue collapse; infected fruit must be removed. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: true,
      foodSafetyNotes: 'Do not eat or can anthracnose-rotted fruits; fungal rot alters fruit acidity and may harbor secondary spoilage organisms.',
      harvestPrecaution: 'Discard all fruit showing sunken circular lesions.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Colletotrichum does not cause animal infections, but rotted produce should not be fed to pets.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Ripe fruit lesions in warm wet weather' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Circular sunken lesions on ripe fruit' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Colletotrichum dematium causes leaf anthracnose' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Anthracnose of Tomato',
        organization: 'Purdue University Extension Plant Pathology',
        url: 'https://www.extension.purdue.edu/extmedia/BP/BP-180-W.pdf',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Tomato Anthracnose Management in Gardens',
        organization: 'University of Minnesota Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 15. Root Rot
  {
    id: 'disease-root-rot',
    category: 'disease',
    pathogenType: 'oomycete',
    commonName: 'Root Rot (Pythium / Phytophthora Complex)',
    scientificName: 'Pythium ultimum, Phytophthora spp., Rhizoctonia (Oomycota / Fungi)',
    shortDescription:
      'Subterranean water-mold and fungal decay of plant roots in waterlogged, poorly aerated container potting mix, causing brown slimy root breakdown and sudden canopy wilt.',
    observableSymptoms: [
      'Unexplained foliage wilting, drooping, or dulling despite the potting soil being wet or damp',
      'Lower leaves turn pale yellow, drop prematurely, or exhibit brown mushy stem bases',
      'Roots are dark brown, black, soft, slimy, or hollow, easily sloughing off when gently pulled',
      'Noticeable foul, sour, or stagnant anaerobic odor emanating from container drainage holes',
      'Healthy root systems (firm, white, crisp) are absent upon unpotting',
    ],
    affectedPlantParts: ['roots', 'crown', 'stems', 'leaves'],
    possibleCauses: [
      'Chronic overwatering and poorly draining potting substrate lacking perlite or aeration',
      'Pots without drainage holes or pots sitting permanently in water-filled saucers',
      'Reusing contaminated potting soil from previously diseased plants',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 15, max: 28, optimal: '20°C–24°C' },
      favorableHumidity: 'any',
      moistureConditions: 'Requires saturated, waterlogged, oxygen-depleted substrate; motile zoospores swim through water films to infect root tips',
      culturalTriggers: ['Containers without drainage holes', 'Leaving pots sitting in filled catch saucers'],
    },
    transmissionVectors: [
      'Contaminated potting mix, dirty recycled pots, or infected plant roots',
      'Recirculated runoff water in hydroponic or vertical drip systems',
      'Fungus gnat larvae carrying spores between containers',
    ],
    isolationGuidance:
      'Isolate affected container. Do not allow drainage runoff from this pot to enter other plant saucers or vertical trays.',
    overwinteringMechanism: 'Produces resilient thick-walled oospores and chlamydospores that survive for years in dry potting mix and dirty containers.',
    similarConditions: [
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering causes wilting in dry, light soil with crisp dry roots that recover within hours of watering; root rot causes wilting in heavy, wet soil with brown, mushy, foul-smelling roots.',
      },
      {
        conditionId: 'abiotic-overwatering-stress',
        distinguishingFeature: 'Overwatering stress is the cultural precursor (hypoxia); once Pythium/Phytophthora pathogens invade, root rot causes structural sloughing and necrotic root death.',
      },
    ],
    preventionGuidance: [
      'Always use containers with verified open drainage holes; never plant directly into sealed pots',
      'Formulate potting mixes with at least 20–25% coarse drainage material (perlite, pumice, coarse bark)',
      'Empty all runoff water from collection saucers within 30 minutes of watering',
    ],
    treatment: {
      culturalControls: [
        'Cease watering immediately and allow the root zone to aerate',
        'Unpot the plant, gently rinse away saturated soil, and inspect the root ball',
        'Prune away all brown, black, mushy, or slimy roots using sterilized shears, leaving only firm white roots',
        'Repot into a clean, sanitized container with fresh, pasteurized, well-draining potting mix',
      ],
      physicalControls: [
        'Wash and sanitize pots thoroughly with hot soapy water or an approved horticultural greenhouse disinfectant before reuse',
      ],
      biologicalControls: [
        'Incorporate biological Trichoderma harzianum or Streptomyces lydicus into fresh potting mix to protect new roots',
      ],
      registeredChemicalNotes: [
        'Chemical fungicide drenches are not recommended once roots have rotted away; physical excision, substrate aeration, and sanitation per product label instructions are required',
      ],
      prohibitedPractices: [
        'Do not pour bleach, chemical drain cleaners, or unregistered mixtures into potting soil', 'Do not water a wilting plant without checking soil moisture first (watering a root-rotted plant accelerates pathogen decay)',
        'Do not reuse soil from a root-rotted plant',
      ],
      preHarvestIntervalGuidance:
        'Sanitation measures carry no chemical withholding interval. Wash hands after handling decaying root matter.',
      cureGuaranteeDisclaimer: 'If more than 70% of the root system has rotted away, survival is unlikely; propagation of healthy upper stem cuttings is recommended. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'critical',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Root rot pathogens do not produce human toxins in foliage, but infected roots cannot support fruit production.',
      harvestPrecaution: 'Discard severely rotted plants.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Pythium and Phytophthora do not infect humans or pets. Anaerobic potting mix may harbor general bacteria; wash hands with soap.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'spearmint', relationshipType: 'confirmed_host', notes: 'Stolon and root decay occurs quickly if container potting mix remains waterlogged in saucers' },
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Common indoor casualty of overwatered saucers' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'Basal rhizome and root rot from winter overwatering' },
      { plantSlug: 'aloe-vera', relationshipType: 'confirmed_host', notes: 'Extremely vulnerable to root rot in heavy potting soil' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Sudden collapse in saturated container mixes' },
      { plantSlug: 'holy-basil-tulsi', relationshipType: 'confirmed_host', notes: 'Root decay in cool saturated substrates' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Drip-tray waterlogging kills roots' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Pythium root rot under poor drainage' },
    ],
    references: [
      {
        title: 'Root Rots in Container Gardening and Landscapes',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/GARDEN/PLANTS/DISEASES/rootrot.html',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Pythium Root Rot in Indoor & Greenhouse Crops',
        organization: 'Purdue University Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 16. Damping-Off
  {
    id: 'disease-damping-off',
    category: 'disease',
    pathogenType: 'oomycete',
    commonName: 'Damping-Off of Seedlings',
    scientificName: 'Pythium spp., Rhizoctonia solani, Fusarium spp.',
    shortDescription:
      'Lethal seedling disease caused by soil-borne fungi and water molds, causing newly germinated seedlings to rot at the soil line, topple over, and collapse.',
    observableSymptoms: [
      'Seeds rot in the soil before emergence (pre-emergence damping-off)',
      'Emerging seedling stems become water-soaked, thin, and wire-like right at the soil line',
      'Seedlings topple over abruptly while the top cotyledons are still green (post-emergence damping-off)',
      'Fluffy white mycelium spreading across the soil surface in seedling trays or microgreen mats',
    ],
    affectedPlantParts: ['seedlings', 'roots', 'stems'],
    possibleCauses: [
      'Cold, overly wet, waterlogged seedling starting media',
      'Overcrowded seedling density with inadequate air circulation and low light',
      'Reusing unwashed seedling flats or unpasteurized garden soil rather than pasteurized soilless seed-starting mix',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 12, max: 24, optimal: '15°C–20°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Continuous soil surface saturation combined with high ambient humidity',
      culturalTriggers: ['Sowing seeds too densely', 'Covering seedling trays with humidity domes without ventilation'],
    },
    transmissionVectors: [
      'Contaminated seed-starting trays and unsterilized soil mixes',
      'Water splashing between seed cells',
      'Fungus gnat larvae carrying spores across seedling flats',
    ],
    isolationGuidance:
      'Immediately remove and discard collapsed seedling patches along with surrounding soil to prevent radial spread across the flat.',
    overwinteringMechanism: 'Resilient oospores and resting sclerotia survive in soil, trays, and organic debris.',
    similarConditions: [
      {
        conditionId: 'pest-fungus-gnats',
        distinguishingFeature: 'Fungus gnat larvae feed on roots; damping-off produces a distinct water-soaked necrotic constriction at the soil line that causes seedlings to topple.',
      },
      {
        conditionId: 'abiotic-cold-injury',
        distinguishingFeature: 'Cold injury causes uniform purpling/stunting; damping-off causes localized constriction and collapse at the soil surface.',
      },
    ],
    preventionGuidance: [
      'Use only fresh, pasteurized, soilless seed-starting mix (peat/perlite or coco coir)',
      'Wash reusable seed trays thoroughly with hot soapy water and an approved horticultural disinfectant before sowing',
      'Remove humidity domes as soon as the first seeds germinate to allow surface drying',
      'Provide bottom heat (seedling heat mat at 21°C–24°C) to accelerate rapid germination and stem emergence',
    ],
    treatment: {
      culturalControls: [
        'Discard collapsed seedlings and adjacent substrate immediately',
        'Increase ventilation with a gentle fan to dry the surface of seedling flats',
        'Water seedling trays strictly from the bottom; never mist emerged seedlings from above',
      ],
      physicalControls: [
        'Sprinkle a thin layer of horticultural vermiculite or clean dry sand over the substrate surface',
      ],
      biologicalControls: [
        'Drench seed-starting media with biological Trichoderma or Streptomyces lydicus bio-fungicide',
      ],
      registeredChemicalNotes: [
        'Chemical fungicides are not recommended for home seedling flats; prevention via clean, sanitized culture is standard',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not apply unlabelled synthetic chemical drenches or homemade bleach mixtures to seedling flats', 'Do not sow seeds in heavy garden topsoil in containers (poor aeration and high pathogen load)',
        'Do not keep plastic humidity domes on seedlings after germination',
      ],
      preHarvestIntervalGuidance: 'Non-chemical cultural sanitation controls carry no pre-harvest interval. If commercial bio-fungicide seed treatments are utilized, verify the product container label before harvest.',
      cureGuaranteeDisclaimer: 'Seedlings that have collapsed cannot be revived; the stem vascular tissue is structurally destroyed. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'critical',
    edibleCropRelevance: {
      isFoodSafetyConcern: true,
      foodSafetyNotes: 'Do not consume microgreens or sprouts exhibiting fungal mold, decay, or water-soaked collapse. Warm, moist sprouting conditions that foster fungal damping-off also represent a primary risk environment for human foodborne bacterial pathogens (Salmonella enterica, Escherichia coli O157:H7, Listeria monocytogenes). While garden pests are absent in jar sprouting, microbial food-safety risks are significant.',
      harvestPrecaution: 'Discard entire microgreen sections or sprouting batches where mold or collapse occurs. Thoroughly wash sprouting vessels with hot soapy water. Vulnerable individuals (pregnant women, elderly, children, immunocompromised) should avoid consuming raw sprouts.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Wash hands after handling moldy seedling media.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'broccoli-sprouts', relationshipType: 'susceptible_family', notes: 'Sprouting seeds can succumb to Pythium or fungal mold if drainage is poor; distinct from foodborne bacterial contamination' },
      { plantSlug: 'mung-bean-sprouts', relationshipType: 'susceptible_family', notes: 'Stagnant water promotes seed rot and fungal decay; requires complete rinse drainage' },
      { plantSlug: 'alfalfa-sprouts', relationshipType: 'susceptible_family', notes: 'Dense seed beds in sprouting jars are susceptible to seed decay and mold under poor drainage' },
      { plantSlug: 'broccoli-microgreens', relationshipType: 'confirmed_host', notes: 'High-density sowing increases damping-off vulnerability' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Slow-germinating spinach seeds vulnerable in cold damp mix' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Tender seedling stems collapse quickly' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Vulnerable in saturated seedling cells' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Requires warm soil to outgrow damping-off' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Slow emergence increases susceptibility' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Wire-stem symptom at soil line' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Rhizoctonia collar rot on seedlings' },
    ],
    references: [
      {
        title: 'Damping-Off in Flower and Vegetable Seedlings',
        organization: 'University of Minnesota Extension',
        url: 'https://extension.umn.edu/solve-problem/damping',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Damping-Off in Greenhouse and Microgreen Production',
        organization: 'Purdue University Extension Plant Pathology',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 17. Bacterial Leaf Spot
  {
    id: 'disease-bacterial-leaf-spot',
    category: 'disease',
    pathogenType: 'bacterial',
    commonName: 'Bacterial Leaf Spot',
    scientificName: 'Xanthomonas campestris, Pseudomonas syringae',
    shortDescription:
      'Bacterial infection causing small, water-soaked, angular or greasy spots on leaves that turn dark brown with translucent margins and yellow chlorotic halos.',
    observableSymptoms: [
      'Small (1–3 mm), dark, water-soaked angular spots on leaves, often bounded by small veins',
      'Spots turn dark brown or black with a greasy appearance on the leaf underside',
      'Surrounding tissue develops a bright yellow chlorotic halo',
      'Under wet morning conditions, microscopic milky bacterial ooze may bead on lesions',
      'Severely spotted leaves turn yellow, ragged, and drop prematurely',
    ],
    affectedPlantParts: ['leaves', 'stems', 'fruit'],
    possibleCauses: [
      'Bacteria entering natural leaf openings (stomata, hydathodes) or mechanical abrasions during wet periods',
      'Water splashing from overhead watering, rain, or high humidity condensation',
      'Contaminated seed or uncertified transplants',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 22, max: 32, optimal: '25°C–30°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Requires free water on leaves for bacteria to swim into stomatal pores and infect tissue',
      culturalTriggers: ['Overhead spraying or misting of foliage', 'Working in wet plants'],
    },
    transmissionVectors: [
      'Splashing water droplets from rain or hose',
      'Pruning shears, tools, and hands touching wet leaves',
      'Seed-borne transmission on commercial seed coats',
    ],
    isolationGuidance:
      'Isolate infected containers. Keep foliage completely dry to prevent bacteria swimming to neighboring plants.',
    overwinteringMechanism: 'Survives on infected crop debris, weed hosts, and on contaminated seed coats.',
    similarConditions: [
      {
        conditionId: 'disease-early-blight',
        distinguishingFeature: 'Early blight fungal lesions produce concentric target rings; bacterial spots remain angular, greasy, and lack concentric rings.',
      },
      {
        conditionId: 'disease-septoria-leaf-spot',
        distinguishingFeature: 'Septoria spots develop grey-white centers with black pycnidia specks; bacterial spots are dark, greasy, and lack pycnidia.',
      },
    ],
    preventionGuidance: [
      'Purchase certified disease-free and hot-water-treated seed where available',
      'Water strictly at the soil line using a watering can or drip line; never wet leaves',
      'Increase container spacing to maximize air circulation and rapid canopy drying',
    ],
    treatment: {
      culturalControls: [
        'Prune and destroy infected leaves immediately when plants are completely dry',
        'Sanitize all pruning tools in 70% isopropyl alcohol between plants',
      ],
      physicalControls: [
        'Improve ventilation and direct sunlight exposure to dry foliage rapidly',
      ],
      biologicalControls: [
        'Apply biological Bacillus subtilis or Bacillus amyloliquefaciens preventively to colonize leaf surfaces',
      ],
      registeredChemicalNotes: [
        'Fixed copper bactericides (copper octanoate / copper hydroxide) provide protective barrier if applied before widespread infection',
        'Antibiotics (streptomycin) are strictly regulated or prohibited in home gardening to avoid resistance',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Never handle or prune plants when foliage is wet (rapidly spreads bacteria across all plants)',
        'Do not apply synthetic fungicides (fungicides do not control bacterial pathogens)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Verify copper bactericide label for pre-harvest intervals on tomatoes and herbs. Wash all produce thoroughly.',
      cureGuaranteeDisclaimer: 'Bacterial infections inside leaf parenchyma cannot be cured; management focuses on preventing spread to new growth. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Plant pathogenic Xanthomonas bacteria do not infect humans; however, discard heavily spotted leaves.',
      harvestPrecaution: 'Harvest fruit and healthy leaves above the disease zone.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Plant pathogenic bacteria are harmless to humans and animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Xanthomonas perforans host; fruit spotting and leaf drop' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Angular water-soaked leaf spots' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Pseudomonas syringae pv. coriandricola causes bacterial blight' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Xanthomonas campestris pv. vitians causes bacterial spot' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Bacterial Spot of Tomato',
        organization: 'University of Florida IFAS Extension',
        url: 'https://edis.ifas.ufl.edu/publication/VH027',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Bacterial Diseases of Vegetables',
        organization: 'Purdue University Extension',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 18. Fusarium Wilt
  {
    id: 'disease-fusarium-wilt',
    category: 'disease',
    pathogenType: 'fungal',
    commonName: 'Fusarium Wilt',
    scientificName: 'Fusarium oxysporum (Nectriaceae)',
    shortDescription:
      'Lethal soil-borne vascular fungal pathogen that enters root tips and colonizes the xylem water-conducting vessels, causing one-sided yellowing, vascular browning, and irreversible daytime wilt.',
    observableSymptoms: [
      'Characteristic "one-sided" yellowing: leaves on one side of a stem or one side of the plant turn yellow while the other side remains green',
      'Foliage wilts during warm sunny afternoons but partially recovers at night initially',
      'Vascular discoloration: cutting the lower main stem lengthwise reveals dark reddish-brown staining in the xylem ring',
      'Permanent wilting, stunting, foliage browning, and eventual complete vine collapse',
    ],
    affectedPlantParts: ['roots', 'stems', 'leaves', 'whole_plant'],
    possibleCauses: [
      'Infection by host-specific formae speciales of Fusarium oxysporum in potting soil',
      'Warm soil temperatures (27°C–32°C) accelerating fungal growth inside xylem vessels',
      'Using unsterilized recycled containers or contaminated soil mixes',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 24, max: 34, optimal: '27°C–30°C' },
      favorableHumidity: 'any',
      moistureConditions: 'Pathogen infects roots in moist warm soil; wilting symptoms are exacerbated by high ambient heat and evaporative demand',
      culturalTriggers: ['Warm substrate temperatures in shallow dark containers on hot balconies'],
    },
    transmissionVectors: [
      'Contaminated potting soil, unsterilized recycled containers, and infected transplants',
      'Water drainage running from infected containers into adjacent pots',
      'Contaminated garden trowels and tools',
    ],
    isolationGuidance:
      'Immediately isolate and discard infected plants along with their soil. Do not allow runoff to touch other containers.',
    overwinteringMechanism: 'Produces chlamydospores with thick resilient walls that survive in soil and pots for over 10 years without a host.',
    similarConditions: [
      {
        conditionId: 'disease-root-rot',
        distinguishingFeature: 'Root rot produces soft, slimy, black rotted roots with a foul smell; Fusarium wilt roots often appear visually intact outside, but the internal stem xylem shows brown vascular staining.',
      },
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering wilts the entire plant symmetrically and leaves recover within 2 hours of watering; Fusarium wilt causes one-sided yellowing and vascular browning that fails to recover.',
      },
    ],
    preventionGuidance: [
      'Plant certified resistant cultivars (indicated by "F" or "FF" on seed packets for tomatoes)',
      'Always use fresh, pasteurized soilless potting mix in clean containers',
      'Wash and disinfect used containers thoroughly with hot soapy water or an approved horticultural disinfectant before replanting',
    ],
    treatment: {
      culturalControls: [
        'There is no cure once vascular xylem vessels are colonized; remove and discard the plant and soil immediately',
        'Do not save seeds from infected plants',
      ],
      physicalControls: [
        'Thoroughly scrub pots with hot soapy water or sanitize using an approved horticultural greenhouse sanitizer before reusing',
      ],
      biologicalControls: [
        'Incorporate beneficial biological fungi (Trichoderma harzianum) into fresh potting mix as a preventive root colonizer',
      ],
      registeredChemicalNotes: [
        'Chemical fungicides are not effective and not recommended once Fusarium is established inside vascular tissue; discard plant safely',
      ],
      prohibitedPractices: [
        'Do not apply chemical drenches or homemade bleach mixtures to cure wilted plants (ineffective)', 'Do not dump infected soil into home garden beds or compost heaps (chlamydospores contaminate soil for years)',
        'Do not take stem cuttings from infected vines',
      ],
      preHarvestIntervalGuidance: 'Non-chemical cultural management is mandatory; chemical fungicides cannot rescue infected xylem. Consult commercial product labels if any registered bio-fungicides are used in your jurisdiction.',
      cureGuaranteeDisclaimer: 'Vascular wilt pathogens cannot be eradicated from inside an infected living plant; disposal is the only safe management course. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'critical',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Fusarium oxysporum does not produce mycotoxins harmful to humans on unblemished fruit; harvest healthy ripe fruit before discarding vine.',
      harvestPrecaution: 'Harvest ripe fruits immediately before plant collapses.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Fusarium oxysporum plant strains are non-pathogenic to humans and domestic pets.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Fusarium oxysporum f. sp. lycopersici host' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Vascular browning and one-sided wilt' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Fusarium oxysporum f. sp. basilicum causes dark stem streaks' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Fusarium oxysporum f. sp. spinaciae causes seedling and mature wilt' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for specialized vegetable formae speciales of Fusarium oxysporum' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Fusarium Wilt of Tomato',
        organization: 'University of Florida IFAS Extension',
        url: 'https://edis.ifas.ufl.edu/publication/PP115',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Fusarium Wilt of Basil',
        organization: 'University of Massachusetts Amherst Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 19. Botrytis Gray Mold
  {
    id: 'disease-botrytis-gray-mold',
    category: 'disease',
    pathogenType: 'fungal',
    commonName: 'Botrytis Gray Mold',
    scientificName: 'Botrytis cinerea (Sclerotiniaceae)',
    shortDescription:
      'Ubiquitous necrotrophic fungal pathogen causing soft, water-soaked brown rot covered by a dense, fuzzy, mouse-grey blanket of airborne fungal spores in cool, humid conditions.',
    observableSymptoms: [
      'Dense, velvety, mouse-grey to brownish fuzzy fungal growth covering rotting flowers, fruit, or leaves',
      'Water-soaked, soft, brownish lesions on stems, particularly around pruning stubs and leaf scars',
      'Pale circular ghost spots (halos) on green tomato fruits caused by aborted spore germ tubes',
      'Rapid rotting and collapse of tender flower petals, ripening fruits, and wounded foliage',
    ],
    affectedPlantParts: ['flowers', 'fruit', 'stems', 'leaves'],
    possibleCauses: [
      'Cool to mild temperatures (15°C–22°C) combined with prolonged high relative humidity (> 85% RH)',
      'Spent flowers or dying leaves left clinging to moist plant stems',
      'Poor air movement and plant overcrowding in enclosed vertical rack tiers',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 24, optimal: '15°C–20°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Requires free moisture on plant tissue or continuous high humidity (> 90%) for spore germination and colonization',
      culturalTriggers: ['Leaving spent dead flower petals on plants', 'Pruning in humid weather leaving wet cut stubs'],
    },
    transmissionVectors: [
      'Airborne conidia released in vast clouds when fuzzy mold is disturbed',
      'Splashing water droplets from watering',
      'Pruning tools cutting through infected and healthy stems',
    ],
    isolationGuidance:
      'Carefully bag moldy plant parts before cutting to prevent dispersing spore clouds onto neighboring containers.',
    overwinteringMechanism: 'Survives as hard black resting bodies (sclerotia) in plant debris and soil, and as saprophytic mycelium.',
    similarConditions: [
      {
        conditionId: 'disease-powdery-mildew',
        distinguishingFeature: 'Powdery mildew is superficial, white, dry, and flour-like on live leaves; Botrytis is dense, fuzzy, mouse-grey, and causes soft mushy tissue rot.',
      },
      {
        conditionId: 'pest-mealybugs',
        distinguishingFeature: 'Mealybugs are white cottony insects in stem crotches; Botrytis is fuzzy grey fungal sporulation covering decaying tissue.',
      },
    ],
    preventionGuidance: [
      'Prune dead flowers (deadheading) and yellowing leaves promptly before Botrytis colonizes them',
      'Ensure adequate horizontal airflow around vertical shelving tiers with an oscillating fan',
      'Water early in the morning so plant surfaces and container rims dry before nightfall',
    ],
    treatment: {
      culturalControls: [
        'Carefully clip off and bag moldy blossoms, leaves, and fruit without shaking spores onto healthy foliage',
        'Increase ventilation and reduce relative humidity below 80% RH',
      ],
      physicalControls: [
        'Sanitize pruning tools between cuts with 70% alcohol',
        'Expose plants to direct morning sunshine and dry air',
      ],
      biologicalControls: [
        'Apply biological bio-fungicides: Bacillus subtilis or Streptomyces lydicus preventively',
        'Apply copper soap fungicide at early flower set in cool humid weather',
      ],
      registeredChemicalNotes: [
        'Botrytis readily develops resistance to single-site systemic fungicides; cultural sanitation and humidity control are the primary defenses',
      
        'Apply registered controls strictly according to the manufacturer product label instructions',],
      prohibitedPractices: [
        'Do not mist plants in cool, humid, or cloudy weather',
        'Do not leave dead plant litter in containers or on vertical rack shelves',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Check specific commercial fungicide label for pre-harvest intervals on vegetables and herbs. Wash produce thoroughly.',
      cureGuaranteeDisclaimer: 'Tissues colonized by Botrytis are structurally decayed and cannot be restored; remove affected parts. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: true,
      foodSafetyNotes: 'Do not eat fruit or foliage colonized by fuzzy Botrytis mold; discard decayed items.',
      harvestPrecaution: 'Discard moldy fruits and leaves; harvest healthy undamaged produce.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Inhaling clouds of Botrytis spores can trigger allergic respiratory reactions or asthma in sensitive individuals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Ghost spots on fruit and stem cankers' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Blossom and ripe fruit decay' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Basal grey mold in dense heads' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Leaf rot in cool humid conditions' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Spent flower petal blighting' },
      { plantSlug: 'french-marigold', relationshipType: 'confirmed_host', notes: 'Decaying floral head mold' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Thick waxy cuticle and xerophytic foliage rarely affected unless injured or under extreme cold saturation' },
    ],
    references: [
      {
        title: 'Gray Mold (Botrytis cinerea) Management Guidelines',
        organization: 'University of California Statewide IPM',
        url: 'https://ipm.ucanr.edu/PMG/GARDEN/PLANTS/DISEASES/botrytis.html',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Botrytis Blight and Gray Mold in Greenhouse Crops',
        organization: 'Purdue University Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 20. Mosaic Virus Symptoms
  {
    id: 'disease-mosaic-virus',
    category: 'disease',
    pathogenType: 'viral',
    commonName: 'Mosaic Virus Complex (TMV / CMV)',
    scientificName: 'Tobacco Mosaic Virus (TMV), Cucumber Mosaic Virus (CMV) (Viruses)',
    shortDescription:
      'Submicroscopic viral plant pathogens causing mottled light-and-dark green mosaic foliage patterns, shoestring leaf distortion, and stunted unthrifty growth.',
    observableSymptoms: [
      'Mottled foliage displaying irregular contrasting patches of dark green and pale yellow-green',
      'Shoestring distortion: leaf blades fail to expand, producing thin, strap-like or thread-like foliage',
      'Pronounced leaf puckering, blistering, curling, and overall plant stunting',
      'Uneven fruit coloration, bumpy fruit surfaces, and ringspots on developing tomatoes',
    ],
    affectedPlantParts: ['leaves', 'fruit', 'growing_tips', 'whole_plant'],
    possibleCauses: [
      'Transmission by sap-sucking insect vectors, primarily aphids and thrips',
      'Mechanical transmission via gardener hands, pruning shears, or tobacco residue on smoker fingers',
      'Contaminated seed coats or infected vegetative nursery cuttings',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 32, optimal: '25°C–28°C' },
      favorableHumidity: 'any',
      culturalTriggers: ['Aphid infestations', 'Handling plants after smoking tobacco without washing hands'],
    },
    transmissionVectors: [
      'Aphid stylet transfer during exploratory feeding (Cucumber Mosaic Virus)',
      'Mechanical sap transfer via hands, tools, and clothing (Tobacco Mosaic Virus)',
      'Seed-borne transmission in uncertified seed batches',
    ],
    isolationGuidance:
      'Immediately isolate and discard virus-infected plants. Viral pathogens are systemic and cannot be cured.',
    overwinteringMechanism: 'Overwinters in perennial weeds, contaminated seed, and as extremely stable virus particles on stakes and tools.',
    similarConditions: [
      {
        conditionId: 'abiotic-iron-deficiency',
        distinguishingFeature: 'Iron deficiency causes clean, uniform interveinal chlorosis (veins green, blade yellow) on young leaves without leaf blistering or shoestring distortion; mosaic virus causes irregular blotchy mottling and leaf puckering.',
      },
      {
        conditionId: 'abiotic-nitrogen-deficiency',
        distinguishingFeature: 'Nitrogen deficiency causes uniform, pale green-yellow chlorosis progressing from bottom leaves upward without mottling; mosaic virus causes irregular, blotchy mosaic patterns with distorted puckering.',
      },
    ],
    preventionGuidance: [
      'Plant virus-resistant cultivars (indicated by "T" or "TMV" on tomato seed packets)',
      'Control aphid and thrips vectors early using insecticidal soap and yellow sticky cards',
      'Wash hands thoroughly with soap and water before handling plants (especially gardeners who use tobacco products)',
    ],
    treatment: {
      culturalControls: [
        'There are no chemical or biological cures for plant viruses; infected plants must be removed and discarded',
        'Do not compost virus-infected plants in home compost heaps',
      ],
      physicalControls: [
        'Disinfect pruning shears in a 20% nonfat dry milk solution or 70% isopropyl rubbing alcohol between plants to deactivate viral particles',
      ],
      biologicalControls: [
        'Suppress insect vectors (aphids) using biological controls (ladybugs, lacewings, insecticidal soap)',
      ],
      registeredChemicalNotes: [
        'No chemical pesticide or spray can cure a plant virus inside plant cells; chemical treatments are not effective and not recommended',
      ],
      prohibitedPractices: [
        'Do not spray chemical pesticides or homemade bleach washes in an attempt to cure viral infections', 'Do not handle plants after using tobacco products without washing hands with soap and water',
        'Do not take cuttings or save seed from virus-infected plants',
      ],
      preHarvestIntervalGuidance: 'Non-chemical cultural sanitation applies; viral infections cannot be cured chemically. If vector-control insecticidal soaps are applied, verify the exact commercial product label for harvest intervals.',
      cureGuaranteeDisclaimer: 'Plant viruses are systemic within cellular DNA/RNA pathways; no treatment can cure an infected plant. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'critical',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Plant viruses do not infect humans or animals; fruit from infected vines is safe to eat if aesthetically acceptable.',
      harvestPrecaution: 'Harvest mature fruits before discarding infected vines.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Plant viruses are strictly specific to botanical hosts and completely harmless to humans and animals.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'TMV and ToMV host; leaf curling and stunting' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Mottled mosaic patterns on foliage' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Alfalfa mosaic virus and CMV host' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Cucumber mosaic virus causes spinach blight' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Tobacco Mosaic Virus' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Tomato Mosaic Virus and Tobacco Mosaic Virus',
        organization: 'University of Minnesota Extension',
        url: 'https://extension.umn.edu/diseases/tomato-mosaic-virus-and-tobacco-mosaic-virus',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Cucumber Mosaic Virus in Home Gardens',
        organization: 'University of Maryland Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },
];

// ==============================================================================
// 3. ABIOTIC DISORDERS & NUTRIENT DEFICIENCIES (15 Conditions)
// ==============================================================================

const ABIOTIC_CONDITIONS: AbioticCondition[] = [
  // 21. Nitrogen Deficiency
  {
    id: 'abiotic-nitrogen-deficiency',
    category: 'abiotic',
    abioticCategory: 'macronutrient_deficiency',
    mobilityInPlant: 'mobile',
    commonName: 'Nitrogen Deficiency',
    shortDescription:
      'Primary macronutrient deficiency causing general, uniform pale yellowing (chlorosis) beginning on the oldest lower leaves, while new growth remains small and pale green.',
    observableSymptoms: [
      'Oldest lower leaves turn uniformly pale yellow or yellowish-green across the entire leaf blade',
      'Yellowing progresses upward from the base of the plant toward the canopy',
      'Stems may develop thin, spindly growth and reddish-purple tinting in tomatoes',
      'Overall growth is stunted; foliage remains small and unthrifty',
    ],
    affectedPlantParts: ['leaves', 'stems', 'whole_plant'],
    possibleCauses: [
      'Nutrient depletion in confined container potting volume from prolonged watering leaching',
      'Using unfertilized or exhausted potting mix',
      'Substrate pH below 5.5 or above 7.5 reducing nitrogen uptake',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Frequent heavy watering leaching soluble nitrate ions out of container drainage holes', 'Rapid vegetative flush exhausting soil reserves'],
    },
    diagnosticKey:
      'Uniform chlorosis starting strictly on oldest lower leaves because nitrogen is phloem-mobile and translocated to support new upper shoots.',
    similarConditions: [
      {
        conditionId: 'abiotic-iron-deficiency',
        distinguishingFeature: 'Iron deficiency starts on the newest upper leaves with green veins (interveinal); nitrogen deficiency starts on the oldest lower leaves uniformly.',
      },
      {
        conditionId: 'abiotic-overwatering-stress',
        distinguishingFeature: 'Overwatering causes lower leaves to turn yellow but with soft, water-soaked, limp foliage and soggy soil; nitrogen deficiency leaves remain firm and dry.',
      },
    ],
    preventionGuidance: [
      'Incorporate a balanced slow-release organic fertilizer into container potting mix at planting',
      'Top-dress containers monthly with aged organic compost or worm castings',
      'Avoid excessive watering that flushes nutrient-rich runoff from containers',
    ],
    treatment: {
      culturalControls: [
        'Apply a balanced, water-soluble organic liquid fertilizer (e.g. fish hydrolysate or seaweed extract) diluted to label strength',
        'Top-dress container surface with 1–2 tablespoons of aged worm castings and water in gently',
      ],
      physicalControls: [
        'Check container drainage to ensure roots are healthy and able to absorb nutrients',
      ],
      biologicalControls: [
        'Add organic microbial inoculants (mycorrhizae) to enhance root nutrient scavenging',
      ],
      prohibitedPractices: [
        'Do not over-apply high-nitrogen chemical fertilizer (causes severe fertilizer salt root burn and induces aphid outbreaks)',
        'Never apply granular synthetic fertilizer directly against tender plant stems',
      ],
      preHarvestIntervalGuidance: 'Non-chemical organic amendments carry no synthetic withholding interval; check the commercial fertilizer package label for crop-specific guidance and rinse edible greens thoroughly.',
      cureGuaranteeDisclaimer: 'Severely yellowed lower leaves may drop, but new growth will resume healthy deep green coloration within 5–7 days of feeding. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Nitrogen deficiency is a non-pathogenic cultural disorder. Leaves are safe to eat.',
      harvestPrecaution: 'None required.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic cultural condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Heavy nitrogen feeder; lower leaf chlorosis common' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Lower leaves yellow during early fruit set' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Rapid yellowing of outer leaves in containers' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Pale heads lacking deep green pigmentation' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Lower leaves turn bright yellow under frequent watering' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Yellowing lower foliage' },
    ],
    references: [
      {
        title: 'Plant Nutrient Deficiencies in Container Production',
        organization: 'University of Maryland Extension',
        url: 'https://extension.umd.edu/resource/nitrogen-deficiency-vegetables',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Nutrient Management for Home Gardens',
        organization: 'Colorado State University Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Apply liquid organic nitrogen feed (fish emulsion or balanced 3-1-2 liquid fertilizer)',
      'Top-dress container with aged worm castings',
      'Reduce watering volume if excessive drainage runoff is observed',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 22. Iron Deficiency
  {
    id: 'abiotic-iron-deficiency',
    category: 'abiotic',
    abioticCategory: 'micronutrient_deficiency',
    mobilityInPlant: 'immobile',
    commonName: 'Iron Chlorosis',
    shortDescription:
      'Immobile micronutrient deficiency causing sharp, striking interveinal chlorosis (bright yellow leaf blade with dark green veins) on the youngest terminal leaves.',
    observableSymptoms: [
      'Youngest, newly emerging leaves develop striking interveinal chlorosis: veins remain distinctly dark green while the tissue between veins turns pale yellow or ivory',
      'Older lower leaves remain normal deep green initially',
      'In severe prolonged deficiency, new leaves emerge almost completely bleached white and may develop brown necrotic edges',
    ],
    affectedPlantParts: ['growing_tips', 'leaves'],
    possibleCauses: [
      'High soil or tap water pH (> 7.2) locking iron into an insoluble ferric precipitate unavailable to plant roots',
      'Waterlogged, compacted container potting mix restricting root respiration and iron uptake',
      'Excessive phosphorus or zinc in the substrate competing with iron absorption',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Watering containers with hard, alkaline municipal tap water', 'Cold, saturated container soil in early spring'],
    },
    diagnosticKey:
      'Interveinal chlorosis strictly on the newest upper growth because iron is immobile in plant vascular tissue and cannot be translocated from older foliage.',
    similarConditions: [
      {
        conditionId: 'abiotic-magnesium-deficiency',
        distinguishingFeature: 'Magnesium deficiency also causes interveinal chlorosis, but it starts on the oldest lower leaves because magnesium is mobile; iron deficiency starts on the newest upper leaves.',
      },
      {
        conditionId: 'disease-mosaic-virus',
        distinguishingFeature: 'Mosaic virus causes irregular blotchy mottling with leaf puckering; iron chlorosis produces a clean, symmetrical green vein network on a yellow blade.',
      },
    ],
    preventionGuidance: [
      'Maintain potting substrate pH in the optimal range of 6.0–6.8 for container vegetables',
      'If municipal tap water is hard and alkaline (pH > 7.5), let it sit or use rainwater/filtered water',
      'Avoid over-compacting container mixes; ensure perlite aeration',
    ],
    treatment: {
      culturalControls: [
        'Check substrate pH using a calibrated digital meter; if pH > 7.2, amend with a mild organic acidifier (sulfur or ericaceous mix)',
        'Allow waterlogged potting soil to aerate before re-watering',
      ],
      physicalControls: [
        'Flush container with filtered or rainwater to leach excess alkaline salts',
      ],
      biologicalControls: [
        'Apply chelated iron (Fe-EDDHA for high pH soils or Fe-EDTA for neutral soils) as a soil drench or light foliar spray',
      ],
      prohibitedPractices: [
        'Do not apply large doses of agricultural lime to containers without testing pH (raises pH and induces severe iron lockout)',
        'Do not apply concentrated foliar iron sprays in direct bright sunlight (causes leaf speckle burn)',
      ],
      preHarvestIntervalGuidance: 'Non-chemical organic and mineral micronutrient drenches carry no synthetic withholding interval; verify manufacturer product label for container crop use.',
      cureGuaranteeDisclaimer: 'New growth will emerge green within 7–10 days of correcting pH or applying chelated iron; severely bleached leaves may not fully re-green. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Iron chlorosis is an abiotic physiological disorder. Foliage is non-toxic.',
      harvestPrecaution: 'None required.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Interveinal chlorosis on top new shoots in alkaline potting mix' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'New leaves turn bright yellow with green veins' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Sensitive to alkaline tap water lockout' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Yellowing of terminal floral shoots' },
      { plantSlug: 'coriander', relationshipType: 'susceptible_family', notes: 'New growth pale in alkaline soil' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Slow growth rate minimizes visible iron deficiency' },
    ],
    references: [
      {
        title: 'Iron Chlorosis in Ornamentals and Vegetables',
        organization: 'Utah State University Extension',
        url: 'https://extension.usu.edu/yardandgarden/research/iron-chlorosis',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Diagnosing Plant Micronutrient Deficiencies',
        organization: 'Penn State Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Apply chelated iron (Fe-EDDHA or Fe-EDTA) drench',
      'Test and adjust soil pH into the 6.0–6.8 range',
      'Improve potting mix aeration and drainage',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 23. Magnesium Deficiency
  {
    id: 'abiotic-magnesium-deficiency',
    category: 'abiotic',
    abioticCategory: 'macronutrient_deficiency',
    mobilityInPlant: 'mobile',
    commonName: 'Magnesium Deficiency',
    shortDescription:
      'Mobile macronutrient deficiency causing striking interveinal chlorosis (yellowing between green veins) on the oldest lower leaves, often accompanied by reddish or purple pigmentation.',
    observableSymptoms: [
      'Interveinal chlorosis beginning on oldest lower and middle leaves: leaf margins and interveinal areas turn pale yellow while main veins remain dark green',
      'In tomatoes, yellow interveinal areas may develop bronze, purple, or reddish patches',
      'Leaf edges may curl inward or become brittle and necrotic over time',
      'Upper young foliage remains normal green because magnesium is translocated upward',
    ],
    affectedPlantParts: ['leaves'],
    possibleCauses: [
      'Exhausted container potting soil lacking magnesium reserves',
      'Excessive potassium or calcium fertilization in potting mix competing with magnesium root uptake',
      'Acidic potting substrate (pH < 5.5) where magnesium availability drops sharply',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Heavy feeding with high-potassium tomato fertilizers', 'Very sandy or lightweight peat-heavy potting mixes'],
    },
    diagnosticKey:
      'Interveinal chlorosis strictly on the oldest lower and middle leaves because magnesium is phloem-mobile; contrast with iron deficiency which occurs on the newest top leaves.',
    similarConditions: [
      {
        conditionId: 'abiotic-iron-deficiency',
        distinguishingFeature: 'Iron deficiency occurs on the youngest top leaves; magnesium deficiency occurs on the oldest bottom leaves.',
      },
      {
        conditionId: 'abiotic-nitrogen-deficiency',
        distinguishingFeature: 'Nitrogen chlorosis is uniform across the entire lower leaf blade; magnesium chlorosis leaves the veins distinctly green.',
      },
    ],
    preventionGuidance: [
      'Incorporate dolomitic limestone (which supplies both calcium and magnesium) into acidic container potting mixes',
      'Maintain balanced fertilizer ratios; avoid extreme over-application of potassium',
      'Ensure container pH remains in the 6.0–6.8 range',
    ],
    treatment: {
      culturalControls: [
        'Apply Epsom salts (magnesium sulfate) dissolved in water: 1 teaspoon per 4 liters of water as a soil drench',
        'Top-dress with composted organic matter to supply trace minerals',
      ],
      physicalControls: [
        'Verify root health and check drainage holes',
      ],
      biologicalControls: [
        'Foliar spray of dilute Epsom salts (0.5% solution) for rapid tissue absorption in fruiting tomatoes',
      ],
      prohibitedPractices: [
        'Do not apply concentrated Epsom salts directly to dry soil (can cause root salt burn)',
        'Do not apply excessive lime if soil pH is already neutral (> 6.8)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Magnesium sulfate carries no pre-harvest withholding interval. Wash all produce before consumption.',
      cureGuaranteeDisclaimer: 'Severely chlorotic lower leaves will not fully re-green, but the spread to middle canopy foliage will halt within 7 days. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Magnesium deficiency is a cultural disorder. Fruit and foliage are safe for consumption.',
      harvestPrecaution: 'None required.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Common during heavy fruit load; lower leaves show interveinal yellowing with purple tint' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Lower leaves show green veins with yellow blades' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Outer leaves turn yellow between veins' },
      { plantSlug: 'genovese-basil', relationshipType: 'susceptible_family', notes: 'Occasional lower leaf yellowing in peat mixes' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Low metabolic micronutrient requirement rarely manifests iron chlorosis under normal indoor care' },
    ],
    references: [
      {
        title: 'Magnesium Deficiency in Tomato and Vegetable Crops',
        organization: 'University of Florida IFAS Extension',
        url: 'https://edis.ifas.ufl.edu/publication/SS669',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Nutrient Deficiencies and Toxicities in Vegetables',
        organization: 'Purdue University Extension',
        year: 2021,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Drench soil with Epsom salt solution (1 tsp magnesium sulfate per gallon water)',
      'Check and correct low soil pH using dolomitic lime',
      'Balance potassium fertilizer applications',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 24. Potassium Deficiency
  {
    id: 'abiotic-potassium-deficiency',
    category: 'abiotic',
    abioticCategory: 'macronutrient_deficiency',
    mobilityInPlant: 'mobile',
    commonName: 'Potassium Deficiency',
    shortDescription:
      'Mobile macronutrient deficiency causing marginal leaf chlorosis followed by dry brown necrotic scorch along the outer edges of older lower leaves.',
    observableSymptoms: [
      'Leaf margins of older lower leaves turn yellow, followed rapidly by dry brown necrotic scorching along the leaf edges (marginal burn)',
      'The central area of the leaf blade remains green while the perimeter is scorched like paper',
      'Stems become weak, brittle, and prone to lodging under crop weight',
      'In tomatoes, fruit ripening is blotchy and uneven (yellow shoulder disorder)',
    ],
    affectedPlantParts: ['leaves', 'fruit', 'stems'],
    possibleCauses: [
      'Nutrient depletion in shallow container potting soil during heavy flowering and fruiting',
      'Leaching of soluble potassium ions through frequent irrigation drainage',
      'Excessive calcium or magnesium competing with potassium root uptake',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Heavy fruit set on container tomatoes exhausting substrate potassium', 'Lightweight peat soils with low cation exchange capacity (CEC)'],
    },
    diagnosticKey:
      'Marginal leaf scorch on older lower leaves while the central portion of the leaf remains green; contrast with salt burn which affects leaf tips indiscriminately.',
    similarConditions: [
      {
        conditionId: 'abiotic-salt-accumulation',
        distinguishingFeature: 'Salt accumulation scorches leaf tips and margins across the entire plant following fertilizer over-application; potassium deficiency starts strictly on oldest lower leaves during fruiting.',
      },
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering causes temporary whole-leaf drooping; potassium deficiency produces permanent crispy brown scorched margins on lower leaves.',
      },
    ],
    preventionGuidance: [
      'Feed fruiting container plants with a balanced fertilizer formulated with adequate potassium (e.g., NPK 5-5-10 or organic sulfate of potash)',
      'Incorporate potassium-rich organic amendments (greensand, kelp meal, or aged compost) into potting media',
      'Avoid excessive leaching watering practices',
    ],
    treatment: {
      culturalControls: [
        'Apply a water-soluble organic potassium feed (liquid kelp extract or sulfate of potash) diluted per label instructions',
        'Top-dress with aged compost to enhance container cation exchange capacity',
      ],
      physicalControls: [
        'Prune heavily scorched, non-photosynthetic lower leaves to improve airflow',
      ],
      biologicalControls: [
        'Kelp meal and liquid seaweed drench to supply bioavailable potassium and trace micronutrients',
      ],
      prohibitedPractices: [
        'Do not dump large amounts of wood ash into container pots (causes severe alkaline pH spikes > 8.0 and root burn)',
        'Do not over-apply muriate of potash (potassium chloride) in containers (causes chloride toxicity)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance: 'Non-chemical organic kelp and mineral amendments carry no synthetic withholding interval; check fertilizer label for recommended application frequency and rinse produce thoroughly.',
      cureGuaranteeDisclaimer: 'Crispy scorched marginal tissue is dead and cannot recover; new leaves and developing fruit will develop normally once potassium is supplied. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Potassium deficiency is an abiotic cultural disorder. Fruit and foliage are safe for culinary consumption.',
      harvestPrecaution: 'None required.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'High potassium requirement for fruit ripening; marginal scorch common' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Marginal leaf scorch and blotchy ripening' },
      { plantSlug: 'dwarf-zinnia', relationshipType: 'confirmed_host', notes: 'Marginal browning on lower leaves' },
      { plantSlug: 'french-marigold', relationshipType: 'confirmed_host', notes: 'Weak stems and leaf edge browning' },
      { plantSlug: 'spinach', relationshipType: 'susceptible_family', notes: 'Outer leaf margin scorch' },
    ],
    references: [
      {
        title: 'Potassium Deficiency in Vegetable Crops',
        organization: 'University of California Agriculture & Natural Resources',
        url: 'https://vric.ucdavis.edu/pdf/fertilization_Potassium.pdf',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Plant Nutrients and Deficiency Symptoms',
        organization: 'University of Georgia Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Drench with organic liquid kelp meal or sulfate of potash',
      'Top-dress container with potassium-rich compost',
      'Adjust watering to avoid excessive leaching',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 25. Calcium-Related Disorders (Blossom End Rot)
  {
    id: 'abiotic-calcium-disorders',
    category: 'abiotic',
    abioticCategory: 'macronutrient_deficiency',
    mobilityInPlant: 'immobile',
    commonName: 'Calcium-Related Disorders (Blossom End Rot)',
    shortDescription:
      'Immobile macronutrient physiological disorder in container tomatoes and fruiting crops, causing a flat or sunken, dark leathery rot at the blossom end (bottom) of developing fruits.',
    observableSymptoms: [
      'Small, water-soaked, light-brown spot appears at the blossom end (bottom) of green, developing tomato fruit',
      'Spot enlarges, flattens, and turns into a dark brown or black, sunken, leathery, firm patch',
      'Secondary saprophytic black mold may colonize the dead leathery patch in humid conditions',
      'Affected fruits ripen prematurely and drop from the vine',
      'Foliage typically appears completely healthy and green (the disorder is localized to rapidly expanding fruit cells)',
    ],
    affectedPlantParts: ['fruit'],
    possibleCauses: [
      'Erratic watering cycles (alternating periods of dry soil followed by heavy drenching) interrupting steady calcium transpiration stream',
      'Shallow container soil drying out rapidly in hot, windy balcony conditions',
      'Excessive ammonium or potassium nitrogen feeding competing with calcium uptake',
      'True soil calcium deficiency (rare; usually a transpiration transport failure rather than soil lack)',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 22, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Erratic moisture cycles in containers', 'Hot windy weather causing rapid transpiration surges'],
    },
    diagnosticKey:
      'Lesion occurs strictly on the blossom end (opposite the stem) of developing fruits; foliage remains green and vigorous without disease spots.',
    similarConditions: [
      {
        conditionId: 'disease-anthracnose',
        distinguishingFeature: 'Anthracnose produces circular sunken lesions anywhere on the fruit surface and oozes salmon-pink spores; blossom end rot is strictly localized to the bottom blossom end and forms a dry leathery pad.',
      },
      {
        conditionId: 'disease-early-blight',
        distinguishingFeature: 'Early blight fruit rot occurs at the stem end (top) and is accompanied by concentric target rings on leaves; blossom end rot occurs at the blossom end (bottom).',
      },
    ],
    preventionGuidance: [
      'Maintain consistent, even container soil moisture; never let the container dry to the point of vine wilting',
      'Apply a 2 cm layer of organic mulch (coconut coir or straw) to container soil surface to buffer evaporation',
      'Ensure container volume is at least 15–20 liters for determinate tomatoes to provide an adequate moisture reservoir',
    ],
    treatment: {
      culturalControls: [
        'Pick off and discard all affected fruits immediately (allows the vine to redirect calcium to healthy new fruit)',
        'Establish a regular, consistent daily watering schedule (e.g. every morning at the same time)',
      ],
      physicalControls: [
        'Check container soil moisture depth with a wooden dowel daily before watering',
      ],
      biologicalControls: [
        'Add dolomitic lime or gypsum (calcium sulfate) to potting mix at planting time to ensure bioavailable calcium',
      ],
      prohibitedPractices: [
        'Do not rely on foliar calcium sprays to cure blossom end rot (calcium moves through the xylem via root transpiration, not phloem leaf uptake)',
        'Do not dump eggshells into potting mix expecting instant cure (eggshells take months to decompose and do not dissolve in container timeframes)',
      ],
      preHarvestIntervalGuidance:
        'Irrigation and soil amendments carry no pre-harvest withholding interval. Wash all produce before consumption.',
      cureGuaranteeDisclaimer: 'Affected fruits cannot be repaired and must be removed; subsequent fruits will develop normally once moisture consistency is established. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'high',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Blossom end rot is a non-pathogenic physiological disorder. Cut away the leathery bottom and the unblemished top of the tomato is safe to eat.',
      harvestPrecaution: 'Remove affected fruits early to preserve vine energy.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Very common in patio containers during hot dry spells' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Blossom end rot occurs in small containers with erratic moisture' },
      { plantSlug: 'spinach', relationshipType: 'not_known_host', notes: 'Blossom end rot is a fruit disorder that does not apply to non-fruiting leafy greens' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Blossom end rot is a fruit disorder that does not apply to non-fruiting foliage ornamentals' },
    ],
    references: [
      {
        title: 'Blossom End Rot of Tomato',
        organization: 'University of Minnesota Extension',
        url: 'https://extension.umn.edu/plant-diseases/blossom-end-rot',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Blossom End Rot in Home Garden Tomatoes',
        organization: 'Purdue University Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Establish strict, even watering intervals to stabilize the transpiration stream',
      'Remove all fruits showing blossom end rot',
      'Mulch soil surface to prevent rapid moisture swings',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 26. Tipburn
  {
    id: 'abiotic-tipburn',
    category: 'abiotic',
    abioticCategory: 'physiological_disorder',
    mobilityInPlant: 'immobile',
    commonName: 'Foliage Tipburn',
    shortDescription:
      'Physiological disorder of leafy greens (lettuce, spinach) caused by localized calcium deficiency in rapidly expanding inner leaf margins, producing necrotic brown crispy margins.',
    observableSymptoms: [
      'Browning, curling, and necrosis strictly along the margins and tips of young, rapidly expanding inner leaves',
      'Outer older wrapper leaves appear healthy and green',
      'Necrotic leaf margins become paper-dry, brown, or black, creating entry points for secondary bacterial soft rot',
      'Head lettuce inner leaves become unmarketable and bitter',
    ],
    affectedPlantParts: ['leaves', 'growing_tips'],
    possibleCauses: [
      'Rapid vegetative growth driven by high light and warm temperatures exceeding the rate of calcium transpiration transport',
      'High relative humidity or stagnant air around dense heads reducing transpirational pull to enclosed inner leaves',
      'Fluctuating moisture levels in container potting mix',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 30, optimal: '24°C–28°C' },
      favorableHumidity: 'high_humidity',
      culturalTriggers: ['High nitrogen feeding driving rapid leaf expansion', 'Stagnant unventilated air on vertical rack tiers'],
    },
    diagnosticKey:
      'Necrosis occurs strictly on the margins of the youngest, inner expanding leaves of leafy greens; contrast with potassium deficiency which affects oldest outer leaves.',
    similarConditions: [
      {
        conditionId: 'abiotic-potassium-deficiency',
        distinguishingFeature: 'Potassium deficiency scorches margins on oldest lower leaves; tipburn occurs on the youngest inner expanding leaves.',
      },
      {
        conditionId: 'disease-bacterial-leaf-spot',
        distinguishingFeature: 'Bacterial spot produces water-soaked angular lesions; tipburn produces marginal papery browning without bacterial ooze.',
      },
    ],
    preventionGuidance: [
      'Select tipburn-resistant cultivars of lettuce and leafy greens',
      'Avoid high-nitrogen fertilizer that forces rapid, tender foliage expansion',
      'Ensure constant gentle airflow around vertical rack tiers to facilitate leaf transpiration',
      'Maintain steady, consistent soil moisture',
    ],
    treatment: {
      culturalControls: [
        'Trim and discard brown crispy leaf margins before culinary preparation',
        'Improve air movement over lettuce heads with an oscillating fan',
        'Moderate growth speed by shading containers during intense afternoon heat',
      ],
      physicalControls: [
        'Move leafy greens to a cooler, partially shaded tier on vertical racks',
      ],
      biologicalControls: [
        'Ensure steady root moisture availability using bottom-watering sub-irrigation trays',
      ],
      prohibitedPractices: [
        'Do not apply foliar calcium sprays to dense enclosed heads (calcium does not translocate into enclosed inner leaves)',
        'Do not over-fertilize with ammonium-based fertilizers',
      ],
      preHarvestIntervalGuidance:
        'Cultural corrections carry no pre-harvest withholding interval. Wash all salad greens thoroughly in cold potable water.',
      cureGuaranteeDisclaimer: 'Dead brown marginal leaf cells cannot be cured; management prevents tipburn on newly emerging inner leaves. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Tipburn is a non-pathogenic calcium transpiration disorder. Trim away brown edges; remainder of leaf is safe to eat.',
      harvestPrecaution: 'Trim dry margins during salad preparation.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Inner leaf margin necrosis common during rapid warm growth' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Tender expanding leaves show tip browning' },
      { plantSlug: 'french-radish', relationshipType: 'susceptible_family', notes: 'Occasional foliage margin browning' },
      { plantSlug: 'snake-plant', relationshipType: 'not_known_host', notes: 'Not a known host for Erysiphaceae powdery mildew species that attack vegetables' },
      { plantSlug: 'golden-pothos', relationshipType: 'not_known_host', notes: 'Not a known host for dipteran vegetable leafminers' },
    ],
    references: [
      {
        title: 'Tipburn of Lettuce: Physiological Disorder',
        organization: 'University of California Agriculture & Natural Resources',
        url: 'https://vric.ucdavis.edu/pdf/lettuce_tipburn.pdf',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Tipburn in Indoor and Vertical Greens',
        organization: 'Cornell University Controlled Environment Agriculture',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Increase air movement with an oscillating fan to encourage transpirational flow',
      'Moderate light intensity and nitrogen feeding to slow leaf expansion rate',
      'Stabilize container watering frequency',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 27. Edema (Oedema)
  {
    id: 'abiotic-edema',
    category: 'abiotic',
    abioticCategory: 'physiological_disorder',
    mobilityInPlant: 'not_applicable',
    commonName: 'Edema (Oedema / Water Blistering)',
    shortDescription:
      'Physiological disorder occurring when roots absorb water faster than the plant can transpire it, causing internal leaf cells to engorge, rupture, and form corky, raised blisters on leaf undersides.',
    observableSymptoms: [
      'Small, raised, water-soaked pimples or blisters appearing on the undersides of leaves and on succulent stems',
      'Blisters turn into rough, brown, tan, or white corky, scabby warts as ruptured cells callus over',
      'Leaves may cup, curl upward, turn yellow, and drop prematurely in severe cases',
      'Foliage feels brittle or thickened in affected areas',
    ],
    affectedPlantParts: ['leaves', 'stems'],
    possibleCauses: [
      'Warm, moist potting soil combined with cool, humid, overcast air and low light (roots pump water into leaves, but high humidity and low light prevent leaf transpiration)',
      'Overwatering during cloudy, humid, or rainy spells',
      'Poor container drainage and lack of air movement around vertical rack tiers',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 12, max: 22, optimal: '16°C–20°C' },
      favorableHumidity: 'high_humidity',
      moistureConditions: 'Saturated root zone paired with high ambient relative humidity (> 80%) and low air circulation',
      culturalTriggers: ['Heavy watering during overcast or rainy weather', 'Enclosed vertical racks without exhaust airflow'],
    },
    diagnosticKey:
      'Raised corky blisters on leaf undersides that cannot be scraped off without tearing leaf tissue (distinguishing from scale insects which pop off cleanly).',
    similarConditions: [
      {
        conditionId: 'pest-scale-insects',
        distinguishingFeature: 'Scale insects are individual living insects that can be cleanly scraped off with a thumbnail; edema blisters are ruptured plant cells that are part of the leaf tissue and cannot be separated.',
      },
      {
        conditionId: 'disease-bacterial-leaf-spot',
        distinguishingFeature: 'Bacterial spots are flat, greasy, and necrotize; edema creates raised corky blisters on the underside of green leaves.',
      },
    ],
    preventionGuidance: [
      'Reduce watering frequency during cool, overcast, or humid weather periods',
      'Never water container plants late in the evening',
      'Ensure adequate ventilation and air movement around all vertical shelf tiers',
    ],
    treatment: {
      culturalControls: [
        'Cease watering and allow the container potting mix to dry out significantly',
        'Improve air circulation around plants with an oscillating fan',
        'Move plants to an area with higher light intensity to stimulate active transpiration',
      ],
      physicalControls: [
        'Space containers farther apart on shelves to lower local canopy relative humidity',
      ],
      biologicalControls: [
        'Formulate future potting mixes with 25% perlite or pumice to ensure rapid drainage',
      ],
      prohibitedPractices: [
        'Do not apply chemical pesticides or fungicides (edema is purely physiological; sprays will not help and can exacerbate damage)',
        'Do not prune all blistered leaves (leaves still photosynthesize)',
      ],
      preHarvestIntervalGuidance:
        'Edema is entirely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'Corky ruptured blisters are permanent scar tissue and will not disappear; corrective measures ensure new growth develops smooth and unblistered. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'low',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Edema is non-pathogenic corky plant scar tissue. Leaves and fruits are completely safe to eat.',
      harvestPrecaution: 'None required.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Underside leaf blisters common under humid indoor lights' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Corky warty bumps along lower leaf veins' },
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Blistering in overwatered humid rooms' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'Succulent leaf blistering under cool overwatering' },
      { plantSlug: 'aloe-vera', relationshipType: 'susceptible_family', notes: 'Waterlogging causes corky leaf eruptions' },
    ],
    references: [
      {
        title: 'Edema / Oedema: Causes and Cultural Management',
        organization: 'University of Wisconsin-Madison Extension',
        url: 'https://hort.extension.wisc.edu/articles/oedema/',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Oedema in Container Plants and Vegetables',
        organization: 'RHS (Royal Horticultural Society)',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Reduce watering frequency and allow soil to dry down',
      'Increase air movement and light intensity',
      'Ensure night temperatures are not significantly colder than soil temperature',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 28. Overwatering Stress (Root Hypoxia)
  {
    id: 'abiotic-overwatering-stress',
    category: 'abiotic',
    abioticCategory: 'moisture_stress',
    mobilityInPlant: 'not_applicable',
    commonName: 'Overwatering Stress (Root Hypoxia)',
    shortDescription:
      'Physiological asphyxiation of plant roots caused by chronically waterlogged potting mix, depriving root cells of essential oxygen and leading to generalized wilting, yellowing, and leaf drop.',
    observableSymptoms: [
      'Foliage wilts, droops, and looks limp despite the potting soil being noticeably heavy, saturated, or wet',
      'Lower leaves turn pale yellow and drop prematurely while remaining soft and limp',
      'Soil surface remains wet for days without drying, possibly developing green algae crust',
      'Pot feels unusually heavy; water sits stagnant in catch saucers',
    ],
    affectedPlantParts: ['roots', 'leaves', 'whole_plant'],
    possibleCauses: [
      'Watering too frequently on a rigid calendar schedule without checking soil moisture',
      'Potting mix that is too dense, heavy, or compacted, lacking aeration pores',
      'Using containers without drainage holes or leaving pots in flooded drip trays',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Watering before topsoil dries', 'Oversized container with large volume of unused wet soil'],
    },
    diagnosticKey:
      'Wilting and yellowing occurring in heavy, saturated potting soil; plant fails to recover after watering (and often worsens).',
    similarConditions: [
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering causes wilting in dry, lightweight soil; overwatering causes wilting in heavy, wet soil.',
      },
      {
        conditionId: 'disease-root-rot',
        distinguishingFeature: 'Overwatering stress is the initial abiotic oxygen deprivation; if prolonged, pathogenic oomycetes (Pythium) invade and cause black slimy root decay.',
      },
    ],
    preventionGuidance: [
      'Always test soil moisture 3–5 cm deep with a finger or wooden dowel before watering',
      'Ensure every container has open, unobstructed drainage holes',
      'Match pot size to plant root ball (do not over-pot small plants into giant containers)',
    ],
    treatment: {
      culturalControls: [
        'Cease watering immediately until the top 30–50% of the pot depth dries out',
        'Empty all water from saucers and drainage trays immediately',
        'Tilt container at a 45-degree angle for 15 minutes to facilitate gravitational perched water drainage',
      ],
      physicalControls: [
        'Gently aerate compacted soil surface by poking 4–5 small holes with a clean chopstick',
      ],
      biologicalControls: [
        'Allow natural aerobic root respiration to recover before resuming light watering',
      ],
      prohibitedPractices: [
        'Do not apply fertilizer to an overwatered, oxygen-deprived plant (damaged roots cannot absorb salts, resulting in root burn)',
        'Never plant into pots without drainage holes',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Completely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'If caught before secondary root rot pathogens destroy root cambium, plants recover within 5–10 days of drying down. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Non-pathogenic cultural condition. Edible parts remain safe.',
      harvestPrecaution: 'None required.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless cultural condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Yellowing lower leaves from saucer flooding' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'Soft, mushy leaf bases from waterlogging' },
      { plantSlug: 'aloe-vera', relationshipType: 'confirmed_host', notes: 'Translucent squishy foliage from overwatering' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Drooping pale stems in saturated soil' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Root oxygen starvation in heavy mixes' },
      { plantSlug: 'holy-basil-tulsi', relationshipType: 'confirmed_host', notes: 'Leaf drop from saturated root zone' },
    ],
    references: [
      {
        title: 'Overwatering Symptoms and Diagnosis in Houseplants',
        organization: 'University of Maryland Extension',
        url: 'https://extension.umd.edu/resource/overwatering',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Container Soil Physics: Drainage and Aeration',
        organization: 'University of Florida IFAS Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Stop watering and empty catch saucers',
      'Aerate soil gently and allow top half of container to dry down',
      'Ensure drainage holes are unobstructed',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 29. Underwatering Stress
  {
    id: 'abiotic-underwatering-stress',
    category: 'abiotic',
    abioticCategory: 'moisture_stress',
    mobilityInPlant: 'not_applicable',
    commonName: 'Underwatering Stress (Drought Desiccation)',
    shortDescription:
      'Acute or chronic moisture deficit causing loss of cellular turgor pressure, leading to drooping, dulling, crispy brown leaf tips, and premature leaf shedding.',
    observableSymptoms: [
      'Foliage wilts, droops, or curls inward; leaves feel thin, limp, and lose glossy luster',
      'Container feels extremely lightweight when lifted; potting mix pulls away from container sides leaving a perimeter gap',
      'Oldest leaves turn yellow, crisp, papery brown, and drop from the plant',
      'Water poured on top drains immediately down the edge gap without wetting root ball',
    ],
    affectedPlantParts: ['leaves', 'stems', 'whole_plant'],
    possibleCauses: [
      'Infrequent watering in small containers with high root density and rapid transpiration',
      'High ambient heat, direct sun, or dry windy balcony conditions',
      'Hydrophobic peat potting soil that repels water once completely dried out',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 20, max: 40 },
      favorableHumidity: 'low_humidity',
      culturalTriggers: ['Under-sized containers in full sun', 'Forgetting watering in warm weather'],
    },
    diagnosticKey:
      'Wilting occurring in dry, lightweight soil; plant rapidly recovers full cellular turgor and perks up within 1–3 hours of deep bottom-watering.',
    similarConditions: [
      {
        conditionId: 'abiotic-overwatering-stress',
        distinguishingFeature: 'Overwatered plants wilt in heavy, wet soil; underwatered plants wilt in lightweight, dry soil and perk up rapidly upon thorough soaking.',
      },
      {
        conditionId: 'disease-fusarium-wilt',
        distinguishingFeature: 'Fusarium wilt leaves fail to recover after watering; underwatered plants regain full turgor within hours.',
      },
    ],
    preventionGuidance: [
      'Select appropriately sized containers (minimum 15 L for tomatoes, 5–7 L for herbs) to hold adequate moisture reserves',
      'Apply a 2 cm mulch layer over container soil to reduce surface evaporation',
      'Check containers twice daily during extreme summer heatwaves',
    ],
    treatment: {
      culturalControls: [
        'Water thoroughly until moisture drains freely from all drainage holes',
        'If potting soil is hydrophobic and repelling water, submerge the pot in a basin of lukewarm water for 20 minutes (bottom soak) until fully rehydrated',
      ],
      physicalControls: [
        'Move containers to dappled shade while recovering from severe drought wilting',
      ],
      biologicalControls: [
        'Top-dress with compost to improve soil water retention capacity',
      ],
      prohibitedPractices: [
        'Do not apply fertilizer to a bone-dry, wilted plant (concentrated fertilizer salts will burn dehydrated root hairs severely)',
        'Do not submerge pots for hours (causes root oxygen starvation)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Completely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'Limp green leaves will recover within hours; leaves that have already turned crispy brown will not revive and should be pruned. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Non-pathogenic cultural condition. Edible parts remain safe.',
      harvestPrecaution: 'Harvest leafy greens before they bolt in response to drought stress.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless cultural condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'spearmint', relationshipType: 'confirmed_host', notes: 'High leaf surface area and shallow stolons wilt dramatically when container dries out' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Rapid wilting and bitterness under dry conditions' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Drought triggers emergency premature bolting' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Rapid wilting and flower stem elongation' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Dramatic foliage drooping in dry pots' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Vine drooping and blossom drop' },
      { plantSlug: 'aloe-vera', relationshipType: 'rarely_affected', notes: 'CAM photosynthesis and water-storing parenchymal gel buffer against typical short-term container drought' },
      { plantSlug: 'snake-plant', relationshipType: 'rarely_affected', notes: 'Crassulacean acid metabolism and thick waxy cuticle enable survival through extended dry periods without wilting' },
    ],
    references: [
      {
        title: 'Watering Container Plants: Managing Drought and Hydrophobic Soils',
        organization: 'University of California Agriculture & Natural Resources',
        url: 'https://vric.ucdavis.edu/pdf/container_irrigation.pdf',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Drought Stress in Home Garden Crops',
        organization: 'Colorado State University Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Bottom-soak dry pot in water basin for 20 minutes to break soil hydrophobicity',
      'Move plant to temporary shade during rehydration',
      'Mulch soil surface to buffer evaporation',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 30. Salt Accumulation (Fertilizer Burn)
  {
    id: 'abiotic-salt-accumulation',
    category: 'abiotic',
    abioticCategory: 'salinity_osmotic',
    mobilityInPlant: 'not_applicable',
    commonName: 'Substrate Salt Accumulation (Fertilizer Burn)',
    shortDescription:
      'Excessive buildup of soluble mineral salts from synthetic fertilizers and hard tap water in container potting mix, drawing moisture out of roots and causing marginal leaf scorch.',
    observableSymptoms: [
      'White, yellowish, or crusty crystalline salt deposits visible on the soil surface, pot rim, and drainage holes',
      'Leaf tips and outer margins turn brown, dry, and crispy like paper (marginal burn)',
      'Plants wilt even when soil is moist because high osmotic pressure prevents roots absorbing water',
      'Slowed growth, dark dull foliage, and root tip necrosis',
    ],
    affectedPlantParts: ['leaves', 'roots'],
    possibleCauses: [
      'Repeated application of chemical liquid or granular fertilizers without adequate drainage leaching',
      'Watering containers in shallow amounts that never flush through drainage holes',
      'Using municipal tap water with high electrical conductivity (EC) and dissolved minerals',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 10, max: 35 },
      favorableHumidity: 'any',
      culturalTriggers: ['Applying full-strength synthetic fertilizer to dry containers', 'Letting containers sit in saucer runoff water where salts redissolve and re-enter'],
    },
    diagnosticKey:
      'Visible white crystalline crust on soil surface and pot rim accompanied by crispy marginal leaf scorch across multiple plant species.',
    similarConditions: [
      {
        conditionId: 'pest-spider-mites',
        distinguishingFeature: 'Spider mites produce fine stippling and silk webbing; salt burn produces clean, papery brown margins without webbing or mites.',
      },
      {
        conditionId: 'abiotic-potassium-deficiency',
        distinguishingFeature: 'Potassium deficiency starts strictly on oldest lower leaves during heavy fruiting; salt burn affects leaf tips across the entire plant following fertilizer applications.',
      },
    ],
    preventionGuidance: [
      'Always apply fertilizer at half the manufacturer-recommended strength in container gardening',
      'Every 4–6 weeks, thoroughly leach containers by pouring clean water through until 20% drains out the bottom',
      'Empty drainage catch-trays immediately so dissolved salts are not reabsorbed',
    ],
    treatment: {
      culturalControls: [
        'Cease all fertilizer applications immediately for at least 3–4 weeks',
        'Leach the container: pour clean rainwater or filtered tap water equal to twice the container volume slowly through the soil to wash out accumulated mineral salts',
        'Scrape off and discard the top 1 cm of crusty, salt-laden soil and replace with fresh compost',
      ],
      physicalControls: [
        'Scrub white salt deposits off terracotta pot rims with a stiff brush',
      ],
      biologicalControls: [
        'Switch to organic fertilizers (fish emulsion, seaweed, worm castings) which carry a significantly lower salt index than synthetic chemical salts',
      ],
      prohibitedPractices: [
        'Do not apply more fertilizer trying to "fix" yellowing/browning caused by salt burn',
        'Do not let pots sit in runoff water',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Leaching with clean water carries no withholding interval. Rinse all produce before eating.',
      cureGuaranteeDisclaimer: 'Scorched brown leaf margins will not turn green, but flushing salts stops the progression of burn on new leaves. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Salt burn is an abiotic mineral disorder. Foliage is non-toxic.',
      harvestPrecaution: 'Trim dry margins from culinary leaves.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Tip burn from tap water fluoride and fertilizer salts' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'Brown leaf tips from fertilizer accumulation' },
      { plantSlug: 'aloe-vera', relationshipType: 'confirmed_host', notes: 'Sensitive to chemical fertilizer salts; leaf tip dieback' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Marginal scorch from heavy chemical feeding' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Osmotic leaf scorch and blossom drop' },
    ],
    references: [
      {
        title: 'Soluble Salts in Container Potting Media',
        organization: 'University of Massachusetts Amherst Extension',
        url: 'https://ag.umass.edu/greenhouse-floriculture/fact-sheets/soluble-salts-in-soilless-media',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Salinity and Fertilizer Burn in Container Gardens',
        organization: 'Colorado State University Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Leach container thoroughly with clean water (2x pot volume)',
      'Scrape off and replace top 1 cm of crusty soil',
      'Pause all fertilizer applications and switch to low-salt organic feeds',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 31. Sun Scorch
  {
    id: 'abiotic-sun-scorch',
    category: 'abiotic',
    abioticCategory: 'light_stress',
    mobilityInPlant: 'not_applicable',
    commonName: 'Sun Scorch (Photobleaching / Sunburn)',
    shortDescription:
      'Abiotic radiation and thermal injury caused by moving shade-adapted or indoor plants abruptly into intense direct sunlight, destroying chlorophyll and producing bleached, papery patches.',
    observableSymptoms: [
      'Upper, sun-exposed leaf surfaces develop bleached white, silvery, or light tan patches',
      'Bleached areas become paper-thin, dry, brittle, and translucent',
      'Lower leaves and shaded portions of the plant remain completely green and unaffected',
      'On green tomato fruits, exposed upper shoulders develop white, shiny, blistered, sunken leathery patches (fruit sunscald)',
    ],
    affectedPlantParts: ['leaves', 'fruit'],
    possibleCauses: [
      'Moving plants directly from indoor grow lights or shaded rooms onto an intense, sunny balcony without gradual hardening off',
      'Sudden defoliation (from early blight or pruning) exposing previously shaded green fruits to harsh midday sun',
      'Water droplets acting as lenses during intense midday direct sun (minor contributor compared to UV photobleaching)',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 25, max: 40 },
      favorableHumidity: 'any',
      culturalTriggers: ['Skipping the 7–10 day hardening-off period when moving plants outdoors', 'Placing shade plants (Pothos) in south-facing sun'],
    },
    diagnosticKey:
      'Bleached, papery lesions occurring strictly on upper, directly sun-exposed leaf surfaces; shaded foliage on the same plant remains perfectly green.',
    similarConditions: [
      {
        conditionId: 'pest-thrips',
        distinguishingFeature: 'Thrips produce silvery bleached patches accompanied by distinct black tar-like frass droplets and active insects; sun scorch leaves clean, dry, paper-thin bleached patches without fecal drops.',
      },
      {
        conditionId: 'disease-powdery-mildew',
        distinguishingFeature: 'Powdery mildew is a superficial white powdery fungal growth on top of green tissue; sun scorch is actual dead, paper-thin bleached leaf tissue.',
      },
    ],
    preventionGuidance: [
      'Always "harden off" indoor plants over 7–10 days: start in full shade outdoors for 2 hours, gradually increasing sunlight exposure daily',
      'Maintain adequate canopy foliage over developing tomato clusters to shield fruit from direct solar radiation',
      'Use 30–40% shade cloth over south-facing balconies during extreme summer heatwaves',
    ],
    treatment: {
      culturalControls: [
        'Move scorched plants immediately back to bright, indirect light or morning-only sun',
        'Ensure steady watering to support surviving green foliage transpiration',
      ],
      physicalControls: [
        'Provide shade cloth or relocate to lower, sheltered tiers of vertical racks',
      ],
      biologicalControls: [
        'Allow plant to produce new sun-adapted leaves with thicker cuticles and protective anthocyanins',
      ],
      prohibitedPractices: [
        'Do not strip off all sunburned leaves immediately (leaves that still have green areas continue to photosynthesize and sustain recovery)',
        'Do not apply chemical sprays or fertilizers to sun-scorched plants',
      ],
      preHarvestIntervalGuidance:
        'Completely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'Bleached papery leaf tissue is dead and cannot re-green; new growth emerging under proper lighting will be adapted and healthy. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Sunscald on tomato fruits produces a tough leathery patch. Cut away the leathery part; the rest of the tomato is safe to eat.',
      harvestPrecaution: 'Harvest fruit before secondary mold colonizes sunscald lesions.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless abiotic condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Bleaches and scorches rapidly in direct outdoor sunlight' },
      { plantSlug: 'snake-plant', relationshipType: 'confirmed_host', notes: 'White bleached patches if moved abruptly outdoors' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Tender leaves bleach and crisp in intense afternoon sun' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Photobleaching under harsh balcony radiation' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Fruit sunscald if canopy is over-pruned' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'White sunken leathery fruit sunscald' },
    ],
    references: [
      {
        title: 'Sunscald and Photobleaching in Vegetables and Ornamentals',
        organization: 'University of Maryland Extension',
        url: 'https://extension.umd.edu/resource/sunscald-vegetables',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Hardening Off Transplants and Preventing Sunburn',
        organization: 'Purdue University Extension',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Relocate plant to bright indirect light or partial morning sun',
      'Maintain consistent watering to support transpiration',
      'Prune severely bleached leaves only after new healthy leaves emerge',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 32. Cold Injury
  {
    id: 'abiotic-cold-injury',
    category: 'abiotic',
    abioticCategory: 'temperature_stress',
    mobilityInPlant: 'not_applicable',
    commonName: 'Cold Injury (Chilling & Frost Damage)',
    shortDescription:
      'Thermal injury caused by exposure to sub-optimal chilling temperatures (< 10°C) or freezing temperatures (< 0°C), resulting in cellular membrane collapse, water-soaked foliage, blackening, and defoliation.',
    observableSymptoms: [
      'Leaves become dark green and water-soaked shortly after cold exposure, then collapse into a limp, mushy black mass upon thawing',
      'Warm-season herbs (holy basil, sweet basil) turn completely black within 12 hours of exposure to near-freezing temperatures',
      'Stunting, purpling of lower leaf veins (chilling-induced phosphorus lockout), and sudden leaf shedding',
      'Terminal growing tips wither, turn brown, and die back',
    ],
    affectedPlantParts: ['leaves', 'growing_tips', 'stems', 'whole_plant'],
    possibleCauses: [
      'Leaving tender summer herbs or houseplants on balconies during sudden autumn cold snaps or early spring frosts',
      'Placing plants next to single-pane windows during freezing winter weather',
      'Air conditioning drafts directed continuously onto tropical foliage',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: -5, max: 10, optimal: '< 8°C for tropicals; < 0°C for temperate' },
      favorableHumidity: 'any',
      culturalTriggers: ['Unexpected overnight balcony frost', 'Early spring transplanting before soil warms'],
    },
    diagnosticKey:
      'Sudden collapse and blackening of foliage occurring across multiple species immediately following an overnight drop below critical species minimums.',
    similarConditions: [
      {
        conditionId: 'disease-early-blight',
        distinguishingFeature: 'Early blight causes localized circular spots with target rings; frost causes sudden widespread water-soaking and blackening of entire exposed leaves overnight.',
      },
      {
        conditionId: 'abiotic-overwatering-stress',
        distinguishingFeature: 'Overwatering causes gradual yellowing over weeks; cold injury causes sudden blackening/collapse within 24 hours of cold exposure.',
      },
    ],
    preventionGuidance: [
      'Monitor nighttime balcony temperatures; bring tender herbs (basil, tulsi) and tropicals indoors when forecast drops below 12°C',
      'Cover outdoor vertical racks with frost fleece or burlap on clear, radiative frost nights',
      'Do not move warm-season transplants outdoors until nighttime temperatures reliably exceed 12°C–15°C',
    ],
    treatment: {
      culturalControls: [
        'Move plants immediately to a warm, draft-free room with bright indirect light',
        'Wait several days before pruning to clearly assess what tissue is permanently dead versus viable stems that may re-sprout',
        'Once damage is callused, prune dead, mushy, black stems with sterilized shears',
      ],
      physicalControls: [
        'Keep plants away from cold exterior glass panes in winter',
      ],
      biologicalControls: [
        'Resume watering only when soil dries slightly; cold-damaged plants transpire very little water',
      ],
      prohibitedPractices: [
        'Do not heavily water or fertilize cold-shocked plants (damaged roots cannot absorb water and will rot)',
        'Do not prune stems before knowing where viable green cambium remains',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Completely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'Tissue that has turned black and mushy is dead; recovery depends on whether dormant buds on protected lower stems survived. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'critical',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Frost-damaged herbs lose essential oils and turn black, becoming unpalatable. Discard blackened foliage.',
      harvestPrecaution: 'Harvest all basil, tomatoes, and tender herbs before the first forecasted frost.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless abiotic condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'holy-basil-tulsi', relationshipType: 'confirmed_host', notes: 'Extremely cold-sensitive; drops leaves and blackens below 10°C' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Blackens and dies overnight at temperatures below 5°C' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Chilling causes foliage purpling, stunting, and frost death' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Lethal frost damage below 0°C' },
      { plantSlug: 'lemongrass', relationshipType: 'confirmed_host', notes: 'Winter foliage dieback in sub-tropical frost' },
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Chilling injury below 10°C; black leaf lesions' },
    ],
    references: [
      {
        title: 'Cold and Frost Damage on Landscape and Garden Plants',
        organization: 'University of Florida IFAS Extension',
        url: 'https://edis.ifas.ufl.edu/publication/MG022',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Protecting Container Gardens from Frost and Chilling Injury',
        organization: 'Penn State Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Relocate to warm indoor environment (18°C–24°C)',
      'Hold watering until soil dries; do not fertilize',
      'Prune dead blackened tissue after viable green growth resumes',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 33. Heat Stress
  {
    id: 'abiotic-heat-stress',
    category: 'abiotic',
    abioticCategory: 'temperature_stress',
    mobilityInPlant: 'not_applicable',
    commonName: 'Heat Stress (Thermal Inhibition & Scorch)',
    shortDescription:
      'Thermal inhibition and moisture imbalance occurring when ambient temperatures exceed a species critical threshold (> 30°C–35°C), leading to pollen sterility, blossom drop, leaf cupping, and photosynthesis shutdown.',
    observableSymptoms: [
      'Flower buds drop abruptly without setting fruit (blossom drop in tomatoes)',
      'Leaves cup upward along their margins into a trough shape (leaf rolling) to reduce surface area exposure',
      'Foliage wilts during peak afternoon heat even when soil is moist, recovering after sunset',
      'Pollen becomes sterile; existing fruits develop thin walls and fail to size up properly',
    ],
    affectedPlantParts: ['flowers', 'fruit', 'leaves'],
    possibleCauses: [
      'Balcony microclimates radiating heat from concrete walls, brickwork, or metal railings (> 35°C)',
      'Dark plastic containers absorbing solar radiation and heating root zones above 32°C',
      'Prolonged heatwaves with night temperatures remaining above 24°C',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 30, max: 45, optimal: '> 32°C day, > 24°C night' },
      favorableHumidity: 'any',
      culturalTriggers: ['Dark plastic containers baking on concrete balconies', 'Lack of shade cloth during summer heat domes'],
    },
    diagnosticKey:
      'Upward leaf rolling and massive blossom drop occurring during heatwaves while soil moisture is adequate; plants perk up every evening.',
    similarConditions: [
      {
        conditionId: 'disease-mosaic-virus',
        distinguishingFeature: 'Mosaic virus causes crinkled, mottled foliage and stunted growth; heat-induced leaf rolling leaves the leaf green without mottling, and curling relaxes when temperatures drop.',
      },
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering causes downward limp drooping; heat stress causes upward boat-like leaf cupping.',
      },
    ],
    preventionGuidance: [
      'Erect 30%–50% white or aluminized shade cloth over balconies during heatwaves',
      'Shield dark plastic containers with cardboard or light-colored pot sleeves to keep root zones cool',
      'Group containers together so canopies shade pots and create a humid microclimate',
    ],
    treatment: {
      culturalControls: [
        'Move containers to partial morning sun or dappled shade during heatwave peaks',
        'Water containers early in the morning so roots are fully turgid before thermal peak',
      ],
      physicalControls: [
        'Place containers on wooden slatted risers rather than directly on baking concrete balcony floors',
      ],
      biologicalControls: [
        'Mulch container surfaces with 3 cm of light-colored straw or coco coir to reflect heat',
      ],
      prohibitedPractices: [
        'Do not apply fertilizer during extreme heatwaves (plants cannot utilize nutrients and salts burn roots)',
        'Do not prune foliage during heatwaves (foliage canopy protects fruit from sunscald)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Completely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'Fallen blossoms cannot be reattached; fruit set will resume naturally once temperatures fall below 30°C. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Heat stress is an abiotic temperature response. Fruit and foliage are safe for culinary consumption.',
      harvestPrecaution: 'Harvest leafy greens before heat turns them bitter.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless cultural condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Blossom drop and leaf curling above 32°C' },
      { plantSlug: 'tomato-bush', relationshipType: 'confirmed_host', notes: 'Pollen sterility above 34°C daytime / 24°C night' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Severe heat stress triggers rapid bolting and latex bitterness' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Thermal stress stops vegetative growth' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Rapid flower initiation in heat' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Roots turn woody and pungent' },
    ],
    references: [
      {
        title: 'Heat Stress and Blossom Drop in Tomato Production',
        organization: 'University of Florida IFAS Extension',
        url: 'https://edis.ifas.ufl.edu/publication/HS1195',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Heat Stress in Urban Container Gardens',
        organization: 'University of California Agriculture & Natural Resources',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Provide 30–50% shade cloth during afternoon peak heat',
      'Shield pots from direct sun to keep root temperature < 30°C',
      'Maintain steady morning hydration and pause fertilizer feeding',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 34. Premature Bolting
  {
    id: 'abiotic-premature-bolting',
    category: 'abiotic',
    abioticCategory: 'physiological_disorder',
    mobilityInPlant: 'not_applicable',
    commonName: 'Premature Bolting',
    shortDescription:
      'Physiological reproductive trigger causing cool-season leafy crops and herbs to abruptly elongate their central stems, produce flowers, and turn leaves bitter and unpalatable.',
    observableSymptoms: [
      'Central stem elongates rapidly upwards into a tall, rigid, flowering stalk',
      'Foliage changes shape, becoming smaller, sparser, and arrow-shaped',
      'Leaves turn tough, fibrous, and develop intensely bitter milky latex (lettuce) or harsh pungent flavor (spinach, radish)',
      'Vegetative leaf production ceases entirely as the plant commits all energy to seed set',
    ],
    affectedPlantParts: ['stems', 'leaves', 'flowers', 'whole_plant'],
    possibleCauses: [
      'Increasing day length (long photoperiods > 14 hours) combined with rising temperatures (> 24°C)',
      'Root restriction or moisture stress signaling impending plant death and triggering emergency seed reproduction',
      'Cold shock in early spring followed by a sudden warm spell',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 22, max: 35, optimal: '> 25°C for cool-season crops' },
      favorableHumidity: 'any',
      culturalTriggers: ['Planting cool-season crops late in spring', 'Shallow containers drying out frequently'],
    },
    diagnosticKey:
      'Rapid vertical elongation of central flower stalk in cool-season leafy crops, accompanied by bitter taste.',
    similarConditions: [
      {
        conditionId: 'abiotic-nitrogen-deficiency',
        distinguishingFeature: 'Nitrogen deficiency slows growth and yellows leaves without triggering vertical stem elongation; bolting causes dramatic vertical stalk elongation.',
      },
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering causes temporary wilting; bolting is a permanent developmental transition to flowering.',
      },
    ],
    preventionGuidance: [
      'Grow cool-season crops (spinach, lettuce, cilantro, radish) in early spring or autumn when photoperiods and temperatures are moderate',
      'Select slow-bolt or bolt-resistant cultivars (e.g. Bloomsdale Long Standing spinach)',
      'Provide afternoon shade on hot balconies to keep soil cool',
      'Maintain consistent moisture to prevent stress-induced emergency seed set',
    ],
    treatment: {
      culturalControls: [
        'Harvest all usable leaves immediately before bitterness intensifies',
        'Once a plant has bolted, harvest the entire crop and replant with a warm-season species (basil, peppers, tomatoes)',
      ],
      physicalControls: [
        'Pinching off early flower buds may delay bolting by a few days in basil, but in lettuce and spinach the bitter chemical transition is irreversible',
      ],
      biologicalControls: [
        'Allow bolted coriander to produce green seeds (fresh green coriander seeds are a gourmet culinary seasoning!) or let flowers attract beneficial hoverflies',
      ],
      prohibitedPractices: [
        'Do not apply fertilizers hoping to reverse bolting (once flowering hormones trigger, the transition is permanent)',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Completely non-chemical; no withholding intervals apply.',
      cureGuaranteeDisclaimer: 'Bolting is a genetically programmed hormonal developmental stage; it cannot be reversed back to vegetative growth. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Bolted greens are non-toxic, but highly bitter and fibrous. Edible seeds (coriander/cilantro) are culinary seasonings.',
      harvestPrecaution: 'Harvest immediately at first sign of central stem elongation.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Completely harmless physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Long day lengths (> 14 hrs) trigger rapid central flower stalk' },
      { plantSlug: 'coriander', relationshipType: 'confirmed_host', notes: 'Notoriously bolt-prone in warm temperatures > 24°C' },
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Heads elongate, produce bitter white latex and flower' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Radish bolts instead of swelling roots if planted in summer' },
      { plantSlug: 'genovese-basil', relationshipType: 'confirmed_host', notes: 'Flowering spikes stop new leaf growth unless pinched' },
    ],
    references: [
      {
        title: 'Bolting in Leafy Greens and Herbs',
        organization: 'University of Maryland Extension',
        url: 'https://extension.umd.edu/resource/bolting-vegetables',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Temperature and Photoperiod Effects on Vegetable Bolting',
        organization: 'Cornell University Cooperative Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Harvest all remaining edible foliage immediately',
      'Replace with heat-tolerant summer crops',
      'Schedule cool-season crops for autumn or early spring',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },

  // 35. Osmotic Stress
  {
    id: 'abiotic-osmotic-stress',
    category: 'abiotic',
    abioticCategory: 'salinity_osmotic',
    mobilityInPlant: 'not_applicable',
    commonName: 'Osmotic Moisture Stress',
    shortDescription:
      'Physiological drought occurring when high soil solute concentration (salts, fertilizer minerals) creates a lower water potential outside the root than inside, preventing root water uptake despite wet soil.',
    observableSymptoms: [
      'Plants wilt or exhibit limp foliage even when the potting substrate is damp or moist',
      'Leaves develop a dark blue-green, dull cast and remain stunted',
      'Crispy, dry necrotic margins and tips appear on foliage across the entire canopy',
      'Fine feeder roots are stunted, dark, and fail to branch into the substrate',
    ],
    affectedPlantParts: ['leaves', 'roots', 'whole_plant'],
    possibleCauses: [
      'High electrical conductivity (EC > 2.5 mS/cm) from heavy liquid fertilizer dosing in containers',
      'Accumulation of de-icing salts or hard tap water dissolved minerals',
      'Severe drought concentration of existing soil minerals',
    ],
    environmentalRiskFactors: {
      favorableTemperatureC: { min: 15, max: 35 },
      favorableHumidity: 'low_humidity',
      culturalTriggers: ['Applying fertilizer to dry soil', 'Watering with small volumes that never produce drainage runoff'],
    },
    diagnosticKey:
      'Wilting and crispy marginal leaf scorch occurring in damp soil following fertilizer applications; electrical conductivity of runoff is elevated.',
    similarConditions: [
      {
        conditionId: 'abiotic-underwatering-stress',
        distinguishingFeature: 'Underwatering occurs in dry soil; osmotic stress occurs in damp soil due to high solute concentration preventing water absorption.',
      },
      {
        conditionId: 'pest-spider-mites',
        distinguishingFeature: 'Spider mites produce fine leaf stippling and webbing; osmotic stress produces papery marginal scorch without webbing.',
      },
    ],
    preventionGuidance: [
      'Dilute liquid fertilizers to half strength for container growing',
      'Always moisten root balls with plain water before applying liquid fertilizers',
      'Routinely flush containers with clean water to prevent salt accumulation',
    ],
    treatment: {
      culturalControls: [
        'Flush container thoroughly with plain, room-temperature rainwater or filtered water (2x pot volume)',
        'Pause all fertilizer applications for at least 3 weeks until normal growth resumes',
      ],
      physicalControls: [
        'Drain catch saucers immediately after flushing',
      ],
      biologicalControls: [
        'Top-dress with fresh worm castings once soil EC returns to safe levels (< 1.2 mS/cm)',
      ],
      prohibitedPractices: [
        'Do not apply more fertilizer or mineral supplements',
        'Do not let leached runoff sit in saucers to be reabsorbed',
      
        'Do not spray unregistered chemical mixtures or homemade bleach remedies',],
      preHarvestIntervalGuidance:
        'Leaching with water carries no withholding interval. Wash all produce thoroughly.',
      cureGuaranteeDisclaimer: 'Dead brown marginal tissue cannot recover, but flushing restores root water uptake and protects subsequent foliage. Full cure or reversal of established necrotic tissue is not guaranteed; management focuses on healthy new growth.',
    },
    severity: 'moderate',
    edibleCropRelevance: {
      isFoodSafetyConcern: false,
      foodSafetyNotes: 'Osmotic stress is an abiotic physical disorder. Foliage is safe for culinary consumption.',
      harvestPrecaution: 'Trim dry margins from leaves.',
    },
    humanPetSafety: {
      isToxicToHumans: false,
      isToxicToPets: false,
      precautionaryAdvice: 'Non-toxic physiological condition.',
      emergencyEscalationNote: 'No clinical escalation required under normal handling. In case of accidental pesticide ingestion or severe allergic reaction, immediately contact your local poison control centre or national emergency medical services.',
    },
    confirmedHostSlugs: [
      { plantSlug: 'butterhead-lettuce', relationshipType: 'confirmed_host', notes: 'Extremely sensitive to high substrate EC; marginal leaf scorch' },
      { plantSlug: 'spinach', relationshipType: 'confirmed_host', notes: 'Stunted dark blue-green foliage and leaf tip burn' },
      { plantSlug: 'cherry-tomato', relationshipType: 'confirmed_host', notes: 'Root water absorption failure during fruit swelling' },
      { plantSlug: 'french-radish', relationshipType: 'confirmed_host', notes: 'Foliage burn and root cracking' },
      { plantSlug: 'golden-pothos', relationshipType: 'confirmed_host', notes: 'Tip burn from tap water salt accumulation' },
    ],
    references: [
      {
        title: 'Salinity and Osmotic Stress in Container Crops',
        organization: 'University of California Agriculture & Natural Resources',
        url: 'https://vric.ucdavis.edu/pdf/salinity_management.pdf',
        year: 2022,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
      {
        title: 'Managing Soluble Salts and Osmotic Potential in Greenhouse Media',
        organization: 'Purdue University Extension',
        year: 2023,
        evidenceLevel: 'extension_consensus',
        scopes: ['identification_symptoms', 'environmental_triggers', 'prevention_cultural', 'treatment_ipm', 'edible_crop_safety'],
      },
    ],
    correctiveMeasures: [
      'Leach container soil with plain water equal to twice the pot volume',
      'Halt all fertilizer feeding for 3 weeks',
      'Ensure 20% drainage fraction during future watering',
    ],
    verificationStatus: 'verified',
    lastReviewed: '2026-11-05',
  },
];

// ==============================================================================
// 4. UNIFIED DATASET & HELPER EXPORTS
// ==============================================================================

/**
 * Complete, unified Plant Health Knowledge Base dataset.
 * Contains 35 fully typed, verified conditions across Pests (9),
 * Diseases (11), and Abiotic Disorders (15).
 */
export const PLANT_HEALTH_KB: PlantHealthCondition[] = [
  ...PEST_CONDITIONS,
  ...DISEASE_CONDITIONS,
  ...ABIOTIC_CONDITIONS,
];

/**
 * Retrieve a specific plant health condition by its unique ID.
 */
export function getConditionById(id: string): PlantHealthCondition | undefined {
  if (!id) return undefined;
  return PLANT_HEALTH_KB.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

/**
 * Retrieve all conditions belonging to a specific category ('pest' | 'disease' | 'abiotic').
 */
export function getConditionsByCategory(category: ConditionCategory): PlantHealthCondition[] {
  return PLANT_HEALTH_KB.filter((c) => c.category === category);
}

/**
 * Retrieve all conditions cross-referenced with a specific plant slug.
 * Matches confirmed hosts, susceptible families, or general associations.
 */
export function getConditionsForPlantSlug(
  slug: string,
  relationshipType?: 'confirmed_host' | 'susceptible_family'
): PlantHealthCondition[] {
  if (!slug) return [];
  const normalizedSlug = slug.toLowerCase();

  return PLANT_HEALTH_KB.filter((c) => {
    return c.confirmedHostSlugs.some((host) => {
      if (host.plantSlug.toLowerCase() !== normalizedSlug) return false;
      if (relationshipType) return host.relationshipType === relationshipType;
      return host.relationshipType === 'confirmed_host' || host.relationshipType === 'susceptible_family';
    });
  });
}

/**
 * Retrieve detailed entries for similar-looking conditions cross-referenced by an entry.
 */
export function getSimilarConditions(conditionId: string): Array<{
  condition: PlantHealthCondition;
  distinguishingFeature: string;
}> {
  const cond = getConditionById(conditionId);
  if (!cond) return [];

  const results: Array<{ condition: PlantHealthCondition; distinguishingFeature: string }> = [];

  for (const similar of cond.similarConditions) {
    const target = getConditionById(similar.conditionId);
    if (target) {
      results.push({
        condition: target,
        distinguishingFeature: similar.distinguishingFeature,
      });
    }
  }

  return results;
}

/**
 * Filter conditions by flexible multi-criteria options.
 */
export function queryHealthKb(options: HealthKbFilterOptions): PlantHealthCondition[] {
  return PLANT_HEALTH_KB.filter((c) => {
    if (options.category && c.category !== options.category) return false;
    if (options.severity && c.severity !== options.severity) return false;
    if (options.verificationStatus && c.verificationStatus !== options.verificationStatus) return false;
    if (options.affectedPart && !c.affectedPlantParts.includes(options.affectedPart)) return false;
    if (options.plantSlug) {
      const isHost = c.confirmedHostSlugs.some(
        (h) =>
          h.plantSlug.toLowerCase() === options.plantSlug?.toLowerCase() &&
          (h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family')
      );
      if (!isHost) return false;
    }
    return true;
  });
}

/**
 * Search the knowledge base for conditions matching symptom keywords.
 */
export function searchConditionsBySymptom(query: string): PlantHealthCondition[] {
  if (!query || query.trim().length === 0) return [];
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  return PLANT_HEALTH_KB.filter((c) => {
    const haystack = [
      c.commonName,
      c.scientificName || '',
      c.shortDescription,
      ...c.observableSymptoms,
      ...c.possibleCauses,
    ].join(' ').toLowerCase();

    return tokens.some((token) => haystack.includes(token));
  });
}

/**
 * Return summary statistics of the knowledge base.
 */
export function getHealthKbStats() {
  const pests = PLANT_HEALTH_KB.filter((c) => c.category === 'pest');
  const diseases = PLANT_HEALTH_KB.filter((c) => c.category === 'disease');
  const abiotics = PLANT_HEALTH_KB.filter((c) => c.category === 'abiotic');

  return {
    totalConditions: PLANT_HEALTH_KB.length,
    pestsCount: pests.length,
    diseasesCount: diseases.length,
    abioticCount: abiotics.length,
    verifiedCount: PLANT_HEALTH_KB.filter((c) => c.verificationStatus === 'verified').length,
    partiallyVerifiedCount: PLANT_HEALTH_KB.filter((c) => c.verificationStatus === 'partially-verified').length,
  };
}
