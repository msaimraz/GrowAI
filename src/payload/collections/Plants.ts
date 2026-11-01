import type { CollectionConfig } from 'payload';

export const Plants: CollectionConfig = {
  slug: 'plants',
  admin: {
    useAsTitle: 'commonName',
    defaultColumns: ['commonName', 'scientificName', 'categorySlug', 'difficultyLevel', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    // Only published plants are publicly visible; editors and admins can see drafts
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        _status: {
          equals: 'published',
        },
      };
    },
    create: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    // Identification & Basic Classification
    {
      name: 'commonName',
      type: 'text',
      required: true,
      label: 'Common Botanical Name',
    },
    {
      name: 'scientificName',
      type: 'text',
      required: true,
      label: 'Scientific Name (Binomial Nomenclature)',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Unique URL Slug',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Plant Category Relation',
    },
    {
      name: 'categorySlug',
      type: 'select',
      required: true,
      label: 'Category Taxonomy Code',
      options: [
        { label: 'Vegetables & Fruits', value: 'vegetables-fruits' },
        { label: 'Herbs & Leafy Greens', value: 'herbs-greens' },
        { label: 'Indoor & Decorative', value: 'indoor-decorative' },
        { label: 'Flowering Plants', value: 'flowering' },
        { label: 'Traditional Medicinal & Aromatic', value: 'medicinal-aromatic' },
        { label: 'Microgreens & Quick-Harvest', value: 'microgreens' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'Botanical Summary / Agronomic Profile',
    },
    {
      name: 'badge',
      type: 'text',
      label: 'Special Badge / Accolade (e.g., Space Efficient, Fast Yield)',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Feature on Homepage Hero / Recommendations',
    },

    // Media & Imagery
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      label: 'Featured Botanical Image',
    },
    {
      name: 'featuredImageUrl',
      type: 'text',
      label: 'Direct Image URL Fallback',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Botanical Gallery Images',
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },

    // Environmental Parameters
    {
      name: 'environments',
      type: 'select',
      hasMany: true,
      required: true,
      label: 'Viable Growing Environments',
      options: [
        { label: 'Indoor Apartment', value: 'indoor' },
        { label: 'Balcony', value: 'balcony' },
        { label: 'Patio', value: 'patio' },
        { label: 'Greenhouse', value: 'greenhouse' },
        { label: 'Vertical Rack / Tower', value: 'vertical-rack' },
      ],
    },
    {
      name: 'temperatureRange',
      type: 'group',
      label: 'Temperature Tolerances (°C)',
      fields: [
        {
          name: 'min',
          type: 'number',
          required: true,
          label: 'Minimum Survival Temperature (°C)',
        },
        {
          name: 'max',
          type: 'number',
          required: true,
          label: 'Maximum Heat Tolerance (°C)',
        },
        {
          name: 'unit',
          type: 'text',
          defaultValue: 'C',
          admin: { readOnly: true },
        },
        {
          name: 'idealRange',
          type: 'text',
          label: 'Ideal Daytime/Nighttime Range (e.g. 18°C–24°C)',
        },
      ],
    },
    {
      name: 'sunlight',
      type: 'select',
      required: true,
      label: 'Photoperiod & Sunlight Requirements',
      options: [
        { label: 'Full Sun (6+ hrs direct sun)', value: 'full-sun' },
        { label: 'Partial Sun (3–6 hrs direct sun)', value: 'partial-sun' },
        { label: 'Bright Indirect Light', value: 'bright-indirect' },
        { label: 'Low Light / Shade Tolerant', value: 'low-light' },
      ],
    },
    {
      name: 'sunlightHours',
      type: 'text',
      required: true,
      label: 'Recommended Sunlight Hours (e.g. 6–8 hours daily)',
    },

    // Hydration, Soil & Potting Specifications
    {
      name: 'watering',
      type: 'group',
      label: 'Watering & Moisture Guidance',
      fields: [
        {
          name: 'frequency',
          type: 'text',
          required: true,
          label: 'Watering Frequency',
        },
        {
          name: 'guidance',
          type: 'textarea',
          required: true,
          label: 'Application Guidance',
        },
        {
          name: 'moistureLevel',
          type: 'select',
          required: true,
          options: [
            { label: 'Low (drought tolerant / allow drying)', value: 'low' },
            { label: 'Moderate (dry top 2-3 cm between waterings)', value: 'moderate' },
            { label: 'High (keep evenly moist)', value: 'high' },
          ],
        },
      ],
    },
    {
      name: 'soil',
      type: 'group',
      label: 'Growing Medium & Soil Requirements',
      fields: [
        {
          name: 'type',
          type: 'text',
          required: true,
          label: 'Soil / Medium Texture',
        },
        {
          name: 'drainage',
          type: 'text',
          required: true,
          label: 'Drainage Characteristics',
        },
        {
          name: 'recommendedMix',
          type: 'text',
          label: 'Suggested Potting Blend Recipe',
        },
      ],
    },
    {
      name: 'potting',
      type: 'group',
      label: 'Container Dimensions & Spatial Requirements',
      fields: [
        {
          name: 'minDepthCm',
          type: 'number',
          required: true,
          label: 'Minimum Container Depth (cm)',
        },
        {
          name: 'spacingCm',
          type: 'number',
          required: true,
          label: 'Minimum Plant Spacing (cm)',
        },
        {
          name: 'recommendedPotSize',
          type: 'text',
          required: true,
          label: 'Recommended Container Capacity (e.g., 5–7 Liters)',
        },
      ],
    },
    {
      name: 'humidity',
      type: 'group',
      label: 'Relative Humidity Preferences',
      fields: [
        { name: 'min', type: 'number', label: 'Minimum RH (%)' },
        { name: 'max', type: 'number', label: 'Maximum RH (%)' },
        { name: 'note', type: 'text', label: 'Humidity Notes' },
      ],
    },
    {
      name: 'ph',
      type: 'group',
      label: 'Substrate pH Preferences',
      fields: [
        { name: 'min', type: 'number', label: 'Minimum pH' },
        { name: 'max', type: 'number', label: 'Maximum pH' },
        { name: 'note', type: 'text', label: 'pH Buffering Notes' },
      ],
    },

    // Phenological Timelines
    {
      name: 'timelines',
      type: 'group',
      label: 'Phenological Growth Timelines',
      fields: [
        {
          name: 'germinationMin',
          type: 'number',
          required: true,
          label: 'Germination Min Days',
        },
        {
          name: 'germinationMax',
          type: 'number',
          required: true,
          label: 'Germination Max Days',
        },
        {
          name: 'seedlingMin',
          type: 'number',
          required: true,
          label: 'Seedling Min Days',
        },
        {
          name: 'seedlingMax',
          type: 'number',
          required: true,
          label: 'Seedling Max Days',
        },
        {
          name: 'harvestMin',
          type: 'number',
          label: 'First Harvest Min Days',
        },
        {
          name: 'harvestMax',
          type: 'number',
          label: 'First Harvest Max Days',
        },
        {
          name: 'floweringMin',
          type: 'number',
          label: 'Flowering Min Days',
        },
        {
          name: 'floweringMax',
          type: 'number',
          label: 'Flowering Max Days',
        },
        {
          name: 'maturityMin',
          type: 'number',
          required: true,
          label: 'Full Maturity Min Days',
        },
        {
          name: 'maturityMax',
          type: 'number',
          required: true,
          label: 'Full Maturity Max Days',
        },
        {
          name: 'timelineNotes',
          type: 'textarea',
          label: 'Timeline Observations & Temperature Influences',
        },
      ],
    },

    // Vertical Suitability & Difficulty
    {
      name: 'verticalSuitability',
      type: 'group',
      label: 'Vertical Agriculture Architecture Suitability',
      fields: [
        {
          name: 'isSuitable',
          type: 'checkbox',
          defaultValue: true,
          label: 'Suitable for Vertical Farming / Shelving',
        },
        {
          name: 'rating',
          type: 'select',
          required: true,
          options: [
            { label: 'Ideal (Naturally compact, shallow roots)', value: 'ideal' },
            { label: 'Moderate (Requires pruning or training)', value: 'moderate' },
            { label: 'Challenging (Heavy feeder or root volume)', value: 'challenging' },
            { label: 'Unsuitable (Excessive vine length / root tap)', value: 'unsuitable' },
          ],
        },
        {
          name: 'recommendedTier',
          type: 'select',
          required: true,
          options: [
            { label: 'Top Tier (High Light, Unrestricted Overhead)', value: 'top' },
            { label: 'Middle Tier (Balanced Light, Microclimate)', value: 'middle' },
            { label: 'Bottom Tier (Dappled / Low Light, Heavy Pots)', value: 'bottom' },
            { label: 'Any Tier', value: 'any' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Vertical Stacking Guidance',
        },
      ],
    },
    {
      name: 'difficulty',
      type: 'group',
      label: 'Grower Difficulty & Care Demands',
      fields: [
        {
          name: 'level',
          type: 'select',
          required: true,
          options: [
            { label: 'Beginner Friendly', value: 'beginner' },
            { label: 'Intermediate Care', value: 'intermediate' },
            { label: 'Advanced Horticultural Skill', value: 'advanced' },
          ],
        },
        {
          name: 'score',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          label: 'Difficulty Score (1 to 5)',
        },
        {
          name: 'methodologyNotes',
          type: 'textarea',
          label: 'Horticultural Demands Justification',
        },
      ],
    },

    // Phytopathology, Remediation & Uses
    {
      name: 'commonProblems',
      type: 'array',
      label: 'Documented Phytopathological Issues & Organic Remedies',
      fields: [
        { name: 'issue', type: 'text', required: true, label: 'Problem / Pest Name' },
        { name: 'symptoms', type: 'text', required: true, label: 'Diagnostic Symptoms' },
        { name: 'prevention', type: 'text', required: true, label: 'Preventive Measure' },
        { name: 'organicRemedy', type: 'text', required: true, label: 'Organic Remediation' },
      ],
    },
    {
      name: 'practicalUses',
      type: 'array',
      label: 'Culinary, Aesthetic or Functional Practical Uses',
      fields: [
        { name: 'item', type: 'text', required: true },
      ],
    },
    {
      name: 'safetyNotes',
      type: 'textarea',
      label: 'Toxicity, Pet Warnings & Handling Precautions',
    },
    {
      name: 'sourceUrls',
      type: 'array',
      label: 'Agronomic Research References & Citations',
      fields: [
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'dataReviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'verified',
      options: [
        { label: 'Agronomist Verified', value: 'verified' },
        { label: 'Peer-Reviewed Literature', value: 'peer-reviewed' },
        { label: 'Community Field Draft', value: 'community-draft' },
      ],
    },

    // Medicinal & Phytochemical Information Architecture
    {
      name: 'medicinalProfile',
      type: 'group',
      label: 'Medicinal & Phytochemical Profile',
      fields: [
        // Suitability for Consumption
        {
          name: 'isEdible',
          type: 'checkbox',
          defaultValue: true,
          label: 'Is Edible / Safe for Ingestion',
        },
        {
          name: 'edibilityCategory',
          type: 'select',
          required: true,
          defaultValue: 'edible',
          enumName: 'enum_plants_edibility_cat',
          options: [
            { label: 'Edible (Food / Culinary)', value: 'edible' },
            { label: 'Edible with Preparation (Cooking / Soaking required)', value: 'edible-with-preparation' },
            { label: 'Toxic / Inedible (Not safe for consumption)', value: 'toxic-inedible' },
            { label: 'Strictly Ornamental (Not for consumption)', value: 'strictly-ornamental' },
          ],
        },
        {
          name: 'edibilityNotes',
          type: 'textarea',
          label: 'Consumption Notes & Guidance',
        },

        // Medicinal Value & Role in Traditional Medicine
        {
          name: 'medicinalValueSummary',
          type: 'textarea',
          label: 'Medicinal Value Summary',
        },
        {
          name: 'traditionalMedicineRole',
          type: 'textarea',
          label: 'Role in Traditional Herbal Medicine',
        },
        {
          name: 'biologicalProperties',
          type: 'array',
          label: 'Scientifically Studied Biological Properties',
          dbName: 'plants_bio_properties',
          fields: [
            { name: 'property', type: 'text', required: true },
          ],
        },
        {
          name: 'overallEvidenceLevel',
          type: 'select',
          required: true,
          defaultValue: 'preliminary-research',
          enumName: 'enum_plants_evidence_level',
          options: [
            { label: 'Traditional use: historically documented use without sufficient clinical confirmation', value: 'traditional-use' },
            { label: 'Preliminary research: laboratory or animal research, or early human research', value: 'preliminary-research' },
            { label: 'Clinical evidence: supported by relevant human clinical studies', value: 'clinical-evidence' },
            { label: 'Insufficient evidence: claims cannot be adequately substantiated', value: 'insufficient-evidence' },
          ],
        },

        // Active Compounds
        {
          name: 'activeCompounds',
          type: 'array',
          label: 'Important Active Compounds & Phytochemicals',
          dbName: 'plants_active_compounds',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Compound Name' },
            { name: 'chemicalClass', type: 'text', label: 'Chemical Class (e.g. Glucosinolate, Flavonoid, Polyphenol)' },
            { name: 'description', type: 'textarea', required: true, label: 'Description & Biological Significance' },
            { name: 'primaryLocation', type: 'text', label: 'Primary Location in Plant (e.g. Sprouts, Leaves, Seeds)' },
            {
              name: 'studiedProperties',
              type: 'array',
              label: 'Studied Biological Properties',
              dbName: 'plants_compound_properties',
              fields: [{ name: 'property', type: 'text', required: true }],
            },
          ],
        },

        // Herbal Preparations
        {
          name: 'herbalPreparations',
          type: 'array',
          label: 'Herbal Preparations & Formulations',
          dbName: 'plants_herbal_preps',
          fields: [
            { name: 'type', type: 'text', required: true, label: 'Preparation Type' },
            { name: 'partUsed', type: 'text', required: true, label: 'Plant Part Used' },
            { name: 'traditionalRole', type: 'textarea', required: true, label: 'Traditional or Intended Role' },
            {
              name: 'activeCompounds',
              type: 'array',
              label: 'Associated Active Compounds',
              dbName: 'plants_prep_compounds',
              fields: [{ name: 'compound', type: 'text', required: true }],
            },
            {
              name: 'evidenceLevel',
              type: 'select',
              required: true,
              defaultValue: 'traditional-use',
              enumName: 'enum_plants_prep_evidence',
              options: [
                { label: 'Traditional Use', value: 'traditional-use' },
                { label: 'Preliminary Research', value: 'preliminary-research' },
                { label: 'Clinical Evidence', value: 'clinical-evidence' },
                { label: 'Insufficient Evidence', value: 'insufficient-evidence' },
              ],
            },
            { name: 'safetyConsiderations', type: 'textarea', label: 'Safety Considerations & Risks' },
          ],
        },

        // Safety, Toxicity & Contraindications
        {
          name: 'toxicityLevel',
          type: 'select',
          required: true,
          defaultValue: 'non-toxic',
          enumName: 'enum_plants_toxicity_level',
          options: [
            { label: 'Non-toxic (Food safe in customary amounts)', value: 'non-toxic' },
            { label: 'Mildly toxic if ingested', value: 'mildly-toxic-if-ingested' },
            { label: 'Toxic due to Calcium Oxalate crystals', value: 'toxic-calcium-oxalate' },
            { label: 'Toxic due to Saponins', value: 'toxic-saponins' },
            { label: 'Contains anti-nutrients (e.g. lectins, phytoestrogens)', value: 'contains-anti-nutrients' },
          ],
        },
        { name: 'toxicParts', type: 'text', label: 'Toxic Parts (if any)' },
        { name: 'symptoms', type: 'textarea', label: 'Reported Symptoms upon Ingestion / Exposure' },
        {
          name: 'contraindications',
          type: 'array',
          label: 'Contraindications',
          dbName: 'plants_contraindications',
          fields: [{ name: 'item', type: 'text', required: true }],
        },
        {
          name: 'medicationInteractions',
          type: 'array',
          label: 'Medication Interactions',
          dbName: 'plants_med_interactions',
          fields: [{ name: 'item', type: 'text', required: true }],
        },
        { name: 'generalPrecautions', type: 'textarea', required: true, label: 'General Precautions & Guidance' },

        // Food Safety & Microbial Risks (dedicated for sprouts)
        {
          name: 'foodSafetyHasMicrobialRisk',
          type: 'checkbox',
          defaultValue: false,
          label: 'Has Microbial Food Safety Risk (Sprout Guidance)',
        },
        {
          name: 'foodSafetyPathogens',
          type: 'array',
          label: 'Pathogen Concerns (e.g. Salmonella, E. coli, Listeria)',
          dbName: 'plants_sprout_pathogens',
          fields: [{ name: 'pathogen', type: 'text', required: true }],
        },
        {
          name: 'foodSafetyWashingAdvisory',
          type: 'textarea',
          label: 'Washing Advisory (Washing alone does not guarantee safety)',
        },
        {
          name: 'foodSafetyCookingRecommendation',
          type: 'textarea',
          label: 'Cooking Recommendation',
        },
        {
          name: 'foodSafetyVulnerableAdvisory',
          type: 'textarea',
          label: 'Vulnerable Populations Advisory',
        },

        // References
        {
          name: 'references',
          type: 'array',
          label: 'Traceable Scientific & Regulatory References',
          dbName: 'plants_references',
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Study / Document Title' },
            { name: 'authorOrOrg', type: 'text', required: true, label: 'Author or Organization (e.g. WHO, FDA, USDA, PubMed journal)' },
            { name: 'year', type: 'text', label: 'Publication Year' },
            { name: 'publication', type: 'text', label: 'Journal / Source Publication' },
            { name: 'url', type: 'text', label: 'Traceable URL / Link' },
            { name: 'doi', type: 'text', label: 'Digital Object Identifier (DOI)' },
          ],
        },
      ],
    },
  ],
};
