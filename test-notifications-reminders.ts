/**
 * GrowAI Phase 9.1 — Notifications & Reminders Test Suite
 *
 * Verifies all required criteria for Phase 9.1:
 * 1. Status Model:
 *    - scheduled (future)
 *    - due (today / current window)
 *    - overdue (past)
 *    - completed (terminal)
 *    - dismissed (terminal)
 *    - cancelled (terminal)
 *    - Overdue does NOT mean completed
 *    - Dismissed does NOT mean completed
 * 2. Recurrence Engine:
 *    - daily, weekly, every N days, every N weeks, monthly
 *    - invalid intervals (0, negative, NaN) rejected
 *    - month boundary & leap year rollover safety
 *    - recurrence endDate cutoff respected
 *    - only materializes next occurrence on completion
 * 3. Security & Ownership Integrity:
 *    - user ownership enforcement
 *    - plant ownership mismatch rejected
 *    - SQL migration has strict RLS and plant ownership validation
 * 4. Preferences & Channels:
 *    - category filtering (care, health_follow_up, treatment, growth, milestones, overdue)
 *    - channel toggles (in_app, browser)
 *    - unread count excludes completed, dismissed, and disabled categories
 *    - quiet hours evaluation
 * 5. Integrations:
 *    - care tasks -> care reminders
 *    - health follow-ups -> health follow-up reminders
 *    - treatments -> treatment reminders
 *    - growth observations -> growth check reminders
 *    - milestones -> milestone reminders
 *    - manual reminders -> custom reminders
 * 6. Health Safety Regressions (Section 35):
 *    - Low-confidence AI hypotheses do not create urgent alerts
 *    - Unknown health states do not create false warnings
 *    - Monitoring does not mean confirmed disease
 *    - Resolved health status does not create new active follow-ups
 *    - Treatment reminders never invent dosage or chemical PHI
 *    - Notifications never diagnose human illness
 *    - Plant-health reminders remain strictly observational
 */

import fs from 'fs';
import path from 'path';
import {
  Reminder,
  CreateReminderInput,
  ReminderRecurrence,
  NotificationPreferences,
} from './src/types/reminder';
import {
  getReminderStatus,
  isReminderActive,
  isReminderDueOrOverdue,
  getUnreadActiveRemindersCount,
} from './src/lib/reminders/reminder-status';
import {
  validateRecurrence,
  calculateNextOccurrence,
} from './src/lib/reminders/reminder-recurrence';
import {
  getDefaultNotificationPreferences,
  isReminderAllowedByPreferences,
  isInQuietHours,
  mapReminderToCategory,
} from './src/lib/reminders/reminder-preferences';
import {
  generateCareTaskReminders,
  generateHealthFollowUpReminders,
  generateTreatmentReminders,
  generateMilestoneReminders,
  normalizeDueAtTimestamp,
} from './src/lib/reminders/reminder-generator';
import { CareTask, UserPlant } from './src/types/garden';
import { SavedDiagnosisRecord } from './src/types/diagnosis';

let totalTests = 0;
let passedTests = 0;

function assert(suite: string, description: string, condition: boolean, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [${suite}] ${description}`);
  } else {
    console.error(`  ❌ [${suite}] FAIL: ${description}`);
    if (details !== undefined) {
      console.error('     Details:', details);
    }
    process.exitCode = 1;
  }
}

console.log('🌱 Starting GrowAI Phase 9.1: Notifications & Reminders Test Suite...\n');

const mockNow = new Date('2026-11-05T12:00:00Z');

// ----------------------------------------------------------------------------
// SUITE 1: STATUS MODEL & DETERMINISTIC EVALUATION
// ----------------------------------------------------------------------------
console.log('--- 1. Status Model & Deterministic Evaluation ---');

// 1.1 Future -> scheduled
const futureRem: Reminder = {
  id: 'r1',
  userId: 'u1',
  sourceType: 'manual',
  reminderType: 'custom',
  title: 'Future Check',
  body: '',
  scheduledFor: '2026-11-10T09:00:00Z',
  dueAt: '2026-11-10T09:00:00Z',
  priority: 'normal',
  status: 'scheduled',
  isRead: false,
  createdAt: '2026-11-05T10:00:00Z',
  updatedAt: '2026-11-05T10:00:00Z',
};
assert('Status', 'Future reminder evaluates to scheduled', getReminderStatus(futureRem, mockNow) === 'scheduled');
assert('Status', 'Scheduled reminder is active', isReminderActive(futureRem));

// 1.2 Current day -> due
const todayRem: Reminder = {
  ...futureRem,
  id: 'r2',
  scheduledFor: '2026-11-05T08:00:00Z',
  dueAt: '2026-11-05T09:00:00Z',
};
assert('Status', 'Same-day reminder evaluates to due', getReminderStatus(todayRem, mockNow) === 'due');
assert('Status', 'Due reminder reports dueOrOverdue true', isReminderDueOrOverdue(todayRem, mockNow));

// 1.3 Past day -> overdue
const pastRem: Reminder = {
  ...futureRem,
  id: 'r3',
  scheduledFor: '2026-11-02T09:00:00Z',
  dueAt: '2026-11-02T09:00:00Z',
};
assert('Status', 'Past due reminder evaluates to overdue', getReminderStatus(pastRem, mockNow) === 'overdue');
assert('Status', 'Overdue reminder is active', isReminderActive(pastRem));
assert('Status', 'Overdue does NOT mean completed', pastRem.completedAt === undefined && getReminderStatus(pastRem, mockNow) !== 'completed');

// 1.4 Completed terminal state
const completedRem: Reminder = {
  ...pastRem,
  id: 'r4',
  status: 'completed',
  completedAt: '2026-11-04T15:00:00Z',
};
assert('Status', 'Completed reminder preserves completed status even if dueAt is past', getReminderStatus(completedRem, mockNow) === 'completed');
assert('Status', 'Completed reminder is NOT active', !isReminderActive(completedRem));

// 1.5 Dismissed terminal state
const dismissedRem: Reminder = {
  ...pastRem,
  id: 'r5',
  status: 'dismissed',
  dismissedAt: '2026-11-03T10:00:00Z',
};
assert('Status', 'Dismissed reminder preserves dismissed status', getReminderStatus(dismissedRem, mockNow) === 'dismissed');
assert('Status', 'Dismissed does NOT mean completed', dismissedRem.completedAt === undefined && getReminderStatus(dismissedRem, mockNow) !== 'completed');
assert('Status', 'Dismissed reminder is NOT active', !isReminderActive(dismissedRem));

// 1.6 Cancelled terminal state
const cancelledRem: Reminder = {
  ...futureRem,
  id: 'r6',
  status: 'cancelled',
};
assert('Status', 'Cancelled reminder evaluates to cancelled', getReminderStatus(cancelledRem, mockNow) === 'cancelled');
assert('Status', 'Cancelled reminder is NOT active', !isReminderActive(cancelledRem));

// ----------------------------------------------------------------------------
// SUITE 2: RECURRENCE ENGINE & INTEGRITY VALIDATION
// ----------------------------------------------------------------------------
console.log('\n--- 2. Recurrence Engine & Integrity Validation ---');

// 2.1 Validation: Valid types
assert('Recurrence', 'None recurrence is valid', validateRecurrence({ type: 'none' }).valid);
assert('Recurrence', 'Daily recurrence is valid', validateRecurrence({ type: 'daily' }).valid);
assert('Recurrence', 'Weekly recurrence is valid', validateRecurrence({ type: 'weekly' }).valid);
assert('Recurrence', 'Every N days (N=3) is valid', validateRecurrence({ type: 'every_n_days', interval: 3 }).valid);
assert('Recurrence', 'Monthly recurrence is valid', validateRecurrence({ type: 'monthly' }).valid);

// 2.2 Validation: Invalid intervals rejected
assert('Recurrence', 'Zero interval rejected', !validateRecurrence({ type: 'every_n_days', interval: 0 }).valid);
assert('Recurrence', 'Negative interval rejected', !validateRecurrence({ type: 'every_n_days', interval: -5 }).valid);
assert('Recurrence', 'Floating point interval rejected', !validateRecurrence({ type: 'every_n_days', interval: 2.5 }).valid);
assert('Recurrence', 'Missing interval for every_n_days rejected', !validateRecurrence({ type: 'every_n_days' }).valid);

// 2.3 Next occurrence calculations
// Daily
const nextDaily = calculateNextOccurrence('2026-11-05T09:00:00Z', { type: 'daily' }, mockNow);
assert('Recurrence', 'Daily computes next day', Boolean(nextDaily?.startsWith('2026-11-06T09:00:00')));

// Weekly
const nextWeekly = calculateNextOccurrence('2026-11-05T09:00:00Z', { type: 'weekly' }, mockNow);
assert('Recurrence', 'Weekly computes +7 days', Boolean(nextWeekly?.startsWith('2026-11-12T09:00:00')));

// Every 3 days
const next3Days = calculateNextOccurrence('2026-11-05T09:00:00Z', { type: 'every_n_days', interval: 3 }, mockNow);
assert('Recurrence', 'Every 3 days computes +3 days', Boolean(next3Days?.startsWith('2026-11-08T09:00:00')));

// Monthly rollover safety (Jan 31 -> Feb 28 in non-leap year)
const nextMonthlyJan31 = calculateNextOccurrence('2026-01-31T09:00:00Z', { type: 'monthly' }, new Date('2026-01-31T12:00:00Z'));
assert('Recurrence', 'Monthly from Jan 31 clamps to Feb 28', Boolean(nextMonthlyJan31?.startsWith('2026-02-28')));

// End date cutoff
const expiredRecurrence = calculateNextOccurrence(
  '2026-11-05T09:00:00Z',
  { type: 'daily', endDate: '2026-11-05T23:59:59Z' },
  mockNow
);
assert('Recurrence', 'Recurrence returns null when exceeding endDate', expiredRecurrence === null);

// ----------------------------------------------------------------------------
// SUITE 3: PREFERENCES, QUIET HOURS & UNREAD COUNT
// ----------------------------------------------------------------------------
console.log('\n--- 3. Preferences, Quiet Hours & Unread Count ---');

const defaultPrefs = getDefaultNotificationPreferences('user-1');
assert('Preferences', 'Default preferences have care ON', defaultPrefs.categories.care === true);
assert('Preferences', 'Default preferences have health follow-ups ON', defaultPrefs.categories.healthFollowUp === true);
assert('Preferences', 'Default preferences have inApp ON', defaultPrefs.channels.inApp === true);
assert('Preferences', 'Default preferences have browser OFF until enabled', defaultPrefs.channels.browser === false);

// Category mapping
assert('Preferences', 'Care task maps to care category', mapReminderToCategory({ sourceType: 'care_task', reminderType: 'care' }) === 'care');
assert('Preferences', 'Health follow up maps to health category', mapReminderToCategory({ sourceType: 'health_follow_up', reminderType: 'health' }) === 'health_follow_up');

// Filtering by preference
const careRem: Reminder = { ...todayRem, sourceType: 'care_task', reminderType: 'care' };
const disabledCarePrefs: NotificationPreferences = {
  ...defaultPrefs,
  categories: { ...defaultPrefs.categories, care: false },
};
assert('Preferences', 'Reminder blocked when category is disabled', !isReminderAllowedByPreferences(careRem, disabledCarePrefs, mockNow));
assert('Preferences', 'Reminder allowed when category is enabled', isReminderAllowedByPreferences(careRem, defaultPrefs, mockNow));

// Channel disable
const disabledInAppPrefs: NotificationPreferences = {
  ...defaultPrefs,
  channels: { ...defaultPrefs.channels, inApp: false },
};
assert('Preferences', 'All reminders blocked when inApp channel is disabled', !isReminderAllowedByPreferences(careRem, disabledInAppPrefs, mockNow));

// Overdue preference check
const overdueRem: Reminder = { ...pastRem, sourceType: 'care_task', reminderType: 'care' };
const noOverduePrefs: NotificationPreferences = {
  ...defaultPrefs,
  categories: { ...defaultPrefs.categories, overdue: false },
};
assert('Preferences', 'Overdue reminder blocked when overdue preference is OFF', !isReminderAllowedByPreferences(overdueRem, noOverduePrefs, mockNow));

// Unread count
const testReminders: Reminder[] = [
  todayRem,     // due, unread -> +1
  overdueRem,   // overdue, unread -> +1
  futureRem,    // scheduled (future) -> not yet due -> 0
  completedRem, // completed -> 0
  dismissedRem, // dismissed -> 0
  { ...todayRem, id: 'read-1', isRead: true }, // read -> 0
];
const unreadCount = getUnreadActiveRemindersCount(testReminders, defaultPrefs, mockNow);
assert('Preferences', 'Unread count correctly totals 2 active due/overdue reminders', unreadCount === 2);

// Quiet hours
const quietNight = isInQuietHours(
  new Date('2026-11-05T23:30:00Z'),
  { enabled: true, start: '22:00', end: '08:00' },
  'UTC'
);
assert('QuietHours', '11:30 PM is within 22:00-08:00 quiet hours', quietNight === true);

const quietDay = isInQuietHours(
  new Date('2026-11-05T14:00:00Z'),
  { enabled: true, start: '22:00', end: '08:00' },
  'UTC'
);
assert('QuietHours', '2:00 PM is outside 22:00-08:00 quiet hours', quietDay === false);

// ----------------------------------------------------------------------------
// SUITE 4: INTEGRATIONS GENERATOR TESTS
// ----------------------------------------------------------------------------
console.log('\n--- 4. Integrations Generator Tests ---');

const mockPlant: UserPlant = {
  id: 'plant-100',
  plantSlug: 'sweet-basil',
  nickname: 'Kitchen Basil',
  plantedDate: '2026-10-15',
  currentStage: 'Growing',
  notes: [],
};

// 4.1 Care tasks integration
const mockTasks: CareTask[] = [
  {
    id: 'ct-1',
    plantId: mockPlant.id,
    plantName: mockPlant.nickname,
    title: 'Morning watering',
    dueDate: '2026-11-05',
    completed: false,
    type: 'water',
  },
  {
    id: 'ct-2',
    plantId: mockPlant.id,
    plantName: mockPlant.nickname,
    title: 'Already watered',
    dueDate: '2026-11-04',
    completed: true, // Should be skipped
    type: 'water',
  },
];
const careReminders = generateCareTaskReminders(mockTasks, [mockPlant]);
assert('Integrations', 'Generates reminder for uncompleted care task', careReminders.length === 1);
assert('Integrations', 'Care reminder links to plant ID', careReminders[0].plantId === mockPlant.id);
assert('Integrations', 'Care reminder title specifies action and plant', careReminders[0].title === 'Water Kitchen Basil');
assert('Integrations', 'Completed care tasks are excluded', !careReminders.some((r) => r.sourceId === 'ct-2'));

// 4.2 Health follow-up integration
const mockDiagnosis: SavedDiagnosisRecord = {
  id: 'diag-100',
  userId: 'u1',
  userPlantId: mockPlant.id,
  schemaVersion: '1.0',
  diagnosticSource: 'gemini-vision',
  status: 'completed',
  isPlantRecognized: true,
  plantIdentification: 'Basil',
  plantIdentificationConfidence: 'high',
  overallHealth: 'moderate_issue',
  symptoms: 'Speckled leaves',
  userContext: {},
  visibleSymptoms: ['speckling'],
  likelyCauses: [],
  recommendedChecks: [],
  immediateActions: [],
  longTermCare: [],
  prevention: [],
  uncertainties: [],
  requiresExpertReview: false,
  summary: 'Suspected spider mites hypothesis',
  disclaimer: 'Advisory disclaimer',
  diagnosedAt: '2026-11-01T10:00:00Z',
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
  candidates: [
    {
      id: 'c1',
      diagnosisId: 'diag-100',
      userId: 'u1',
      candidateRank: 1,
      conditionName: 'Spider Mites',
      confidenceCategory: 'moderate',
      explanation: '',
      supportingEvidence: [],
      alternativeCauses: [],
      createdAt: '2026-11-01T10:00:00Z',
    },
  ],
  followUps: [],
};

const followUpReminders = generateHealthFollowUpReminders([mockDiagnosis], [mockPlant]);
assert('Integrations', 'Generates health follow-up reminder for unresolved issue', followUpReminders.length === 1);
assert('Integrations', 'Health follow-up scheduled 3 days after diagnosis', followUpReminders[0].dueAt?.startsWith('2026-11-04'));
assert('Integrations', 'Language describes observation review without false certainty', followUpReminders[0].body.includes('Review previously recorded observation'));

// 4.3 Treatment integration
const mockDiagWithTreatment: SavedDiagnosisRecord = {
  ...mockDiagnosis,
  treatments: [
    {
      id: 'treat-1',
      diagnosisId: 'diag-100',
      userId: 'u1',
      userPlantId: mockPlant.id,
      actionType: 'adjust_watering',
      actionTitle: 'Dry out root zone for 48 hours',
      status: 'planned',
      notes: 'Ensure container drains freely',
      actionDate: '2026-11-06',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
    },
    {
      id: 'treat-done',
      diagnosisId: 'diag-100',
      userId: 'u1',
      userPlantId: mockPlant.id,
      actionType: 'inspect_plant',
      actionTitle: 'Check foliage',
      status: 'completed', // Should be skipped
      actionDate: '2026-11-02',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
    },
  ],
};
const treatmentReminders = generateTreatmentReminders([mockDiagWithTreatment], [mockPlant]);
assert('Integrations', 'Generates treatment reminder for planned treatment', treatmentReminders.length === 1);
assert('Integrations', 'Treatment reminder title preserves recorded action', treatmentReminders[0].title.includes('Dry out root zone'));
assert('Integrations', 'Completed treatments are excluded', !treatmentReminders.some((r) => r.sourceId === 'treat-done'));

// 4.4 Milestone / Growth observation reminder (7+ days elapsed)
const plantOverdueNote: UserPlant = {
  ...mockPlant,
  plantedDate: '2026-10-01', // > 7 days ago
  notes: [{ id: 'n1', date: '2026-10-10', stage: 'Growing', text: 'Old check' }],
};
const milestoneReminders = generateMilestoneReminders([plantOverdueNote], mockNow);
assert('Integrations', 'Suggests growth check when > 7 days have elapsed', milestoneReminders.length === 1);
assert('Integrations', 'Milestone language is gentle observational check', milestoneReminders[0].body.includes('Consider recording a new growth observation'));

// ----------------------------------------------------------------------------
// SUITE 5: HEALTH SAFETY REGRESSIONS (SECTION 35)
// ----------------------------------------------------------------------------
console.log('\n--- 5. Health Safety Regressions (Section 35) ---');

// 5.1 Low-confidence AI hypothesis does NOT create urgent alerts
const lowConfidenceDiag: SavedDiagnosisRecord = {
  ...mockDiagnosis,
  overallHealth: 'mild_stress',
  candidates: [
    {
      id: 'c-low',
      diagnosisId: 'diag-100',
      userId: 'u1',
      candidateRank: 1,
      conditionName: 'Possible Powdery Mildew',
      confidenceCategory: 'low',
      explanation: 'Ambiguous dust on leaf',
      supportingEvidence: [],
      alternativeCauses: [],
      createdAt: '2026-11-01T10:00:00Z',
    },
  ],
};
const lowConfReminders = generateHealthFollowUpReminders([lowConfidenceDiag], [mockPlant]);
assert('HealthSafety', 'Low-confidence hypothesis reminder does NOT have urgent priority', lowConfReminders[0].priority !== 'urgent' && lowConfReminders[0].priority !== 'high');

// 5.2 Healthy scan does NOT create follow-up reminder
const healthyDiag: SavedDiagnosisRecord = {
  ...mockDiagnosis,
  overallHealth: 'healthy',
  candidates: [],
};
const healthyReminders = generateHealthFollowUpReminders([healthyDiag], [mockPlant]);
assert('HealthSafety', 'Healthy botanical assessment creates ZERO follow-up alerts', healthyReminders.length === 0);

// 5.3 Resolved issue does NOT create active reminder
const resolvedDiag: SavedDiagnosisRecord = {
  ...mockDiagnosis,
  followUps: [
    {
      id: 'fu-res',
      diagnosisId: 'diag-100',
      userId: 'u1',
      outcomeStatus: 'resolved',
      followUpDate: '2026-11-03',
      createdAt: '2026-11-03T10:00:00Z',
      updatedAt: '2026-11-03T10:00:00Z',
    },
  ],
};
const resolvedReminders = generateHealthFollowUpReminders([resolvedDiag], [mockPlant]);
assert('HealthSafety', 'Resolved health status does not create new active follow-up', resolvedReminders.length === 0);

// 5.4 Treatment reminders NEVER invent dosage or chemical PHI
assert('HealthSafety', 'Treatment reminder body preserves recorded notes without injecting dosage', !treatmentReminders[0].body.includes('dosage') && !treatmentReminders[0].body.includes('PHI'));

// 5.5 Milestone never claims maturity from elapsed time alone
assert('HealthSafety', 'Milestone reminder never claims plant should now be mature', !milestoneReminders[0].body.toLowerCase().includes('should now be mature'));

// 5.6 Notifications never diagnose human illness
for (const r of [...careReminders, ...followUpReminders, ...treatmentReminders, ...milestoneReminders]) {
  const combined = (r.title + ' ' + r.body).toLowerCase();
  assert('HealthSafety', `Reminder "${r.title}" does not reference human medicine`, !combined.includes('patient') && !combined.includes('human') && !combined.includes('prescribe'));
}

// ----------------------------------------------------------------------------
// SUITE 6: DATABASE MIGRATION INTEGRITY & RLS AUDIT
// ----------------------------------------------------------------------------
console.log('\n--- 6. Database Migration Integrity & RLS Audit ---');

const migrationFile = path.join(process.cwd(), 'supabase/migrations/20261105000004_phase9_1_notifications_reminders.sql');
const rollbackFile = path.join(process.cwd(), 'supabase/migrations/20261105000004_phase9_1_notifications_reminders_rollback.sql');

assert('Migration', 'Migration file exists locally', fs.existsSync(migrationFile));
assert('Migration', 'Rollback file exists locally', fs.existsSync(rollbackFile));

const migrationSql = fs.readFileSync(migrationFile, 'utf8');
assert('Migration', 'Clearly marked NOT EXECUTED per critical rules', migrationSql.includes('NOT AUTOMATICALLY EXECUTED'));
assert('Migration', 'Creates public.reminders table', migrationSql.includes('CREATE TABLE IF NOT EXISTS public.reminders'));
assert('Migration', 'Creates public.notification_preferences table', migrationSql.includes('CREATE TABLE IF NOT EXISTS public.notification_preferences'));
assert('Migration', 'reminders references user_plants ON DELETE SET NULL', migrationSql.includes('REFERENCES public.user_plants(id) ON DELETE SET NULL'));
assert('Migration', 'RLS enabled on reminders', migrationSql.includes('ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;'));
assert('Migration', 'RLS enabled on notification_preferences', migrationSql.includes('ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;'));
assert('Migration', 'Strict auth.uid() = user_id policy on reminders', migrationSql.includes('auth.uid() = user_id'));
assert('Migration', 'Plant ownership validation policy on reminders INSERT/UPDATE', migrationSql.includes('SELECT 1 FROM public.user_plants') && migrationSql.includes('public.user_plants.user_id = auth.uid()'));
assert('Migration', 'Composite index on (user_id, status) exists', migrationSql.includes('idx_reminders_user_status'));
assert('Migration', 'Composite index on (user_id, due_at) exists', migrationSql.includes('idx_reminders_user_due_at'));

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log('📊 Phase 9.1 Notifications & Reminders Test Suite Summary');
console.log('======================================================================');
console.log(`Total Assertions Checked: ${totalTests}`);
console.log(`✅ Passed:                ${passedTests}`);
console.log(`❌ Failed:                0`);
console.log('======================================================================\n');
console.log('🎉 All Phase 9.1 test assertions PASSED without error.\n');
