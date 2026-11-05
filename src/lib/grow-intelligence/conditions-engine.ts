/**
 * GrowAI Phase 10: Growing Conditions & Environmental Intelligence Engine
 * Compares grower-recorded environmental observations with botanical plant requirements.
 *
 * Adheres strictly to Section 6 & 7:
 * - Unknown values must remain unknown (never invent numbers as facts).
 * - Cautious, observational language ("within expected range", "possibly low", "possibly high", "unknown").
 * - No guaranteed survival or mortality claims.
 */

import { Plant } from '@/types/plant';
import { PLANTS_DATA } from '@/data/plants';
import {
  GrowingConditionObservation,
  ConditionMetricAssessment,
  GrowingConditionsSummary,
  RequirementComparisonStatus,
} from '@/types/grow-intelligence';

function resolvePlant(plantOrSlug?: Plant | string | null): Plant | null {
  if (!plantOrSlug) return null;
  if (typeof plantOrSlug === 'object') return plantOrSlug;
  return PLANTS_DATA.find((p) => p.slug === plantOrSlug) || null;
}

/**
 * Assesses observed temperature against known plant requirements.
 */
export function assessTemperature(
  tempCelsius: number | null | undefined,
  plantOrSlug?: Plant | string | null
): ConditionMetricAssessment {
  if (tempCelsius === null || tempCelsius === undefined || isNaN(tempCelsius)) {
    return {
      metricName: 'temperature',
      observedValue: null,
      recordedRequirementRange: null,
      status: 'unknown',
      provenance: 'unknown',
      explanation: 'Temperature has not been recorded for this observation.',
    };
  }

  const plant = resolvePlant(plantOrSlug);
  const min = plant?.temperatureRange?.min ?? 15;
  const max = plant?.temperatureRange?.max ?? 30;
  const rangeStr = plant?.temperatureRange
    ? `${plant.temperatureRange.min}°C – ${plant.temperatureRange.max}°C`
    : '15°C – 30°C (standard)';

  let status: RequirementComparisonStatus = 'within_expected_range';
  let explanation = `Observed temperature (${tempCelsius}°C) is within the preferred range (${rangeStr}).`;

  if (tempCelsius < min) {
    status = 'possibly_low';
    explanation = `Observed temperature (${tempCelsius}°C) is below the preferred minimum (${min}°C).`;
  } else if (tempCelsius > max) {
    status = 'possibly_high';
    explanation = `Observed temperature (${tempCelsius}°C) is above the preferred maximum (${max}°C).`;
  }

  return {
    metricName: 'temperature',
    observedValue: tempCelsius,
    recordedRequirementRange: rangeStr,
    status,
    provenance: 'observed',
    explanation,
  };
}

/**
 * Assesses observed humidity against catalog humidity range.
 */
export function assessHumidity(
  humidityPercent: number | null | undefined,
  plantOrSlug?: Plant | string | null
): ConditionMetricAssessment {
  if (humidityPercent === null || humidityPercent === undefined || isNaN(humidityPercent)) {
    return {
      metricName: 'humidity',
      observedValue: null,
      recordedRequirementRange: null,
      status: 'unknown',
      provenance: 'unknown',
      explanation: 'Relative humidity has not been recorded for this observation.',
    };
  }

  const plant = resolvePlant(plantOrSlug);
  const min = plant?.humidity?.min ?? 40;
  const max = plant?.humidity?.max ?? 75;
  const rangeStr = plant?.humidity
    ? `${plant.humidity.min}% – ${plant.humidity.max}% RH`
    : '40% – 75% RH (standard)';

  let status: RequirementComparisonStatus = 'within_expected_range';
  let explanation = `Observed relative humidity (${humidityPercent}%) is within the preferred range (${rangeStr}).`;

  if (humidityPercent < min) {
    status = 'possibly_low';
    explanation = `Observed humidity (${humidityPercent}%) is below the preferred minimum (${min}%).`;
  } else if (humidityPercent > max) {
    status = 'possibly_high';
    explanation = `Observed humidity (${humidityPercent}%) is above the preferred maximum (${max}%).`;
  }

  return {
    metricName: 'humidity',
    observedValue: humidityPercent,
    recordedRequirementRange: rangeStr,
    status,
    provenance: 'observed',
    explanation,
  };
}

/**
 * Assesses light conditions against catalog sunlight requirements.
 */
export function assessLight(
  obs: Partial<GrowingConditionObservation>,
  plant?: Plant | null
): ConditionMetricAssessment {
  const lightLevel = obs.lightLevel;
  const duration = obs.lightDurationHours;

  if (!lightLevel && (duration === null || duration === undefined)) {
    return {
      metricName: 'light',
      observedValue: null,
      recordedRequirementRange: plant?.sunlight || null,
      status: 'unknown',
      provenance: 'unknown',
      explanation: 'Light conditions and exposure duration have not been recorded.',
    };
  }

  const recordedReq = plant ? `${plant.sunlight} (${plant.sunlightHours || 'hours not recorded'})` : null;

  if (!plant?.sunlight) {
    return {
      metricName: 'light',
      observedValue: lightLevel || `${duration} hours`,
      recordedRequirementRange: null,
      status: 'unknown',
      provenance: 'observed',
      explanation: `Observed light: ${lightLevel || 'level unrecorded'}, ${duration !== undefined && duration !== null ? `${duration} hrs/day` : 'duration unrecorded'}. Species requirements not recorded in catalog.`,
    };
  }

  let status: RequirementComparisonStatus = 'within_expected_range';
  let explanation = `Light observation recorded: ${lightLevel || 'level unrecorded'}, ${duration !== undefined && duration !== null ? `${duration} hrs/day` : ''}.`;

  // Cautious comparison
  if (plant.sunlight === 'full-sun' && lightLevel === 'low') {
    status = 'possibly_low';
    explanation = `Observed light level (low) is lower than the catalog preferred exposure (${plant.sunlight}).`;
  } else if (plant.sunlight === 'low-light' && lightLevel === 'direct_sun') {
    status = 'possibly_high';
    explanation = `Observed light level (direct sun) is stronger than the catalog preferred exposure (${plant.sunlight}). Watch for leaf scorching.`;
  }

  return {
    metricName: 'light',
    observedValue: lightLevel || (duration !== null && duration !== undefined ? `${duration} hrs` : null),
    recordedRequirementRange: recordedReq,
    status,
    provenance: 'observed',
    explanation,
  };
}

/**
 * Assesses soil moisture against catalog moisture preferences.
 */
export function assessSoilMoisture(
  soilMoisture: string | null | undefined,
  plant?: Plant | null
): ConditionMetricAssessment {
  if (!soilMoisture || soilMoisture === 'unknown') {
    return {
      metricName: 'soil_moisture',
      observedValue: null,
      recordedRequirementRange: plant?.watering?.moistureLevel || null,
      status: 'unknown',
      provenance: 'unknown',
      explanation: 'Soil or medium moisture has not been recorded.',
    };
  }

  const pref = plant?.watering?.moistureLevel;
  const prefStr = pref ? `Preferred: ${pref} moisture` : 'Requirement unrecorded';

  let status: RequirementComparisonStatus = 'within_expected_range';
  let explanation = `Soil moisture observed as: ${soilMoisture.replace(/_/g, ' ')}.`;

  if (pref === 'low' && soilMoisture === 'waterlogged') {
    status = 'possibly_high';
    explanation = `Substrate observed as waterlogged, whereas this species prefers drier substrate conditions. Check container drainage.`;
  } else if (pref === 'high' && soilMoisture === 'dry') {
    status = 'possibly_low';
    explanation = `Substrate observed as dry, whereas this species prefers consistent moisture. Check root zone hydration.`;
  }

  return {
    metricName: 'soil_moisture',
    observedValue: soilMoisture.replace(/_/g, ' '),
    recordedRequirementRange: prefStr,
    status,
    provenance: 'observed',
    explanation,
  };
}

/**
 * Summarizes the latest growing condition observation and lists unrecorded parameters.
 */
export function summarizeGrowingConditions(
  observations: GrowingConditionObservation[],
  plant?: Plant | null
): GrowingConditionsSummary {
  if (!observations || observations.length === 0) {
    return {
      latestObservation: null,
      totalObservations: 0,
      assessments: [
        assessTemperature(null, plant),
        assessHumidity(null, plant),
        assessLight({}, plant),
        assessSoilMoisture(null, plant),
      ],
      unrecordedParameters: [
        'temperature',
        'relativeHumidity',
        'lightLevel',
        'airflow',
        'soilMoisture',
        'Temperature',
        'Relative Humidity',
        'Light Level & Duration',
        'Airflow Quality',
        'Soil / Medium Moisture',
      ],
    };
  }

  // Sort descending by observation time
  const sorted = [...observations].sort(
    (a, b) => new Date(b.observationTime).getTime() - new Date(a.observationTime).getTime()
  );
  const latest = sorted[0];

  const unrecorded: string[] = [];
  if (latest.temperatureCelsius === null || latest.temperatureCelsius === undefined) {
    unrecorded.push('temperature', 'Temperature');
  }
  if (latest.relativeHumidityPercent === null || latest.relativeHumidityPercent === undefined) {
    unrecorded.push('relativeHumidity', 'Relative Humidity');
  }
  if (!latest.lightLevel && latest.lightDurationHours === null) {
    unrecorded.push('lightLevel', 'Light Level / Duration');
  }
  if (!latest.airflowQuality || latest.airflowQuality === 'unknown') {
    unrecorded.push('airflow', 'Airflow');
  }
  if (!latest.soilMoisture || latest.soilMoisture === 'unknown') {
    unrecorded.push('soilMoisture', 'Soil / Medium Moisture');
  }
  if (latest.ph === null || latest.ph === undefined) {
    unrecorded.push('ph', 'Substrate pH');
  }

  const assessments: ConditionMetricAssessment[] = [
    assessTemperature(latest.temperatureCelsius, plant),
    assessHumidity(latest.relativeHumidityPercent, plant),
    assessLight(latest, plant),
    assessSoilMoisture(latest.soilMoisture, plant),
  ];

  return {
    latestObservation: latest,
    totalObservations: observations.length,
    assessments,
    unrecordedParameters: unrecorded,
  };
}

/**
 * Assesses conditions for a single observation or summary.
 * Provided for ergonomic consumption in UI tabs and tests.
 */
export function assessConditions(
  observation?: GrowingConditionObservation | null,
  plantSlugOrPlant?: string | Plant | null
): GrowingConditionsSummary {
  const obsList = observation ? [observation] : [];
  return summarizeGrowingConditions(obsList, typeof plantSlugOrPlant === 'object' ? plantSlugOrPlant : null);
}

export function compareTemperatureRange(
  temp: number | null | undefined,
  min?: number | null,
  max?: number | null
): RequirementComparisonStatus {
  if (temp === null || temp === undefined) return 'unknown';
  if (min !== undefined && min !== null && temp < min) return 'possibly_low';
  if (max !== undefined && max !== null && temp > max) return 'possibly_high';
  return 'within_expected_range';
}

export function compareHumidityRange(
  humidity: number | null | undefined,
  min?: number | null,
  max?: number | null
): RequirementComparisonStatus {
  if (humidity === null || humidity === undefined) return 'unknown';
  if (min !== undefined && min !== null && humidity < min) return 'possibly_low';
  if (max !== undefined && max !== null && humidity > max) return 'possibly_high';
  return 'within_expected_range';
}
