-- ==============================================================================
-- GrowAI Database Migration Rollback: 20261105000004_phase9_1_notifications_reminders_rollback.sql
-- Phase 9.1: Notifications & Reminders Infrastructure Rollback
-- ==============================================================================

DROP TRIGGER IF EXISTS on_notification_preferences_updated ON public.notification_preferences;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

DROP TRIGGER IF EXISTS on_reminders_updated ON public.reminders;
DROP INDEX IF EXISTS public.uq_reminders_active_source;
DROP TABLE IF EXISTS public.reminders CASCADE;

