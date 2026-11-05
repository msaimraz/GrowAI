/**
 * GrowAI Phase 10: Propagation Engine & Lineage Tracking
 * Tracks propagation events, rooting observations, and parent-offspring lineages.
 *
 * Adheres strictly to Section 10 & 11:
 * - Lineage integrity: links parent -> offspring accurately without fabricating progeny.
 * - Does not claim rooting has occurred without an explicit recorded observation.
 * - Maps directly into the existing Plant Timeline architecture.
 */

import { UserPlant } from '@/types/garden';
import {
  PropagationEvent,
  PropagationMethod,
  PropagationStatus,
  PlantLineageInfo,
} from '@/types/grow-intelligence';
import { PlantTimelineEvent } from '@/types/timeline';

/**
 * Validates a propagation event input.
 */
export function validatePropagationEvent(input: Partial<PropagationEvent>): {
  valid: boolean;
  error?: string;
} {
  if (!input.parentPlantId) {
    return { valid: false, error: 'Parent plant ID is required.' };
  }

  if (!input.propagationMethod) {
    return { valid: false, error: 'Propagation method is required.' };
  }

  if (!input.startedDate) {
    return { valid: false, error: 'Started date is required.' };
  }

  const d = new Date(input.startedDate);
  if (isNaN(d.getTime())) {
    return { valid: false, error: 'Started date must be a valid date.' };
  }

  return { valid: true };
}

/**
 * Builds lineage info for a specific plant, discovering parent and direct offspring.
 */
export function buildPlantLineageInfo(
  plantOrId: string | UserPlant,
  plants: UserPlant[],
  propagationEvents: PropagationEvent[] = []
): PlantLineageInfo {
  const plantId = typeof plantOrId === 'string' ? plantOrId : plantOrId.id;
  const currentPlant = plants.find((p) => p.id === plantId) || (typeof plantOrId === 'object' ? plantOrId : undefined);
  const nickname = currentPlant?.nickname || 'Plant';

  // Discover Parent Plant
  let parentPlantId: string | null = currentPlant?.parentPlantId || null;
  let parentNickname: string | null = null;
  let propagationMethod: PropagationMethod | null = (currentPlant?.propagationMethod as PropagationMethod) || null;
  let propagationDate: string | null = currentPlant?.propagationDate || null;

  // Also check propagation events if parent not set on plant directly
  if (!parentPlantId) {
    const parentEvent = propagationEvents.find((e) => e.offspringPlantId === plantId);
    if (parentEvent) {
      parentPlantId = parentEvent.parentPlantId;
      propagationMethod = parentEvent.propagationMethod;
      propagationDate = parentEvent.startedDate;
    }
  }

  if (parentPlantId) {
    const parent = plants.find((p) => p.id === parentPlantId);
    parentNickname = parent?.nickname || 'Parent Plant';
  }

  // Discover Offspring (plants that reference this plant as parent, or via propagation events)
  const directOffspringPlants = plants.filter((p) => p.parentPlantId === plantId);
  const offspringFromEvents = propagationEvents
    .filter((e) => e.parentPlantId === plantId && e.offspringPlantId)
    .map((e) => e.offspringPlantId!);

  const allOffspringIds = Array.from(
    new Set([...directOffspringPlants.map((p) => p.id), ...offspringFromEvents])
  );

  const offspring = allOffspringIds.map((id) => {
    const off = plants.find((p) => p.id === id);
    return {
      id,
      nickname: off?.nickname || 'Offspring',
      status: off?.currentStage || 'Active',
    };
  });

  return {
    plantId,
    nickname,
    parentPlantId,
    parentNickname,
    propagationMethod,
    propagationDate,
    offspringCount: offspring.length,
    offspring,
  };
}

/**
 * Converts propagation events into chronological PlantTimelineEvent objects for Phase 9 integration.
 */
export function generatePropagationTimelineEvents(
  eventsOrEvent: PropagationEvent[] | PropagationEvent,
  targetPlantId: string
): PlantTimelineEvent[] {
  const events = Array.isArray(eventsOrEvent) ? eventsOrEvent : [eventsOrEvent];
  const timelineEvents: PlantTimelineEvent[] = [];

  for (const event of events) {
    const isParent = event.parentPlantId === targetPlantId;
    const isOffspring = event.offspringPlantId === targetPlantId;

    if (!isParent && !isOffspring) continue;

    // 1. Started event
    if (isParent) {
      timelineEvents.push({
        id: `prop-start-${event.id}`,
        plantId: targetPlantId,
        eventDate: event.startedDate,
        category: 'propagation',
        eventType: 'propagation',
        title: `Propagation Started (${event.propagationMethod})`,
        description: `Started new ${event.propagationMethod} propagation in ${event.medium || 'growing medium'}${event.environment ? ` (${event.environment})` : ''}.${event.notes ? ` Note: ${event.notes}` : ''}`,
        sourceProvenance: 'propagation_events',
      });
    }

    // 2. Outcome event (success or failure)
    if (event.outcomeDate && (event.status === 'success' || event.status === 'failure')) {
      const isSuccess = event.status === 'success';
      const outcomeTitle = isSuccess
        ? `Propagation Successful (${event.propagationMethod})`
        : `Propagation Failed (${event.propagationMethod})`;

      const outcomeDesc = isSuccess
        ? `Successfully rooted/established.${event.offspringPlantNickname ? ` Offspring created: ${event.offspringPlantNickname}.` : ''}`
        : `Propagation did not establish.${event.notes ? ` Note: ${event.notes}` : ''}`;

      timelineEvents.push({
        id: `prop-outcome-${event.id}`,
        plantId: targetPlantId,
        eventDate: event.outcomeDate,
        category: 'propagation',
        eventType: 'propagation',
        title: outcomeTitle,
        description: outcomeDesc,
        sourceProvenance: 'propagation_events',
        badge: {
          text: isSuccess ? 'Rooted / Success' : 'Failed',
          variant: isSuccess ? 'success' : 'critical',
        },
      });
    }
  }

  return timelineEvents;
}

export const buildPlantLineage = buildPlantLineageInfo;
