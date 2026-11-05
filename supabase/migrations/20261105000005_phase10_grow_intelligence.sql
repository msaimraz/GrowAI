-- ==============================================================================
-- GrowAI Database Migration: 20261105000005_phase10_grow_intelligence.sql
-- Phase 10: Grow Intelligence & Production System
--
-- STATUS: LOCAL MIGRATION FILE (NOT AUTOMATICALLY EXECUTED PER CRITICAL RULES)
-- ==============================================================================

-- 1. Growing Conditions Table (Environmental Observations)
CREATE TABLE IF NOT EXISTS public.growing_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  environment_zone TEXT,
  light_level TEXT CHECK (
    light_level IN ('low', 'medium', 'bright_indirect', 'direct_sun', 'grow_light', 'unknown') 
    OR light_level IS NULL
  ),
  light_duration_hours NUMERIC CHECK (
    (light_duration_hours >= 0 AND light_duration_hours <= 24) 
    OR light_duration_hours IS NULL
  ),
  light_source TEXT CHECK (
    light_source IN ('natural', 'grow_light', 'mixed', 'unknown') 
    OR light_source IS NULL
  ),
  is_grow_light BOOLEAN NOT NULL DEFAULT FALSE,
  temperature_celsius NUMERIC,
  temp_min_celsius NUMERIC,
  temp_max_celsius NUMERIC,
  relative_humidity_percent NUMERIC CHECK (
    (relative_humidity_percent >= 0 AND relative_humidity_percent <= 100) 
    OR relative_humidity_percent IS NULL
  ),
  airflow_quality TEXT CHECK (
    airflow_quality IN ('stagnant', 'gentle', 'moderate', 'strong', 'fan_ventilated', 'unknown') 
    OR airflow_quality IS NULL
  ),
  soil_moisture TEXT CHECK (
    soil_moisture IN ('dry', 'slightly_moist', 'moist', 'waterlogged', 'unknown') 
    OR soil_moisture IS NULL
  ),
  drainage_quality TEXT CHECK (
    drainage_quality IN ('poor', 'adequate', 'excellent', 'unknown') 
    OR drainage_quality IS NULL
  ),
  ph NUMERIC CHECK ((ph >= 0 AND ph <= 14) OR ph IS NULL),
  medium_type TEXT,
  notes TEXT,
  observation_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_growing_conditions_user_id ON public.growing_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_growing_conditions_plant_id ON public.growing_conditions(plant_id);
CREATE INDEX IF NOT EXISTS idx_growing_conditions_obs_time ON public.growing_conditions(user_id, observation_time DESC);

ALTER TABLE public.growing_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own growing conditions"
  ON public.growing_conditions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own growing conditions"
  ON public.growing_conditions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own growing conditions"
  ON public.growing_conditions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own growing conditions"
  ON public.growing_conditions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_growing_conditions_updated ON public.growing_conditions;
CREATE TRIGGER on_growing_conditions_updated
  BEFORE UPDATE ON public.growing_conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Feeding & Fertilization Records Table
CREATE TABLE IF NOT EXISTS public.feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  feeding_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  product_name TEXT NOT NULL,
  fertilizer_type TEXT NOT NULL DEFAULT 'organic' CHECK (
    fertilizer_type IN ('organic', 'synthetic', 'compost_tea', 'slow_release', 'liquid_feed', 'foliar', 'worm_castings', 'other')
  ),
  npk_ratio TEXT,
  formulation TEXT CHECK (
    formulation IN ('liquid', 'granular', 'powder', 'spikes', 'pellets', 'other') 
    OR formulation IS NULL
  ),
  application_method TEXT NOT NULL DEFAULT 'soil_drench' CHECK (
    application_method IN ('soil_drench', 'foliar_spray', 'top_dress', 'sub_irrigation', 'hydroponic_reservoir', 'other')
  ),
  dosage_amount NUMERIC CHECK (dosage_amount >= 0 OR dosage_amount IS NULL),
  dosage_unit TEXT,
  dosage_unknown BOOLEAN NOT NULL DEFAULT FALSE,
  source_reference TEXT,
  next_planned_date DATE,
  grower_observation TEXT,
  nutrient_observation TEXT CHECK (
    nutrient_observation IN ('normal_vigor', 'chlorosis', 'leaf_edge_damage', 'stunted_growth', 'purpling', 'interveinal_chlorosis', 'possible_deficiency', 'other')
    OR nutrient_observation IS NULL
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_feeding_records_user_id ON public.feeding_records(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_plant_id ON public.feeding_records(plant_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON public.feeding_records(user_id, feeding_date DESC);

ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feeding records"
  ON public.feeding_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feeding records"
  ON public.feeding_records FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own feeding records"
  ON public.feeding_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own feeding records"
  ON public.feeding_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_feeding_records_updated ON public.feeding_records;
CREATE TRIGGER on_feeding_records_updated
  BEFORE UPDATE ON public.feeding_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Propagation Events Table (Lineage Tracking)
CREATE TABLE IF NOT EXISTS public.propagation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  propagation_method TEXT NOT NULL CHECK (
    propagation_method IN ('seed', 'cutting', 'division', 'runner', 'layering', 'grafting', 'other')
  ),
  started_date DATE NOT NULL DEFAULT CURRENT_DATE,
  medium TEXT,
  environment TEXT,
  notes TEXT,
  expected_followup_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (
    status IN ('in_progress', 'success', 'failure', 'pending_outcome')
  ),
  outcome_date DATE,
  offspring_plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_propagation_events_user_id ON public.propagation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_propagation_events_parent_id ON public.propagation_events(parent_plant_id);
CREATE INDEX IF NOT EXISTS idx_propagation_events_offspring_id ON public.propagation_events(offspring_plant_id);

ALTER TABLE public.propagation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own propagation events"
  ON public.propagation_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own propagation events"
  ON public.propagation_events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = parent_plant_id
      AND public.user_plants.user_id = auth.uid()
    ) AND (
      offspring_plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = offspring_plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own propagation events"
  ON public.propagation_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = parent_plant_id
      AND public.user_plants.user_id = auth.uid()
    ) AND (
      offspring_plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = offspring_plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own propagation events"
  ON public.propagation_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_propagation_events_updated ON public.propagation_events;
CREATE TRIGGER on_propagation_events_updated
  BEFORE UPDATE ON public.propagation_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Production / Crop Cycles Table
CREATE TABLE IF NOT EXISTS public.production_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_name TEXT NOT NULL,
  plant_slug TEXT NOT NULL,
  growing_area TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  stage TEXT NOT NULL DEFAULT 'nursery' CHECK (
    stage IN ('planned', 'nursery', 'vegetative', 'flowering', 'harvesting', 'closed')
  ),
  quantity_planted INTEGER NOT NULL DEFAULT 1 CHECK (quantity_planted >= 0),
  quantity_active INTEGER NOT NULL DEFAULT 1 CHECK (quantity_active >= 0),
  quantity_lost INTEGER NOT NULL DEFAULT 0 CHECK (quantity_lost >= 0),
  quantity_harvested NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_harvested >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('planned', 'active', 'paused', 'completed', 'cancelled')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_production_cycles_user_id ON public.production_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_production_cycles_status ON public.production_cycles(user_id, status);

ALTER TABLE public.production_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own production cycles"
  ON public.production_cycles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own production cycles"
  ON public.production_cycles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production cycles"
  ON public.production_cycles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production cycles"
  ON public.production_cycles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_production_cycles_updated ON public.production_cycles;
CREATE TRIGGER on_production_cycles_updated
  BEFORE UPDATE ON public.production_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Production Cycle Plants Junction (Optional Batches)
CREATE TABLE IF NOT EXISTS public.production_cycle_plants (
  cycle_id UUID NOT NULL REFERENCES public.production_cycles(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.user_plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (cycle_id, plant_id)
);

CREATE INDEX IF NOT EXISTS idx_production_cycle_plants_user ON public.production_cycle_plants(user_id);

ALTER TABLE public.production_cycle_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cycle plant batches"
  ON public.production_cycle_plants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle plant batches"
  ON public.production_cycle_plants FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.production_cycles
      WHERE public.production_cycles.id = cycle_id
      AND public.production_cycles.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.user_plants
      WHERE public.user_plants.id = plant_id
      AND public.user_plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cycle plant batches"
  ON public.production_cycle_plants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Harvest Records Table
CREATE TABLE IF NOT EXISTS public.harvest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
  production_cycle_id UUID REFERENCES public.production_cycles(id) ON DELETE SET NULL,
  harvest_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  quantity NUMERIC NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL CHECK (unit IN ('g', 'kg', 'oz', 'lb', 'pieces', 'bunches', 'units')),
  harvest_type TEXT NOT NULL DEFAULT 'cut_and_come_again' CHECK (
    harvest_type IN ('full_harvest', 'cut_and_come_again', 'pruning_yield', 'thinning')
  ),
  quality_observation TEXT CHECK (
    quality_observation IN ('prime', 'good', 'acceptable', 'substandard', 'blemished')
    OR quality_observation IS NULL
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_harvest_records_user_id ON public.harvest_records(user_id);
CREATE INDEX IF NOT EXISTS idx_harvest_records_plant_id ON public.harvest_records(plant_id);
CREATE INDEX IF NOT EXISTS idx_harvest_records_cycle_id ON public.harvest_records(production_cycle_id);
CREATE INDEX IF NOT EXISTS idx_harvest_records_date ON public.harvest_records(user_id, harvest_date DESC);

ALTER TABLE public.harvest_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own harvest records"
  ON public.harvest_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own harvest records"
  ON public.harvest_records FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    ) AND (
      production_cycle_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.production_cycles
        WHERE public.production_cycles.id = production_cycle_id
        AND public.production_cycles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own harvest records"
  ON public.harvest_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND (
      plant_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_plants
        WHERE public.user_plants.id = plant_id
        AND public.user_plants.user_id = auth.uid()
      )
    ) AND (
      production_cycle_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.production_cycles
        WHERE public.production_cycles.id = production_cycle_id
        AND public.production_cycles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own harvest records"
  ON public.harvest_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_harvest_records_updated ON public.harvest_records;
CREATE TRIGGER on_harvest_records_updated
  BEFORE UPDATE ON public.harvest_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Add reminder constraints compatibility if reminders table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reminders') THEN
    ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminders_source_type_check;
    ALTER TABLE public.reminders ADD CONSTRAINT reminders_source_type_check CHECK (
      source_type IN (
        'care_task',
        'health_follow_up',
        'treatment',
        'growth_observation',
        'growth_milestone',
        'planting_milestone',
        'health_monitoring',
        'feeding',
        'propagation',
        'harvest',
        'production',
        'manual'
      )
    );

    ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminders_reminder_type_check;
    ALTER TABLE public.reminders ADD CONSTRAINT reminders_reminder_type_check CHECK (
      reminder_type IN (
        'care',
        'health',
        'treatment',
        'growth',
        'milestone',
        'feeding',
        'propagation',
        'harvest',
        'production',
        'custom'
      )
    );
  END IF;
END $$;

