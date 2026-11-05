-- ==============================================================================
-- GrowAI Database Migration Rollback: 20261105000005_phase10_grow_intelligence_rollback.sql
-- Phase 10: Grow Intelligence & Production System Rollback
-- ==============================================================================

DROP TRIGGER IF EXISTS on_harvest_records_updated ON public.harvest_records;
DROP TABLE IF EXISTS public.harvest_records CASCADE;

DROP TABLE IF EXISTS public.production_cycle_plants CASCADE;

DROP TRIGGER IF EXISTS on_production_cycles_updated ON public.production_cycles;
DROP TABLE IF EXISTS public.production_cycles CASCADE;

DROP TRIGGER IF EXISTS on_propagation_events_updated ON public.propagation_events;
DROP TABLE IF EXISTS public.propagation_events CASCADE;

DROP TRIGGER IF EXISTS on_feeding_records_updated ON public.feeding_records;
DROP TABLE IF EXISTS public.feeding_records CASCADE;

DROP TRIGGER IF EXISTS on_growing_conditions_updated ON public.growing_conditions;
DROP TABLE IF EXISTS public.growing_conditions CASCADE;

