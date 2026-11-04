-- ==============================================================================
-- GrowAI Database Migration: 20261105000001_phase7a_growth_intelligence.sql
-- Module: Phase 7A — Growth Intelligence & Health Journal
--
-- Safely repeatable and idempotent migration:
-- 1. Alters user_plants with lineage and harvest tracking (no data loss).
-- 2. Hardened trigger for parent ownership, self-parenting, and cyclic ancestry prevention.
-- 3. plant_photos table with user and plant consistency trigger.
-- 4. Secure RLS policies with DROP POLICY IF EXISTS guards.
-- 5. Defers org_id to Phase 7E.
-- ==============================================================================

-- 1. Extend user_plants with Lineage & Harvest Tracking
ALTER TABLE public.user_plants
  ADD COLUMN IF NOT EXISTS parent_plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS propagation_method TEXT CHECK (
    propagation_method IN ('seed', 'cutting', 'division', 'runner', 'layering', 'nursery_transplant') 
    OR propagation_method IS NULL
  ),
  ADD COLUMN IF NOT EXISTS propagation_date DATE,
  ADD COLUMN IF NOT EXISTS actual_harvest_date DATE;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_plants_parent_id ON public.user_plants(parent_plant_id);
CREATE INDEX IF NOT EXISTS idx_user_plants_planted_date ON public.user_plants(planted_date);

-- 2. Hardened Parent Ownership & Ancestry Cycle Prevention Trigger
CREATE OR REPLACE FUNCTION public.validate_plant_parent_ownership()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  ancestor_record RECORD;
BEGIN
  -- If no parent is set, nothing to validate
  IF NEW.parent_plant_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1. Prevent self-parenting
  IF NEW.id IS NOT NULL AND NEW.parent_plant_id = NEW.id THEN
    RAISE EXCEPTION 'A plant cannot be its own parent.';
  END IF;

  -- 2. Ensure parent belongs to the exact same user
  IF NOT EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE id = NEW.parent_plant_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Parent plant must exist and belong to the same authorized grower.';
  END IF;

  -- 3. Prevent circular propagation ancestry using recursive CTE
  IF NEW.id IS NOT NULL THEN
    FOR ancestor_record IN (
      WITH RECURSIVE ancestry AS (
        SELECT parent_plant_id, id FROM public.user_plants WHERE id = NEW.parent_plant_id
        UNION ALL
        SELECT u.parent_plant_id, u.id FROM public.user_plants u
        JOIN ancestry a ON u.id = a.parent_plant_id
        WHERE a.parent_plant_id IS NOT NULL
      )
      SELECT id FROM ancestry WHERE id = NEW.id LIMIT 1
    ) LOOP
      RAISE EXCEPTION 'Circular propagation ancestry detected: plant % cannot be an ancestor of itself.', NEW.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_plant_parent ON public.user_plants;
CREATE TRIGGER trg_validate_plant_parent
  BEFORE INSERT OR UPDATE OF parent_plant_id, user_id ON public.user_plants
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_plant_parent_ownership();

-- 3. Plant Photos Table (Private Storage Metadata)
CREATE TABLE IF NOT EXISTS public.plant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Stored as: {user_id}/{user_plant_id}/{photo_id}.webp
  caption TEXT,
  growth_stage TEXT CHECK (
    growth_stage IN ('Seed', 'Germination', 'Seedling', 'Growing', 'Mature', 'Harvested') 
    OR growth_stage IS NULL
  ),
  height_cm NUMERIC(6, 2),
  taken_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for chronological queries and plant owner lookup
CREATE INDEX IF NOT EXISTS idx_plant_photos_user_plant ON public.plant_photos(user_plant_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_plant_photos_user_id ON public.plant_photos(user_id);

-- 4. Hardened Photo Consistency Trigger
-- Guarantees user_id and user_plant_id always match on INSERT or UPDATE
CREATE OR REPLACE FUNCTION public.validate_plant_photo_consistency()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE id = NEW.user_plant_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Photo must be associated with a plant owned by the same user.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_plant_photo ON public.plant_photos;
CREATE TRIGGER trg_validate_plant_photo
  BEFORE INSERT OR UPDATE OF user_id, user_plant_id ON public.plant_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_plant_photo_consistency();

-- 5. Enable RLS on plant_photos with safely repeatable policies
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can view their own plant photos"
  ON public.plant_photos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can insert their own plant photos"
  ON public.plant_photos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can update their own plant photos"
  ON public.plant_photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can delete their own plant photos"
  ON public.plant_photos FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Private Storage Bucket Setup & Policies (Run in Supabase Storage context)
-- Bucket: plant-photos (public: false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-photos',
  'plant-photos',
  false,
  5242880, -- 5 MB ceiling per photo
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Users can read their own plant photo files" ON storage.objects;
CREATE POLICY "Users can read their own plant photo files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'plant-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload their own plant photo files" ON storage.objects;
CREATE POLICY "Users can upload their own plant photo files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'plant-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.user_plants 
      WHERE id::text = (storage.foldername(name))[2] 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own plant photo files" ON storage.objects;
CREATE POLICY "Users can delete their own plant photo files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'plant-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
