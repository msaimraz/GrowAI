/**
 * GrowAI Phase 11: Data Quality Intelligence Engine
 * Measures the completeness of a garden's recorded data across botanical,
 * environmental, nutritional, growth, and health domains.
 *
 * CRITICAL SAFETY PRINCIPLE:
 * Data completeness is strictly NOT plant health.
 * An incomplete record does not mean an unhealthy plant.
 * Never report "garden is X% healthy" from data quality scores.
 */

import { AdaptiveGardenInput, DataQualityReport, DataQualityCategory } from '@/types/adaptive-grow';

export function calculateDataQuality(input: AdaptiveGardenInput): DataQualityReport {
  const {
    plants = [],
    conditions = [],
    feedings = [],
    propagations = [],
    cycles = [],
    harvests = [],
    diagnoses = [],
  } = input;

  if (plants.length === 0) {
    return {
      score: 0,
      categories: [
        { category: 'Plant Basics', score: 0, missing: ['No plants added to garden yet'] },
        { category: 'Growth Observations', score: 0, missing: ['No plants available for growth tracking'] },
        { category: 'Environmental Records', score: 0, missing: ['No active plants to observe'] },
        { category: 'Nutrient Feeding Records', score: 0, missing: ['Zero feeding applications logged across garden'] },
        { category: 'Health Follow-ups', score: 0, missing: ['No plants available for health monitoring'] },
        { category: 'Production Records', score: 0, missing: ['No plants or production cycles logged'] },
      ],
    };
  }

  const categories: DataQualityCategory[] = [];

  // 1. Plant Basics Completeness
  const basicMissing: string[] = [];
  let basicPoints = 0;
  const maxBasicPoints = plants.length * 4;

  if (plants.length === 0) {
    basicMissing.push('No plants added to garden yet');
  } else {
    for (const p of plants) {
      if (p.plantedDate) basicPoints += 1;
      else basicMissing.push(`${p.nickname}: planting date unrecorded`);

      if (p.location) basicPoints += 1;
      else basicMissing.push(`${p.nickname}: location unrecorded`);

      if (p.potSize) basicPoints += 1;
      else basicMissing.push(`${p.nickname}: container/pot size unrecorded`);

      if (p.currentStage) basicPoints += 1;
      else basicMissing.push(`${p.nickname}: current growth stage unrecorded`);
    }
  }

  const basicScore = maxBasicPoints > 0 ? Math.round((basicPoints / maxBasicPoints) * 100) : 0;
  categories.push({
    category: 'Plant Basics',
    score: basicScore,
    missing: basicMissing.slice(0, 5),
  });

  // 2. Growth Tracking Completeness
  const growthMissing: string[] = [];
  let growthPoints = 0;
  const maxGrowthPoints = plants.length * 2;

  if (plants.length === 0) {
    growthMissing.push('No plants available for growth tracking');
  } else {
    for (const p of plants) {
      if (p.notes && p.notes.length > 0) {
        growthPoints += 1;
      } else {
        growthMissing.push(`${p.nickname}: zero growth notes recorded`);
      }

      // Check if note is reasonably recent (within 30 days)
      const now = input.referenceDate
        ? new Date(input.referenceDate)
        : typeof window !== 'undefined'
          ? new Date()
          : new Date('2026-11-05T00:00:00.000Z');
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const hasRecentNote = p.notes?.some((n) => new Date(n.date).getTime() >= thirtyDaysAgo.getTime());

      if (hasRecentNote) {
        growthPoints += 1;
      } else if (p.notes && p.notes.length > 0) {
        growthMissing.push(`${p.nickname}: no growth note in the last 30 days`);
      }
    }
  }

  const growthScore = maxGrowthPoints > 0 ? Math.round((growthPoints / maxGrowthPoints) * 100) : 0;
  categories.push({
    category: 'Growth Observations',
    score: growthScore,
    missing: growthMissing.slice(0, 5),
  });

  // 3. Environmental Records Completeness
  const envMissing: string[] = [];
  let envPoints = 0;
  const activePlants = plants.filter((p) => p.currentStage !== 'Harvested');
  const maxEnvPoints = activePlants.length * 3;

  if (activePlants.length === 0) {
    envMissing.push('No active plants to observe');
  } else {
    const plantIdsWithCond = new Set(conditions.map((c) => c.plantId).filter(Boolean));
    for (const p of activePlants) {
      const pConds = conditions.filter((c) => !c.plantId || c.plantId === p.id);
      if (pConds.length > 0) {
        envPoints += 1;
        const latest = pConds[pConds.length - 1];
        if (latest.temperatureCelsius !== undefined && latest.temperatureCelsius !== null) {
          envPoints += 1;
        } else {
          envMissing.push(`${p.nickname}: temperature not recorded in latest condition log`);
        }
        if (latest.relativeHumidityPercent !== undefined && latest.relativeHumidityPercent !== null) {
          envPoints += 1;
        } else {
          envMissing.push(`${p.nickname}: humidity not recorded in latest condition log`);
        }
      } else {
        envMissing.push(`${p.nickname}: no environmental conditions recorded`);
      }
    }
  }

  const envScore = maxEnvPoints > 0 ? Math.round((envPoints / maxEnvPoints) * 100) : 0;
  categories.push({
    category: 'Environmental Records',
    score: envScore,
    missing: envMissing.slice(0, 5),
  });

  // 4. Feeding Records Completeness
  const feedMissing: string[] = [];
  let feedPoints = 0;
  let maxFeedPoints = activePlants.length;

  if (feedings.length === 0) {
    feedMissing.push('Zero feeding applications logged across garden');
  } else {
    for (const f of feedings) {
      maxFeedPoints += 2;
      if (f.productName) feedPoints += 1;
      else feedMissing.push(`Feeding on ${f.feedingDate}: product name unrecorded`);

      if (f.npkRatio) feedPoints += 1;
      else if (f.dosageUnknown) feedPoints += 1; // Explicitly noted unknown is valid data
      else feedMissing.push(`Feeding on ${f.feedingDate}: NPK or formulation unrecorded`);
    }
  }

  const feedScore = maxFeedPoints > 0 ? Math.round((feedPoints / maxFeedPoints) * 100) : 0;
  categories.push({
    category: 'Nutrient Feeding Records',
    score: feedScore,
    missing: feedMissing.slice(0, 5),
  });

  // 5. Health & Follow-up Completeness
  const healthMissing: string[] = [];
  let healthPoints = 0;
  let maxHealthPoints = Math.max(diagnoses.length, 1);

  if (diagnoses.length === 0) {
    healthPoints = 1; // Clean baseline if no diagnoses exist
  } else {
    for (const d of diagnoses) {
      if (d.symptoms) healthPoints += 1;
      maxHealthPoints += 1;

      // If issue was identified, verify follow-up was recorded
      if (d.primaryClassification === 'biotic' || d.overallHealth === 'severe_issue' || d.overallHealth === 'moderate_issue') {
        maxHealthPoints += 1;
        if (d.followUps && d.followUps.length > 0) {
          healthPoints += 1;
        } else {
          healthMissing.push(`Diagnosis for ${d.plantIdentification || 'plant'}: missing follow-up observation`);
        }
      }
    }
  }

  const healthScore = maxHealthPoints > 0 ? Math.round((healthPoints / maxHealthPoints) * 100) : 100;
  categories.push({
    category: 'Health Follow-ups',
    score: Math.min(100, healthScore),
    missing: healthMissing.slice(0, 5),
  });

  // 6. Production & Cycle Records Completeness
  const prodMissing: string[] = [];
  let prodPoints = 0;
  let maxProdPoints = Math.max(cycles.length + harvests.length, 1);

  if (cycles.length === 0 && harvests.length === 0) {
    prodPoints = 1;
  } else {
    for (const c of cycles) {
      if (c.quantityPlanted > 0) prodPoints += 1;
      else prodMissing.push(`Cycle "${c.cycleName}": planted quantity unrecorded`);
      if (c.growingArea) prodPoints += 1;
      else prodMissing.push(`Cycle "${c.cycleName}": growing area unrecorded (yield/m² unavailable)`);
      maxProdPoints += 2;
    }
    for (const h of harvests) {
      if (h.quantity && h.unit) prodPoints += 1;
      maxProdPoints += 1;
    }
  }

  const prodScore = maxProdPoints > 0 ? Math.round((prodPoints / maxProdPoints) * 100) : 100;
  categories.push({
    category: 'Production Records',
    score: Math.min(100, prodScore),
    missing: prodMissing.slice(0, 5),
  });

  // Overall completeness score (mean across active categories)
  const totalScore = Math.round(
    categories.reduce((acc, c) => acc + c.score, 0) / categories.length
  );

  return {
    score: totalScore,
    categories,
  };
}

/**
 * Returns overall completeness score and top critical missing data items.
 */
export function getDataCompletenessScore(input: AdaptiveGardenInput): {
  completenessScore: number;
  missingCriticalData: string[];
} {
  const report = calculateDataQuality(input);
  const allMissing: string[] = [];
  for (const cat of report.categories) {
    allMissing.push(...cat.missing);
  }

  return {
    completenessScore: report.score,
    missingCriticalData: allMissing.slice(0, 5),
  };
}

