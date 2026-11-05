/**
 * GrowAI Phase 8.4 — Diagnosis History & Treatment Tracking Persistence Layer
 *
 * Provides pure conversion helpers and data access methods for:
 * 1. Diagnosis record & differential candidate persistence
 * 2. Observational treatment & action tracking (planned/started/completed/skipped)
 * 3. Follow-up outcome tracking (improving/unchanged/worsening/resolved/uncertain)
 * 4. Safe relationship mapping and offline distinction
 */

import {
  DiagnosisResponse,
  SavedDiagnosisRecord,
  SavedDiagnosisCandidate,
  SavedDiagnosisTreatment,
  SavedDiagnosisFollowUp,
  CreateDiagnosisPayload,
  CreateTreatmentInput,
  CreateFollowUpInput,
  TreatmentActionType,
  TreatmentStatus,
  FollowUpOutcome,
  PrimaryClassification,
} from '@/types/diagnosis';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const DIAGNOSIS_SCHEMA_VERSION = '1.0';

const LOCAL_STORAGE_KEYS = {
  DIAGNOSIS_HISTORY: 'growai_demo_diagnosis_history',
  DIAGNOSIS_TREATMENTS: 'growai_demo_diagnosis_treatments',
  DIAGNOSIS_FOLLOW_UPS: 'growai_demo_diagnosis_follow_ups',
};

// ==============================================================================
// 1. PURE TRANSFORMATION & VALIDATION HELPERS
// ==============================================================================

/**
 * Validates and converts an in-memory DiagnosisResponse into persistent database structures.
 * Strictly guarantees:
 * - schema_version is attached ('1.0')
 * - diagnostic provenance is preserved ('gemini-vision' | 'agronomic-heuristic' | 'fallback')
 * - candidates are limited to at most 3
 * - follow-up questions are limited to at most 3
 * - no secrets, API credentials, or raw image buffers are included
 */
export function buildDiagnosisPersistencePayload(params: {
  diagnosis: DiagnosisResponse;
  userId: string;
  userPlantId?: string | null;
  plantPhotoId?: string | null;
  diagnosisId?: string;
}): {
  record: Omit<SavedDiagnosisRecord, 'candidates' | 'treatments' | 'followUps'>;
  candidates: SavedDiagnosisCandidate[];
} {
  const { diagnosis, userId, userPlantId, plantPhotoId } = params;
  const diagnosisId = params.diagnosisId || crypto.randomUUID();
  const nowIso = new Date().toISOString();

  // Validate and determine diagnostic source provenance
  const diagnosticSource: 'gemini-vision' | 'agronomic-heuristic' | 'fallback' =
    diagnosis.engine === 'gemini-vision'
      ? 'gemini-vision'
      : diagnosis.engine === 'agronomic-heuristic'
      ? 'agronomic-heuristic'
      : 'fallback';

  // Enforce candidate limit (<= 3)
  const clampedConditions = (diagnosis.possibleConditions || []).slice(0, 3);

  // Enforce follow-up question limit (<= 3)
  const clampedQuestions = (diagnosis.followUpQuestions || []).slice(0, 3);

  const candidates: SavedDiagnosisCandidate[] = clampedConditions.map((cond, idx) => ({
    id: crypto.randomUUID(),
    diagnosisId,
    userId,
    candidateRank: idx + 1,
    kbConditionId: cond.kbConditionId || null,
    conditionName: cond.name,
    category: cond.category || null,
    explanation: cond.explanation,
    confidenceCategory: cond.confidenceCategory,
    supportingEvidence: cond.supportingEvidence || [],
    contradictingEvidence: cond.contradictingEvidence || [],
    alternativeCauses: cond.alternativeCauses || [],
    recommendedNextObservation: cond.recommendedNextObservation || null,
    groundedTreatment: cond.groundedTreatment || null,
    createdAt: nowIso,
  }));

  const record: Omit<SavedDiagnosisRecord, 'candidates' | 'treatments' | 'followUps'> = {
    id: diagnosisId,
    userId,
    userPlantId: userPlantId || null,
    plantPhotoId: plantPhotoId || null,
    schemaVersion: DIAGNOSIS_SCHEMA_VERSION,
    diagnosticSource,
    modelUsed: diagnosis.modelUsed || null,
    status: diagnosis.status,
    primaryClassification: diagnosis.primaryClassification || 'undetermined',
    isPlantRecognized: diagnosis.isPlantRecognized,
    plantIdentification: diagnosis.plantIdentification,
    plantIdentificationConfidence: diagnosis.plantIdentificationConfidence,
    plantSlug: diagnosis.userContextProvided?.plantName || null,
    overallHealth: diagnosis.overallHealth,
    imageQuality: diagnosis.imageQuality || null,
    evidenceSeparation: diagnosis.evidenceSeparation || null,
    symptoms: diagnosis.userContextProvided?.reportedSymptoms || '',
    userContext: {
      watering: diagnosis.userContextProvided?.watering,
      sunlight: diagnosis.userContextProvided?.sunlight,
      environment: diagnosis.userContextProvided?.environment,
      temperature: diagnosis.userContextProvided?.temperature,
      soil: diagnosis.userContextProvided?.soil,
      plantName: diagnosis.userContextProvided?.plantName,
    },
    visibleSymptoms: diagnosis.visibleSymptoms || [],
    likelyCauses: diagnosis.likelyCauses || [],
    recommendedChecks: diagnosis.recommendedChecks || [],
    immediateActions: diagnosis.immediateActions || [],
    longTermCare: diagnosis.longTermCare || [],
    prevention: diagnosis.prevention || [],
    uncertainties: diagnosis.uncertainties || [],
    followUpQuestions: clampedQuestions,
    requiresExpertReview: diagnosis.requiresExpertReview || false,
    summary: diagnosis.summary,
    disclaimer: diagnosis.disclaimer,
    suggestedFollowUp: diagnosis.suggestedFollowUp || null,
    diagnosedAt: diagnosis.analyzedAt || nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return { record, candidates };
}

// ==============================================================================
// 2. DATA ACCESS LAYER: DIAGNOSIS PERSISTENCE & HISTORY
// ==============================================================================

/**
 * Saves a completed diagnosis consultation to persistent history.
 */
export async function saveDiagnosisToHistory(
  payload: CreateDiagnosisPayload
): Promise<{ success: boolean; diagnosisId?: string; error?: string; isOffline?: boolean }> {
  // Check for offline environment
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      error: 'You are currently offline. Cloud persistence requires an active internet connection.',
      isOffline: true,
    };
  }

  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: 'Please sign in to save your plant diagnosis to your garden history.',
        };
      }

      const { record, candidates } = buildDiagnosisPersistencePayload({
        diagnosis: payload.diagnosis,
        userId: user.id,
        userPlantId: payload.userPlantId,
        plantPhotoId: payload.plantPhotoId,
      });

      // 1. Insert Diagnosis Record
      const { error: recordError } = await supabase.from('diagnosis_records').insert({
        id: record.id,
        user_id: user.id,
        user_plant_id: record.userPlantId,
        plant_photo_id: record.plantPhotoId,
        schema_version: record.schemaVersion,
        diagnostic_source: record.diagnosticSource,
        model_used: record.modelUsed,
        status: record.status,
        primary_classification: record.primaryClassification,
        is_plant_recognized: record.isPlantRecognized,
        plant_identification: record.plantIdentification,
        plant_identification_confidence: record.plantIdentificationConfidence,
        plant_slug: record.plantSlug,
        overall_health: record.overallHealth,
        image_quality: record.imageQuality as any,
        evidence_separation: record.evidenceSeparation as any,
        symptoms: record.symptoms,
        user_context: record.userContext as any,
        visible_symptoms: record.visibleSymptoms,
        likely_causes: record.likelyCauses,
        recommended_checks: record.recommendedChecks,
        immediate_actions: record.immediateActions,
        long_term_care: record.longTermCare,
        prevention: record.prevention,
        uncertainties: record.uncertainties,
        follow_up_questions: record.followUpQuestions as any,
        requires_expert_review: record.requiresExpertReview,
        summary: record.summary,
        disclaimer: record.disclaimer,
        suggested_follow_up: record.suggestedFollowUp,
        diagnosed_at: record.diagnosedAt,
      });

      if (recordError) {
        return { success: false, error: `Failed to save diagnosis record: ${recordError.message}` };
      }

      // 2. Insert Candidates if present
      if (candidates.length > 0) {
        const candidateInserts = candidates.map((c) => ({
          id: c.id,
          diagnosis_id: record.id,
          user_id: user.id,
          candidate_rank: c.candidateRank,
          kb_condition_id: c.kbConditionId,
          condition_name: c.conditionName,
          category: c.category,
          explanation: c.explanation,
          confidence_category: c.confidenceCategory,
          supporting_evidence: c.supportingEvidence,
          contradicting_evidence: c.contradictingEvidence || [],
          alternative_causes: c.alternativeCauses,
          recommended_next_observation: c.recommendedNextObservation,
          grounded_treatment: c.groundedTreatment as any,
        }));

        const { error: candError } = await supabase
          .from('diagnosis_candidates')
          .insert(candidateInserts);

        if (candError) {
          console.error('Error saving diagnosis candidates:', candError);
        }
      }

      return { success: true, diagnosisId: record.id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unexpected failure during diagnosis save.' };
    }
  }

  // Demo / Local Mode (Unauthenticated or local mock storage)
  try {
    const demoUserId = 'demo-grower-local';
    const { record, candidates } = buildDiagnosisPersistencePayload({
      diagnosis: payload.diagnosis,
      userId: demoUserId,
      userPlantId: payload.userPlantId,
      plantPhotoId: payload.plantPhotoId,
    });

    const fullRecord: SavedDiagnosisRecord = {
      ...record,
      candidates,
      treatments: [],
      followUps: [],
    };

    saveLocalRecord(fullRecord);
    return { success: true, diagnosisId: record.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save demo diagnosis locally.' };
  }
}

/**
 * Fetches diagnosis history for the authenticated user (or local demo).
 */
export async function fetchDiagnosisHistory(params?: {
  userPlantId?: string;
}): Promise<{ records: SavedDiagnosisRecord[]; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { records: [] };
      }

      let query = supabase
        .from('diagnosis_records')
        .select('*')
        .eq('user_id', user.id)
        .order('diagnosed_at', { ascending: false });

      if (params?.userPlantId) {
        query = query.eq('user_plant_id', params.userPlantId);
      }

      const { data, error } = await query;

      if (error) {
        return { records: [], error: error.message };
      }

      const records: SavedDiagnosisRecord[] = (data || []).map(mapDatabaseRowToDiagnosisRecord);
      return { records };
    } catch (err: any) {
      return { records: [], error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const local = getLocalRecords();
    let filtered = local;
    if (params?.userPlantId) {
      filtered = filtered.filter((r) => r.userPlantId === params.userPlantId);
    }
    return { records: filtered.sort((a, b) => new Date(b.diagnosedAt).getTime() - new Date(a.diagnosedAt).getTime()) };
  } catch {
    return { records: [] };
  }
}

/**
 * Fetches all diagnoses for a specific user plant with full candidate, treatment, and follow-up data.
 */
export async function fetchDiagnosesForPlant(
  userPlantId: string
): Promise<{ records: SavedDiagnosisRecord[]; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { records: [], error: 'Authentication required.' };
      }

      const { data: recordsData, error: recordsError } = await supabase
        .from('diagnosis_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('user_plant_id', userPlantId)
        .order('diagnosed_at', { ascending: false });

      if (recordsError) {
        return { records: [], error: recordsError.message };
      }

      if (!recordsData || recordsData.length === 0) {
        return { records: [] };
      }

      const diagnosisIds = recordsData.map((r) => r.id);

      const [candidatesRes, treatmentsRes, followUpsRes] = await Promise.all([
        supabase
          .from('diagnosis_candidates')
          .select('*')
          .in('diagnosis_id', diagnosisIds)
          .order('candidate_rank', { ascending: true }),
        supabase
          .from('diagnosis_treatments')
          .select('*')
          .in('diagnosis_id', diagnosisIds)
          .order('action_date', { ascending: false }),
        supabase
          .from('diagnosis_follow_ups')
          .select('*')
          .in('diagnosis_id', diagnosisIds)
          .order('follow_up_date', { ascending: false }),
      ]);

      const candidatesByDiag: Record<string, SavedDiagnosisCandidate[]> = {};
      for (const c of candidatesRes.data || []) {
        if (!candidatesByDiag[c.diagnosis_id]) candidatesByDiag[c.diagnosis_id] = [];
        candidatesByDiag[c.diagnosis_id].push(mapDatabaseRowToCandidate(c));
      }

      const treatmentsByDiag: Record<string, SavedDiagnosisTreatment[]> = {};
      for (const t of treatmentsRes.data || []) {
        if (!treatmentsByDiag[t.diagnosis_id]) treatmentsByDiag[t.diagnosis_id] = [];
        treatmentsByDiag[t.diagnosis_id].push(mapDatabaseRowToTreatment(t));
      }

      const followUpsByDiag: Record<string, SavedDiagnosisFollowUp[]> = {};
      for (const f of followUpsRes.data || []) {
        if (!followUpsByDiag[f.diagnosis_id]) followUpsByDiag[f.diagnosis_id] = [];
        followUpsByDiag[f.diagnosis_id].push(mapDatabaseRowToFollowUp(f));
      }

      const records: SavedDiagnosisRecord[] = recordsData.map((row) => {
        const r = mapDatabaseRowToDiagnosisRecord(row);
        r.candidates = candidatesByDiag[r.id] || [];
        r.treatments = treatmentsByDiag[r.id] || [];
        r.followUps = followUpsByDiag[r.id] || [];
        return r;
      });

      return { records };
    } catch (err: any) {
      return { records: [], error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const local = getLocalRecords();
    const matching = local
      .filter((r) => r.userPlantId === userPlantId)
      .sort((a, b) => new Date(b.diagnosedAt).getTime() - new Date(a.diagnosedAt).getTime());
    return { records: matching };
  } catch (err: any) {
    return { records: [], error: err.message };
  }
}

/**
 * Fetches all diagnoses for all plants in the garden with full details.
 * Returns both the complete list and a map keyed by userPlantId.
 */
export async function fetchAllGardenDiagnoses(): Promise<{
  allDiagnoses: SavedDiagnosisRecord[];
  diagnosesByPlantId: Record<string, SavedDiagnosisRecord[]>;
  error?: string;
}> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { allDiagnoses: [], diagnosesByPlantId: {}, error: 'Authentication required.' };
      }

      const { data: recordsData, error: recordsError } = await supabase
        .from('diagnosis_records')
        .select('*')
        .eq('user_id', user.id)
        .order('diagnosed_at', { ascending: false });

      if (recordsError) {
        return { allDiagnoses: [], diagnosesByPlantId: {}, error: recordsError.message };
      }

      if (!recordsData || recordsData.length === 0) {
        return { allDiagnoses: [], diagnosesByPlantId: {} };
      }

      const diagnosisIds = recordsData.map((r) => r.id);

      const [candidatesRes, treatmentsRes, followUpsRes] = await Promise.all([
        supabase
          .from('diagnosis_candidates')
          .select('*')
          .in('diagnosis_id', diagnosisIds)
          .order('candidate_rank', { ascending: true }),
        supabase
          .from('diagnosis_treatments')
          .select('*')
          .in('diagnosis_id', diagnosisIds)
          .order('action_date', { ascending: false }),
        supabase
          .from('diagnosis_follow_ups')
          .select('*')
          .in('diagnosis_id', diagnosisIds)
          .order('follow_up_date', { ascending: false }),
      ]);

      const candidatesByDiag: Record<string, SavedDiagnosisCandidate[]> = {};
      for (const c of candidatesRes.data || []) {
        if (!candidatesByDiag[c.diagnosis_id]) candidatesByDiag[c.diagnosis_id] = [];
        candidatesByDiag[c.diagnosis_id].push(mapDatabaseRowToCandidate(c));
      }

      const treatmentsByDiag: Record<string, SavedDiagnosisTreatment[]> = {};
      for (const t of treatmentsRes.data || []) {
        if (!treatmentsByDiag[t.diagnosis_id]) treatmentsByDiag[t.diagnosis_id] = [];
        treatmentsByDiag[t.diagnosis_id].push(mapDatabaseRowToTreatment(t));
      }

      const followUpsByDiag: Record<string, SavedDiagnosisFollowUp[]> = {};
      for (const f of followUpsRes.data || []) {
        if (!followUpsByDiag[f.diagnosis_id]) followUpsByDiag[f.diagnosis_id] = [];
        followUpsByDiag[f.diagnosis_id].push(mapDatabaseRowToFollowUp(f));
      }

      const allDiagnoses: SavedDiagnosisRecord[] = recordsData.map((row) => {
        const r = mapDatabaseRowToDiagnosisRecord(row);
        r.candidates = candidatesByDiag[r.id] || [];
        r.treatments = treatmentsByDiag[r.id] || [];
        r.followUps = followUpsByDiag[r.id] || [];
        return r;
      });

      const diagnosesByPlantId: Record<string, SavedDiagnosisRecord[]> = {};
      for (const d of allDiagnoses) {
        if (d.userPlantId) {
          if (!diagnosesByPlantId[d.userPlantId]) diagnosesByPlantId[d.userPlantId] = [];
          diagnosesByPlantId[d.userPlantId].push(d);
        }
      }

      return { allDiagnoses, diagnosesByPlantId };
    } catch (err: any) {
      return { allDiagnoses: [], diagnosesByPlantId: {}, error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const local = getLocalRecords();
    const sorted = [...local].sort(
      (a, b) => new Date(b.diagnosedAt).getTime() - new Date(a.diagnosedAt).getTime()
    );
    const diagnosesByPlantId: Record<string, SavedDiagnosisRecord[]> = {};
    for (const d of sorted) {
      if (d.userPlantId) {
        if (!diagnosesByPlantId[d.userPlantId]) diagnosesByPlantId[d.userPlantId] = [];
        diagnosesByPlantId[d.userPlantId].push(d);
      }
    }
    return { allDiagnoses: sorted, diagnosesByPlantId };
  } catch (err: any) {
    return { allDiagnoses: [], diagnosesByPlantId: {}, error: err.message };
  }
}

/**
 * Fetches a single diagnosis record by ID with its candidates, treatments, and follow-ups.
 */
export async function fetchDiagnosisById(
  id: string
): Promise<{ record?: SavedDiagnosisRecord; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { error: 'Authentication required.' };
      }

      // 1. Fetch Record
      const { data: recordData, error: recordError } = await supabase
        .from('diagnosis_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (recordError || !recordData) {
        return { error: recordError?.message || 'Diagnosis record not found.' };
      }

      // 2. Fetch Candidates
      const { data: candidateData } = await supabase
        .from('diagnosis_candidates')
        .select('*')
        .eq('diagnosis_id', id)
        .order('candidate_rank', { ascending: true });

      // 3. Fetch Treatments
      const { data: treatmentData } = await supabase
        .from('diagnosis_treatments')
        .select('*')
        .eq('diagnosis_id', id)
        .order('action_date', { ascending: false });

      // 4. Fetch Follow-ups
      const { data: followUpData } = await supabase
        .from('diagnosis_follow_ups')
        .select('*')
        .eq('diagnosis_id', id)
        .order('follow_up_date', { ascending: false });

      const record = mapDatabaseRowToDiagnosisRecord(recordData);
      record.candidates = (candidateData || []).map(mapDatabaseRowToCandidate);
      record.treatments = (treatmentData || []).map(mapDatabaseRowToTreatment);
      record.followUps = (followUpData || []).map(mapDatabaseRowToFollowUp);

      return { record };
    } catch (err: any) {
      return { error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const local = getLocalRecords();
    const found = local.find((r) => r.id === id);
    if (!found) {
      return { error: 'Diagnosis record not found in local demo garden.' };
    }
    return { record: found };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Deletes a diagnosis record. All child candidates, treatments, and follow-ups cascade delete.
 * Plant records and plant photos remain intact.
 */
export async function deleteDiagnosisRecord(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Authentication required.' };
      }

      const { error } = await supabase
        .from('diagnosis_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const local = getLocalRecords().filter((r) => r.id !== id);
    saveAllLocalRecords(local);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 3. TREATMENT TRACKING (Actions taken after diagnosis)
// ==============================================================================

/**
 * Records an action or treatment intervention taken after diagnosis.
 */
export async function recordTreatmentAction(
  input: CreateTreatmentInput
): Promise<{ success: boolean; treatment?: SavedDiagnosisTreatment; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;
  const nowIso = new Date().toISOString();
  const todayStr = input.actionDate || nowIso.split('T')[0];

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Authentication required to record treatments.' };
      }

      const status: TreatmentStatus = input.status || 'planned';
      const completedAt = status === 'completed' ? nowIso : null;

      const { data, error } = await supabase
        .from('diagnosis_treatments')
        .insert({
          diagnosis_id: input.diagnosisId,
          user_id: user.id,
          user_plant_id: input.userPlantId || null,
          action_type: input.actionType,
          action_title: input.actionTitle,
          status,
          notes: input.notes || null,
          action_date: todayStr,
          completed_at: completedAt,
        })
        .select()
        .single();

      if (error || !data) {
        return { success: false, error: error?.message || 'Failed to save treatment record.' };
      }

      return { success: true, treatment: mapDatabaseRowToTreatment(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const newTreatment: SavedDiagnosisTreatment = {
      id: crypto.randomUUID(),
      diagnosisId: input.diagnosisId,
      userId: 'demo-grower-local',
      userPlantId: input.userPlantId || null,
      actionType: input.actionType,
      actionTitle: input.actionTitle,
      status: input.status || 'planned',
      notes: input.notes || null,
      actionDate: todayStr,
      completedAt: input.status === 'completed' ? nowIso : null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const records = getLocalRecords();
    const target = records.find((r) => r.id === input.diagnosisId);
    if (target) {
      target.treatments = target.treatments || [];
      target.treatments.unshift(newTreatment);
      saveAllLocalRecords(records);
    }

    return { success: true, treatment: newTreatment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates status of an existing treatment action (planned | started | completed | skipped).
 */
export async function updateTreatmentStatus(
  treatmentId: string,
  status: TreatmentStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;
  const nowIso = new Date().toISOString();
  const completedAt = status === 'completed' ? nowIso : null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Authentication required.' };
      }

      const { error } = await supabase
        .from('diagnosis_treatments')
        .update({
          status,
          completed_at: completedAt,
          updated_at: nowIso,
        })
        .eq('id', treatmentId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const records = getLocalRecords();
    for (const r of records) {
      if (r.treatments) {
        const item = r.treatments.find((t) => t.id === treatmentId);
        if (item) {
          item.status = status;
          item.completedAt = completedAt;
          item.updatedAt = nowIso;
          saveAllLocalRecords(records);
          return { success: true };
        }
      }
    }
    return { success: false, error: 'Treatment not found in demo garden.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a treatment record.
 */
export async function deleteTreatmentAction(
  treatmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Authentication required.' };
      }

      const { error } = await supabase
        .from('diagnosis_treatments')
        .delete()
        .eq('id', treatmentId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const records = getLocalRecords();
    for (const r of records) {
      if (r.treatments) {
        r.treatments = r.treatments.filter((t) => t.id !== treatmentId);
      }
    }
    saveAllLocalRecords(records);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 4. FOLLOW-UP / OUTCOME TRACKING
// ==============================================================================

/**
 * Records an observational follow-up outcome after treatment or monitoring.
 */
export async function recordFollowUpOutcome(
  input: CreateFollowUpInput
): Promise<{ success: boolean; followUp?: SavedDiagnosisFollowUp; error?: string }> {
  const supabase = createClient();
  const isCloud = isSupabaseConfigured() && supabase !== null;
  const nowIso = new Date().toISOString();
  const todayStr = input.followUpDate || nowIso.split('T')[0];

  const rawNotes = input.observationNotes || '';
  const notesToSave = input.plantPhotoId
    ? (rawNotes ? `${rawNotes} [Photo: ${input.plantPhotoId}]` : `[Photo: ${input.plantPhotoId}]`)
    : (rawNotes || null);

  if (isCloud) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Authentication required to record follow-up.' };
      }

      const { data, error } = await supabase
        .from('diagnosis_follow_ups')
        .insert({
          diagnosis_id: input.diagnosisId,
          user_id: user.id,
          outcome_status: input.outcomeStatus,
          observation_notes: notesToSave,
          follow_up_date: todayStr,
        })
        .select()
        .single();

      if (error || !data) {
        return { success: false, error: error?.message || 'Failed to record follow-up outcome.' };
      }

      return { success: true, followUp: mapDatabaseRowToFollowUp(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Demo / Local Mode
  try {
    const newFollowUp: SavedDiagnosisFollowUp = {
      id: crypto.randomUUID(),
      diagnosisId: input.diagnosisId,
      userId: 'demo-grower-local',
      outcomeStatus: input.outcomeStatus,
      observationNotes: input.observationNotes || null,
      followUpDate: todayStr,
      plantPhotoId: input.plantPhotoId || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const records = getLocalRecords();
    const target = records.find((r) => r.id === input.diagnosisId);
    if (target) {
      target.followUps = target.followUps || [];
      target.followUps.unshift(newFollowUp);
      saveAllLocalRecords(records);
    }

    return { success: true, followUp: newFollowUp };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 5. DATABASE ROW MAPPERS (Pure functions)
// ==============================================================================

function mapDatabaseRowToDiagnosisRecord(row: any): SavedDiagnosisRecord {
  return {
    id: row.id,
    userId: row.user_id,
    userPlantId: row.user_plant_id,
    plantPhotoId: row.plant_photo_id,
    schemaVersion: row.schema_version,
    diagnosticSource: row.diagnostic_source,
    modelUsed: row.model_used,
    status: row.status,
    primaryClassification: row.primary_classification as PrimaryClassification,
    isPlantRecognized: row.is_plant_recognized,
    plantIdentification: row.plant_identification,
    plantIdentificationConfidence: row.plant_identification_confidence,
    plantSlug: row.plant_slug,
    overallHealth: row.overall_health,
    imageQuality: row.image_quality,
    evidenceSeparation: row.evidence_separation,
    symptoms: row.symptoms,
    userContext: row.user_context || {},
    visibleSymptoms: row.visible_symptoms || [],
    likelyCauses: row.likely_causes || [],
    recommendedChecks: row.recommended_checks || [],
    immediateActions: row.immediate_actions || [],
    longTermCare: row.long_term_care || [],
    prevention: row.prevention || [],
    uncertainties: row.uncertainties || [],
    followUpQuestions: row.follow_up_questions || [],
    requiresExpertReview: row.requires_expert_review,
    summary: row.summary,
    disclaimer: row.disclaimer,
    suggestedFollowUp: row.suggested_follow_up,
    diagnosedAt: row.diagnosed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDatabaseRowToCandidate(row: any): SavedDiagnosisCandidate {
  return {
    id: row.id,
    diagnosisId: row.diagnosis_id,
    userId: row.user_id,
    candidateRank: row.candidate_rank,
    kbConditionId: row.kb_condition_id,
    conditionName: row.condition_name,
    category: row.category,
    explanation: row.explanation,
    confidenceCategory: row.confidence_category,
    supportingEvidence: row.supporting_evidence || [],
    contradictingEvidence: row.contradicting_evidence || [],
    alternativeCauses: row.alternative_causes || [],
    recommendedNextObservation: row.recommended_next_observation,
    groundedTreatment: row.grounded_treatment,
    createdAt: row.created_at,
  };
}

function mapDatabaseRowToTreatment(row: any): SavedDiagnosisTreatment {
  return {
    id: row.id,
    diagnosisId: row.diagnosis_id,
    userId: row.user_id,
    userPlantId: row.user_plant_id,
    actionType: row.action_type as TreatmentActionType,
    actionTitle: row.action_title,
    status: row.status as TreatmentStatus,
    notes: row.notes,
    actionDate: row.action_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDatabaseRowToFollowUp(row: any): SavedDiagnosisFollowUp {
  const photoMatch = row.observation_notes?.match(/\[Photo:\s*([a-f0-9\-]+)\]/i);
  const plantPhotoId = photoMatch ? photoMatch[1] : (row.plant_photo_id || null);
  const cleanNotes = row.observation_notes
    ? row.observation_notes.replace(/\[Photo:\s*[a-f0-9\-]+\]/i, '').trim()
    : null;

  return {
    id: row.id,
    diagnosisId: row.diagnosis_id,
    userId: row.user_id,
    outcomeStatus: row.outcome_status as FollowUpOutcome,
    observationNotes: cleanNotes || (row.observation_notes ? row.observation_notes : null),
    followUpDate: row.follow_up_date,
    plantPhotoId: plantPhotoId || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==============================================================================
// 6. LOCAL STORAGE ADAPTER (Demo / Non-cloud mode)
// ==============================================================================

function getLocalRecords(): SavedDiagnosisRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.DIAGNOSIS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRecord(record: SavedDiagnosisRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const records = getLocalRecords();
    const existingIdx = records.findIndex((r) => r.id === record.id);
    if (existingIdx >= 0) {
      records[existingIdx] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIAGNOSIS_HISTORY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save diagnosis record to local storage:', err);
  }
}

function saveAllLocalRecords(records: SavedDiagnosisRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIAGNOSIS_HISTORY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to update local diagnosis records:', err);
  }
}

