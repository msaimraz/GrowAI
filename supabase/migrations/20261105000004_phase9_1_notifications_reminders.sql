-- ==============================================================================
-- GrowAI Database Migration: 20261105000004_phase9_1_notifications_reminders.sql
-- Phase 9.1: Notifications & Reminders Infrastructure
--
-- STATUS: LOCAL MIGRATION FILE (NOT AUTOMATICALLY EXECUTED PER CRITICAL RULES)
-- ==============================================================================

-- 1. Create Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  plant_nickname TEXT,
  plant_slug TEXT,
  source_type TEXT NOT NULL CHECK (
    source_type IN (
      'care_task',
      'health_follow_up',
      'treatment',
      'growth_observation',
      'growth_milestone',
      'planting_milestone',
      'health_monitoring',
      'manual'
    )
  ),
  source_id TEXT,
  reminder_type TEXT NOT NULL CHECK (
    reminder_type IN (
      'care',
      'health',
      'treatment',
      'growth',
      'milestone',
      'custom'
    )
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  due_at TIMESTAMPTZ NOT NULL,
  recurrence JSONB,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'due', 'overdue', 'completed', 'dismissed', 'cancelled')
  ),
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON public.reminders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due_at ON public.reminders(user_id, due_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user_read ON public.reminders(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reminders_plant_due ON public.reminders(plant_id, due_at);

-- Partial unique index to enforce active-reminder idempotency per source
CREATE UNIQUE INDEX IF NOT EXISTS uq_reminders_active_source
  ON public.reminders (user_id, source_type, source_id)
  WHERE status IN ('scheduled', 'due', 'overdue') AND source_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies with strict plant ownership validation
CREATE POLICY "Users can view their own reminders"
  ON public.reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON public.reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own reminders"
  ON public.reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own reminders"
  ON public.reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS on_reminders_updated ON public.reminders;
CREATE TRIGGER on_reminders_updated
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  categories JSONB NOT NULL DEFAULT '{"care": true, "healthFollowUp": true, "treatment": true, "growth": true, "milestones": true, "overdue": true}'::jsonb,
  channels JSONB NOT NULL DEFAULT '{"inApp": true, "browser": false}'::jsonb,
  quiet_hours JSONB NOT NULL DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00"}'::jsonb,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences"
  ON public.notification_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_notification_preferences_updated ON public.notification_preferences;
CREATE TRIGGER on_notification_preferences_updated
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

