-- ==============================================================================
-- GrowAI Database Migration Rollback: 20261105000001_phase7a_growth_intelligence_rollback.sql
-- Module: Phase 7A — Growth Intelligence & Health Journal
--
-- CAUTION: This script rolls back Phase 7A schema additions.
-- It will permanently delete Phase 7A plant_photos records and drop lineage columns.
-- Existing user_plants, growth_notes, care_tasks, and profiles will remain intact.
-- DO NOT RUN AUTOMATICALLY. Run only if an intentional rollback of Phase 7A is required.
-- ==============================================================================

-- 1. Clean up Storage policies
DROP POLICY IF EXISTS "Users can read their own plant photo files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own plant photo files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own plant photo files" ON storage.objects;

-- 2. Drop plant_photos table, triggers and functions
DROP TRIGGER IF EXISTS trg_validate_plant_photo ON public.plant_photos;
DROP FUNCTION IF EXISTS public.validate_plant_photo_consistency();

DROP POLICY IF EXISTS "Users can view their own plant photos" ON public.plant_photos;
DROP POLICY IF EXISTS "Users can insert their own plant photos" ON public.plant_photos;
DROP POLICY IF EXISTS "Users can update their own plant photos" ON public.plant_photos;
DROP POLICY IF EXISTS "Users can delete their own plant photos" ON public.plant_photos;

DROP TABLE IF EXISTS public.plant_photos CASCADE;

-- 3. Drop lineage triggers and functions
DROP TRIGGER IF EXISTS trg_validate_plant_parent ON public.user_plants;
DROP FUNCTION IF EXISTS public.validate_plant_parent_ownership();

-- 4. Drop added columns from user_plants
ALTER TABLE public.user_plants
  DROP COLUMN IF EXISTS parent_plant_id,
  DROP COLUMN IF EXISTS propagation_method,
  DROP COLUMN IF EXISTS propagation_date,
  DROP COLUMN IF EXISTS actual_harvest_date;
