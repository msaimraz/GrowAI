# GrowAI — Phase 13: Adaptive Grow Plans & Execution System

## 1. Overview & Core Philosophy

The **GrowAI Grow Plan & Execution System** turns static botanical recommendations and dynamic intelligence signals into concrete, adaptive, step-by-step action plans for growers. Rather than introducing a redundant secondary intelligence engine, Phase 13 acts as the **execution layer** that operates on top of existing GrowAI systems:

- Botanical Catalog & Species Knowledge
- Garden State & Plant Lifecycle Tracking
- Health Diagnosis History & Follow-ups (Phase 8.4/8.5)
- Plant Timeline (Phase 9)
- Notification & Reminder Infrastructure (Phase 9.1/9.2)
- Small-Space Optimization & Production Cycles (Phase 10)
- Adaptive Grow Intelligence & Daily Grow Check (Phase 11)
- Grower Copilot & Conversational Assistance (Phase 12)

### Core Invariants & Safety Guardrails
1. **Biological Completion is Never Inferred Solely from Calendar Days**: A target date or scheduled timeline never marks a plant as "ready for harvest" or "established" without observational or physical verification.
2. **Deterministic & Grounded Provenance**: Every plan step and evidence citation retains provenance categories (`recorded`, `observed`, `calculated`, `inferred`, `recommended`, `unknown`). Unknown facts remain unknown.
3. **Explicit Confirmation for Consequential Mutations**: State mutations (`create_plan`, `pause_plan`, `resume_plan`, `complete_step`, `cancel_plan`) initiated via the Grower Copilot require explicit grower confirmation.
4. **Strict Botanical & Medical Safety**: No fabricated fertilizer or pesticide dosages. Zero guaranteed future yields. Emergency and toxic ingestion queries redirect to local emergency services and regional poison control without universally hard-coding specific country phone numbers.

---

## 2. Domain Models & Architecture

All domain models are defined in [`src/types/grow-plan.ts`](file:///c:/Users/123/Documents/GitHub/GrowAI/src/types/grow-plan.ts).

### Core Entities

- **`GrowPlan`**: Root plan entity representing a structured multi-step effort across a specific scope (`plant`, `multi_plant`, `garden`, `propagation`, `production`).
- **`GrowPlanStep`**: Granular, sequenced task belonging to a plan. Encapsulates category, status, priority, prerequisites, scheduled dates, and observation requirements.
- **`PlanProgress`**: Computed execution metrics including `totalSteps`, `completedSteps`, `completionPercentage`, `observationalProgressPercentage`, and `biologicalProgressPercentage`.
- **`PlanHealthStatus`**: Dynamic health assessment (`on_track`, `needs_attention`, `blocked`, `waiting_for_observation`, `paused`, `completed`, `unknown`).
- **`PlanAdjustmentRecord`**: Immutable log entry documenting dynamic plan adaptations, reasons, triggers, and timestamped step changes.
- **`GrowPlanEvent`**: Audit event for plan lifecycle actions (`plan_created`, `plan_step_completed`, `plan_adjusted`, `plan_paused`, etc.).

---

## 3. Storage & Production Persistence

Persistence is implemented in [`src/lib/grow-plans/storage.ts`](file:///c:/Users/123/Documents/GitHub/GrowAI/src/lib/grow-plans/storage.ts).

### Database Schema (Supabase PostgreSQL)
Migrations are defined in `supabase/migrations/20261105000006_phase13_grow_plans.sql`:

1. **`grow_plans`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `name TEXT NOT NULL`
   - `scope TEXT NOT NULL`
   - `objective TEXT NOT NULL`
   - `status TEXT NOT NULL DEFAULT 'active'`
   - `priority TEXT NOT NULL DEFAULT 'normal'`
   - `start_date TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `target_date TIMESTAMPTZ`
   - `plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE`
   - `production_cycle_id UUID REFERENCES production_cycles(id) ON DELETE SET NULL`
   - `propagation_event_id UUID REFERENCES propagation_events(id) ON DELETE SET NULL`
   - `metadata JSONB NOT NULL DEFAULT '{}'`
   - Row Level Security (RLS) enabled with user-isolated SELECT, INSERT, UPDATE, DELETE policies.

2. **`grow_plan_steps`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `plan_id UUID NOT NULL REFERENCES grow_plans(id) ON DELETE CASCADE`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `title TEXT NOT NULL`
   - `category TEXT NOT NULL`
   - `status TEXT NOT NULL DEFAULT 'pending'`
   - `priority TEXT NOT NULL DEFAULT 'normal'`
   - `requires_observation BOOLEAN NOT NULL DEFAULT false`
   - `requires_confirmation BOOLEAN NOT NULL DEFAULT false`
   - `dependency_metadata JSONB NOT NULL DEFAULT '{}'`
   - `reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL`

3. **`grow_plan_events`**:
   - Audit trail table recording all lifecycle events and adjustments per plan.

### Offline & Demo Resilience
- When authenticated and connected to Supabase, plans are persisted directly to PostgreSQL with RLS.
- When unauthenticated or offline, plans fall back transparently to `localStorage` under `growai_demo_grow_plans_v1`.
- Offline mutations (`create_plan`, `update_plan`, `delete_plan`, `update_step`) are recorded in `growai_pending_plan_mutations_v1` and synced via `syncPendingPlanMutations()` when connectivity is restored.

---

## 4. The 8 Botanical Templates

Implemented in [`src/lib/grow-plans/plan-generator.ts`](file:///c:/Users/123/Documents/GitHub/GrowAI/src/lib/grow-plans/plan-generator.ts):

| Template ID | Name | Focus | Key Prerequisite Rules |
| :--- | :--- | :--- | :--- |
| `plant_establishment` | New Plant Establishment | Acclimatization, root settling, initial growth check | Root check requires initial watering |
| `health_monitoring` | Plant Health Monitoring | Symptom tracking, treatment follow-up, recovery verification | Recovery check blocked until symptom checks complete |
| `propagation` | Propagation Project | Cutting prep, rooting medium, root inspection, potting up | Potting up blocked until root development verified |
| `harvest_preparation` | Harvest Preparation | Maturity inspection, flush/pre-harvest care, physical harvest | Harvest blocked until physical maturity confirmed |
| `production_cycle` | Production Cycle | Batch seeding, thinning, vegetative care, staged harvesting | Thinning requires germination observation |
| `environment_improvement` | Environment Improvement | Light/humidity calibration, sensor audit, ventilation check | Adjustment requires baseline reading |
| `space_optimization` | Small-Space Optimization | Canopy training, spacing adjustment, vertical trellis setup | Trellis training requires canopy measurement |
| `improve_data_quality` | Botanical Data Quality | Missing baseline capture, photos, growth stage record | Verification requires logging baseline fields |

---

## 5. Step Dependency & Progression Engine

Implemented in [`src/lib/grow-plans/plan-step-engine.ts`](file:///c:/Users/123/Documents/GitHub/GrowAI/src/lib/grow-plans/plan-step-engine.ts):

1. **Step Status Flow**:
   - `pending`: Waiting for prerequisites or scheduled timing.
   - `ready`: Prerequisites are met; step is actionable today.
   - `in_progress`: Currently being executed or under observation.
   - `completed`: Successfully completed with optional notes and timestamp.
   - `skipped`: Step was skipped; automatically unblocks downstream dependent steps.
   - `blocked`: One or more prerequisites are incomplete.

2. **Dual Call Signature Support**:
   Supports both object-level convenience calls:
   ```ts
   completePlanStep(plan, stepId, notes);
   skipPlanStep(plan, stepId, reason);
   ```
   and decoupled functional calls:
   ```ts
   completePlanStep(stepId, steps, completedAt);
   skipPlanStep(stepId, steps);
   ```

3. **Prerequisite Resolution**:
   - `checkStepPrerequisites(step, allSteps)` returns `{ isMet: boolean; missingPrerequisiteIds: string[] }`.
   - A prerequisite is satisfied if its status is either `'completed'` or `'skipped'`.

---

## 6. Dynamic Plan Adaptation

Implemented in [`src/lib/grow-plans/plan-adapter.ts`](file:///c:/Users/123/Documents/GitHub/GrowAI/src/lib/grow-plans/plan-adapter.ts):

Plans adapt dynamically without manual grower intervention when real-world garden evidence changes:

- **Diagnosis / Health Follow-up Update**:
  - If a diagnosis outcome indicates `worsening`, new urgent pest/disease inspection steps are injected into active health plans, and step priorities are escalated to `urgent`.
  - If an outcome indicates `resolved`, recovery steps transition to verification mode.
- **Growing Condition Changes**:
  - Adverse observations (e.g., dry soil, severe heat) trigger immediate environmental recalibration steps.
- **Harvest Logging**:
  - Post-harvest cleanup and yield recording steps are unlocked when harvest records are logged.
- **Propagation Shifts**:
  - Rooting observations advance propagation plans from water/medium monitoring to transplant preparation.

All adaptations append an immutable entry to `plan.adjustmentHistory` documenting the exact reason, trigger source, and modifications.

---

## 7. Plan Reconciliation Engine

Implemented in [`src/lib/grow-plans/reconciliation.ts`](file:///c:/Users/123/Documents/GitHub/GrowAI/src/lib/grow-plans/reconciliation.ts):

The reconciliation engine ensures plans never point to stale or deleted garden entities:
- **Orphaned Single-Plant Plans**: If a plant is removed from the garden, single-plant plans are marked `cancelled` with reason `"Plant was removed from garden"`.
- **Multi-Plant Plans**: Deleted plant IDs are pruned from `plan.plantIds`. If no plants remain, the plan is gracefully cancelled.
- **Completed / Cancelled Invariance**: Completed or cancelled plans are **never** resurrected.
- **Reminder Cleanup**: When a plan is cancelled or steps are pruned, linked active reminders are dismissed.

---

## 8. Grower Copilot & Daily Grow Check Integration

- **Daily Grow Check**: Ingests active grow plans via `daily-grow-check.ts`. Today's actionable steps are surfaced directly in the grower's morning checklist alongside urgent care tasks.
- **Plant Timeline**: Ingests plan events (`plan_created`, `plan_step_completed`, `plan_adjusted`) under the `'plan'` category with detailed step names and outcomes.
- **Grower Copilot**:
  - Understands conversational intents: `ask_grow_plan_status`, `create_grow_plan`, `pause_grow_plan`, `resume_grow_plan`, `complete_plan_step`, `cancel_grow_plan`.
  - Consequential actions (`create_plan`, `pause_plan`, `resume_plan`, `complete_step`, `cancel_plan`) produce structured confirmation cards. The user must review and click "Confirm" before state is altered.

