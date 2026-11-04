-- ==============================================================================
-- GrowAI Database Migration Rollback: 20261105000002_phase7a_security_hardening_rollback.sql
-- Module: Phase 7A — Production RLS & Storage Security Hardening Rollback
--
-- Reverts Phase 7A security-hardening policies back to initial Phase 7A definitions.
-- Does NOT drop tables, columns, or user data.
-- ==============================================================================

-- 1. Revert public.plant_photos policies (back to initial definitions)
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

-- 2. Revert photo consistency trigger to initial basic validation
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
    RAISE EXCEPTION 'Plant photo must reference a user_plant owned by the same authorized user.';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Revert storage.objects policies (folder-1 only check for SELECT/DELETE)
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
