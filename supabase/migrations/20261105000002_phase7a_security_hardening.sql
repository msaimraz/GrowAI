-- ==============================================================================
-- GrowAI Database Migration: 20261105000002_phase7a_security_hardening.sql
-- Module: Phase 7A — Production RLS & Storage Security Hardening
--
-- Safely repeatable security migration:
-- 1. Tightens public.plant_photos RLS policies from {public} to {authenticated}.
-- 2. Preserves strict ownership checks (auth.uid() = user_id) on all operations.
-- 3. Hardened SECURITY DEFINER trigger with search_path = '', schema-qualified objects,
--    and strict case-sensitive lowercase UUID.webp validation.
-- 4. Tightens storage.objects SELECT, INSERT, and DELETE policies to require:
--    - bucket_id = 'plant-photos'
--    - First folder equals auth.uid()::text
--    - Second folder equals an existing plant owned by auth.uid()
-- 5. Preserves private bucket configuration.
-- ==============================================================================

-- 1. Ensure private bucket configuration is preserved
UPDATE storage.buckets
SET public = false
WHERE id = 'plant-photos';

-- ------------------------------------------------------------------------------
-- 2. Hardened Database-Level Photo Consistency & Path Validation Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_plant_photo_consistency()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  path_parts text[];
  filename text;
BEGIN
  -- 1. Ensure user_plant_id exists and belongs to the photo owner
  IF NOT EXISTS (
    SELECT 1 FROM public.user_plants
    WHERE id = NEW.user_plant_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Plant photo must reference a user_plant owned by the same authorized user (user_id: %, plant_id: %).', NEW.user_id, NEW.user_plant_id;
  END IF;

  -- 2. Validate storage_path structure: must have exactly 3 parts (user_id/user_plant_id/uuid.webp)
  path_parts := pg_catalog.string_to_array(NEW.storage_path, '/');
  IF pg_catalog.array_length(path_parts, 1) <> 3 THEN
    RAISE EXCEPTION 'Invalid storage_path format (%). Expected format: user_id/user_plant_id/photo_id.webp', NEW.storage_path;
  END IF;

  -- 3. Verify First Folder strictly matches photo user_id
  IF path_parts[1] <> NEW.user_id::text THEN
    RAISE EXCEPTION 'Storage path root folder (%) does not match photo user_id (%).', path_parts[1], NEW.user_id;
  END IF;

  -- 4. Verify Second Folder strictly matches photo user_plant_id
  IF path_parts[2] <> NEW.user_plant_id::text THEN
    RAISE EXCEPTION 'Storage path plant folder (%) does not match photo user_plant_id (%).', path_parts[2], NEW.user_plant_id;
  END IF;

  -- 5. Verify Filename is a valid LOWERCASE UUID followed by .webp extension (case-sensitive !~)
  filename := path_parts[3];
  IF filename !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$' THEN
    RAISE EXCEPTION 'Storage path filename (%) is invalid. Must be a valid lowercase UUID with .webp extension.', filename;
  END IF;

  RETURN NEW;
END;
$$;

-- Function permissions hardening: revoke from PUBLIC, grant to authenticated and service_role
REVOKE ALL ON FUNCTION public.validate_plant_photo_consistency() FROM PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.validate_plant_photo_consistency() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.validate_plant_photo_consistency() TO service_role;

DROP TRIGGER IF EXISTS trg_validate_plant_photo ON public.plant_photos;
CREATE TRIGGER trg_validate_plant_photo
  BEFORE INSERT OR UPDATE OF user_id, user_plant_id, storage_path ON public.plant_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_plant_photo_consistency();

-- ------------------------------------------------------------------------------
-- 3. Hardened RLS Policies on public.plant_photos (Target: TO authenticated)
-- ------------------------------------------------------------------------------

-- SELECT Policy
DROP POLICY IF EXISTS "Users can view their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can view their own plant photos"
  ON public.plant_photos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT Policy
DROP POLICY IF EXISTS "Users can insert their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can insert their own plant photos"
  ON public.plant_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE id = user_plant_id
      AND user_id = auth.uid()
    )
  );

-- UPDATE Policy
DROP POLICY IF EXISTS "Users can update their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can update their own plant photos"
  ON public.plant_photos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE id = user_plant_id
      AND user_id = auth.uid()
    )
  );

-- DELETE Policy
DROP POLICY IF EXISTS "Users can delete their own plant photos" ON public.plant_photos;
CREATE POLICY "Users can delete their own plant photos"
  ON public.plant_photos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Hardened RLS Policies on storage.objects (plant-photos bucket)
-- ------------------------------------------------------------------------------

-- Storage SELECT Policy (Reading / Generating Signed URLs)
DROP POLICY IF EXISTS "Users can read their own plant photo files" ON storage.objects;
CREATE POLICY "Users can read their own plant photo files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'plant-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.user_plants 
      WHERE id::text = (storage.foldername(name))[2] 
      AND user_id = auth.uid()
    )
  );

-- Storage INSERT Policy (Uploading Photo Blobs)
DROP POLICY IF EXISTS "Users can upload their own plant photo files" ON storage.objects;
CREATE POLICY "Users can upload their own plant photo files"
  ON storage.objects
  FOR INSERT
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

-- Storage DELETE Policy (Removing Photo Blobs)
DROP POLICY IF EXISTS "Users can delete their own plant photo files" ON storage.objects;
CREATE POLICY "Users can delete their own plant photo files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'plant-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.user_plants 
      WHERE id::text = (storage.foldername(name))[2] 
      AND user_id = auth.uid()
    )
  );
