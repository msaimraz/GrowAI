/**
 * GrowAI Phase 10: Feeding & Fertilization Tracking Engine
 * Manages feeding history, product records, and gentle nutrient observations.
 *
 * Adheres strictly to Section 8 & 9:
 * - Never invents chemical dosages, dilution rates, or pre-harvest intervals.
 * - Allows dosage_unknown when dosage was not measured or supplied.
 * - Never automatically diagnoses a nutrient deficiency (labels as "possible nutrient-related observation").
 * - Only schedules next feeding if explicitly provided or requested by grower.
 */

import {
  FeedingRecord,
  FeedingSummary,
  NutrientObservationType,
} from '@/types/grow-intelligence';

/**
 * Validates a feeding record input before persistence.
 */
export function validateFeedingRecord(input: Partial<FeedingRecord>): {
  valid: boolean;
  error?: string;
} {
  if (!input.productName || input.productName.trim().length === 0) {
    return { valid: false, error: 'Product name is required.' };
  }

  if (!input.feedingDate) {
    return { valid: false, error: 'Feeding date is required.' };
  }

  const parsedDate = new Date(input.feedingDate);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: 'Feeding date must be a valid timestamp.' };
  }

  if (input.dosageAmount !== undefined && input.dosageAmount !== null) {
    if (isNaN(input.dosageAmount) || input.dosageAmount < 0) {
      return { valid: false, error: 'Dosage amount cannot be negative.' };
    }
  }

  return { valid: true };
}

/**
 * Formats NPK ratio safely without asserting unverified chemical concentrations.
 */
export function formatNpkRatio(npk?: string | null): string | null {
  if (!npk || npk.trim().length === 0) {
    return null;
  }
  return npk.trim();
}

/**
 * Formats a nutrient observation into safe, non-diagnostic observational language.
 */
export function formatNutrientObservation(obs?: NutrientObservationType | null): {
  label: string;
  isCautionary: boolean;
  guidance: string;
} {
  switch (obs) {
    case 'chlorosis':
      return {
        label: 'Leaf Chlorosis (Yellowing)',
        isCautionary: true,
        guidance: 'General foliar yellowing observed (chlorosis). Consider checking substrate moisture and root zone aeration before altering feeding.',
      };
    case 'leaf_edge_damage':
      return {
        label: 'Leaf Margin Damage / Tip Burn',
        isCautionary: true,
        guidance: 'Tip browning or margin damage observed. Note that excessive fertilizer salts or moisture stress can both cause tip burn.',
      };
    case 'stunted_growth':
      return {
        label: 'Stunted Growth Rate',
        isCautionary: true,
        guidance: 'Growth rate appears subdued. Review environmental light and temperature alongside feeding history.',
      };
    case 'purpling':
      return {
        label: 'Foliage Purpling / Anthocyanin Accumulation',
        isCautionary: true,
        guidance: 'Foliar purpling observed. Often associated with cool root temperatures or substrate phosphorus availability.',
      };
    case 'interveinal_chlorosis':
      return {
        label: 'Interveinal Chlorosis',
        isCautionary: true,
        guidance: 'Yellowing between green leaf veins observed. Substrate pH can affect micronutrient mobility.',
      };
    case 'possible_deficiency':
      return {
        label: 'Possible Nutrient-Related Observation',
        isCautionary: true,
        guidance: 'Observed foliage symptoms may be nutrient-related. Do not apply heavy fertilizer doses without verifying root health.',
      };
    case 'normal_vigor':
      return {
        label: 'Normal Plant Vigor',
        isCautionary: false,
        guidance: 'Foliage and growth appear healthy and unstressed.',
      };
    default:
      return {
        label: 'Nutrient observations unrecorded',
        isCautionary: false,
        guidance: 'No specific foliar nutrient observations have been noted.',
      };
  }
}

export function assessFoliarNutrientObservation(obs?: NutrientObservationType | null): string {
  return formatNutrientObservation(obs).guidance;
}

/**
 * Summarizes feeding records for a plant or garden.
 */
export function summarizeFeedingHistory(records: FeedingRecord[], referenceDate?: Date | string): FeedingSummary {
  if (!records || records.length === 0) {
    return {
      lastFeeding: null,
      totalFeedingsRecorded: 0,
      nextPlannedDate: null,
      recentProductsUsed: [],
    };
  }

  // Sort descending by feeding date
  const sorted = [...records].sort(
    (a, b) => new Date(b.feedingDate).getTime() - new Date(a.feedingDate).getTime()
  );
  const last = sorted[0];

  // Find next upcoming planned date if any
  const now = referenceDate
    ? new Date(referenceDate)
    : typeof window !== 'undefined'
      ? new Date()
      : new Date('2026-11-05T00:00:00.000Z');
  const futurePlanned = sorted
    .filter((r) => r.nextPlannedDate && new Date(r.nextPlannedDate).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.nextPlannedDate!).getTime() - new Date(b.nextPlannedDate!).getTime());

  const nextPlanned = futurePlanned[0]?.nextPlannedDate || null;

  // Extract unique products
  const products = Array.from(new Set(sorted.map((r) => r.productName).filter(Boolean)));

  return {
    lastFeeding: last,
    totalFeedingsRecorded: sorted.length,
    nextPlannedDate: nextPlanned,
    recentProductsUsed: products.slice(0, 5),
  };
}
