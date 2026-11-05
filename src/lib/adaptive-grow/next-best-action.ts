/**
 * GrowAI Phase 11: "What Should I Do Now?" Engine
 * Deterministically selects ONE highest-value next action for the grower.
 *
 * CRITICAL SAFETY & BEHAVIORAL INVARIANTS:
 * - Deterministic, tiered priority ordering.
 * - Does NOT create false urgency.
 * - Returns null when no meaningful action is required.
 */

import { GardenState, GrowAction, ActionPriority, ActionCategory } from '@/types/adaptive-grow';

export function getNextBestAction(
  gardenState: GardenState,
  actions: GrowAction[]
): GrowAction | null {
  if (!actions || actions.length === 0) {
    return null;
  }

  // Filter out pure informational status items from being declared an urgent "next action"
  const actionableItems = actions.filter((a) => a.priority !== 'informational');
  if (actionableItems.length === 0) {
    return null;
  }

  // Priority weight mapping
  const priorityWeight: Record<ActionPriority, number> = {
    critical: 1000,
    high: 500,
    medium: 200,
    low: 50,
    informational: 0,
  };

  // Category tie-breaking hierarchy:
  // 1. health (active issues, follow-ups)
  // 2. care (overdue / scheduled tasks)
  // 3. environment (waterlogged, extreme temperatures)
  // 4. production (harvest milestones)
  // 5. growth (observation gaps)
  // 6. propagation (active cutting checks)
  // 7. space (capacity advisories)
  // 8. feeding (incomplete logs)
  // 9. data_quality (missing dates)
  const categoryOrderWeight: Record<ActionCategory, number> = {
    health: 90,
    care: 80,
    environment: 70,
    production: 60,
    growth: 50,
    propagation: 40,
    space: 30,
    feeding: 20,
    data_quality: 10,
  };

  const confidenceWeight: Record<string, number> = {
    high: 5,
    moderate: 2,
    low: 0,
    unknown: 0,
  };

  const scoredActions = actionableItems.map((action) => {
    let score =
      (priorityWeight[action.priority] || 0) +
      (categoryOrderWeight[action.category] || 0) +
      (confidenceWeight[action.confidence] || 0);

    return {
      action,
      score,
    };
  });

  // Sort descending by score
  scoredActions.sort((a, b) => b.score - a.score);

  return scoredActions[0]?.action || null;
}

