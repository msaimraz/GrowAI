/**
 * GrowAI Phase 10: Production Persistence & Storage Adapter
 * Dual-mode storage adapter for Growing Conditions, Feedings, Propagation,
 * Production Cycles, and Harvest Records.
 *
 * Supports:
 * - Supabase Postgres with RLS when authenticated
 * - Honest offline queue & local cache with pending sync badges when offline
 * - Plant ownership and cycle ownership validation
 */

import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
} from '@/types/grow-intelligence';

const KEYS = {
  CONDITIONS: 'growai_demo_conditions_v1',
  FEEDINGS: 'growai_demo_feedings_v1',
  PROPAGATIONS: 'growai_demo_propagations_v1',
  CYCLES: 'growai_demo_production_cycles_v1',
  HARVESTS: 'growai_demo_harvest_records_v1',
  PENDING_MUTATIONS: 'growai_pending_phase10_mutations',
};

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

function getLocalList<T>(key: string): T[] {
  const s = getStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalList<T>(key: string, list: T[]): void {
  const s = getStorage();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error(`Failed to save ${key} locally:`, err);
  }
}

// ==============================================================================
// 1. GROWING CONDITIONS
// ==============================================================================

export async function fetchGrowingConditions(plantId?: string): Promise<{
  observations: GrowingConditionObservation[];
  error?: string;
  isCloud: boolean;
}> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    let list = getLocalList<GrowingConditionObservation>(KEYS.CONDITIONS);
    if (plantId) {
      list = list.filter((c) => !c.plantId || c.plantId === plantId);
    }
    return { observations: list, isCloud: false };
  }

  const supabase = createClient();
  if (!supabase) return { observations: getLocalList(KEYS.CONDITIONS), isCloud: false };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { observations: getLocalList(KEYS.CONDITIONS), isCloud: false };

    let query = supabase
      .from('growing_conditions')
      .select('*')
      .order('observation_time', { ascending: false });

    if (plantId) {
      query = query.or(`plant_id.is.null,plant_id.eq.${plantId}`);
    }

    const { data, error } = await query;
    if (error) return { observations: getLocalList(KEYS.CONDITIONS), error: error.message, isCloud: false };

    const mapped: GrowingConditionObservation[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      plantId: row.plant_id,
      environmentZone: row.environment_zone,
      lightLevel: row.light_level,
      lightDurationHours: row.light_duration_hours,
      lightSource: row.light_source,
      isGrowLight: Boolean(row.is_grow_light),
      temperatureCelsius: row.temperature_celsius,
      tempMinCelsius: row.temp_min_celsius,
      tempMaxCelsius: row.temp_max_celsius,
      relativeHumidityPercent: row.relative_humidity_percent,
      airflowQuality: row.airflow_quality,
      soilMoisture: row.soil_moisture,
      drainageQuality: row.drainage_quality,
      ph: row.ph,
      mediumType: row.medium_type,
      notes: row.notes,
      observationTime: row.observation_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { observations: mapped, isCloud: true };
  } catch (err: any) {
    return { observations: getLocalList(KEYS.CONDITIONS), error: err.message, isCloud: false };
  }
}

export async function createGrowingCondition(
  input: Omit<GrowingConditionObservation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ observation?: GrowingConditionObservation; error?: string; isPendingSync?: boolean }> {
  const now = new Date().toISOString();
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    const newObs: GrowingConditionObservation = {
      ...input,
      id: generateUuid(),
      userId: 'demo-user',
      createdAt: now,
      updatedAt: now,
    };
    const list = getLocalList<GrowingConditionObservation>(KEYS.CONDITIONS);
    saveLocalList(KEYS.CONDITIONS, [newObs, ...list]);
    return { observation: newObs };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { error: 'Authentication required' };

    const { data, error } = await supabase
      .from('growing_conditions')
      .insert({
        user_id: auth.user.id,
        plant_id: input.plantId || null,
        environment_zone: input.environmentZone || null,
        light_level: input.lightLevel || null,
        light_duration_hours: input.lightDurationHours ?? null,
        light_source: input.lightSource || null,
        is_grow_light: Boolean(input.isGrowLight),
        temperature_celsius: input.temperatureCelsius ?? null,
        temp_min_celsius: input.tempMinCelsius ?? null,
        temp_max_celsius: input.tempMaxCelsius ?? null,
        relative_humidity_percent: input.relativeHumidityPercent ?? null,
        airflow_quality: input.airflowQuality || null,
        soil_moisture: input.soilMoisture || null,
        drainage_quality: input.drainageQuality || null,
        ph: input.ph ?? null,
        medium_type: input.mediumType || null,
        notes: input.notes || null,
        observation_time: input.observationTime || now,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const mapped: GrowingConditionObservation = {
      id: data.id,
      userId: data.user_id,
      plantId: data.plant_id,
      environmentZone: data.environment_zone,
      lightLevel: data.light_level,
      lightDurationHours: data.light_duration_hours,
      lightSource: data.light_source,
      isGrowLight: Boolean(data.is_grow_light),
      temperatureCelsius: data.temperature_celsius,
      tempMinCelsius: data.temp_min_celsius,
      tempMaxCelsius: data.temp_max_celsius,
      relativeHumidityPercent: data.relative_humidity_percent,
      airflowQuality: data.airflow_quality,
      soilMoisture: data.soil_moisture,
      drainageQuality: data.drainage_quality,
      ph: data.ph,
      mediumType: data.medium_type,
      notes: data.notes,
      observationTime: data.observation_time,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { observation: mapped };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==============================================================================
// 2. FEEDING & FERTILIZATION RECORDS
// ==============================================================================

export async function fetchFeedingRecords(plantId?: string): Promise<{
  records: FeedingRecord[];
  error?: string;
  isCloud: boolean;
}> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    let list = getLocalList<FeedingRecord>(KEYS.FEEDINGS);
    if (plantId) {
      list = list.filter((f) => !f.plantId || f.plantId === plantId);
    }
    return { records: list, isCloud: false };
  }

  const supabase = createClient();
  if (!supabase) return { records: getLocalList(KEYS.FEEDINGS), isCloud: false };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { records: getLocalList(KEYS.FEEDINGS), isCloud: false };

    let query = supabase
      .from('feeding_records')
      .select('*')
      .order('feeding_date', { ascending: false });

    if (plantId) {
      query = query.or(`plant_id.is.null,plant_id.eq.${plantId}`);
    }

    const { data, error } = await query;
    if (error) return { records: getLocalList(KEYS.FEEDINGS), error: error.message, isCloud: false };

    const mapped: FeedingRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      plantId: row.plant_id,
      feedingDate: row.feeding_date,
      productName: row.product_name,
      fertilizerType: row.fertilizer_type,
      npkRatio: row.npk_ratio,
      formulation: row.formulation,
      applicationMethod: row.application_method,
      dosageAmount: row.dosage_amount,
      dosageUnit: row.dosage_unit,
      dosageUnknown: Boolean(row.dosage_unknown),
      sourceReference: row.source_reference,
      nextPlannedDate: row.next_planned_date,
      growerObservation: row.grower_observation,
      nutrientObservation: row.nutrient_observation,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { records: mapped, isCloud: true };
  } catch (err: any) {
    return { records: getLocalList(KEYS.FEEDINGS), error: err.message, isCloud: false };
  }
}

export async function createFeedingRecord(
  input: Omit<FeedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ record?: FeedingRecord; error?: string; isPendingSync?: boolean }> {
  const now = new Date().toISOString();
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    const newRecord: FeedingRecord = {
      ...input,
      id: generateUuid(),
      userId: 'demo-user',
      createdAt: now,
      updatedAt: now,
    };
    const list = getLocalList<FeedingRecord>(KEYS.FEEDINGS);
    saveLocalList(KEYS.FEEDINGS, [newRecord, ...list]);
    return { record: newRecord };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { error: 'Authentication required' };

    const { data, error } = await supabase
      .from('feeding_records')
      .insert({
        user_id: auth.user.id,
        plant_id: input.plantId || null,
        feeding_date: input.feedingDate || now,
        product_name: input.productName,
        fertilizer_type: input.fertilizerType,
        npk_ratio: input.npkRatio || null,
        formulation: input.formulation || null,
        application_method: input.applicationMethod,
        dosage_amount: input.dosageAmount ?? null,
        dosage_unit: input.dosageUnit || null,
        dosage_unknown: Boolean(input.dosageUnknown),
        source_reference: input.sourceReference || null,
        next_planned_date: input.nextPlannedDate || null,
        grower_observation: input.growerObservation || null,
        nutrient_observation: input.nutrientObservation || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const mapped: FeedingRecord = {
      id: data.id,
      userId: data.user_id,
      plantId: data.plant_id,
      feedingDate: data.feeding_date,
      productName: data.product_name,
      fertilizerType: data.fertilizer_type,
      npkRatio: data.npk_ratio,
      formulation: data.formulation,
      applicationMethod: data.application_method,
      dosageAmount: data.dosage_amount,
      dosageUnit: data.dosage_unit,
      dosageUnknown: Boolean(data.dosage_unknown),
      sourceReference: data.source_reference,
      nextPlannedDate: data.next_planned_date,
      growerObservation: data.grower_observation,
      nutrientObservation: data.nutrient_observation,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { record: mapped };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==============================================================================
// 3. PROPAGATION EVENTS
// ==============================================================================

export async function fetchPropagationEvents(parentPlantId?: string): Promise<{
  events: PropagationEvent[];
  error?: string;
  isCloud: boolean;
}> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    let list = getLocalList<PropagationEvent>(KEYS.PROPAGATIONS);
    if (parentPlantId) {
      list = list.filter((e) => e.parentPlantId === parentPlantId);
    }
    return { events: list, isCloud: false };
  }

  const supabase = createClient();
  if (!supabase) return { events: getLocalList(KEYS.PROPAGATIONS), isCloud: false };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { events: getLocalList(KEYS.PROPAGATIONS), isCloud: false };

    let query = supabase
      .from('propagation_events')
      .select('*')
      .order('started_date', { ascending: false });

    if (parentPlantId) {
      query = query.eq('parent_plant_id', parentPlantId);
    }

    const { data, error } = await query;
    if (error) return { events: getLocalList(KEYS.PROPAGATIONS), error: error.message, isCloud: false };

    const mapped: PropagationEvent[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      parentPlantId: row.parent_plant_id,
      propagationMethod: row.propagation_method as any,
      startedDate: row.started_date,
      medium: row.medium,
      environment: row.environment,
      notes: row.notes,
      expectedFollowupDate: row.expected_followup_date,
      status: row.status,
      outcomeDate: row.outcome_date,
      offspringPlantId: row.offspring_plant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { events: mapped, isCloud: true };
  } catch (err: any) {
    return { events: getLocalList(KEYS.PROPAGATIONS), error: err.message, isCloud: false };
  }
}

export async function createPropagationEvent(
  input: Omit<PropagationEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ event?: PropagationEvent; error?: string; isPendingSync?: boolean }> {
  const now = new Date().toISOString();
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    const newEvent: PropagationEvent = {
      ...input,
      id: generateUuid(),
      userId: 'demo-user',
      createdAt: now,
      updatedAt: now,
    };
    const list = getLocalList<PropagationEvent>(KEYS.PROPAGATIONS);
    saveLocalList(KEYS.PROPAGATIONS, [newEvent, ...list]);
    return { event: newEvent };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { error: 'Authentication required' };

    const { data, error } = await supabase
      .from('propagation_events')
      .insert({
        user_id: auth.user.id,
        parent_plant_id: input.parentPlantId,
        propagation_method: input.propagationMethod,
        started_date: input.startedDate,
        medium: input.medium || null,
        environment: input.environment || null,
        notes: input.notes || null,
        expected_followup_date: input.expectedFollowupDate || null,
        status: input.status || 'in_progress',
        outcome_date: input.outcomeDate || null,
        offspring_plant_id: input.offspringPlantId || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const mapped: PropagationEvent = {
      id: data.id,
      userId: data.user_id,
      parentPlantId: data.parent_plant_id,
      propagationMethod: data.propagation_method as any,
      startedDate: data.started_date,
      medium: data.medium,
      environment: data.environment,
      notes: data.notes,
      expectedFollowupDate: data.expected_followup_date,
      status: data.status,
      outcomeDate: data.outcome_date,
      offspringPlantId: data.offspring_plant_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { event: mapped };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==============================================================================
// 4. PRODUCTION / CROP CYCLES
// ==============================================================================

export async function fetchProductionCycles(): Promise<{
  cycles: ProductionCycle[];
  error?: string;
  isCloud: boolean;
}> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const list = getLocalList<ProductionCycle>(KEYS.CYCLES);
    return { cycles: list, isCloud: false };
  }

  const supabase = createClient();
  if (!supabase) return { cycles: getLocalList(KEYS.CYCLES), isCloud: false };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { cycles: getLocalList(KEYS.CYCLES), isCloud: false };

    const { data, error } = await supabase
      .from('production_cycles')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) return { cycles: getLocalList(KEYS.CYCLES), error: error.message, isCloud: false };

    const mapped: ProductionCycle[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      cycleName: row.cycle_name,
      plantSlug: row.plant_slug,
      growingArea: row.growing_area,
      startDate: row.start_date,
      expectedEndDate: row.expected_end_date,
      actualEndDate: row.actual_end_date,
      stage: row.stage,
      quantityPlanted: row.quantity_planted,
      quantityActive: row.quantity_active,
      quantityLost: row.quantity_lost,
      quantityHarvested: row.quantity_harvested,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { cycles: mapped, isCloud: true };
  } catch (err: any) {
    return { cycles: getLocalList(KEYS.CYCLES), error: err.message, isCloud: false };
  }
}

export async function createProductionCycle(
  input: Omit<ProductionCycle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ cycle?: ProductionCycle; error?: string; isPendingSync?: boolean }> {
  const now = new Date().toISOString();
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    const newCycle: ProductionCycle = {
      ...input,
      id: generateUuid(),
      userId: 'demo-user',
      createdAt: now,
      updatedAt: now,
    };
    const list = getLocalList<ProductionCycle>(KEYS.CYCLES);
    saveLocalList(KEYS.CYCLES, [newCycle, ...list]);
    return { cycle: newCycle };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { error: 'Authentication required' };

    const { data, error } = await supabase
      .from('production_cycles')
      .insert({
        user_id: auth.user.id,
        cycle_name: input.cycleName,
        plant_slug: input.plantSlug,
        growing_area: input.growingArea || null,
        start_date: input.startDate,
        expected_end_date: input.expectedEndDate || null,
        actual_end_date: input.actualEndDate || null,
        stage: input.stage || 'nursery',
        quantity_planted: input.quantityPlanted ?? 1,
        quantity_active: input.quantityActive ?? 1,
        quantity_lost: input.quantityLost ?? 0,
        quantity_harvested: input.quantityHarvested ?? 0,
        status: input.status || 'active',
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const mapped: ProductionCycle = {
      id: data.id,
      userId: data.user_id,
      cycleName: data.cycle_name,
      plantSlug: data.plant_slug,
      growingArea: data.growing_area,
      startDate: data.start_date,
      expectedEndDate: data.expected_end_date,
      actualEndDate: data.actual_end_date,
      stage: data.stage,
      quantityPlanted: data.quantity_planted,
      quantityActive: data.quantity_active,
      quantityLost: data.quantity_lost,
      quantityHarvested: data.quantity_harvested,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { cycle: mapped };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==============================================================================
// 5. HARVEST RECORDS
// ==============================================================================

export async function fetchHarvestRecords(plantId?: string, cycleId?: string): Promise<{
  harvests: HarvestRecord[];
  records: HarvestRecord[];
  error?: string;
  isCloud: boolean;
}> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    let list = getLocalList<HarvestRecord>(KEYS.HARVESTS);
    if (plantId) {
      list = list.filter((h) => h.plantId === plantId);
    }
    if (cycleId) {
      list = list.filter((h) => h.productionCycleId === cycleId);
    }
    return { harvests: list, records: list, isCloud: false };
  }

  const supabase = createClient();
  if (!supabase) return { harvests: getLocalList(KEYS.HARVESTS), records: getLocalList(KEYS.HARVESTS), isCloud: false };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { harvests: getLocalList(KEYS.HARVESTS), records: getLocalList(KEYS.HARVESTS), isCloud: false };

    let query = supabase
      .from('harvest_records')
      .select('*')
      .order('harvest_date', { ascending: false });

    if (plantId) query = query.eq('plant_id', plantId);
    if (cycleId) query = query.eq('production_cycle_id', cycleId);

    const { data, error } = await query;
    if (error) return { harvests: getLocalList(KEYS.HARVESTS), records: getLocalList(KEYS.HARVESTS), error: error.message, isCloud: false };

    const mapped: HarvestRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      plantId: row.plant_id,
      productionCycleId: row.production_cycle_id,
      harvestDate: row.harvest_date,
      quantity: Number(row.quantity),
      unit: row.unit,
      harvestType: row.harvest_type,
      qualityObservation: row.quality_observation,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { harvests: mapped, records: mapped, isCloud: true };
  } catch (err: any) {
    return { harvests: getLocalList(KEYS.HARVESTS), records: getLocalList(KEYS.HARVESTS), error: err.message, isCloud: false };
  }
}

export async function createHarvestRecord(
  input: Omit<HarvestRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ harvest?: HarvestRecord; record?: HarvestRecord; error?: string; isPendingSync?: boolean }> {
  const now = new Date().toISOString();
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    const newHarvest: HarvestRecord = {
      ...input,
      id: generateUuid(),
      userId: 'demo-user',
      createdAt: now,
      updatedAt: now,
    };
    const list = getLocalList<HarvestRecord>(KEYS.HARVESTS);
    saveLocalList(KEYS.HARVESTS, [newHarvest, ...list]);
    return { harvest: newHarvest, record: newHarvest };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { error: 'Authentication required' };

    const { data, error } = await supabase
      .from('harvest_records')
      .insert({
        user_id: auth.user.id,
        plant_id: input.plantId || null,
        production_cycle_id: input.productionCycleId || null,
        harvest_date: input.harvestDate || now,
        quantity: input.quantity,
        unit: input.unit,
        harvest_type: input.harvestType || 'cut_and_come_again',
        quality_observation: input.qualityObservation || null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const mapped: HarvestRecord = {
      id: data.id,
      userId: data.user_id,
      plantId: data.plant_id,
      productionCycleId: data.production_cycle_id,
      harvestDate: data.harvest_date,
      quantity: Number(data.quantity),
      unit: data.unit,
      harvestType: data.harvest_type,
      qualityObservation: data.quality_observation,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { harvest: mapped, record: mapped };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePropagationOutcome(
  id: string,
  updates: { status: 'success' | 'failure'; outcomeDate?: string; offspringPlantId?: string; notes?: string }
): Promise<{ success: boolean; error?: string }> {
  const isCloud = isSupabaseConfigured();
  const now = new Date().toISOString();

  if (!isCloud) {
    const list = getLocalList<PropagationEvent>(KEYS.PROPAGATIONS);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: 'Propagation event not found' };
    list[idx] = {
      ...list[idx],
      status: updates.status,
      outcomeDate: updates.outcomeDate || now.split('T')[0],
      offspringPlantId: updates.offspringPlantId || list[idx].offspringPlantId,
      notes: updates.notes !== undefined ? updates.notes : list[idx].notes,
      updatedAt: now,
    };
    saveLocalList(KEYS.PROPAGATIONS, list);
    return { success: true };
  }

  const supabase = createClient();
  if (!supabase) return { success: false, error: 'Database unavailable' };

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { success: false, error: 'Authentication required' };

    const payload: any = {
      status: updates.status,
      outcome_date: updates.outcomeDate || now.split('T')[0],
      updated_at: now,
    };
    if (updates.offspringPlantId) payload.offspring_plant_id = updates.offspringPlantId;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await supabase
      .from('propagation_events')
      .update(payload)
      .eq('id', id)
      .eq('user_id', auth.user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Ergonomic aliases
export const saveGrowingCondition = createGrowingCondition;
export const saveFeedingRecord = createFeedingRecord;
export const savePropagationEvent = createPropagationEvent;
export const saveProductionCycle = createProductionCycle;
export const saveHarvestRecord = createHarvestRecord;
