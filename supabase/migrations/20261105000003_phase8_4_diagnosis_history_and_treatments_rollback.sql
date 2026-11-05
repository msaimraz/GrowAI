-- ==============================================================================
-- GrowAI Database Migration Rollback: 20261105000003_phase8_4_diagnosis_history_and_treatments_rollback.sql
-- Module: Phase 8.4 — Diagnosis History & Treatment Tracking Rollback
--
-- STATUS: NOT EXECUTED (Created locally for review per Phase 8.4 instructions)
--
-- Safely drops tables, policies, functions, and triggers in reverse dependency order.
-- ==============================================================================

-- 1. Drop Child Tables
DROP TABLE IF EXISTS public.diagnosis_follow_ups CASCADE;
DROP TABLE IF EXISTS public.diagnosis_treatments CASCADE;
DROP TABLE IF EXISTS public.diagnosis_candidates CASCADE;

-- 2. Drop Consistency Trigger & Function
DROP TRIGGER IF EXISTS trg_validate_diagnosis_record ON public.diagnosis_records;
DROP FUNCTION IF EXISTS public.validate_diagnosis_record_consistency();

-- 3. Drop Parent Diagnosis Records Table
DROP TABLE IF EXISTS public.diagnosis_records CASCADE;

