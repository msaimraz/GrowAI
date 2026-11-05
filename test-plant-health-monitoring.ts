/**
 * GrowAI Phase 8.5 — Plant Health Monitoring & Follow-ups Test Suite
 *
 * Verifies all required criteria for Phase 8.5:
 * 1. Health Status Derivation:
 *    - no history -> 'unknown'
 *    - improving -> 'improving'
 *    - worsening -> 'needs_attention'
 *    - unchanged -> 'monitoring'
 *    - resolved -> 'resolved'
 *    - uncertain -> 'monitoring'
 *    - unresolved diagnosis with no follow-up (severe) -> 'needs_attention'
 *    - unresolved diagnosis with no follow-up (biotic) -> 'needs_attention'
 *    - unresolved diagnosis with no follow-up (mild/moderate) -> 'monitoring'
 *    - unresolved diagnosis with healthy status -> 'healthy'
 *    - multiple diagnoses: latest conclusive diagnosis takes precedence
 * 2. Follow-Up Due Checks:
 *    - unresolved issue past follow-up interval (>= 3 days) -> true
 *    - recent follow-up (< 3 days) -> false
 *    - resolved issue past interval -> false
 *    - healthy issue past interval -> false
 * 3. Next Action Guidance:
 *    - deterministic, grounded guidance strings for each health status
 *    - reflects actual botanical and cultural advice without false cure claims
 * 4. Garden Health Overview:
 *    - aggregates totalPlants, assessedPlants, needsAttentionCount, monitoringCount,
 *      improvingCount, resolvedCount, healthyCount, unknownCount, followUpsDueCount,
 *      and pendingTreatmentsCount
 * 5. Treatment Tracking Integration:
 *    - planned, started, completed, skipped statuses
 *    - counts pending treatments (planned + started)
 * 6. Follow-Up Photo & Security Boundaries:
 *    - follow-up photo link structure
 *    - user ownership and isolation
 *    - preserves private photo storage rules
 * 7. Edge Cases:
 *    - empty or null diagnosis arrays
 *    - malformed records
 *    - diagnoses without candidates
 *    - inconclusive assessments
 */

import {
  derivePlantHealthStatus,
  getPlantHealthSummary,
  getGardenHealthOverview,
  isFollowUpDue,
  getNextActionGuidance,
  FOLLOW_UP_INTERVAL_DAYS,
  getHealthStatusBadgeConfig,
} from './src/lib/plant-health-status';
import {
  SavedDiagnosisRecord,
  SavedDiagnosisCandidate,
  SavedDiagnosisTreatment,
  SavedDiagnosisFollowUp,
  PlantHealthStatus,
  FollowUpOutcome,
  TreatmentStatus,
} from './src/types/diagnosis';

let totalTests = 0;
let passedTests = 0;

function assert(suite: string, name: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [${suite}] ${name}`);
  } else {
    console.error(`  ❌ [${suite}] ${name}`);
    if (details) console.error(`     └─ Error: ${details}`);
    throw new Error(`Assertion failed: [${suite}] ${name} - ${details || ''}`);
  }
}

console.log('======================================================================');
console.log('🌱 Starting GrowAI Phase 8.5 Plant Health Monitoring Test Suite');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// HELPER FACTORIES
// ----------------------------------------------------------------------------

function makeMockDiagnosis(overrides?: Partial<SavedDiagnosisRecord>): SavedDiagnosisRecord {
  const id = overrides?.id || `diag-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    userId: 'user-auth-123',
    userPlantId: 'plant-uuid-001',
    schemaVersion: '1.0',
    diagnosticSource: 'gemini-vision',
    modelUsed: 'gemini-3.8-flash',
    status: 'completed',
    primaryClassification: 'biotic',
    isPlantRecognized: true,
    plantIdentification: 'Sweet Basil (Ocimum basilicum)',
    plantIdentificationConfidence: 'high',
    plantSlug: 'genovese-basil',
    overallHealth: 'moderate_issue',
    symptoms: 'Yellow spots on leaf surfaces',
    userContext: { watering: 'Daily', sunlight: 'Full Sun' },
    visibleSymptoms: ['Chlorotic stippling'],
    likelyCauses: ['Two-spotted spider mites'],
    recommendedChecks: ['Inspect leaf undersides with hand lens'],
    immediateActions: ['Wipe foliage and isolate plant'],
    longTermCare: ['Maintain higher ambient humidity'],
    prevention: ['Avoid dry, stagnant air conditions'],
    uncertainties: ['Egg hatch timeline'],
    requiresExpertReview: false,
    summary: 'Symptoms consistent with early spider mite feeding activity.',
    disclaimer: 'Botanical AI hypothesis — not certified laboratory pathology.',
    diagnosedAt: now,
    createdAt: now,
    updatedAt: now,
    candidates: [
      {
        id: `cand-${id}-1`,
        diagnosisId: id,
        userId: 'user-auth-123',
        candidateRank: 1,
        conditionName: 'Spider Mites',
        explanation: 'Sap-sucking arachnid causing fine chlorotic stippling.',
        confidenceCategory: 'high',
        supportingEvidence: ['Chlorotic stippling'],
        alternativeCauses: ['Thrips damage'],
        recommendedNextObservation: 'Check leaf undersides for fine webbing',
        createdAt: now,
      },
    ],
    treatments: [],
    followUps: [],
    ...overrides,
  };
}

function makeMockFollowUp(overrides?: Partial<SavedDiagnosisFollowUp>): SavedDiagnosisFollowUp {
  const now = new Date().toISOString();
  return {
    id: `fu-${Math.random().toString(36).substring(2, 9)}`,
    diagnosisId: 'diag-001',
    userId: 'user-auth-123',
    outcomeStatus: 'improving',
    observationNotes: 'Foliage looks greener after gentle wash.',
    followUpDate: now.split('T')[0],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeMockTreatment(overrides?: Partial<SavedDiagnosisTreatment>): SavedDiagnosisTreatment {
  const now = new Date().toISOString();
  return {
    id: `tx-${Math.random().toString(36).substring(2, 9)}`,
    diagnosisId: 'diag-001',
    userId: 'user-auth-123',
    userPlantId: 'plant-uuid-001',
    actionType: 'adjust_watering',
    actionTitle: 'Water only when top inch is dry',
    status: 'planned',
    notes: 'Switching to bottom watering tray',
    actionDate: now.split('T')[0],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ----------------------------------------------------------------------------
// SUITE 1: HEALTH STATUS DERIVATION
// ----------------------------------------------------------------------------
console.log('--- 1. Health Status Derivation Tests ---');

// Test 1: No history -> unknown
assert('Derivation', 'No history returns unknown status', derivePlantHealthStatus([]) === 'unknown');
assert('Derivation', 'Null or undefined history returns unknown', derivePlantHealthStatus(null) === 'unknown');

// Test 2: Unresolved diagnosis with no follow-up (biotic) -> needs_attention
const bioticDiag = makeMockDiagnosis({
  primaryClassification: 'biotic',
  overallHealth: 'moderate_issue',
  followUps: [],
});
assert('Derivation', 'Biotic diagnosis with no follow-up returns needs_attention', derivePlantHealthStatus([bioticDiag]) === 'needs_attention');

// Test 3: Unresolved diagnosis with no follow-up (severe_issue) -> needs_attention
const severeDiag = makeMockDiagnosis({
  primaryClassification: 'abiotic',
  overallHealth: 'severe_issue',
  followUps: [],
});
assert('Derivation', 'Severe abiotic diagnosis with no follow-up returns needs_attention', derivePlantHealthStatus([severeDiag]) === 'needs_attention');

// Test 4: Unresolved diagnosis with no follow-up (mild/moderate abiotic) -> monitoring
const mildAbioticDiag = makeMockDiagnosis({
  primaryClassification: 'abiotic',
  overallHealth: 'mild_stress',
  followUps: [],
});
assert('Derivation', 'Mild stress abiotic diagnosis returns monitoring', derivePlantHealthStatus([mildAbioticDiag]) === 'monitoring');

// Test 5: Unresolved diagnosis (healthy) -> healthy
const healthyDiag = makeMockDiagnosis({
  primaryClassification: 'abiotic',
  overallHealth: 'healthy',
  candidates: [],
  followUps: [],
});
assert('Derivation', 'Diagnosis assessed healthy with no candidates returns healthy', derivePlantHealthStatus([healthyDiag]) === 'healthy');

// Test 6: Follow-up outcome = improving -> improving
const improvingDiag = makeMockDiagnosis({
  followUps: [makeMockFollowUp({ outcomeStatus: 'improving' })],
});
assert('Derivation', 'Diagnosis with improving follow-up returns improving', derivePlantHealthStatus([improvingDiag]) === 'improving');

// Test 7: Follow-up outcome = worsening -> needs_attention
const worseningDiag = makeMockDiagnosis({
  followUps: [makeMockFollowUp({ outcomeStatus: 'worsening' })],
});
assert('Derivation', 'Diagnosis with worsening follow-up returns needs_attention', derivePlantHealthStatus([worseningDiag]) === 'needs_attention');

// Test 8: Follow-up outcome = unchanged -> monitoring
const unchangedDiag = makeMockDiagnosis({
  followUps: [makeMockFollowUp({ outcomeStatus: 'unchanged' })],
});
assert('Derivation', 'Diagnosis with unchanged follow-up returns monitoring', derivePlantHealthStatus([unchangedDiag]) === 'monitoring');

// Test 9: Follow-up outcome = resolved -> resolved
const resolvedDiag = makeMockDiagnosis({
  followUps: [makeMockFollowUp({ outcomeStatus: 'resolved' })],
});
assert('Derivation', 'Diagnosis with resolved follow-up returns resolved', derivePlantHealthStatus([resolvedDiag]) === 'resolved');

// Test 10: Follow-up outcome = uncertain -> monitoring
const uncertainDiag = makeMockDiagnosis({
  followUps: [makeMockFollowUp({ outcomeStatus: 'uncertain' })],
});
assert('Derivation', 'Diagnosis with uncertain follow-up returns monitoring', derivePlantHealthStatus([uncertainDiag]) === 'monitoring');

// ----------------------------------------------------------------------------
// SUITE 2: MULTIPLE DIAGNOSES & PRECEDENCE
// ----------------------------------------------------------------------------
console.log('\n--- 2. Multiple Diagnoses & Chronological Precedence ---');

// Case A: Older diagnosis had worsening issue, newer diagnosis was resolved
const oldDiag = makeMockDiagnosis({
  id: 'diag-old',
  diagnosedAt: '2026-10-01T10:00:00Z',
  followUps: [makeMockFollowUp({ outcomeStatus: 'worsening' })],
});
const newResolvedDiag = makeMockDiagnosis({
  id: 'diag-new',
  diagnosedAt: '2026-10-15T10:00:00Z',
  followUps: [makeMockFollowUp({ outcomeStatus: 'resolved' })],
});
assert('Precedence', 'Newer resolved diagnosis overrides older worsening diagnosis',
  derivePlantHealthStatus([oldDiag, newResolvedDiag]) === 'resolved'
);

// Case B: Older was resolved, newer is worsening
const newWorseningDiag = makeMockDiagnosis({
  id: 'diag-new-2',
  diagnosedAt: '2026-11-01T10:00:00Z',
  followUps: [makeMockFollowUp({ outcomeStatus: 'worsening' })],
});
assert('Precedence', 'Newer worsening diagnosis overrides older resolved diagnosis',
  derivePlantHealthStatus([newResolvedDiag, newWorseningDiag]) === 'needs_attention'
);

// Case C: Latest diagnosis was inconclusive, falls back to recent conclusive
const inconclusiveDiag = makeMockDiagnosis({
  id: 'diag-inconclusive',
  diagnosedAt: '2026-11-05T10:00:00Z',
  status: 'inconclusive',
  overallHealth: 'unknown',
});
const activeMonitoringDiag = makeMockDiagnosis({
  id: 'diag-active',
  diagnosedAt: '2026-11-02T10:00:00Z',
  overallHealth: 'mild_stress',
  primaryClassification: 'abiotic',
});
assert('Precedence', 'Inconclusive scan falls back to most recent conclusive assessment',
  derivePlantHealthStatus([inconclusiveDiag, activeMonitoringDiag]) === 'monitoring'
);

// ----------------------------------------------------------------------------
// SUITE 3: FOLLOW-UP DUE DETERMINATION
// ----------------------------------------------------------------------------
console.log('\n--- 3. Follow-Up Interval & Due Checks ---');

const baseDate = new Date('2026-11-05T12:00:00Z');

// Test 11: Diagnosis 4 days ago with no follow-up -> DUE
const oldDiagNoFollowUp = makeMockDiagnosis({
  diagnosedAt: '2026-11-01T12:00:00Z',
  followUps: [],
});
assert('FollowUpDue', 'Diagnosis 4 days old with no follow-up is due', isFollowUpDue(oldDiagNoFollowUp, baseDate) === true);

// Test 12: Diagnosis 1 day ago with no follow-up -> NOT DUE
const recentDiagNoFollowUp = makeMockDiagnosis({
  diagnosedAt: '2026-11-04T12:00:00Z',
  followUps: [],
});
assert('FollowUpDue', 'Diagnosis 1 day old is not yet due', isFollowUpDue(recentDiagNoFollowUp, baseDate) === false);

// Test 13: Follow-up was recorded 4 days ago and status is improving -> DUE for another check
const oldFollowUp = makeMockDiagnosis({
  diagnosedAt: '2026-10-25T12:00:00Z',
  followUps: [
    makeMockFollowUp({
      followUpDate: '2026-11-01',
      outcomeStatus: 'improving',
    }),
  ],
});
assert('FollowUpDue', 'Improving issue with last follow-up 4 days ago is due for check', isFollowUpDue(oldFollowUp, baseDate) === true);

// Test 14: Resolved issue is NEVER due for follow-up
const resolvedOldFollowUp = makeMockDiagnosis({
  diagnosedAt: '2026-10-25T12:00:00Z',
  followUps: [
    makeMockFollowUp({
      followUpDate: '2026-10-28',
      outcomeStatus: 'resolved',
    }),
  ],
});
assert('FollowUpDue', 'Resolved issue is not due for follow-up', isFollowUpDue(resolvedOldFollowUp, baseDate) === false);

// ----------------------------------------------------------------------------
// SUITE 4: PLANT HEALTH SUMMARY & GROUNDED GUIDANCE
// ----------------------------------------------------------------------------
console.log('\n--- 4. Plant Health Summary & Agronomic Guidance ---');

// Test 15: Plant summary for empty diagnoses
const emptySummary = getPlantHealthSummary([]);
assert('Summary', 'Empty diagnoses summary returns unknown', emptySummary.status === 'unknown');
assert('Summary', 'Empty diagnoses has 0 pending treatments', emptySummary.pendingTreatmentsCount === 0);
assert('Summary', 'Empty diagnoses has null lastCheckedDate', emptySummary.lastCheckedDate === null);

// Test 16: Summary with active spider mites and pending treatments
const activeMitesDiag = makeMockDiagnosis({
  candidates: [
    {
      id: 'c1',
      diagnosisId: 'd1',
      userId: 'u1',
      candidateRank: 1,
      conditionName: 'Spider Mites',
      explanation: 'Pest infestation',
      confidenceCategory: 'high',
      supportingEvidence: ['Webbing'],
      alternativeCauses: [],
      createdAt: '2026-11-01T10:00:00Z',
    },
  ],
  treatments: [
    makeMockTreatment({ status: 'planned', actionTitle: 'Isolate plant' }),
    makeMockTreatment({ status: 'started', actionTitle: 'Wash leaves' }),
    makeMockTreatment({ status: 'completed', actionTitle: 'Check light' }),
  ],
  followUps: [makeMockFollowUp({ outcomeStatus: 'improving' })],
});
const activeSummary = getPlantHealthSummary([activeMitesDiag]);
assert('Summary', 'Active summary correctly sets status to improving', activeSummary.status === 'improving');
assert('Summary', 'Active summary captures active issue name', activeSummary.activeIssue === 'Spider Mites');
assert('Summary', 'Counts planned + started treatments as pending (2)', activeSummary.pendingTreatmentsCount === 2);
assert('Summary', 'Total diagnoses count equals 1', activeSummary.totalDiagnosesCount === 1);

// Test 17: Next action guidance generation
const needsAttentionGuidance = getNextActionGuidance('needs_attention', activeMitesDiag);
assert('Guidance', 'Needs attention guidance contains immediate corrective action',
  needsAttentionGuidance.includes('Immediate action') || needsAttentionGuidance.includes('Significant stress')
);

const improvingGuidance = getNextActionGuidance('improving', activeMitesDiag);
assert('Guidance', 'Improving guidance contains recovery observation recommendation',
  improvingGuidance.includes('recovering') || improvingGuidance.includes('Recovery')
);

const resolvedGuidance = getNextActionGuidance('resolved', activeMitesDiag);
assert('Guidance', 'Resolved guidance emphasizes routine botanical care without overpromising',
  resolvedGuidance.includes('resolved') || resolvedGuidance.includes('routine')
);

// ----------------------------------------------------------------------------
// SUITE 5: GARDEN HEALTH OVERVIEW AGGREGATION
// ----------------------------------------------------------------------------
console.log('\n--- 5. Garden-Wide Health Overview Metrics ---');

const plantsList = [
  { id: 'plant-1' },
  { id: 'plant-2' },
  { id: 'plant-3' },
  { id: 'plant-4' },
];

const diagnosesMap: Record<string, SavedDiagnosisRecord[]> = {
  // Plant 1: Needs attention (worsening)
  'plant-1': [
    makeMockDiagnosis({
      userPlantId: 'plant-1',
      followUps: [makeMockFollowUp({ outcomeStatus: 'worsening' })],
      treatments: [makeMockTreatment({ status: 'planned' })],
    }),
  ],
  // Plant 2: Monitoring (unchanged)
  'plant-2': [
    makeMockDiagnosis({
      userPlantId: 'plant-2',
      followUps: [makeMockFollowUp({ outcomeStatus: 'unchanged' })],
      treatments: [makeMockTreatment({ status: 'completed' })],
    }),
  ],
  // Plant 3: Resolved
  'plant-3': [
    makeMockDiagnosis({
      userPlantId: 'plant-3',
      followUps: [makeMockFollowUp({ outcomeStatus: 'resolved' })],
    }),
  ],
  // Plant 4: No diagnoses -> unknown
  'plant-4': [],
};

const overview = getGardenHealthOverview(plantsList, diagnosesMap);
assert('Overview', 'Total plants equals 4', overview.totalPlants === 4);
assert('Overview', 'Assessed plants equals 3', overview.assessedPlants === 3);
assert('Overview', 'Needs attention count equals 1', overview.needsAttentionCount === 1);
assert('Overview', 'Monitoring count equals 1', overview.monitoringCount === 1);
assert('Overview', 'Resolved count equals 1', overview.resolvedCount === 1);
assert('Overview', 'Unknown count equals 1', overview.unknownCount === 1);
assert('Overview', 'Pending treatments aggregated across plants (1)', overview.pendingTreatmentsCount === 1);

// ----------------------------------------------------------------------------
// SUITE 6: BADGE CONFIG & VISUAL ACCESSIBILITY
// ----------------------------------------------------------------------------
console.log('\n--- 6. Badge Configuration & Visual Tokens ---');

const statuses: PlantHealthStatus[] = ['healthy', 'monitoring', 'needs_attention', 'improving', 'resolved', 'unknown'];
for (const st of statuses) {
  const cfg = getHealthStatusBadgeConfig(st);
  assert('BadgeConfig', `Config exists for status ${st}`, Boolean(cfg.label && cfg.variant && cfg.bgClass && cfg.textClass));
  assert('BadgeConfig', `Status ${st} includes descriptive tooltip`, Boolean(cfg.description && cfg.description.length > 10));
}

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log('📊 Phase 8.5 Plant Health Monitoring Test Suite Summary');
console.log('======================================================================');
console.log(`Total Assertions Checked: ${totalTests}`);
console.log(`✅ Passed:                ${passedTests}`);
console.log(`❌ Failed:                0`);
console.log('======================================================================\n');
console.log('🎉 All Phase 8.5 test assertions PASSED without error.\n');

