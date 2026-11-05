'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import {
  fetchDiagnosisById,
  recordTreatmentAction,
  updateTreatmentStatus,
  deleteTreatmentAction,
  recordFollowUpOutcome,
  deleteDiagnosisRecord,
} from '@/lib/ai-doctor/persistence';
import {
  SavedDiagnosisRecord,
  TreatmentActionType,
  TreatmentStatus,
  FollowUpOutcome,
} from '@/types/diagnosis';
import { usePwa } from '@/context/PwaContext';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Search,
  WifiOff,
  Loader2,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Droplets,
  Sun,
  Layers,
  ShieldCheck,
  Check,
  FileText,
  Activity,
  ClipboardList,
} from 'lucide-react';

interface DiagnosisDetailClientProps {
  diagnosisId: string;
}

export function DiagnosisDetailClient({ diagnosisId }: DiagnosisDetailClientProps) {
  const router = useRouter();
  const { isOffline } = usePwa();

  const [record, setRecord] = useState<SavedDiagnosisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Treatment Form State
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [actionType, setActionType] = useState<TreatmentActionType>('adjust_watering');
  const [actionTitle, setActionTitle] = useState('');
  const [treatmentStatus, setTreatmentStatus] = useState<TreatmentStatus>('planned');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [actionDate, setActionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [treatmentError, setTreatmentError] = useState<string | null>(null);

  // New Follow-Up Form State
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpOutcome, setFollowUpOutcome] = useState<FollowUpOutcome>('improving');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  // Deletion State
  const [deleting, setDeleting] = useState(false);

  const loadRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDiagnosisById(diagnosisId);
      if (res.error || !res.record) {
        setError(res.error || 'Diagnosis assessment record not found.');
      } else {
        setRecord(res.record);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load diagnosis record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [diagnosisId]);

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) {
      setTreatmentError('Please provide a title for this action.');
      return;
    }

    setSavingTreatment(true);
    setTreatmentError(null);

    try {
      const res = await recordTreatmentAction({
        diagnosisId,
        userPlantId: record?.userPlantId,
        actionType,
        actionTitle: actionTitle.trim(),
        status: treatmentStatus,
        notes: treatmentNotes.trim() || null,
        actionDate,
      });

      if (!res.success || !res.treatment) {
        throw new Error(res.error || 'Failed to save treatment action.');
      }

      setRecord((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          treatments: [res.treatment!, ...(prev.treatments || [])],
        };
      });

      setActionTitle('');
      setTreatmentNotes('');
      setShowAddTreatment(false);
    } catch (err: any) {
      setTreatmentError(err.message || 'Failed to save treatment.');
    } finally {
      setSavingTreatment(false);
    }
  };

  const handleUpdateStatus = async (treatmentId: string, newStatus: TreatmentStatus) => {
    try {
      const res = await updateTreatmentStatus(treatmentId, newStatus);
      if (res.success) {
        setRecord((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            treatments: (prev.treatments || []).map((t) =>
              t.id === treatmentId ? { ...t, status: newStatus } : t
            ),
          };
        });
      }
    } catch (err) {
      console.error('Failed to update treatment status:', err);
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    try {
      const res = await deleteTreatmentAction(treatmentId);
      if (res.success) {
        setRecord((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            treatments: (prev.treatments || []).filter((t) => t.id !== treatmentId),
          };
        });
      }
    } catch (err) {
      console.error('Failed to delete treatment action:', err);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFollowUp(true);
    setFollowUpError(null);

    try {
      const res = await recordFollowUpOutcome({
        diagnosisId,
        outcomeStatus: followUpOutcome,
        observationNotes: followUpNotes.trim() || null,
        followUpDate,
      });

      if (!res.success || !res.followUp) {
        throw new Error(res.error || 'Failed to record follow-up outcome.');
      }

      setRecord((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          followUps: [res.followUp!, ...(prev.followUps || [])],
        };
      });

      setFollowUpNotes('');
      setShowAddFollowUp(false);
    } catch (err: any) {
      setFollowUpError(err.message || 'Failed to save follow-up.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleDeleteDiagnosis = async () => {
    if (!confirm('Are you sure you want to delete this diagnosis record? Associated treatments and follow-up notes will also be removed. Your garden plant will remain intact.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await deleteDiagnosisRecord(diagnosisId);
      if (res.success) {
        router.push('/app/ai-doctor/history');
      }
    } catch (err) {
      console.error('Failed to delete diagnosis:', err);
      setDeleting(false);
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'sage';
      case 'mild_stress':
        return 'amber';
      case 'moderate_issue':
      case 'severe_issue':
        return 'terracotta';
      default:
        return 'neutral';
    }
  };

  const getOutcomeBadgeVariant = (outcome: FollowUpOutcome) => {
    switch (outcome) {
      case 'improving':
        return 'sage';
      case 'resolved':
        return 'forest';
      case 'worsening':
        return 'terracotta';
      case 'uncertain':
        return 'amber';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: TreatmentStatus) => {
    switch (status) {
      case 'completed':
        return 'forest';
      case 'started':
        return 'sage';
      case 'skipped':
        return 'neutral';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="Diagnostic Assessment Snapshot"
        subtitle="Historical consultation, differential reasoning, treatment tracking, and outcome monitoring."
        actionHref="/app/ai-doctor/history"
        actionLabel="Back to History"
        actionIcon="none"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/app/ai-doctor/history"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#144229] hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Back to Diagnosis History</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteDiagnosis}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c9e91] hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{deleting ? 'Deleting...' : 'Delete Assessment'}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#526a57]">
            <Loader2 size={32} className="animate-spin text-[#144229]" />
            <p className="text-sm font-medium">Retrieving diagnosis assessment details...</p>
          </div>
        ) : error || !record ? (
          /* Error State */
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-10 text-center space-y-4">
            <AlertTriangle size={36} className="text-[#9a3412] mx-auto" />
            <h3 className="font-serif font-bold text-xl text-[#0c2417]">Assessment Not Found</h3>
            <p className="text-xs sm:text-sm text-[#526a57] max-w-md mx-auto">
              {error || 'The requested diagnosis record could not be found or you do not have permission to access it.'}
            </p>
            <Link
              href="/app/ai-doctor/history"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#144229] text-white text-xs font-semibold"
            >
              Return to History
            </Link>
          </div>
        ) : (
          /* Record Loaded */
          <div className="space-y-8">
            {/* 1. Header Snapshot Card */}
            <div className="bg-[#0e2a1b] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#bed4c5] pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>
                    Diagnosed on{' '}
                    {new Date(record.diagnosedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium text-[11px]">
                    {record.diagnosticSource === 'gemini-vision'
                      ? 'Gemini 3.8 Flash Vision'
                      : 'Agronomic Heuristic'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#a4f0bf] font-medium text-[11px]">
                    Schema v{record.schemaVersion}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {record.plantIdentification}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#d1e6d7] mt-1">
                    Identification Confidence: <strong className="capitalize">{record.plantIdentificationConfidence}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getHealthBadgeVariant(record.overallHealth)} size="md">
                    {record.overallHealth.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline" size="md" className="capitalize text-white border-white/30">
                    {record.primaryClassification || 'undetermined'}
                  </Badge>
                </div>
              </div>

              {/* Grower Context Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs text-[#bed4c5]">
                {record.userContext?.watering && (
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-[#a4f0bf] shrink-0" />
                    <span>Watering: {record.userContext.watering}</span>
                  </div>
                )}
                {record.userContext?.sunlight && (
                  <div className="flex items-center gap-2">
                    <Sun size={14} className="text-[#a4f0bf] shrink-0" />
                    <span>Sunlight: {record.userContext.sunlight}</span>
                  </div>
                )}
                {record.userContext?.environment && (
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-[#a4f0bf] shrink-0" />
                    <span>Location: {record.userContext.environment}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reported Symptoms & Summary */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                <FileText size={18} className="text-[#144229]" />
                Grower Reported Symptoms & Clinical Summary
              </h3>

              {record.symptoms && (
                <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] text-xs sm:text-sm text-[#2e4435]">
                  <strong className="text-[#0c2417] block mb-1">Observations Described:</strong>
                  {record.symptoms}
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#2e4435] leading-relaxed">
                {record.summary}
              </p>
            </div>

            {/* Evidence Separation (Observed vs Interpretation vs Unknowns) */}
            {record.evidenceSeparation && (
              <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#144229]" />
                  Evidence Separation & Diagnostic Grounding
                </h3>
                <p className="text-xs text-[#526a57]">
                  Strictly delineates directly visible photographic clues from botanical hypotheses and unseen environmental factors.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Observed Evidence */}
                  <div className="p-4 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#144229]">
                      1. Observed Facts
                    </h5>
                    <ul className="text-xs text-[#1e613b] space-y-1.5">
                      {record.evidenceSeparation.observedEvidence?.map((fact, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Diagnostic Interpretation */}
                  <div className="p-4 rounded-2xl bg-[#fff8e6] border border-[#fde68a] space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#92400e]">
                      2. Agronomic Hypotheses
                    </h5>
                    <ul className="text-xs text-[#78350f] space-y-1.5">
                      {record.evidenceSeparation.diagnosticInterpretation?.map((hyp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{hyp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Unknown Information */}
                  <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#526a57]">
                      3. Unknown Factors
                    </h5>
                    <ul className="text-xs text-[#2e4435] space-y-1.5">
                      {record.evidenceSeparation.unknownInformation?.map((unk, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{unk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Differential Candidates (Preserved Snapshot) */}
            {record.candidates && record.candidates.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#0c2417] flex items-center gap-2">
                    <Search size={20} className="text-[#144229]" />
                    Differential Diagnosis Candidates
                  </h3>
                  <p className="text-xs text-[#526a57] mt-0.5">
                    Up to three hypotheses evaluated by the diagnostic engine, ordered by plausibility.
                  </p>
                </div>

                <div className="space-y-4">
                  {record.candidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-5 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#144229] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {cand.candidateRank}
                          </span>
                          <h4 className="font-serif font-bold text-base text-[#0c2417]">
                            {cand.conditionName}
                          </h4>
                          {cand.kbConditionId && (
                            <Link
                              href="/app/learn"
                              className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
                              title="Explore condition in knowledge base"
                            >
                              <span>KB: {cand.kbConditionId}</span>
                              <ExternalLink size={12} />
                            </Link>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="sage" size="sm">
                            {cand.confidenceCategory} confidence
                          </Badge>
                          {cand.category && (
                            <Badge variant="outline" size="sm" className="capitalize">
                              {cand.category}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#2e4435] leading-relaxed">
                        {cand.explanation}
                      </p>

                      {/* Supporting Clues */}
                      {cand.supportingEvidence?.length > 0 && (
                        <div className="text-xs space-y-1">
                          <strong className="text-[#0c2417]">Supporting Visual Clues:</strong>
                          <ul className="list-disc list-inside text-[#2e4435] pl-1 space-y-0.5">
                            {cand.supportingEvidence.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Grounded Treatments Snapshot */}
                      {cand.groundedTreatment && (
                        <div className="pt-2 border-t border-[#ded5c5]/60 mt-2 space-y-2 text-xs">
                          <strong className="text-[#144229] block">
                            Knowledge-Grounded Corrective Guidelines:
                          </strong>
                          {cand.groundedTreatment.culturalCorrections?.length > 0 && (
                            <div className="text-[#2e4435]">
                              <span className="font-medium text-[#0c2417]">Cultural:</span>{' '}
                              {cand.groundedTreatment.culturalCorrections.join('; ')}
                            </div>
                          )}
                          {cand.groundedTreatment.mechanicalPhysicalControls?.length > 0 && (
                            <div className="text-[#2e4435]">
                              <span className="font-medium text-[#0c2417]">Mechanical:</span>{' '}
                              {cand.groundedTreatment.mechanicalPhysicalControls.join('; ')}
                            </div>
                          )}
                          {cand.groundedTreatment.cureDisclaimer && (
                            <p className="italic text-[11px] text-[#526a57] pt-1">
                              {cand.groundedTreatment.cureDisclaimer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions (If Present) */}
            {record.followUpQuestions && record.followUpQuestions.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="font-serif font-bold text-lg text-[#0c2417] flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#144229]" />
                  Context Follow-Up Questions
                </h3>
                <p className="text-xs text-[#526a57]">
                  These diagnostic questions were suggested to differentiate between the leading hypotheses.
                </p>

                <div className="space-y-2.5 pt-1">
                  {record.followUpQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] text-xs space-y-1"
                    >
                      <p className="font-semibold text-[#0c2417]">{q.question}</p>
                      <p className="text-[#526a57] italic">Rationale: {q.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. SECTION C: TREATMENT & ACTION TRACKING */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#eef5ee] text-[#144229]">
                      <ClipboardList size={20} />
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                      Treatment & Action Tracking
                    </h3>
                  </div>
                  <p className="text-xs text-[#526a57] mt-1">
                    Record cultural adjustments, physical steps, and observations taken in response to this diagnosis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddTreatment(!showAddTreatment)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs font-semibold transition-colors cursor-pointer min-h-[44px] shrink-0"
                >
                  <PlusCircle size={16} />
                  <span>{showAddTreatment ? 'Cancel' : 'Record Action'}</span>
                </button>
              </div>

              {/* Add Treatment Form */}
              {showAddTreatment && (
                <form
                  onSubmit={handleCreateTreatment}
                  className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-4 text-xs animate-in fade-in"
                >
                  <h4 className="font-serif font-bold text-sm text-[#0c2417]">
                    New Plant Treatment / Action
                  </h4>

                  {treatmentError && (
                    <div className="p-3 rounded-xl bg-[#fee2e2] text-[#991b1b]">
                      {treatmentError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#0c2417]">Action Type</label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as TreatmentActionType)}
                        className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs"
                      >
                        <option value="adjust_watering">Adjust Watering Schedule</option>
                        <option value="inspect_plant">Physical Inspection / Leaf Undersides</option>
                        <option value="isolate_plant">Isolate Plant to Prevent Spread</option>
                        <option value="improve_ventilation">Improve Airflow & Spacing</option>
                        <option value="remove_affected_leaves">Sanitary Pruning of Dead Foliage</option>
                        <option value="monitor_pests">Pest Monitoring (Sticky Traps / Water Spray)</option>
                        <option value="apply_kb_treatment">Apply KB-Grounded Organic Remedy</option>
                        <option value="custom_action">Custom Action</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#0c2417]">Initial Status</label>
                      <select
                        value={treatmentStatus}
                        onChange={(e) => setTreatmentStatus(e.target.value as TreatmentStatus)}
                        className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs"
                      >
                        <option value="planned">Planned</option>
                        <option value="started">Started</option>
                        <option value="completed">Completed</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#0c2417]">Action Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Switched to bottom watering every 3 days"
                      value={actionTitle}
                      onChange={(e) => setActionTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs text-[#0c2417]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#0c2417]">Action Date</label>
                      <input
                        type="date"
                        value={actionDate}
                        onChange={(e) => setActionDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs text-[#0c2417]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#0c2417]">Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Soil was completely waterlogged at root level"
                        value={treatmentNotes}
                        onChange={(e) => setTreatmentNotes(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs text-[#0c2417]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTreatment(false)}
                      className="px-4 py-2 rounded-xl border border-[#ded5c5] bg-white text-xs font-semibold text-[#0c2417]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingTreatment}
                      className="px-5 py-2 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      {savingTreatment ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Save Action</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Treatments List */}
              {record.treatments && record.treatments.length > 0 ? (
                <div className="space-y-3">
                  {record.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="p-4 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-[#0c2417]">
                            {treatment.actionTitle}
                          </span>
                          <Badge variant={getStatusBadgeVariant(treatment.status)} size="sm">
                            {treatment.status}
                          </Badge>
                          <span className="text-[11px] text-[#526a57]">
                            ({treatment.actionDate})
                          </span>
                        </div>
                        {treatment.notes && (
                          <p className="text-[#2e4435]">{treatment.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Transition Selector */}
                        <select
                          value={treatment.status}
                          onChange={(e) =>
                            handleUpdateStatus(treatment.id, e.target.value as TreatmentStatus)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-[#ded5c5] bg-white text-xs text-[#0c2417] cursor-pointer"
                        >
                          <option value="planned">Planned</option>
                          <option value="started">Started</option>
                          <option value="completed">Completed</option>
                          <option value="skipped">Skipped</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteTreatment(treatment.id)}
                          className="p-1.5 text-[#8c9e91] hover:text-red-600 transition-colors rounded cursor-pointer"
                          title="Delete action"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-[#ded5c5] text-center space-y-1.5 text-xs text-[#526a57]">
                  <p className="font-medium text-[#0c2417]">No Treatments Recorded Yet</p>
                  <p>
                    Log actions like watering changes, leaf pruning, or pest monitoring to track plant health progress.
                  </p>
                </div>
              )}
            </div>

            {/* 3. SECTION D: FOLLOW-UP / OUTCOME TRACKING */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#eef5ee] text-[#144229]">
                      <Activity size={20} />
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                      Follow-Up / Recovery Outcome Tracking
                    </h3>
                  </div>
                  <p className="text-xs text-[#526a57] mt-1">
                    Record subsequent observations. Note: Outcomes track plant response and do not prove or disprove initial hypotheses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddFollowUp(!showAddFollowUp)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs font-semibold transition-colors cursor-pointer min-h-[44px] shrink-0"
                >
                  <PlusCircle size={16} />
                  <span>{showAddFollowUp ? 'Cancel' : 'Record Observation'}</span>
                </button>
              </div>

              {/* Add Follow-Up Form */}
              {showAddFollowUp && (
                <form
                  onSubmit={handleCreateFollowUp}
                  className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-4 text-xs animate-in fade-in"
                >
                  <h4 className="font-serif font-bold text-sm text-[#0c2417]">
                    New Follow-Up Observation
                  </h4>

                  {followUpError && (
                    <div className="p-3 rounded-xl bg-[#fee2e2] text-[#991b1b]">
                      {followUpError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#0c2417]">Observed Outcome</label>
                      <select
                        value={followUpOutcome}
                        onChange={(e) => setFollowUpOutcome(e.target.value as FollowUpOutcome)}
                        className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs"
                      >
                        <option value="improving">Improving (Signs of recovery, new healthy growth)</option>
                        <option value="unchanged">Unchanged (Symptoms stable, no significant progress)</option>
                        <option value="worsening">Worsening (Symptoms expanding or intensifying)</option>
                        <option value="resolved">Resolved (Plant fully recovered / healthy)</option>
                        <option value="uncertain">Uncertain (Mixed or ambiguous visual response)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#0c2417]">Observation Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs text-[#0c2417]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#0c2417]">Observation Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Yellowing stopped advancing, baby leaves at apex emerging bright green"
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#ded5c5] bg-white text-xs text-[#0c2417]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFollowUp(false)}
                      className="px-4 py-2 rounded-xl border border-[#ded5c5] bg-white text-xs font-semibold text-[#0c2417]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingFollowUp}
                      className="px-5 py-2 rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      {savingFollowUp ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Save Follow-Up</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Follow-Ups List */}
              {record.followUps && record.followUps.length > 0 ? (
                <div className="space-y-3">
                  {record.followUps.map((fu) => (
                    <div
                      key={fu.id}
                      className="p-4 rounded-2xl border border-[#ded5c5] bg-[#fbf9f4] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getOutcomeBadgeVariant(fu.outcomeStatus)} size="sm">
                            {fu.outcomeStatus}
                          </Badge>
                          <span className="font-semibold text-[#0c2417]">
                            Observed on {new Date(fu.followUpDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {fu.observationNotes && (
                        <p className="text-[#2e4435] leading-relaxed pt-1">
                          {fu.observationNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-[#ded5c5] text-center space-y-1.5 text-xs text-[#526a57]">
                  <p className="font-medium text-[#0c2417]">No Follow-Up Outcomes Logged</p>
                  <p>
                    Return after 48–72 hours to record whether foliage is improving, unchanged, or worsening.
                  </p>
                </div>
              )}
            </div>

            {/* Disclaimer Footer */}
            <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] text-xs text-[#526a57] space-y-1">
              <strong className="text-[#0c2417] block">Botanical Care Disclaimer:</strong>
              <p className="leading-relaxed">{record.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

