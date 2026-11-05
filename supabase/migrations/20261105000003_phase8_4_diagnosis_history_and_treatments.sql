-- ==============================================================================
-- GrowAI Database Migration: 20261105000003_phase8_4_diagnosis_history_and_treatments.sql
-- Module: Phase 8.4 — Diagnosis History & Treatment Tracking
--
-- STATUS: NOT EXECUTED (Created locally for review per Phase 8.4 instructions)
--
-- Tables Created:
-- 1. public.diagnosis_records: Stores persistent diagnostic assessments
-- 2. public.diagnosis_candidates: Up to 3 differential hypotheses per assessment
-- 3. public.diagnosis_treatments: User actions/interventions taken after diagnosis
-- 4. public.diagnosis_follow_ups: Subsequent health observations & outcomes
--
-- Constraints & Hardening:
-- - UNIQUE (diagnosis_id, candidate_rank) on diagnosis_candidates to prevent duplicate ranks.
-- - Child-table UPDATE policies enforce parent-ownership validation WITH CHECK (diagnosis_id belongs to auth.uid()).
-- - diagnosis_treatments UPDATE policy preserves user_plant_id ownership validation.
--
-- Deletion & Cascade Behavior:
-- - auth.users(id) ON DELETE CASCADE: Deleting user removes their diagnostic data.
-- - user_plants(id) ON DELETE SET NULL: Deleting plant preserves historical diagnoses.
-- - plant_photos(id) ON DELETE SET NULL: Deleting photo preserves historical diagnoses.
-- - diagnosis_records(id) ON DELETE CASCADE: Deleting a diagnosis cleans up its candidates,
--   treatment actions, and follow-ups.
-- - Deleting a diagnosis NEVER deletes user_plants, plant_photos, or Botanical KB content.
--
-- RLS Security:
-- - Strict row-level security enabled on all 4 tables.
-- - Target: TO authenticated with auth.uid() = user_id.
-- - Insert and Update policies enforce ownership of referenced user_plants and plant_photos.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Diagnosis Records Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnosis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  plant_photo_id UUID REFERENCES public.plant_photos(id) ON DELETE SET NULL,
  schema_version TEXT NOT NULL DEFAULT '1.0',
  diagnostic_source TEXT NOT NULL CHECK (diagnostic_source IN ('gemini-vision', 'agronomic-heuristic', 'fallback')),
  model_used TEXT,
  status TEXT NOT NULL CHECK (status IN ('completed', 'inconclusive', 'not_a_plant', 'service_unavailable')),
  primary_classification TEXT CHECK (primary_classification IN ('biotic', 'abiotic', 'mixed', 'undetermined')),
  is_plant_recognized BOOLEAN NOT NULL DEFAULT true,
  plant_identification TEXT NOT NULL,
  plant_identification_confidence TEXT NOT NULL CHECK (plant_identification_confidence IN ('high', 'medium', 'low', 'uncertain')),
  plant_slug TEXT,
  overall_health TEXT NOT NULL CHECK (overall_health IN ('healthy', 'mild_stress', 'moderate_issue', 'severe_issue', 'unknown')),
  image_quality JSONB,
  evidence_separation JSONB,
  symptoms TEXT NOT NULL,
  user_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  visible_symptoms TEXT[] NOT NULL DEFAULT '{}',
  likely_causes TEXT[] NOT NULL DEFAULT '{}',
  recommended_checks TEXT[] NOT NULL DEFAULT '{}',
  immediate_actions TEXT[] NOT NULL DEFAULT '{}',
  long_term_care TEXT[] NOT NULL DEFAULT '{}',
  prevention TEXT[] NOT NULL DEFAULT '{}',
  uncertainties TEXT[] NOT NULL DEFAULT '{}',
  follow_up_questions JSONB DEFAULT '[]'::jsonb,
  requires_expert_review BOOLEAN NOT NULL DEFAULT false,
  summary TEXT NOT NULL,
  disclaimer TEXT NOT NULL,
  suggested_follow_up TEXT,
  diagnosed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diagnosis_records_user_id ON public.diagnosis_records(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_records_user_plant_id ON public.diagnosis_records(user_plant_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_records_diagnosed_at ON public.diagnosis_records(diagnosed_at DESC);

-- Updated_at Trigger
DROP TRIGGER IF EXISTS on_diagnosis_record_updated ON public.diagnosis_records;
CREATE TRIGGER on_diagnosis_record_updated
  BEFORE UPDATE ON public.diagnosis_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Cross-reference consistency trigger (guarantees plant and photo belong to same user)
CREATE OR REPLACE FUNCTION public.validate_diagnosis_record_consistency()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_plant_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE id = NEW.user_plant_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Referenced user_plant must exist and belong to the same authorized user.';
    END IF;
  END IF;

  IF NEW.plant_photo_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.plant_photos
      WHERE id = NEW.plant_photo_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Referenced plant_photo must exist and belong to the same authorized user.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_diagnosis_record ON public.diagnosis_records;
CREATE TRIGGER trg_validate_diagnosis_record
  BEFORE INSERT OR UPDATE OF user_id, user_plant_id, plant_photo_id ON public.diagnosis_records
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_diagnosis_record_consistency();

-- Enable RLS
ALTER TABLE public.diagnosis_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own diagnosis records" ON public.diagnosis_records;
CREATE POLICY "Users can view their own diagnosis records"
  ON public.diagnosis_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagnosis records" ON public.diagnosis_records;
CREATE POLICY "Users can insert their own diagnosis records"
  ON public.diagnosis_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (user_plant_id IS NULL OR EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    )) AND
    (plant_photo_id IS NULL OR EXISTS (
      SELECT 1 FROM public.plant_photos
      WHERE public.plant_photos.id = plant_photo_id
      AND public.plant_photos.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update their own diagnosis records" ON public.diagnosis_records;
CREATE POLICY "Users can update their own diagnosis records"
  ON public.diagnosis_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own diagnosis records" ON public.diagnosis_records;
CREATE POLICY "Users can delete their own diagnosis records"
  ON public.diagnosis_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 2. Diagnosis Candidates Table (Differential Hypotheses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnosis_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID NOT NULL REFERENCES public.diagnosis_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_rank INTEGER NOT NULL CHECK (candidate_rank >= 1 AND candidate_rank <= 3),
  kb_condition_id TEXT,
  condition_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('pest', 'disease', 'abiotic') OR category IS NULL),
  explanation TEXT NOT NULL,
  confidence_category TEXT NOT NULL CHECK (confidence_category IN ('high', 'moderate', 'low', 'inconclusive', 'uncertain')),
  supporting_evidence TEXT[] NOT NULL DEFAULT '{}',
  contradicting_evidence TEXT[] DEFAULT '{}',
  alternative_causes TEXT[] NOT NULL DEFAULT '{}',
  recommended_next_observation TEXT,
  grounded_treatment JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (diagnosis_id, candidate_rank)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diagnosis_candidates_diagnosis_id ON public.diagnosis_candidates(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_candidates_user_id ON public.diagnosis_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_candidates_kb_condition ON public.diagnosis_candidates(kb_condition_id);

-- Enable RLS
ALTER TABLE public.diagnosis_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own diagnosis candidates" ON public.diagnosis_candidates;
CREATE POLICY "Users can view their own diagnosis candidates"
  ON public.diagnosis_candidates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagnosis candidates" ON public.diagnosis_candidates;
CREATE POLICY "Users can insert their own diagnosis candidates"
  ON public.diagnosis_candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.diagnosis_records
      WHERE public.diagnosis_records.id = diagnosis_id
      AND public.diagnosis_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own diagnosis candidates" ON public.diagnosis_candidates;
CREATE POLICY "Users can update their own diagnosis candidates"
  ON public.diagnosis_candidates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.diagnosis_records
      WHERE public.diagnosis_records.id = diagnosis_id
      AND public.diagnosis_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own diagnosis candidates" ON public.diagnosis_candidates;
CREATE POLICY "Users can delete their own diagnosis candidates"
  ON public.diagnosis_candidates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. Diagnosis Treatments Table (User Interventions / Action Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnosis_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID NOT NULL REFERENCES public.diagnosis_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'inspect_plant',
    'isolate_plant',
    'adjust_watering',
    'improve_ventilation',
    'remove_affected_leaves',
    'monitor_pests',
    'apply_kb_treatment',
    'custom_action'
  )),
  action_title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'started', 'completed', 'skipped')) DEFAULT 'planned',
  notes TEXT,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diagnosis_treatments_diagnosis_id ON public.diagnosis_treatments(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_treatments_user_id ON public.diagnosis_treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_treatments_user_plant_id ON public.diagnosis_treatments(user_plant_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_treatments_status ON public.diagnosis_treatments(status);

-- Updated_at Trigger
DROP TRIGGER IF EXISTS on_diagnosis_treatment_updated ON public.diagnosis_treatments;
CREATE TRIGGER on_diagnosis_treatment_updated
  BEFORE UPDATE ON public.diagnosis_treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.diagnosis_treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own diagnosis treatments" ON public.diagnosis_treatments;
CREATE POLICY "Users can view their own diagnosis treatments"
  ON public.diagnosis_treatments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagnosis treatments" ON public.diagnosis_treatments;
CREATE POLICY "Users can insert their own diagnosis treatments"
  ON public.diagnosis_treatments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.diagnosis_records
      WHERE public.diagnosis_records.id = diagnosis_id
      AND public.diagnosis_records.user_id = auth.uid()
    ) AND
    (user_plant_id IS NULL OR EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update their own diagnosis treatments" ON public.diagnosis_treatments;
CREATE POLICY "Users can update their own diagnosis treatments"
  ON public.diagnosis_treatments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.diagnosis_records
      WHERE public.diagnosis_records.id = diagnosis_id
      AND public.diagnosis_records.user_id = auth.uid()
    ) AND
    (user_plant_id IS NULL OR EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete their own diagnosis treatments" ON public.diagnosis_treatments;
CREATE POLICY "Users can delete their own diagnosis treatments"
  ON public.diagnosis_treatments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Diagnosis Follow-Ups Table (Health Outcome Observations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnosis_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID NOT NULL REFERENCES public.diagnosis_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outcome_status TEXT NOT NULL CHECK (outcome_status IN ('improving', 'unchanged', 'worsening', 'resolved', 'uncertain')),
  observation_notes TEXT,
  follow_up_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diagnosis_follow_ups_diagnosis_id ON public.diagnosis_follow_ups(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_follow_ups_user_id ON public.diagnosis_follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_follow_ups_outcome ON public.diagnosis_follow_ups(outcome_status);

-- Updated_at Trigger
DROP TRIGGER IF EXISTS on_diagnosis_follow_up_updated ON public.diagnosis_follow_ups;
CREATE TRIGGER on_diagnosis_follow_up_updated
  BEFORE UPDATE ON public.diagnosis_follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.diagnosis_follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own diagnosis follow-ups" ON public.diagnosis_follow_ups;
CREATE POLICY "Users can view their own diagnosis follow-ups"
  ON public.diagnosis_follow_ups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagnosis follow-ups" ON public.diagnosis_follow_ups;
CREATE POLICY "Users can insert their own diagnosis follow-ups"
  ON public.diagnosis_follow_ups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.diagnosis_records
      WHERE public.diagnosis_records.id = diagnosis_id
      AND public.diagnosis_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own diagnosis follow-ups" ON public.diagnosis_follow_ups;
CREATE POLICY "Users can update their own diagnosis follow-ups"
  ON public.diagnosis_follow_ups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.diagnosis_records
      WHERE public.diagnosis_records.id = diagnosis_id
      AND public.diagnosis_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own diagnosis follow-ups" ON public.diagnosis_follow_ups;
CREATE POLICY "Users can delete their own diagnosis follow-ups"
  ON public.diagnosis_follow_ups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
