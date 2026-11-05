/**
 * GrowAI Phase 10: Production-Aware Space Advisory & Optimizer Extension
 * Extends Phase 7B small-space optimizer with production occupancy and tier utilization analytics.
 *
 * Adheres strictly to Section 17 & 18:
 * - Preserves existing Phase 7B space profile, tiers, layout, and structural safety rules.
 * - Never calls unknown structural load capacity safe.
 * - Never optimizes solely for maximum plant count without considering airflow, light, and access.
 * - Never issues unsupported advice such as "Add 12 more plants" without verified dimension data.
 */

import { UserPlant } from '@/types/garden';
import { ProductionCycle, ProductionSpaceMetrics } from '@/types/grow-intelligence';

/**
 * Computes production-aware space metrics combining garden plants, production cycles, and tier distributions.
 */
export function calculateProductionSpaceMetrics(
  plants: UserPlant[],
  cycles: ProductionCycle[] = [],
  nominalCapacityEstimate = 12
): ProductionSpaceMetrics {
  const activePlants = plants.filter((p) => p.currentStage !== 'Harvested');
  const activePlantsCount = activePlants.length;

  // Active cycles with linked plants or active counts
  const activeCycles = cycles.filter((c) => c.status === 'active');
  const activeCycleOccupancy = activeCycles.reduce(
    (sum, c) => sum + (c.quantityActive || 0),
    0
  );

  const totalCapacity = Math.max(nominalCapacityEstimate, activePlantsCount);
  const occupancyRate = totalCapacity > 0 ? Math.round((activePlantsCount / totalCapacity) * 100) : 0;
  const unusedSlots = Math.max(0, totalCapacity - activePlantsCount);

  // Tier distribution
  const tierDistribution = {
    top: 0,
    middle: 0,
    bottom: 0,
    unassigned: 0,
  };

  for (const p of activePlants) {
    if (p.tier === 'top') tierDistribution.top++;
    else if (p.tier === 'middle') tierDistribution.middle++;
    else if (p.tier === 'bottom') tierDistribution.bottom++;
    else tierDistribution.unassigned++;
  }

  // Generate evidence-backed, cautious advisories
  const advisories: string[] = [
    'Structural safety protection: Structural capacity must not be assumed safe when unconfirmed. Verify physical shelf and railing load limits.',
  ];

  if (unusedSlots > 0) {
    advisories.push(
      `Growing area has ${unusedSlots} open plant slot${unusedSlots > 1 ? 's' : ''} based on your nominal layout.`
    );
  }

  const assignedTiersTotal = tierDistribution.top + tierDistribution.middle + tierDistribution.bottom;
  if (assignedTiersTotal > 0) {
    if (tierDistribution.top > assignedTiersTotal * 0.75) {
      advisories.push('Recorded plants are heavily concentrated on the top tier. Check that lower tiers have adequate light access.');
    } else if (tierDistribution.bottom > assignedTiersTotal * 0.75) {
      advisories.push('Recorded plants are concentrated on the bottom tier. Monitor lower-tier airflow and moisture evaporation.');
    }
  }

  if (tierDistribution.unassigned > 0) {
    advisories.push(
      `${tierDistribution.unassigned} active plant${tierDistribution.unassigned > 1 ? 's do' : ' does'} not have a vertical tier assigned.`
    );
  }

  if (activeCycles.length > 0) {
    advisories.push(
      `Active production cycles account for ${activeCycleOccupancy} crop unit${activeCycleOccupancy > 1 ? 's' : ''}.`
    );
  }

  return {
    totalSpaceCapacityUnits: totalCapacity,
    activePlantsOccupied: activePlantsCount,
    occupancyRatePercent: occupancyRate,
    activeCycleOccupancy,
    unusedCapacitySlots: unusedSlots,
    tierDistribution,
    // Structural safety rating must never be assumed safe without physical manufacturer confirmation
    isStructuralSafetyVerified: false,
    advisories,
  };
}

export const calculateSpaceMetrics = calculateProductionSpaceMetrics;
