-- ==============================================================================
-- GrowAI Database Migration: 20261029000001_initial_schema.sql
-- Phase 2A: Authentication & Persistent User Garden Data
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Profiles Table (1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. User Plants Table
CREATE TABLE IF NOT EXISTS public.user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_slug TEXT NOT NULL,
  nickname TEXT NOT NULL,
  current_stage TEXT NOT NULL CHECK (current_stage IN ('Seed', 'Germination', 'Seedling', 'Growing', 'Mature', 'Harvested')),
  planted_date DATE NOT NULL,
  location TEXT,
  tier TEXT CHECK (tier IN ('top', 'middle', 'bottom') OR tier IS NULL),
  pot_size TEXT,
  custom_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_plants_user_id ON public.user_plants(user_id);

ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plants"
  ON public.user_plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON public.user_plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON public.user_plants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON public.user_plants FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER on_user_plant_updated
  BEFORE UPDATE ON public.user_plants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Growth Notes Table
CREATE TABLE IF NOT EXISTS public.growth_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  observation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  stage TEXT NOT NULL CHECK (stage IN ('Seed', 'Germination', 'Seedling', 'Growing', 'Mature', 'Harvested')),
  text TEXT NOT NULL,
  height_cm NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_growth_notes_user_id ON public.growth_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_notes_plant_id ON public.growth_notes(user_plant_id);

ALTER TABLE public.growth_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own growth notes"
  ON public.growth_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own growth notes for their own plants"
  ON public.growth_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own growth notes"
  ON public.growth_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = user_plant_id
      AND public.user_plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own growth notes"
  ON public.growth_notes FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Care Tasks Table
CREATE TABLE IF NOT EXISTS public.care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id UUID REFERENCES public.user_plants(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('water', 'fertilize', 'prune', 'harvest', 'inspect', 'repot')),
  due_date TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_care_tasks_user_id ON public.care_tasks(user_id);

ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own care tasks"
  ON public.care_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own care tasks"
  ON public.care_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (
      user_plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = user_plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own care tasks"
  ON public.care_tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own care tasks"
  ON public.care_tasks FOR DELETE
  USING (auth.uid() = user_id);
