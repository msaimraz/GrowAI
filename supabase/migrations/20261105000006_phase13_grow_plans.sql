-- ==============================================================================
-- GrowAI Phase 13: Adaptive Grow Plans & Execution System
-- Migration: 20261105000006_phase13_grow_plans.sql
--
-- Description:
-- Creates the execution and tracking layer for Grow Plans:
-- 1. grow_plans: High-level grow strategies with scope, objective, and status.
-- 2. grow_plan_steps: Individual executable, evidence-backed plan steps with dependencies.
-- 3. grow_plan_events: Chronological audit events for plan adjustments, pauses, and milestones.
--
-- Security:
-- - Row Level Security (RLS) enabled on all tables.
-- - Strict auth.uid() = user_id ownership enforcement.
-- - Parent validation checks ensuring referenced plants, production cycles,
--   and propagation events belong to the authenticated user.
-- ==============================================================================

-- 1. GROW PLANS TABLE
CREATE TABLE IF NOT EXISTS public.grow_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL CHECK (scope IN ('plant', 'garden', 'production_cycle', 'propagation', 'space', 'custom')),
  objective TEXT NOT NULL CHECK (objective IN (
    'establish_plant',
    'improve_growing_conditions',
    'monitor_health',
    'recover_from_health_issue',
    'prepare_for_harvest',
    'increase_recorded_output',
    'propagate_plant',
    'establish_production_cycle',
    'optimize_space',
    'improve_data_quality',
    'general_care',
    'custom'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled', 'needs_review')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  production_cycle_id UUID REFERENCES public.production_cycles(id) ON DELETE SET NULL,
  propagation_event_id UUID REFERENCES public.propagation_events(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. GROW PLAN STEPS TABLE
CREATE TABLE IF NOT EXISTS public.grow_plan_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.grow_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN (
    'care',
    'health',
    'environment',
    'feeding',
    'growth',
    'propagation',
    'production',
    'harvest',
    'space',
    'observation',
    'data_quality',
    'review'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'in_progress', 'completed', 'skipped', 'blocked', 'needs_review')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_for TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  requires_observation BOOLEAN NOT NULL DEFAULT false,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependency_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. GROW PLAN EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.grow_plan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.grow_plans(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.grow_plan_steps(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'plan_created',
    'plan_step_started',
    'plan_step_completed',
    'plan_step_skipped',
    'plan_adjusted',
    'plan_paused',
    'plan_resumed',
    'plan_completed',
    'plan_cancelled',
    'plan_review'
  )),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_grow_plans_user_status ON public.grow_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_grow_plans_plant ON public.grow_plans(plant_id) WHERE plant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grow_plans_cycle ON public.grow_plans(production_cycle_id) WHERE production_cycle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grow_plans_propagation ON public.grow_plans(propagation_event_id) WHERE propagation_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_grow_plan_steps_plan_status ON public.grow_plan_steps(plan_id, status);
CREATE INDEX IF NOT EXISTS idx_grow_plan_steps_user_due ON public.grow_plan_steps(user_id, due_at);
CREATE INDEX IF NOT EXISTS idx_grow_plan_steps_reminder ON public.grow_plan_steps(reminder_id) WHERE reminder_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_grow_plan_events_plan ON public.grow_plan_events(plan_id, created_at);
CREATE INDEX IF NOT EXISTS idx_grow_plan_events_user ON public.grow_plan_events(user_id, created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.grow_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grow_plan_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grow_plan_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR grow_plans
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own grow plans"
  ON public.grow_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grow plans with verified parents"
  ON public.grow_plans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      plant_id IS NULL OR
      EXISTS (SELECT 1 FROM public.user_plants WHERE id = plant_id AND user_id = auth.uid())
    )
    AND (
      production_cycle_id IS NULL OR
      EXISTS (SELECT 1 FROM public.production_cycles WHERE id = production_cycle_id AND user_id = auth.uid())
    )
    AND (
      propagation_event_id IS NULL OR
      EXISTS (SELECT 1 FROM public.propagation_events WHERE id = propagation_event_id AND user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own grow plans with verified parents"
  ON public.grow_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      plant_id IS NULL OR
      EXISTS (SELECT 1 FROM public.user_plants WHERE id = plant_id AND user_id = auth.uid())
    )
    AND (
      production_cycle_id IS NULL OR
      EXISTS (SELECT 1 FROM public.production_cycles WHERE id = production_cycle_id AND user_id = auth.uid())
    )
    AND (
      propagation_event_id IS NULL OR
      EXISTS (SELECT 1 FROM public.propagation_events WHERE id = propagation_event_id AND user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own grow plans"
  ON public.grow_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR grow_plan_steps
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own grow plan steps"
  ON public.grow_plan_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert steps into their own grow plans"
  ON public.grow_plan_steps FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.grow_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update steps in their own grow plans"
  ON public.grow_plan_steps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.grow_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own grow plan steps"
  ON public.grow_plan_steps FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS POLICIES FOR grow_plan_events
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own grow plan events"
  ON public.grow_plan_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert events into their own grow plans"
  ON public.grow_plan_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.grow_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own grow plan events"
  ON public.grow_plan_events FOR DELETE
  USING (auth.uid() = user_id);

