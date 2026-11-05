/**
 * GrowAI Phase 9.1: Reminder Generator & Integrations Engine
 * Pure generator functions bridging existing garden entities (care tasks, health assessments,
 * treatments, follow-ups, growth notes, and milestones) into normalized reminder candidates.
 *
 * Strictly adheres to agronomic safety guidelines:
 * - Never claims an AI hypothesis is a confirmed disease.
 * - Never invents dosage, pesticide intervals, or chemical PHI.
 * - Never infers maturity from elapsed calendar days alone.
 * - Never diagnoses human medical conditions.
 */

import { CreateReminderInput } from '@/types/reminder';
import { CareTask, UserPlant } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import { FOLLOW_UP_INTERVAL_DAYS, isFollowUpDue } from '@/lib/plant-health-status';
import {
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  GrowingConditionObservation,
} from '@/types/grow-intelligence';

/**
 * Normalizes a date string (YYYY-MM-DD or ISO) into an ISO string.
 * Sets time to 09:00:00Z for date-only strings to provide friendly morning notification.
 */
export function normalizeDueAtTimestamp(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date().toISOString();
  }
  const trimmed = dateStr.trim();
  if (trimmed.length === 10 && trimmed.includes('-')) {
    // YYYY-MM-DD -> 09:00 UTC morning reminder
    return `${trimmed}T09:00:00.000Z`;
  }
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

/**
 * 1. Care Tasks Integration:
 * Converts active, uncompleted care tasks into standardized reminders.
 */
export function generateCareTaskReminders(
  tasks: CareTask[],
  plants: UserPlant[] = []
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const plantMap = new Map<string, UserPlant>();
  for (const p of plants) {
    plantMap.set(p.id, p);
  }

  for (const task of tasks) {
    if (task.completed) continue;
    if (!task.dueDate) continue;

    const plant = task.plantId ? plantMap.get(task.plantId) : undefined;
    const plantName = plant?.nickname || task.plantName || 'Plant';

    let actionWord = 'Care for';
    switch (task.type) {
      case 'water':
        actionWord = 'Water';
        break;
      case 'fertilize':
        actionWord = 'Fertilize';
        break;
      case 'prune':
        actionWord = 'Prune';
        break;
      case 'harvest':
        actionWord = 'Harvest check for';
        break;
      case 'repot':
        actionWord = 'Repot';
        break;
      case 'inspect':
        actionWord = 'Inspect';
        break;
    }

    const title = `${actionWord} ${plantName}`;
    const body = `${task.title} is scheduled for ${plantName}.`;

    reminders.push({
      plantId: task.plantId || null,
      plantNickname: plantName,
      plantSlug: plant?.plantSlug || null,
      sourceType: 'care_task',
      sourceId: task.id,
      reminderType: 'care',
      title,
      body,
      dueAt: normalizeDueAtTimestamp(task.dueDate),
      priority: task.type === 'water' ? 'normal' : 'normal',
      metadata: {
        taskType: task.type,
        actionUrl: `/app/my-garden?plantId=${task.plantId || ''}`,
      },
    });
  }

  return reminders;
}

/**
 * 2. Health Follow-ups Integration:
 * Converts pending health follow-up intervals into gentle observational reminders.
 * Strictly adheres to botanical language: "AI hypothesis", "Review previously recorded observation".
 */
export function generateHealthFollowUpReminders(
  diagnoses: SavedDiagnosisRecord[],
  plants: UserPlant[] = []
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const plantMap = new Map<string, UserPlant>();
  for (const p of plants) {
    plantMap.set(p.id, p);
  }

  for (const diag of diagnoses) {
    if (!diag.userPlantId) continue;
    if (diag.status !== 'completed') continue;
    if (diag.overallHealth === 'healthy') continue; // Healthy scans do not generate issue follow-ups

    const plant = plantMap.get(diag.userPlantId);
    const plantName = plant?.nickname || diag.userContext?.plantName || 'Plant';

    // Check latest follow-up
    const followUps = diag.followUps || [];
    const latestFollowUp = followUps[followUps.length - 1];

    // If the latest follow-up was resolved, no follow-up reminder is needed
    if (latestFollowUp && latestFollowUp.outcomeStatus === 'resolved') {
      continue;
    }

    // Determine reference date for follow-up
    const lastDateStr = latestFollowUp
      ? latestFollowUp.followUpDate || latestFollowUp.createdAt
      : diag.diagnosedAt || diag.createdAt;

    const lastDate = new Date(lastDateStr);
    if (isNaN(lastDate.getTime())) continue;

    // Follow-up scheduled for FOLLOW_UP_INTERVAL_DAYS (3 days) after last observation
    const targetDate = new Date(lastDate.getTime());
    targetDate.setDate(targetDate.getDate() + FOLLOW_UP_INTERVAL_DAYS);

    const conditionHypothesis = diag.candidates && diag.candidates.length > 0
      ? diag.candidates[0].conditionName
      : 'observed symptoms';

    reminders.push({
      plantId: diag.userPlantId,
      plantNickname: plantName,
      plantSlug: plant?.plantSlug || diag.plantSlug || null,
      sourceType: 'health_follow_up',
      sourceId: diag.id,
      reminderType: 'health',
      title: `Plant health follow-up for ${plantName}`,
      body: `Review previously recorded observation for ${conditionHypothesis}. Check if symptoms are improving, unchanged, or worsening.`,
      dueAt: targetDate.toISOString(),
      priority: diag.overallHealth === 'severe_issue' ? 'high' : 'normal',
      metadata: {
        conditionName: conditionHypothesis,
        actionUrl: `/app/ai-doctor/history/${diag.id}`,
      },
    });
  }

  return reminders;
}

/**
 * 3. Treatment Tracking Integration:
 * Reminds grower to perform or review a planned/started treatment intervention.
 * Strictly avoids inventing dosage, chemical PHI, or cure promises.
 */
export function generateTreatmentReminders(
  diagnoses: SavedDiagnosisRecord[],
  plants: UserPlant[] = []
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const plantMap = new Map<string, UserPlant>();
  for (const p of plants) {
    plantMap.set(p.id, p);
  }

  for (const diag of diagnoses) {
    const treatments = diag.treatments || [];
    for (const treat of treatments) {
      if (treat.status === 'completed' || treat.status === 'skipped') continue;
      if (!treat.actionDate) continue;

      const plantId = treat.userPlantId || diag.userPlantId || null;
      const plant = plantId ? plantMap.get(plantId) : undefined;
      const plantName = plant?.nickname || 'Plant';

      reminders.push({
        plantId,
        plantNickname: plantName,
        plantSlug: plant?.plantSlug || diag.plantSlug || null,
        sourceType: 'treatment',
        sourceId: treat.id,
        reminderType: 'treatment',
        title: `Treatment reminder: ${treat.actionTitle}`,
        body: treat.notes
          ? `${treat.notes} — Recorded action for ${plantName}.`
          : `Review the treatment action recorded for ${plantName}.`,
        dueAt: normalizeDueAtTimestamp(treat.actionDate),
        priority: 'normal',
        metadata: {
          treatmentActionType: treat.actionType,
          actionUrl: `/app/ai-doctor/history/${diag.id}`,
        },
      });
    }
  }

  return reminders;
}

/**
 * 4. Growth Observation & Milestone Reminders:
 * Encourages periodic note logging and milestone observation.
 * Strict rule: NEVER infers maturity or expected yield from elapsed calendar days alone.
 */
export function generateMilestoneReminders(
  plants: UserPlant[],
  nowInput?: Date
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const now = nowInput || new Date();

  for (const plant of plants) {
    if (plant.currentStage === 'Harvested') continue;

    // Check if 7+ days have elapsed since last note or planting
    let lastActivityDate: Date | null = null;
    if (plant.notes && plant.notes.length > 0) {
      const sorted = [...plant.notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted[0]?.date) {
        lastActivityDate = new Date(sorted[0].date);
      }
    }
    if (!lastActivityDate && plant.plantedDate) {
      lastActivityDate = new Date(plant.plantedDate);
    }

    if (lastActivityDate && !isNaN(lastActivityDate.getTime())) {
      const daysSince = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

      // If 7 or more days since last observation, suggest logging a growth observation
      if (daysSince >= 7) {
        reminders.push({
          plantId: plant.id,
          plantNickname: plant.nickname,
          plantSlug: plant.plantSlug,
          sourceType: 'growth_observation',
          sourceId: plant.id,
          reminderType: 'growth',
          title: `Growth check for ${plant.nickname}`,
          body: `It has been over a week since your last journal entry. Consider recording a new growth observation or taking a progress photo.`,
          dueAt: now.toISOString(),
          priority: 'low',
          metadata: {
            actionUrl: `/app/my-garden?plantId=${plant.id}`,
          },
        });
      }
    }
  }

  return reminders;
}

/**
 * 5. Feeding & Nutrient Reminders (Phase 10):
 * Reminds grower of planned feeding events.
 * Strictly adheres to safety: never invents dosage; refers grower to manufacturer label.
 */
export function generateFeedingReminders(
  feedings: FeedingRecord[],
  plants: UserPlant[] = []
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const plantMap = new Map<string, UserPlant>();
  for (const p of plants) {
    plantMap.set(p.id, p);
  }

  for (const feed of feedings) {
    if (!feed.nextPlannedDate) continue;

    const plant = feed.plantId ? plantMap.get(feed.plantId) : undefined;
    const plantName = plant?.nickname || 'Plant';

    reminders.push({
      plantId: feed.plantId || null,
      plantNickname: plantName,
      plantSlug: plant?.plantSlug || null,
      sourceType: 'feeding',
      sourceId: feed.id,
      reminderType: 'feeding',
      title: `Scheduled feeding for ${plantName}`,
      body: `Planned feeding with ${feed.productName}. Always follow product manufacturer instructions for application rates.`,
      dueAt: normalizeDueAtTimestamp(feed.nextPlannedDate),
      priority: 'normal',
      metadata: {
        productName: feed.productName,
        fertilizerType: feed.fertilizerType,
        actionUrl: `/app/my-garden?plantId=${feed.plantId || ''}&tab=feeding`,
      },
    });
  }

  return reminders;
}

/**
 * 6. Propagation Inspection Reminders (Phase 10):
 * Reminds grower to check cutting moisture, rooting progress, or humidity dome.
 */
export function generatePropagationReminders(
  propagations: PropagationEvent[],
  plants: UserPlant[] = [],
  nowInput?: Date
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const plantMap = new Map<string, UserPlant>();
  for (const p of plants) {
    plantMap.set(p.id, p);
  }

  const now = nowInput || new Date();

  for (const prop of propagations) {
    if (prop.status !== 'in_progress') continue;

    const parentPlant = plantMap.get(prop.parentPlantId);
    const parentName = parentPlant?.nickname || prop.parentPlantNickname || 'Parent plant';

    let dueTarget = prop.expectedFollowupDate;
    if (!dueTarget && prop.startedDate) {
      // If no followup date set, prompt inspection 5 days after start
      const start = new Date(prop.startedDate);
      if (!isNaN(start.getTime())) {
        const nextCheck = new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000);
        dueTarget = nextCheck.toISOString();
      }
    }

    if (dueTarget) {
      reminders.push({
        plantId: prop.parentPlantId,
        plantNickname: parentName,
        plantSlug: parentPlant?.plantSlug || null,
        sourceType: 'propagation',
        sourceId: prop.id,
        reminderType: 'propagation',
        title: `Check propagation: ${prop.propagationMethod} (${parentName})`,
        body: `Inspect moisture levels and root formation for ${parentName} ${prop.propagationMethod} cutting.`,
        dueAt: normalizeDueAtTimestamp(dueTarget),
        priority: 'normal',
        metadata: {
          propagationMethod: prop.propagationMethod,
          actionUrl: `/app/my-garden?plantId=${prop.parentPlantId}&tab=production`,
        },
      });
    }
  }

  return reminders;
}

/**
 * 7. Harvest Observation Reminders (Phase 10):
 * Prompts visual harvest inspection for plants in mature/fruiting stages or active harvesting cycles.
 * Strict safety rule: Never guarantees maturity or yield; prompts grower to visually verify readiness.
 */
export function generateHarvestMilestoneReminders(
  plants: UserPlant[],
  cycles: ProductionCycle[] = []
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];

  // 1. Plant-level visual harvest checks
  for (const plant of plants) {
    if (plant.currentStage === 'Mature') {
      reminders.push({
        plantId: plant.id,
        plantNickname: plant.nickname,
        plantSlug: plant.plantSlug,
        sourceType: 'harvest',
        sourceId: `harvest-check-${plant.id}`,
        reminderType: 'harvest',
        title: `Visual harvest check for ${plant.nickname}`,
        body: `${plant.nickname} is in ${plant.currentStage.toLowerCase()} stage. Visually inspect fruit or foliage for harvest readiness.`,
        dueAt: normalizeDueAtTimestamp(new Date().toISOString()),
        priority: 'normal',
        metadata: {
          currentStage: plant.currentStage,
          actionUrl: `/app/my-garden?plantId=${plant.id}&tab=production`,
        },
      });
    }
  }

  // 2. Production cycle harvest checks
  for (const cycle of cycles) {
    if (cycle.status === 'active' && (cycle.stage === 'flowering' || cycle.stage === 'harvesting')) {
      reminders.push({
        plantId: null,
        plantNickname: cycle.cycleName,
        plantSlug: cycle.plantSlug,
        sourceType: 'production',
        sourceId: `cycle-check-${cycle.id}`,
        reminderType: 'production',
        title: `Production cycle review: ${cycle.cycleName}`,
        body: `Cycle is in ${cycle.stage} stage. Check progress and log any cut-and-come-again or batch harvests.`,
        dueAt: normalizeDueAtTimestamp(cycle.expectedEndDate || new Date().toISOString()),
        priority: 'normal',
        metadata: {
          cycleId: cycle.id,
          stage: cycle.stage,
          actionUrl: `/app/grow-intelligence`,
        },
      });
    }
  }

  return reminders;
}

/**
 * 8. Daily Grow & Environmental Observation Reminders (Phase 10):
 * Gentle check-in for plants lacking recent environmental observations.
 */
export function generateDailyGrowCheckReminders(
  plants: UserPlant[],
  conditions: GrowingConditionObservation[] = [],
  nowInput?: Date
): CreateReminderInput[] {
  const reminders: CreateReminderInput[] = [];
  const now = nowInput || new Date();

  // Find plants that have no condition observations or haven't been observed in > 7 days
  for (const plant of plants) {
    if (plant.currentStage === 'Harvested') continue;

    const plantConditions = conditions.filter((c) => c.plantId === plant.id);
    let lastObsTime = 0;
    for (const c of plantConditions) {
      const t = new Date(c.observationTime).getTime();
      if (t > lastObsTime) lastObsTime = t;
    }

    const daysSince = lastObsTime > 0
      ? Math.floor((now.getTime() - lastObsTime) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSince >= 5 && plantConditions.length > 0) {
      reminders.push({
        plantId: plant.id,
        plantNickname: plant.nickname,
        plantSlug: plant.plantSlug,
        sourceType: 'care_task',
        sourceId: `env-check-${plant.id}`,
        reminderType: 'care',
        title: `Check growing conditions for ${plant.nickname}`,
        body: `It has been ${daysSince} days since an environmental observation was recorded. Check light, moisture, and temperature.`,
        dueAt: now.toISOString(),
        priority: 'low',
        metadata: {
          actionUrl: `/app/my-garden?plantId=${plant.id}&tab=conditions`,
        },
      });
    }
  }

  return reminders;
}

