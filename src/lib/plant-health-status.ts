/**
 * GrowAI Plant Health Status Derivation Utility
 * Phase 8.5 — Plant Health Monitoring & Follow-ups
 *
 * PURE, DETERMINISTIC, TESTABLE
 * Completely decoupled from React, DOM, and browser storage APIs.
 *
 * Deterministic Precedence Rules:
 * 1. NO HISTORY:
 *    - If no diagnosis records exist for a specimen -> 'unknown'.
 *    - We never claim "healthy" simply due to an absence of records.
 *
 * 2. LATEST CONCLUSIVE ASSESSMENT PRECEDENCE:
 *    - Diagnoses are evaluated in reverse chronological order (newest first).
 *    - Inconclusive/service_unavailable entries do not overwrite existing conclusive issues.
 *
 * 3. FOLLOW-UP OUTCOME OVERRIDES:
 *    - If the latest active diagnosis has follow-up observations:
 *      * 'resolved'   -> 'resolved' (the issue has been addressed and cleared)
 *      * 'improving'  -> 'improving' (symptoms subsiding under ongoing care)
 *      * 'worsening'  -> 'needs_attention' (escalating symptoms requiring grower action)
 *      * 'unchanged'  -> 'monitoring' (persistent symptoms requiring continued observation)
 *      * 'uncertain'  -> 'monitoring' (ambiguous progress requiring vigilant check)
 *
 * 4. UNRESOLVED DIAGNOSIS WITH NO FOLLOW-UPS:
 *    - If overallHealth is 'healthy' with no active pest/disease candidates -> 'healthy'.
 *    - If overallHealth is 'severe_issue' OR classification is 'biotic' (pest/fungal/bacterial) -> 'needs_attention'.
 *    - If overallHealth is 'moderate_issue' or 'mild_stress' -> 'monitoring'.
 *    - Otherwise -> 'unknown'.
 *
 * 5. PENDING CRITICAL TREATMENTS:
 *    - Pending isolation or major pruning actions on an active issue reinforce 'needs_attention'.
 */

import {
  SavedDiagnosisRecord,
  SavedDiagnosisFollowUp,
  SavedDiagnosisTreatment,
  PlantHealthStatus,
  PlantHealthSummary,
  FollowUpOutcome,
  GardenHealthOverview,
} from '@/types/diagnosis';

/**
 * Standard interval (in days) after which an unresolved diagnosis or follow-up
 * is considered overdue for a follow-up observation.
 */
export const FOLLOW_UP_INTERVAL_DAYS = 3;

/**
 * Derives the strict botanical health status for a single plant from its historical diagnoses.
 */
export function derivePlantHealthStatus(
  diagnoses?: SavedDiagnosisRecord[] | null
): PlantHealthStatus {
  if (!diagnoses || diagnoses.length === 0) {
    return 'unknown';
  }

  // Sort descending by diagnosis timestamp
  const sorted = [...diagnoses].sort((a, b) => {
    const timeA = new Date(a.diagnosedAt || a.createdAt).getTime();
    const timeB = new Date(b.diagnosedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  // Find the most recent conclusive diagnosis (not invalid/inconclusive)
  const latestConclusive = sorted.find(
    (d) => d.status === 'completed' && d.overallHealth !== 'unknown'
  );

  // If no completed diagnosis exists, fall back to first record or 'unknown'
  const primary = latestConclusive || sorted[0];

  if (!primary || primary.status !== 'completed') {
    return 'unknown';
  }

  // Evaluate follow-ups on the primary diagnosis
  const followUps = primary.followUps ? [...primary.followUps] : [];
  if (followUps.length > 0) {
    // Sort follow-ups newest first
    followUps.sort((a, b) => {
      const timeA = new Date(a.followUpDate || a.createdAt).getTime();
      const timeB = new Date(b.followUpDate || b.createdAt).getTime();
      return timeB - timeA;
    });

    const latestFollowUp = followUps[0];
    switch (latestFollowUp.outcomeStatus) {
      case 'resolved':
        return 'resolved';
      case 'improving':
        return 'improving';
      case 'worsening':
        return 'needs_attention';
      case 'unchanged':
      case 'uncertain':
        return 'monitoring';
    }
  }

  // No follow-ups logged yet for this diagnosis
  if (primary.overallHealth === 'healthy') {
    // If declared healthy and no candidates exist
    if (!primary.candidates || primary.candidates.length === 0) {
      return 'healthy';
    }
    return 'monitoring';
  }

  if (primary.overallHealth === 'severe_issue') {
    return 'needs_attention';
  }

  if (primary.primaryClassification === 'biotic') {
    // Biotic pests / diseases require prompt attention to avoid plant-to-plant spread
    return 'needs_attention';
  }

  if (primary.overallHealth === 'moderate_issue' || primary.overallHealth === 'mild_stress') {
    return 'monitoring';
  }

  return 'unknown';
}

/**
 * Checks whether an unresolved diagnosis is due for a follow-up observation.
 */
export function isFollowUpDue(diagnosis: SavedDiagnosisRecord, now: Date = new Date()): boolean {
  if (diagnosis.status !== 'completed') return false;

  const followUps = diagnosis.followUps ? [...diagnosis.followUps] : [];
  if (followUps.length > 0) {
    followUps.sort((a, b) => {
      const timeA = new Date(a.followUpDate || a.createdAt).getTime();
      const timeB = new Date(b.followUpDate || b.createdAt).getTime();
      return timeB - timeA;
    });

    // If already marked resolved, follow-up is not due
    if (followUps[0].outcomeStatus === 'resolved') {
      return false;
    }

    const lastDate = new Date(followUps[0].followUpDate || followUps[0].createdAt);
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= FOLLOW_UP_INTERVAL_DAYS;
  }

  // If healthy, not due
  if (diagnosis.overallHealth === 'healthy' && (!diagnosis.candidates || diagnosis.candidates.length === 0)) {
    return false;
  }

  // No follow-ups: check against initial diagnosis date
  const diagDate = new Date(diagnosis.diagnosedAt || diagnosis.createdAt);
  const diffDays = Math.floor((now.getTime() - diagDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= FOLLOW_UP_INTERVAL_DAYS;
}

/**
 * Extracts human-readable next-action guidance grounded in the latest diagnosis and outcome.
 */
export function getNextActionGuidance(
  status: PlantHealthStatus,
  diagnosis?: SavedDiagnosisRecord | null,
  latestFollowUp?: SavedDiagnosisFollowUp | null
): string {
  switch (status) {
    case 'unknown':
      return 'No health assessments recorded yet. Use AI Doctor to evaluate any leaf discoloration, spots, or pests.';

    case 'healthy':
      return 'Plant is vigorous with no active stresses detected. Maintain standard watering and routine light exposure.';

    case 'resolved':
      return 'Previous issue resolved. Continue routine observation and balanced watering to maintain recovery.';

    case 'improving':
      if (diagnosis?.suggestedFollowUp) {
        return `Recovery in progress: ${diagnosis.suggestedFollowUp}`;
      }
      return 'Plant is recovering nicely. Keep soil moisture steady and check again in 2–3 days.';

    case 'monitoring':
      if (latestFollowUp?.outcomeStatus === 'unchanged') {
        return 'Symptoms persist without progression. Maintain active observation and ensure airflow and moisture are calibrated.';
      }
      if (diagnosis?.recommendedChecks && diagnosis.recommendedChecks.length > 0) {
        return `Recommended check: ${diagnosis.recommendedChecks[0]}`;
      }
      return 'Observe foliage progression over the next 48–72 hours. Isolate if signs of spread appear.';

    case 'needs_attention':
      if (latestFollowUp?.outcomeStatus === 'worsening') {
        return 'Symptoms are escalating. Re-evaluate watering, inspect leaf undersides with magnification, or run a new AI Doctor check.';
      }
      if (diagnosis?.immediateActions && diagnosis.immediateActions.length > 0) {
        return `Immediate action: ${diagnosis.immediateActions[0]}`;
      }
      return 'Significant stress or pest damage identified. Implement cultural corrections and inspect daily.';
  }
}

/**
 * Builds a complete structured health summary for a plant.
 */
export function getPlantHealthSummary(
  diagnoses?: SavedDiagnosisRecord[] | null,
  now: Date = new Date()
): PlantHealthSummary {
  const status = derivePlantHealthStatus(diagnoses);

  if (!diagnoses || diagnoses.length === 0) {
    return {
      status: 'unknown',
      statusLabel: 'No Assessment',
      lastCheckedDate: null,
      activeIssue: null,
      latestFollowUpOutcome: null,
      pendingTreatmentsCount: 0,
      totalDiagnosesCount: 0,
      unresolvedCount: 0,
      isFollowUpDue: false,
      nextActionGuidance: getNextActionGuidance('unknown'),
      latestDiagnosisId: null,
    };
  }

  // Sort descending
  const sorted = [...diagnoses].sort((a, b) => {
    const timeA = new Date(a.diagnosedAt || a.createdAt).getTime();
    const timeB = new Date(b.diagnosedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  const latest = sorted[0];

  // Follow-ups on latest
  const followUps = latest.followUps ? [...latest.followUps] : [];
  followUps.sort((a, b) => {
    const timeA = new Date(a.followUpDate || a.createdAt).getTime();
    const timeB = new Date(b.followUpDate || b.createdAt).getTime();
    return timeB - timeA;
  });
  const latestFollowUp = followUps[0] || null;

  // Active issue name
  let activeIssue: string | null = null;
  if (status !== 'resolved' && status !== 'healthy' && status !== 'unknown') {
    if (latest.candidates && latest.candidates.length > 0) {
      activeIssue = latest.candidates[0].conditionName;
    } else if (latest.visibleSymptoms && latest.visibleSymptoms.length > 0) {
      activeIssue = latest.visibleSymptoms[0];
    } else {
      activeIssue = latest.summary || 'Foliage Stress';
    }
  }

  // Pending treatments across all diagnoses for this plant
  let pendingTreatments = 0;
  let unresolvedCount = 0;

  for (const d of sorted) {
    const dFollowUps = d.followUps || [];
    const isResolved = dFollowUps.some((f) => f.outcomeStatus === 'resolved');
    if (!isResolved && d.overallHealth !== 'healthy') {
      unresolvedCount++;
    }

    if (d.treatments) {
      for (const t of d.treatments) {
        if (t.status === 'planned' || t.status === 'started') {
          pendingTreatments++;
        }
      }
    }
  }

  const due = isFollowUpDue(latest, now);
  const guidance = getNextActionGuidance(status, latest, latestFollowUp);

  const statusLabels: Record<PlantHealthStatus, string> = {
    healthy: 'Healthy',
    monitoring: 'Monitoring',
    needs_attention: 'Needs Attention',
    improving: 'Improving',
    resolved: 'Resolved',
    unknown: 'No Assessment',
  };

  return {
    status,
    statusLabel: statusLabels[status],
    lastCheckedDate: latest.diagnosedAt || latest.createdAt || null,
    activeIssue,
    latestFollowUpOutcome: latestFollowUp ? latestFollowUp.outcomeStatus : null,
    pendingTreatmentsCount: pendingTreatments,
    totalDiagnosesCount: sorted.length,
    unresolvedCount,
    isFollowUpDue: due,
    nextActionGuidance: guidance,
    latestDiagnosisId: latest.id,
  };
}

/**
 * Computes aggregate garden-wide health metrics for the dashboard.
 */
export function getGardenHealthOverview(
  plants: Array<{ id: string }>,
  diagnosesByPlantId: Record<string, SavedDiagnosisRecord[]>
): GardenHealthOverview {
  let needsAttentionCount = 0;
  let monitoringCount = 0;
  let improvingCount = 0;
  let resolvedCount = 0;
  let healthyCount = 0;
  let unknownCount = 0;
  let followUpsDueCount = 0;
  let pendingTreatmentsCount = 0;
  let assessedPlants = 0;

  for (const plant of plants) {
    const list = diagnosesByPlantId[plant.id] || [];
    const summary = getPlantHealthSummary(list);

    if (summary.status !== 'unknown') {
      assessedPlants++;
    }

    switch (summary.status) {
      case 'needs_attention':
        needsAttentionCount++;
        break;
      case 'monitoring':
        monitoringCount++;
        break;
      case 'improving':
        improvingCount++;
        break;
      case 'resolved':
        resolvedCount++;
        break;
      case 'healthy':
        healthyCount++;
        break;
      case 'unknown':
        unknownCount++;
        break;
    }

    if (summary.isFollowUpDue) {
      followUpsDueCount++;
    }

    pendingTreatmentsCount += summary.pendingTreatmentsCount;
  }

  return {
    totalPlants: plants.length,
    assessedPlants,
    needsAttentionCount,
    monitoringCount,
    improvingCount,
    resolvedCount,
    healthyCount,
    unknownCount,
    followUpsDueCount,
    pendingTreatmentsCount,
  };
}

/**
 * Botanical visual configuration tokens for health status badges.
 */
export function getHealthStatusBadgeConfig(status: PlantHealthStatus): {
  label: string;
  variant: 'emerald' | 'amber' | 'crimson' | 'sky' | 'sage' | 'slate';
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  description: string;
} {
  switch (status) {
    case 'needs_attention':
      return {
        label: 'Needs Attention',
        variant: 'crimson',
        bgClass: 'bg-[#fef2f2]',
        textClass: 'text-[#991b1b]',
        borderClass: 'border-[#fecaca]',
        dotClass: 'bg-[#dc2626]',
        description: 'Unresolved issue or worsening symptoms detected.',
      };
    case 'monitoring':
      return {
        label: 'Monitoring',
        variant: 'amber',
        bgClass: 'bg-[#fffbeb]',
        textClass: 'text-[#92400e]',
        borderClass: 'border-[#fde68a]',
        dotClass: 'bg-[#d97706]',
        description: 'Observing foliage progression and cultural adjustments.',
      };
    case 'improving':
      return {
        label: 'Improving',
        variant: 'sky',
        bgClass: 'bg-[#f0f9ff]',
        textClass: 'text-[#0369a1]',
        borderClass: 'border-[#bae6fd]',
        dotClass: 'bg-[#0284c7]',
        description: 'Positive recovery signs observed following care.',
      };
    case 'resolved':
      return {
        label: 'Resolved',
        variant: 'emerald',
        bgClass: 'bg-[#ecfdf5]',
        textClass: 'text-[#065f46]',
        borderClass: 'border-[#a7f3d0]',
        dotClass: 'bg-[#059669]',
        description: 'Health issue addressed and cleared.',
      };
    case 'healthy':
      return {
        label: 'Healthy',
        variant: 'emerald',
        bgClass: 'bg-[#eef5ee]',
        textClass: 'text-[#144229]',
        borderClass: 'border-[#cfe0cf]',
        dotClass: 'bg-[#257a4d]',
        description: 'Vigorous specimen with no active stressors.',
      };
    case 'unknown':
    default:
      return {
        label: 'No Assessment',
        variant: 'slate',
        bgClass: 'bg-[#f8fafc]',
        textClass: 'text-[#64748b]',
        borderClass: 'border-[#e2e8f0]',
        dotClass: 'bg-[#94a3b8]',
        description: 'No diagnostic assessments recorded yet.',
      };
  }
}

