/**
 * GrowAI Phase 11: Daily Grow Check Engine
 * Generates a concise, fact-grounded daily summary for the grower.
 *
 * CRITICAL PRINCIPLE:
 * No generic motivational filler.
 * Clear headline, top actions, observations to record, missing data, positive signals.
 */

import { GardenState, GrowAction, DailyGrowCheck } from '@/types/adaptive-grow';

export interface DailyGrowCheckParams {
  gardenState: GardenState;
  actions: GrowAction[];
  referenceDate?: Date | string;
}

export function generateDailyGrowCheck(params: DailyGrowCheckParams): DailyGrowCheck {
  const { gardenState, actions, referenceDate } = params;

  const now = referenceDate
    ? new Date(referenceDate)
    : typeof window !== 'undefined'
      ? new Date()
      : new Date('2026-11-05T00:00:00.000Z');

  const dateStr = now.toISOString().split('T')[0];

  // Filter out pure informational items for headline action count
  const significantActions = actions.filter((a) => a.priority !== 'informational');
  const topActions = significantActions.slice(0, 3);
  const noActionNeeded = topActions.length === 0;

  // Headline generation
  let headline = '';
  if (gardenState.plants.total === 0) {
    headline = 'Your garden journal is empty. Add your first plant to begin tracking.';
  } else if (noActionNeeded) {
    headline = 'Your garden is operating smoothly. Nothing requires your immediate attention today.';
  } else if (topActions.length === 1) {
    headline = `Today your garden has 1 item worth reviewing: ${topActions[0].title}.`;
  } else {
    headline = `Today your garden has ${significantActions.length} item${
      significantActions.length === 1 ? '' : 's'
    } worth reviewing.`;
  }

  // Observations to record
  const observationsToRecord: string[] = [];
  if (gardenState.growth.plantsWithoutRecentObservation > 0) {
    observationsToRecord.push(
      `${gardenState.growth.plantsWithoutRecentObservation} plant(s) have no growth notes recorded in the last 14 days.`
    );
  }
  if (gardenState.environment.concerns > 0) {
    observationsToRecord.push(
      `${gardenState.environment.concerns} environmental observation(s) noted microclimate stress.`
    );
  }
  if (gardenState.health.unresolvedFollowUps > 0) {
    observationsToRecord.push(
      `${gardenState.health.unresolvedFollowUps} health assessment(s) are pending follow-up inspection.`
    );
  }

  // Missing data list
  const missingData: string[] = [];
  if (gardenState.dataQuality.missingCriticalData.length > 0) {
    missingData.push(...gardenState.dataQuality.missingCriticalData.slice(0, 3));
  }

  // Positive signals
  const positiveSignals: string[] = [];
  if (gardenState.plants.healthy > 0) {
    positiveSignals.push(
      `${gardenState.plants.healthy} of ${gardenState.plants.total} plant(s) currently assessed healthy.`
    );
  }
  if (gardenState.care.overdue === 0 && gardenState.plants.total > 0) {
    positiveSignals.push('All scheduled care tasks are up to date.');
  }
  if (gardenState.production.harvestRecords > 0) {
    positiveSignals.push(
      `${gardenState.production.harvestRecords} harvest event(s) successfully logged to date.`
    );
  }
  if (gardenState.growth.recentObservations > 0) {
    positiveSignals.push(
      `${gardenState.growth.recentObservations} growth observation(s) logged in the last 14 days.`
    );
  }

  return {
    date: dateStr,
    headline,
    topActions,
    observationsToRecord,
    missingData,
    positiveSignals,
    noActionNeeded,
  };
}

