/**
 * GrowAI Phase 10: Production Cycles, Harvest & Yield Intelligence Engine
 * Manages crop cycles, plant batches, harvest entries, and deterministic yield analytics.
 *
 * Adheres strictly to Section 12, 13, 14, 15, 16 & 40:
 * - Deterministic arithmetic: calculates only from recorded data.
 * - If area is unknown, yield per area is explicitly marked null/unavailable (never fabricated).
 * - Original recorded units and quantities are strictly preserved.
 * - No false causality or yield increase claims.
 */

import {
  ProductionCycle,
  ProductionStage,
  ProductionCycleStatus,
  HarvestRecord,
  HarvestUnit,
  YieldMetrics,
  CropCycleComparison,
} from '@/types/grow-intelligence';
import { PlantTimelineEvent } from '@/types/timeline';

/**
 * Validates a production cycle input.
 */
export function validateProductionCycle(input: Partial<ProductionCycle>): {
  valid: boolean;
  error?: string;
} {
  if (!input.cycleName || input.cycleName.trim().length === 0) {
    return { valid: false, error: 'Cycle name is required.' };
  }

  if (!input.plantSlug || input.plantSlug.trim().length === 0) {
    return { valid: false, error: 'Plant species is required.' };
  }

  if (!input.startDate) {
    return { valid: false, error: 'Start date is required.' };
  }

  if (input.quantityPlanted !== undefined && input.quantityPlanted < 0) {
    return { valid: false, error: 'Quantity planted cannot be negative.' };
  }

  if (input.quantityActive !== undefined && input.quantityActive < 0) {
    return { valid: false, error: 'Quantity active cannot be negative.' };
  }

  if (input.quantityLost !== undefined && input.quantityLost < 0) {
    return { valid: false, error: 'Quantity lost cannot be negative.' };
  }

  return { valid: true };
}

/**
 * Validates a harvest record input.
 */
export function validateHarvestRecord(input: Partial<HarvestRecord>): {
  valid: boolean;
  error?: string;
} {
  if (!input.harvestDate) {
    return { valid: false, error: 'Harvest date is required.' };
  }

  if (input.quantity === undefined || input.quantity === null || isNaN(input.quantity) || input.quantity <= 0) {
    return { valid: false, error: 'Harvest quantity must be a positive number.' };
  }

  if (!input.unit) {
    return { valid: false, error: 'Harvest unit is required.' };
  }

  if (!input.plantId && !input.productionCycleId) {
    return { valid: false, error: 'Harvest must be associated with either a plant or production cycle.' };
  }

  return { valid: true };
}

/**
 * Computes deterministic yield metrics from recorded harvest records.
 * If area is provided (in square meters), computes yield/area; otherwise yield/area is null.
 */
export function calculateYieldMetrics(
  harvests: HarvestRecord[],
  areaSquareMeters?: number | null
): YieldMetrics {
  if (!harvests || harvests.length === 0) {
    return {
      totalHarvestCount: 0,
      totalsByUnit: {},
      averageHarvestPerEventByUnit: {},
      yieldPerArea: null,
      firstHarvestDate: null,
      latestHarvestDate: null,
      harvestFrequencyDays: null,
    };
  }

  // Sort chronologically ascending
  const sorted = [...harvests].sort(
    (a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime()
  );

  const totalsByUnit: Record<string, number> = {};
  const countsByUnit: Record<string, number> = {};

  for (const h of sorted) {
    const unit = h.unit;
    totalsByUnit[unit] = (totalsByUnit[unit] || 0) + Number(h.quantity);
    countsByUnit[unit] = (countsByUnit[unit] || 0) + 1;
  }

  const averagesByUnit: Record<string, number> = {};
  for (const unit of Object.keys(totalsByUnit)) {
    const count = countsByUnit[unit] || 1;
    averagesByUnit[unit] = Math.round((totalsByUnit[unit] / count) * 100) / 100;
  }

  const firstDate = sorted[0].harvestDate;
  const latestDate = sorted[sorted.length - 1].harvestDate;

  // Harvest frequency in days if multiple harvests exist
  let frequencyDays: number | null = null;
  if (sorted.length > 1) {
    const spanMs = new Date(latestDate).getTime() - new Date(firstDate).getTime();
    const spanDays = Math.max(1, Math.round(spanMs / (1000 * 60 * 60 * 24)));
    frequencyDays = Math.round((spanDays / (sorted.length - 1)) * 10) / 10;
  }

  // Yield per area: ONLY calculated when valid positive area is explicitly provided
  let yieldPerArea: YieldMetrics['yieldPerArea'] = null;
  if (areaSquareMeters && areaSquareMeters > 0) {
    // Pick the primary unit (e.g. g or kg or pieces)
    const primaryUnit = Object.keys(totalsByUnit)[0];
    if (primaryUnit) {
      const totalAmount = totalsByUnit[primaryUnit];
      yieldPerArea = {
        yieldAmount: totalAmount,
        unit: primaryUnit,
        areaSquareMeters,
        yieldPerSquareMeter: Math.round((totalAmount / areaSquareMeters) * 100) / 100,
      };
    }
  }

  return {
    totalHarvestCount: sorted.length,
    totalsByUnit,
    averageHarvestPerEventByUnit: averagesByUnit,
    yieldPerArea,
    firstHarvestDate: firstDate,
    latestHarvestDate: latestDate,
    harvestFrequencyDays: frequencyDays,
  };
}

/**
 * Compares two production cycles objectively without asserting false causality.
 */
export function compareProductionCycles(
  cycleA: ProductionCycle,
  cycleB: ProductionCycle
): CropCycleComparison {
  const getDuration = (c: ProductionCycle): number | null => {
    if (!c.startDate || !c.actualEndDate) return null;
    const start = new Date(c.startDate).getTime();
    const end = new Date(c.actualEndDate).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return null;
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const getLossRate = (c: ProductionCycle): number | null => {
    if (!c.quantityPlanted || c.quantityPlanted <= 0) return null;
    return Math.round(((c.quantityLost || 0) / c.quantityPlanted) * 1000) / 10;
  };

  const durA = getDuration(cycleA);
  const durB = getDuration(cycleB);
  const lossA = getLossRate(cycleA);
  const lossB = getLossRate(cycleB);

  const notes: string[] = [];
  if (cycleA.quantityHarvested !== cycleB.quantityHarvested) {
    const higher = cycleA.quantityHarvested > cycleB.quantityHarvested ? cycleA.cycleName : cycleB.cycleName;
    const diff = Math.abs(cycleA.quantityHarvested - cycleB.quantityHarvested);
    notes.push(`Recorded harvest: ${higher} logged ${diff} units more than the comparison cycle.`);
  } else {
    notes.push(`Both cycles logged equal harvest totals (${cycleA.quantityHarvested} units).`);
  }

  if (durA !== null && durB !== null) {
    if (durA !== durB) {
      const shorter = durA < durB ? cycleA.cycleName : cycleB.cycleName;
      notes.push(`${shorter} concluded in fewer calendar days (${Math.min(durA, durB)} days vs ${Math.max(durA, durB)} days).`);
    } else {
      notes.push(`Both cycles had identical recorded durations of ${durA} days.`);
    }
  }

  if (lossA !== null && lossB !== null && lossA !== lossB) {
    const lower = lossA < lossB ? cycleA.cycleName : cycleB.cycleName;
    notes.push(`${lower} experienced a lower mortality/loss rate.`);
  }

  return {
    cycleA,
    cycleB,
    durationDaysA: durA,
    durationDaysB: durB,
    totalHarvestA: cycleA.quantityHarvested,
    totalHarvestB: cycleB.quantityHarvested,
    lossRateA: lossA,
    lossRateB: lossB,
    comparisonNotes: notes,
  };
}

export const compareCropCycles = compareProductionCycles;

/**
 * Converts harvest records into chronological timeline events for Phase 9 integration.
 */
export function generateHarvestTimelineEvents(
  harvests: HarvestRecord[],
  targetPlantId: string
): PlantTimelineEvent[] {
  const events: PlantTimelineEvent[] = [];

  for (const h of harvests) {
    if (h.plantId !== targetPlantId) continue;

    const formattedDate = new Date(h.harvestDate).toISOString().split('T')[0];
    const isFull = h.harvestType === 'full_harvest';

    events.push({
      id: `harvest-${h.id}`,
      plantId: targetPlantId,
      eventDate: formattedDate,
      category: 'harvest',
      eventType: 'harvest',
      title: isFull ? 'Full Plant Harvest' : `Harvest: ${h.quantity} ${h.unit}`,
      description: `Harvested ${h.quantity} ${h.unit} (${h.harvestType.replace(/_/g, ' ')})${h.qualityObservation ? ` — Quality: ${h.qualityObservation}` : ''}.${h.notes ? ` Note: ${h.notes}` : ''}`,
      sourceProvenance: 'harvest_records',
      badge: {
        text: `${h.quantity} ${h.unit}`,
        variant: 'success',
      },
    });
  }

  return events;
}
