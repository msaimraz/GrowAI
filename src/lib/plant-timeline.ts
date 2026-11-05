/**
 * GrowAI Phase 9: Plant Timeline Engine
 * Pure, deterministic timeline aggregation engine for longitudinal plant journals.
 * Aggregates lifecycle events, observations, photos, health diagnoses, treatments,
 * follow-ups, care tasks, propagation, and harvest events.
 *
 * Independent of React and browser APIs for maximum testability and SSR safety.
 */

import {
  PlantTimelineEvent,
  PlantTimelineEventType,
  PlantTimelineCategory,
  PlantTimelineFilter,
  PlantGrowthSummary,
  BuildPlantTimelineParams,
} from '@/types/timeline';
import { GrowthStage, PropagationMethod, TaskType } from '@/types/garden';
import { TreatmentActionType, TreatmentStatus, FollowUpOutcome } from '@/types/diagnosis';
import { getPlantHealthSummary } from '@/lib/plant-health-status';

/**
 * Deterministic priority rank for same-day/same-timestamp events
 * Higher rank sorts first when dates are identical.
 */
const EVENT_TYPE_SORT_PRIORITY: Record<PlantTimelineEventType, number> = {
  harvest: 100,
  health_follow_up: 90,
  treatment: 80,
  health_assessment: 70,
  feeding: 65,
  condition_observation: 62,
  photo: 60,
  growth_observation: 50,
  care: 40,
  stage_change: 35,
  transplant: 30,
  germination: 25,
  planting: 20,
  propagation: 15,
  plant_added: 10,
};

/**
 * Human-readable label for propagation methods
 */
export function formatPropagationMethod(method?: PropagationMethod | null): string {
  if (!method) return 'Propagated';
  switch (method) {
    case 'cutting':
      return 'Stem / Leaf Cutting';
    case 'division':
      return 'Root Division';
    case 'runner':
      return 'Runner / Stolon';
    case 'layering':
      return 'Layering';
    case 'seed':
      return 'Seed Propagation';
    case 'nursery_transplant':
      return 'Nursery Transplant';
    default:
      return method;
  }
}

/**
 * Human-readable label for treatment action types
 */
export function formatTreatmentActionType(actionType?: TreatmentActionType | null): string {
  if (!actionType) return 'Treatment';
  switch (actionType) {
    case 'inspect_plant':
      return 'Physical Inspection';
    case 'isolate_plant':
      return 'Quarantine / Isolation';
    case 'adjust_watering':
      return 'Watering Adjustment';
    case 'improve_ventilation':
      return 'Ventilation Improvement';
    case 'remove_affected_leaves':
      return 'Prune Damaged Foliage';
    case 'monitor_pests':
      return 'Pest Monitoring';
    case 'apply_kb_treatment':
      return 'Organic Treatment Applied';
    case 'custom_action':
      return 'Custom Horticultural Care';
    default:
      return actionType;
  }
}

/**
 * Human-readable label for treatment status
 */
export function formatTreatmentStatus(status?: TreatmentStatus | null): string {
  if (!status) return 'Planned';
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'started':
      return 'In Progress';
    case 'planned':
      return 'Planned';
    case 'skipped':
      return 'Skipped';
    default:
      return status;
  }
}

/**
 * Human-readable label for follow-up outcome
 */
export function formatFollowUpOutcome(outcome?: FollowUpOutcome | null): string {
  if (!outcome) return 'Uncertain';
  switch (outcome) {
    case 'improving':
      return 'Condition Improving';
    case 'resolved':
      return 'Issue Resolved';
    case 'unchanged':
      return 'Condition Unchanged';
    case 'worsening':
      return 'Condition Worsening';
    case 'uncertain':
      return 'Outcome Uncertain';
    default:
      return outcome;
  }
}

/**
 * Human-readable label for care task types
 */
export function formatCareTaskType(taskType?: TaskType | null): string {
  if (!taskType) return 'Care Task';
  switch (taskType) {
    case 'water':
      return 'Watering';
    case 'fertilize':
      return 'Fertilization';
    case 'prune':
      return 'Pruning';
    case 'harvest':
      return 'Harvesting';
    case 'inspect':
      return 'Inspection';
    case 'repot':
      return 'Repotting';
    default:
      return taskType;
  }
}

/**
 * Parses and validates an ISO or YYYY-MM-DD date string.
 * Returns null if invalid or unparseable.
 */
export function parseTimelineDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Formats a date string into friendly botanical display, e.g. "12 Oct 2026".
 * Returns "Date not recorded" if invalid or missing.
 */
export function formatTimelineDate(dateStr?: string | null): string {
  const d = parseTimelineDate(dateStr);
  if (!d) return 'Date not recorded';
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates plant age strictly from the recorded planting date.
 * Does NOT fallback to creation date to preserve historical veracity.
 */
export function calculatePlantAgeFromPlanting(
  plantedDate?: string | null,
  nowInput?: Date
): { ageDisplay: string; daysSincePlanting: number | null; plantedDateDisplay: string } {
  const pDate = parseTimelineDate(plantedDate);
  if (!pDate) {
    return {
      ageDisplay: 'Planting date not recorded',
      daysSincePlanting: null,
      plantedDateDisplay: 'Planting date not recorded',
    };
  }

  const now = nowInput || new Date();
  // Normalize both dates to UTC midnight for precise day count
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcPlanted = Date.UTC(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
  const diffDays = Math.floor((utcNow - utcPlanted) / (1000 * 60 * 60 * 24));

  const plantedDateDisplay = formatTimelineDate(plantedDate);

  if (diffDays < 0) {
    return {
      ageDisplay: 'Planted today',
      daysSincePlanting: 0,
      plantedDateDisplay,
    };
  }

  if (diffDays === 0) {
    return {
      ageDisplay: 'Day 1 (Planted today)',
      daysSincePlanting: 0,
      plantedDateDisplay,
    };
  }

  return {
    ageDisplay: `Day ${diffDays + 1} (${diffDays} ${diffDays === 1 ? 'day' : 'days'} since planting)`,
    daysSincePlanting: diffDays,
    plantedDateDisplay,
  };
}

/**
 * Main Pure Function: Builds a complete, deduplicated, chronologically sorted plant timeline
 */
export function buildPlantTimeline(params: BuildPlantTimelineParams): {
  events: PlantTimelineEvent[];
  summary: PlantGrowthSummary;
} {
  const {
    plant,
    parentPlant,
    photos = [],
    tasks = [],
    diagnoses = [],
    now = new Date(),
    conditions = [],
    feedings = [],
    propagations = [],
    harvests = [],
  } = params;

  const rawEvents: PlantTimelineEvent[] = [];
  const seenEventIds = new Set<string>();

  const pushEvent = (event: PlantTimelineEvent) => {
    if (!event.id || seenEventIds.has(event.id)) return;
    if (!parseTimelineDate(event.eventDate)) return; // Discard events with missing or invalid dates
    seenEventIds.add(event.id);
    rawEvents.push(event);
  };

  // --------------------------------------------------------------------------
  // 1. Lifecycle: Plant Added
  // --------------------------------------------------------------------------
  if (plant.createdAt) {
    pushEvent({
      id: `lifecycle-added-${plant.id}`,
      plantId: plant.id,
      eventType: 'plant_added',
      category: 'lifecycle',
      eventDate: plant.createdAt,
      title: 'Plant Added to Garden',
      description: `${plant.nickname} was added to your digital garden journal.`,
      sourceReferenceId: plant.id,
      sourceProvenance: 'user_plants',
      badge: { text: 'Journal Entry', variant: 'neutral' },
    });
  }

  // --------------------------------------------------------------------------
  // 2. Lifecycle: Planting
  // --------------------------------------------------------------------------
  if (plant.plantedDate) {
    pushEvent({
      id: `lifecycle-planting-${plant.id}`,
      plantId: plant.id,
      eventType: 'planting',
      category: 'lifecycle',
      eventDate: plant.plantedDate,
      title: 'Planted',
      description: `Planted in container / bed as initial stage: ${plant.currentStage || 'Seed'}.`,
      sourceReferenceId: plant.id,
      sourceProvenance: 'user_plants',
      badge: { text: 'Planting', variant: 'accent' },
      metadata: { growthStage: plant.currentStage },
    });
  }

  // --------------------------------------------------------------------------
  // 3. Propagation & Lineage
  // --------------------------------------------------------------------------
  if (plant.propagationMethod || plant.propagationDate || plant.parentPlantId) {
    const propDate = plant.propagationDate || plant.plantedDate || plant.createdAt;
    if (propDate) {
      const parentName = parentPlant ? `"${parentPlant.nickname}"` : 'parent plant';
      pushEvent({
        id: `lifecycle-propagation-${plant.id}`,
        plantId: plant.id,
        eventType: 'propagation',
        category: 'propagation',
        eventDate: propDate,
        title: 'Propagated from Parent',
        description: `Propagated via ${formatPropagationMethod(plant.propagationMethod)}${plant.parentPlantId ? ` from ${parentName}` : ''}.`,
        sourceReferenceId: plant.parentPlantId || plant.id,
        sourceProvenance: 'user_plants',
        badge: { text: formatPropagationMethod(plant.propagationMethod), variant: 'info' },
        metadata: {
          propagationMethod: plant.propagationMethod || undefined,
          parentPlantId: plant.parentPlantId || undefined,
          parentPlantNickname: parentPlant?.nickname,
        },
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Harvest Event
  // --------------------------------------------------------------------------
  if (plant.actualHarvestDate || plant.currentStage === 'Harvested') {
    const harvestDate = plant.actualHarvestDate || (plant.currentStage === 'Harvested' ? plant.plantedDate : null);
    if (harvestDate) {
      pushEvent({
        id: `lifecycle-harvest-${plant.id}`,
        plantId: plant.id,
        eventType: 'harvest',
        category: 'harvest',
        eventDate: harvestDate,
        title: 'Harvest Recorded',
        description: `Harvest completed for ${plant.nickname}.`,
        sourceReferenceId: plant.id,
        sourceProvenance: 'user_plants',
        badge: { text: 'Harvested', variant: 'success' },
        metadata: {
          growthStage: 'Harvested',
          actualHarvestDate: plant.actualHarvestDate || undefined,
        },
      });
    }
  }

  // --------------------------------------------------------------------------
  // 5. Growth Notes & Stage Progression
  // --------------------------------------------------------------------------
  const sortedNotes = [...(plant.notes || [])].sort((a, b) => {
    const da = parseTimelineDate(a.date)?.getTime() || 0;
    const db = parseTimelineDate(b.date)?.getTime() || 0;
    return da - db;
  });

  const stagesSeen: GrowthStage[] = [];
  if (plant.currentStage) stagesSeen.push(plant.currentStage);

  let previousStage: GrowthStage | undefined = undefined;

  for (const note of sortedNotes) {
    if (!note.date) continue;

    // Detect stage progression
    if (note.stage && note.stage !== previousStage) {
      if (previousStage !== undefined) {
        pushEvent({
          id: `stage-change-${note.id}`,
          plantId: plant.id,
          eventType: 'stage_change',
          category: 'growth',
          eventDate: note.date,
          title: `Stage Change: ${previousStage} → ${note.stage}`,
          description: `Plant transitioned from ${previousStage} to ${note.stage}.`,
          sourceReferenceId: note.id,
          sourceProvenance: 'growth_notes',
          badge: { text: note.stage, variant: 'accent' },
          metadata: {
            previousStage,
            growthStage: note.stage,
            heightCm: note.heightCm,
          },
        });
      }
      if (!stagesSeen.includes(note.stage)) {
        stagesSeen.push(note.stage);
      }
      previousStage = note.stage;
    }

    // Specific germination event
    if (note.stage === 'Germination') {
      pushEvent({
        id: `germination-${note.id}`,
        plantId: plant.id,
        eventType: 'germination',
        category: 'growth',
        eventDate: note.date,
        title: 'Germination Observed',
        description: note.text || 'Seed has sprouted embryonic leaves.',
        sourceReferenceId: note.id,
        sourceProvenance: 'growth_notes',
        badge: { text: 'Germinated', variant: 'success' },
        metadata: { growthStage: 'Germination', heightCm: note.heightCm },
      });
    }

    // Specific transplant event if noted in text
    const lowerText = (note.text || '').toLowerCase();
    if (lowerText.includes('transplant') || lowerText.includes('repotted') || lowerText.includes('repot')) {
      pushEvent({
        id: `transplant-${note.id}`,
        plantId: plant.id,
        eventType: 'transplant',
        category: 'growth',
        eventDate: note.date,
        title: 'Transplant / Repotting',
        description: note.text,
        sourceReferenceId: note.id,
        sourceProvenance: 'growth_notes',
        badge: { text: 'Transplanted', variant: 'info' },
        metadata: { growthStage: note.stage, heightCm: note.heightCm },
      });
    }

    // Standard growth observation
    pushEvent({
      id: `note-${note.id}`,
      plantId: plant.id,
      eventType: 'growth_observation',
      category: 'growth',
      eventDate: note.date,
      title: note.stage ? `Growth Note (${note.stage})` : 'Growth Observation',
      description: note.text || 'Growth progress logged.',
      sourceReferenceId: note.id,
      sourceProvenance: 'growth_notes',
      badge: note.heightCm
        ? { text: `${note.heightCm} cm`, variant: 'info' }
        : note.stage
        ? { text: note.stage, variant: 'neutral' }
        : undefined,
      metadata: {
        growthStage: note.stage,
        heightCm: note.heightCm,
      },
    });
  }

  // --------------------------------------------------------------------------
  // 6. Photo Journal Events
  // --------------------------------------------------------------------------
  for (const photo of photos) {
    const photoDate = photo.takenAt || photo.createdAt;
    if (!photoDate) continue;

    if (photo.growthStage && !stagesSeen.includes(photo.growthStage)) {
      stagesSeen.push(photo.growthStage);
    }

    pushEvent({
      id: `photo-${photo.id}`,
      plantId: plant.id,
      eventType: 'photo',
      category: 'photo',
      eventDate: photoDate,
      title: 'Photo Captured',
      description: photo.caption || 'Botanical progress photograph recorded.',
      sourceReferenceId: photo.id,
      sourceProvenance: 'plant_photos',
      badge: photo.growthStage ? { text: photo.growthStage, variant: 'neutral' } : undefined,
      media: {
        photoId: photo.id,
        storagePath: photo.storagePath,
        signedUrl: photo.signedUrl,
        caption: photo.caption,
        heightCm: photo.heightCm,
        growthStage: photo.growthStage,
      },
      metadata: {
        growthStage: photo.growthStage,
        heightCm: photo.heightCm,
      },
    });
  }

  // --------------------------------------------------------------------------
  // 7. Care Tasks (Completed)
  // --------------------------------------------------------------------------
  for (const task of tasks) {
    if (!task.completed) continue;
    const taskDate = task.completedAt || task.dueDate;
    if (!taskDate) continue;

    // Check if task was repotting
    if (task.type === 'repot') {
      pushEvent({
        id: `task-transplant-${task.id}`,
        plantId: plant.id,
        eventType: 'transplant',
        category: 'care',
        eventDate: taskDate,
        title: `Care Completed: ${task.title}`,
        description: 'Plant repotted into new container.',
        sourceReferenceId: task.id,
        sourceProvenance: 'care_tasks',
        badge: { text: 'Repotted', variant: 'info' },
        metadata: { taskType: task.type },
      });
    }

    pushEvent({
      id: `care-${task.id}`,
      plantId: plant.id,
      eventType: 'care',
      category: 'care',
      eventDate: taskDate,
      title: `Care: ${task.title}`,
      description: `${formatCareTaskType(task.type)} completed for ${plant.nickname}.`,
      sourceReferenceId: task.id,
      sourceProvenance: 'care_tasks',
      badge: { text: formatCareTaskType(task.type), variant: 'success' },
      metadata: { taskType: task.type },
    });
  }

  // --------------------------------------------------------------------------
  // 8. Health: Diagnoses, Treatments, Follow-ups
  // --------------------------------------------------------------------------
  for (const diagnosis of diagnoses) {
    const diagDate = diagnosis.diagnosedAt || diagnosis.createdAt;
    if (diagDate) {
      const topCand = diagnosis.candidates && diagnosis.candidates.length > 0
        ? diagnosis.candidates[0]
        : null;

      const healthBadgeVariant =
        diagnosis.overallHealth === 'healthy'
          ? 'success'
          : diagnosis.overallHealth === 'severe_issue'
          ? 'critical'
          : 'warning';

      const healthBadgeText =
        diagnosis.overallHealth === 'healthy'
          ? 'Vigorous / Healthy'
          : `Hypothesis: ${diagnosis.overallHealth.replace('_', ' ')}`;

      pushEvent({
        id: `diagnosis-${diagnosis.id}`,
        plantId: plant.id,
        eventType: 'health_assessment',
        category: 'health',
        eventDate: diagDate,
        title: 'AI Doctor Assessment',
        description:
          diagnosis.summary ||
          (topCand
            ? `Top candidate hypothesis: ${topCand.conditionName} (${topCand.confidenceCategory} confidence).`
            : 'Botanical symptom analysis recorded.'),
        sourceReferenceId: diagnosis.id,
        sourceProvenance: 'diagnosis_records',
        badge: { text: healthBadgeText, variant: healthBadgeVariant },
        metadata: {
          isAiHypothesis: true,
          diagnosticStatus: diagnosis.status,
          candidateRank: topCand?.candidateRank || 1,
          conditionName: topCand?.conditionName,
          kbConditionId: topCand?.kbConditionId || undefined,
        },
        actionLink: {
          label: 'View Diagnosis',
          href: `/app/ai-doctor/history/${diagnosis.id}`,
        },
      });
    }

    // Treatments
    if (diagnosis.treatments && diagnosis.treatments.length > 0) {
      for (const treatment of diagnosis.treatments) {
        const treatDate = treatment.actionDate || treatment.createdAt;
        if (!treatDate) continue;

        const treatBadgeVariant =
          treatment.status === 'completed'
            ? 'success'
            : treatment.status === 'started'
            ? 'info'
            : 'neutral';

        pushEvent({
          id: `treatment-${treatment.id}`,
          plantId: plant.id,
          eventType: 'treatment',
          category: 'health',
          eventDate: treatDate,
          title: `Treatment: ${treatment.actionTitle}`,
          description: treatment.notes || `${formatTreatmentActionType(treatment.actionType)} marked as ${treatment.status}.`,
          sourceReferenceId: treatment.id,
          sourceProvenance: 'diagnosis_treatments',
          badge: { text: formatTreatmentStatus(treatment.status), variant: treatBadgeVariant },
          metadata: {
            treatmentStatus: treatment.status,
            treatmentActionType: treatment.actionType,
          },
          actionLink: {
            label: 'View Treatment Plan',
            href: `/app/ai-doctor/history/${diagnosis.id}`,
          },
        });
      }
    }

    // Follow-ups
    if (diagnosis.followUps && diagnosis.followUps.length > 0) {
      for (const followUp of diagnosis.followUps) {
        const fuDate = followUp.followUpDate || followUp.createdAt;
        if (!fuDate) continue;

        const outcomeVariant =
          followUp.outcomeStatus === 'resolved' || followUp.outcomeStatus === 'improving'
            ? 'success'
            : followUp.outcomeStatus === 'worsening'
            ? 'critical'
            : 'warning';

        pushEvent({
          id: `followup-${followUp.id}`,
          plantId: plant.id,
          eventType: 'health_follow_up',
          category: 'health',
          eventDate: fuDate,
          title: `Follow-up: ${formatFollowUpOutcome(followUp.outcomeStatus)}`,
          description: followUp.observationNotes || `Observation recorded condition as ${followUp.outcomeStatus}.`,
          sourceReferenceId: followUp.id,
          sourceProvenance: 'diagnosis_follow_ups',
          badge: { text: formatFollowUpOutcome(followUp.outcomeStatus), variant: outcomeVariant },
          media: followUp.photoUrl ? { signedUrl: followUp.photoUrl, caption: followUp.observationNotes || undefined } : undefined,
          metadata: {
            followUpOutcome: followUp.outcomeStatus,
          },
          actionLink: {
            label: 'View Follow-up',
            href: `/app/ai-doctor/history/${diagnosis.id}`,
          },
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 9. Feeding & Fertilization Events (Phase 10)
  // --------------------------------------------------------------------------
  for (const feeding of feedings) {
    if (feeding.plantId && feeding.plantId !== plant.id) continue;
    const feedDate = feeding.feedingDate;
    if (!feedDate) continue;

    const descParts: string[] = [];
    if (feeding.dosageAmount) {
      descParts.push(`Applied ${feeding.dosageAmount} ${feeding.dosageUnit || ''}`);
    } else if (feeding.dosageUnknown) {
      descParts.push('Dosage unrecorded');
    }
    descParts.push(`via ${feeding.applicationMethod.replace(/_/g, ' ')}`);
    if (feeding.npkRatio) {
      descParts.push(`(NPK ${feeding.npkRatio})`);
    }

    pushEvent({
      id: `feeding-${feeding.id}`,
      plantId: plant.id,
      eventType: 'feeding',
      category: 'care',
      eventDate: feedDate,
      title: `Fed: ${feeding.productName}`,
      description: descParts.join(' '),
      sourceReferenceId: feeding.id,
      sourceProvenance: 'feeding_records',
      badge: { text: feeding.fertilizerType.replace(/_/g, ' '), variant: 'accent' },
      metadata: {
        taskType: 'fertilize',
      },
    });
  }

  // --------------------------------------------------------------------------
  // 10. Environmental Condition Observations (Phase 10)
  // --------------------------------------------------------------------------
  for (const cond of conditions) {
    if (cond.plantId && cond.plantId !== plant.id) continue;
    const condDate = cond.observationTime;
    if (!condDate) continue;

    const details: string[] = [];
    if (cond.temperatureCelsius !== undefined && cond.temperatureCelsius !== null) {
      details.push(`${cond.temperatureCelsius}°C`);
    }
    if (cond.relativeHumidityPercent !== undefined && cond.relativeHumidityPercent !== null) {
      details.push(`${cond.relativeHumidityPercent}% RH`);
    }
    if (cond.soilMoisture) {
      details.push(`Soil: ${cond.soilMoisture.replace(/_/g, ' ')}`);
    }
    if (cond.lightLevel) {
      details.push(`Light: ${cond.lightLevel.replace(/_/g, ' ')}`);
    }

    pushEvent({
      id: `condition-${cond.id}`,
      plantId: plant.id,
      eventType: 'condition_observation',
      category: 'growth',
      eventDate: condDate,
      title: 'Environment Observation',
      description: details.length > 0 ? details.join(' • ') : (cond.notes || 'Growing conditions observed.'),
      sourceReferenceId: cond.id,
      sourceProvenance: 'growing_conditions',
      badge: { text: 'Environment', variant: 'neutral' },
    });
  }

  // --------------------------------------------------------------------------
  // 11. Propagation Events (Phase 10)
  // --------------------------------------------------------------------------
  for (const prop of propagations) {
    if (prop.parentPlantId === plant.id || prop.offspringPlantId === plant.id) {
      const isParent = prop.parentPlantId === plant.id;
      const propDate = prop.startedDate;
      if (propDate) {
        pushEvent({
          id: `prop-start-${prop.id}`,
          plantId: plant.id,
          eventType: 'propagation',
          category: 'propagation',
          eventDate: propDate,
          title: isParent ? `Propagated (${prop.propagationMethod})` : `Propagated From Parent`,
          description: isParent
            ? `Propagation initiated via ${prop.propagationMethod}${prop.medium ? ` in ${prop.medium}` : ''}.`
            : `Originated from parent plant via ${prop.propagationMethod}.`,
          sourceReferenceId: prop.id,
          sourceProvenance: 'propagation_events',
          badge: { text: prop.propagationMethod, variant: 'accent' },
        });
      }
      if (prop.outcomeDate && (prop.status === 'success' || prop.status === 'failure')) {
        pushEvent({
          id: `prop-outcome-${prop.id}`,
          plantId: plant.id,
          eventType: 'propagation',
          category: 'propagation',
          eventDate: prop.outcomeDate,
          title: `Propagation: ${prop.status === 'success' ? 'Successful' : 'Failed'}`,
          description: prop.notes || `Propagation attempt marked as ${prop.status}.`,
          sourceReferenceId: prop.id,
          sourceProvenance: 'propagation_events',
          badge: {
            text: prop.status === 'success' ? 'Rooted / Success' : 'Failed',
            variant: prop.status === 'success' ? 'success' : 'critical',
          },
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 12. Harvest Records (Phase 10)
  // --------------------------------------------------------------------------
  for (const h of harvests) {
    if (h.plantId && h.plantId !== plant.id) continue;
    const hDate = h.harvestDate;
    if (!hDate) continue;

    pushEvent({
      id: `harvest-rec-${h.id}`,
      plantId: plant.id,
      eventType: 'harvest',
      category: 'harvest',
      eventDate: hDate,
      title: `Harvest: ${h.quantity} ${h.unit}`,
      description: `${h.harvestType === 'cut_and_come_again' ? 'Cut-and-come-again' : 'Harvest'} logged (${h.quantity} ${h.unit})${h.qualityObservation ? ` — Quality: ${h.qualityObservation}` : ''}.${h.notes ? ` ${h.notes}` : ''}`,
      sourceReferenceId: h.id,
      sourceProvenance: 'harvest_records',
      badge: {
        text: `${h.quantity} ${h.unit}`,
        variant: 'success',
      },
      metadata: {
        actualHarvestDate: h.harvestDate,
        harvestYield: `${h.quantity} ${h.unit}`,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Chronological Sorting (Newest First) with Deterministic Tie-Breaking
  // --------------------------------------------------------------------------
  rawEvents.sort((a, b) => {
    const da = parseTimelineDate(a.eventDate)?.getTime() || 0;
    const db = parseTimelineDate(b.eventDate)?.getTime() || 0;

    if (db !== da) {
      return db - da; // Descending (newest first)
    }

    // Tie-breaker: sort by event type priority
    const priorityA = EVENT_TYPE_SORT_PRIORITY[a.eventType] || 0;
    const priorityB = EVENT_TYPE_SORT_PRIORITY[b.eventType] || 0;
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    // Secondary tie-breaker: alphabetical by ID
    return a.id.localeCompare(b.id);
  });

  // --------------------------------------------------------------------------
  // Growth Summary Derivation
  // --------------------------------------------------------------------------
  const ageInfo = calculatePlantAgeFromPlanting(plant.plantedDate, now);

  // Latest observation date across notes and photos
  let latestObsDate: string | null = null;
  let latestObsTime = 0;

  for (const note of plant.notes || []) {
    const d = parseTimelineDate(note.date);
    if (d && d.getTime() > latestObsTime) {
      latestObsTime = d.getTime();
      latestObsDate = note.date;
    }
  }
  for (const photo of photos) {
    const d = parseTimelineDate(photo.takenAt || photo.createdAt);
    if (d && d.getTime() > latestObsTime) {
      latestObsTime = d.getTime();
      latestObsDate = photo.takenAt || photo.createdAt || null;
    }
  }

  const lastObsDisplay = latestObsDate ? formatTimelineDate(latestObsDate) : 'No observations yet';

  // Derived health status via Phase 8.5 utility
  const healthSum = getPlantHealthSummary(diagnoses);

  const completedCareTasks = tasks.filter((t) => t.completed).length;

  const summary: PlantGrowthSummary = {
    plantId: plant.id,
    nickname: plant.nickname,
    plantSlug: plant.plantSlug,
    currentStage: plant.currentStage || 'Stage not recorded',
    stageHistory: stagesSeen,
    ageDisplay: ageInfo.ageDisplay,
    daysSincePlanting: ageInfo.daysSincePlanting,
    plantedDateDisplay: ageInfo.plantedDateDisplay,
    lastObservationDate: latestObsDate,
    lastObservationDateDisplay: lastObsDisplay,
    totalPhotosCount: photos.length,
    totalHealthAssessmentsCount: diagnoses.length,
    totalGrowthNotesCount: plant.notes?.length || 0,
    totalCareTasksCompleted: completedCareTasks,
    healthStatus: healthSum.status,
    healthStatusLabel: healthSum.statusLabel,
    hasPropagationLineage: Boolean(plant.parentPlantId || plant.propagationMethod),
    isHarvested: plant.currentStage === 'Harvested' || Boolean(plant.actualHarvestDate),
  };

  return {
    events: rawEvents,
    summary,
  };
}

/**
 * Pure Function: Filters normalized timeline events deterministically
 */
export function filterTimelineEvents(
  events: PlantTimelineEvent[],
  filter: PlantTimelineFilter
): PlantTimelineEvent[] {
  if (filter === 'all') return events;

  return events.filter((e) => {
    switch (filter) {
      case 'growth':
        return (
          e.category === 'growth' ||
          e.eventType === 'growth_observation' ||
          e.eventType === 'condition_observation' ||
          e.eventType === 'stage_change' ||
          e.eventType === 'germination' ||
          e.eventType === 'transplant' ||
          e.eventType === 'planting' ||
          e.eventType === 'plant_added'
        );
      case 'photos':
        return e.category === 'photo' || Boolean(e.media?.signedUrl || e.media?.photoId || e.media?.storagePath);
      case 'health':
        return (
          e.category === 'health' ||
          e.eventType === 'health_assessment' ||
          e.eventType === 'treatment' ||
          e.eventType === 'health_follow_up'
        );
      case 'care':
        return e.category === 'care' || e.eventType === 'care' || e.eventType === 'feeding';
      case 'harvest':
        return e.category === 'harvest' || e.eventType === 'harvest';
      case 'propagation':
        return e.category === 'propagation' || e.eventType === 'propagation';
      default:
        return true;
    }
  });
}

