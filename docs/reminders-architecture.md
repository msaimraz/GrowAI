# GrowAI Reminders & Notifications Architecture Guide

GrowAI Phase 9.1 introduces a generic, reusable reminder and notification engine designed to serve existing features (care tasks, health follow-ups, treatments, growth observations, milestones) and all future horticultural features without duplicate notification subsystems.

---

## 1. Core Architecture

The system centers on two persistent domain models:

### `Reminder`
```typescript
interface Reminder {
  id: string;
  userId: string;
  plantId?: string | null;
  plantNickname?: string | null;
  plantSlug?: string | null;
  sourceType: ReminderSourceType;
  sourceId?: string | null;
  reminderType: ReminderType;
  title: string;
  body: string;
  scheduledFor: string; // ISO 8601 timestamp
  dueAt: string;        // ISO 8601 timestamp
  recurrence?: ReminderRecurrence | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'scheduled' | 'due' | 'overdue' | 'completed' | 'dismissed' | 'cancelled';
  completedAt?: string | null;
  dismissedAt?: string | null;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### `NotificationPreferences`
```typescript
interface NotificationPreferences {
  userId: string;
  categories: {
    care: boolean;
    healthFollowUp: boolean;
    treatment: boolean;
    growth: boolean;
    milestones: boolean;
    overdue: boolean;
  };
  channels: {
    inApp: boolean;
    browser: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // e.g. "22:00"
    end: string;   // e.g. "08:00"
  };
  timezone: string;
}
```

---

## 2. Source Types & Reminder Types

### Source Types (`ReminderSourceType`)
- `care_task`: Automated or manual task scheduled in the garden.
- `health_follow_up`: Review of an ongoing plant health observation (Phase 8.5 follow-up interval).
- `treatment`: Interventions or cultural adjustments recorded for an active diagnosis.
- `growth_observation`: Prompt to record a periodic journal note or photo.
- `growth_milestone`: Review of a phenological growth stage milestone.
- `planting_milestone`: Sowing or transplant anniversary milestone.
- `health_monitoring`: General plant health check.
- `manual`: Grower-created custom reminder.

### Reminder Types (`ReminderType`)
`'care' | 'health' | 'treatment' | 'growth' | 'milestone' | 'custom'`

---

## 3. Deterministic Status Lifecycle

A reminder’s active status is computed via the pure function `getReminderStatus(reminder, now, timezone)`:

```text
       ┌───────────┐
       │ Scheduled │ (dueAt in future)
       └─────┬─────┘
             │ (time arrives)
             ▼
       ┌───────────┐
       │    Due    │ (today / active window)
       └─────┬─────┘
             │ (due date passes)
             ▼
       ┌───────────┐
       │  Overdue  │ (past due date, uncompleted)
       └─────┬─────┘
             │
   ┌─────────┴─────────┐
   │                   │
   ▼                   ▼
┌───────────┐   ┌───────────┐
│ Completed │   │ Dismissed │ (Terminal states)
└───────────┘   └───────────┘
```

### Key Safety Invariants:
1. **Overdue is NOT Completed**: An overdue reminder remains strictly active and uncompleted until the grower explicitly marks it done.
2. **Dismissed is NOT Completed**: Dismissing a notification removes it from the active drawer without falsifying cultural task completion records.
3. **Terminal Preservation**: Terminal statuses (`completed`, `dismissed`, `cancelled`) are immutable with respect to time passing.

---

## 4. Recurrence Specification

Recurrence is evaluated deterministically without materializing hundreds of future rows into the database:
- Supported: `none`, `daily`, `weekly`, `every_n_days`, `every_n_weeks`, `monthly`.
- On completion: `completeReminder(id)` marks the current instance `completed`, calculates the next occurrence timestamp (`calculateNextOccurrence`), and inserts the single next `scheduled` reminder instance.
- Safety: Intervals are validated as strictly positive integers. Month rollovers (e.g. Jan 31 + 1 month) safely clamp to month boundaries (Feb 28/29).

---

## 5. Security & Row Level Security (RLS)

1. **Authentication Boundary**: All reminders query and persist with `auth.uid() = user_id`.
2. **Plant Ownership Validation**: If `plant_id` is supplied, Supabase RLS enforces:
   ```sql
   plant_id IS NULL OR EXISTS (
     SELECT 1 FROM public.user_plants
     WHERE public.user_plants.id = plant_id
     AND public.user_plants.user_id = auth.uid()
   )
   ```
3. **No Service-Role Leakage**: Client interactions use the standard authenticated browser client.

---

## 6. How Future Features Should Create Reminders

Any future GrowAI feature (e.g., harvesting reminders, soil amendments, seasonal transitions) should import and invoke `createReminder` from `@/lib/reminders/reminder-storage`:

```typescript
import { createReminder } from '@/lib/reminders/reminder-storage';

// Example: Creating a reminder from a new feature
await createReminder({
  plantId: plant.id,
  plantNickname: plant.nickname,
  plantSlug: plant.plantSlug,
  sourceType: 'growth_observation',
  sourceId: note.id,
  reminderType: 'growth',
  title: `Check growth on ${plant.nickname}`,
  body: 'Inspect vertical canopy development and foliage density.',
  dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  recurrence: { type: 'every_n_days', interval: 7 },
  priority: 'normal',
});
```

---

## 7. Agronomic & Medical Safety Rules

1. **Never Infer Maturity from Elapsed Time**: Never generate `"Your plant should now be mature."` Reminders must remain observational (`"Consider recording a new growth observation."`).
2. **Never Treat AI Hypotheses as Confirmed Diseases**: Health follow-ups remind the user to `"Review previously recorded observation"`.
3. **Never Invent Dosages or Chemical PHI**: Treatment reminders only surface notes and interventions explicitly recorded by the grower.
4. **Never Diagnose Human Illness**: Notifications strictly address plant biology and cultural care.

