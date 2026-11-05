-- ==============================================================================
-- GrowAI Phase 13: Adaptive Grow Plans & Execution System
-- Migration Rollback: 20261105000006_phase13_grow_plans_rollback.sql
-- ==============================================================================

DROP TABLE IF EXISTS public.grow_plan_events CASCADE;
DROP TABLE IF EXISTS public.grow_plan_steps CASCADE;
DROP TABLE IF EXISTS public.grow_plans CASCADE;

