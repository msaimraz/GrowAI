'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { PLANTS_DATA } from '@/data/plants';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';
import { fetchUserGarden } from '@/lib/storage';
import {
  fetchDiagnosesForPlant,
  updateTreatmentStatus,
} from '@/lib/ai-doctor/persistence';
import {
  derivePlantHealthStatus,
  getPlantHealthSummary,
  getHealthStatusBadgeConfig,
  isFollowUpDue,
} from '@/lib/plant-health-status';
import {
  UserPlant,
  PlantPhoto,
} from '@/types/garden';
import {
  SavedDiagnosisRecord,
  SavedDiagnosisFollowUp,
  SavedDiagnosisTreatment,
  TreatmentStatus,
  FollowUpOutcome,
  PlantHealthStatus,
} from '@/types/diagnosis';
import { RecordFollowUpModal } from '@/components/diagnosis/RecordFollowUpModal';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Sprout,
  Stethoscope,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface PlantHealthDetailClientProps {
  plantId: string;
}

export function PlantHealthDetailClient({ plantId }: PlantHealthDetailClientProps) {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const { isOffline } = usePwa();

  const [plant, setPlant] = useState<UserPlant | null>(null);
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCloud, setIsCloud] = useState(false);
  const [selectedDiagnosisForFollowUp, setSelectedDiagnosisForFollowUp] =
    useState<SavedDiagnosisRecord | null>(null);
  const [updatingTreatmentId, setUpdatingTreatmentId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gardenRes, diagRes] = await Promise.all([
        fetchUserGarden(),
        fetchDiagnosesForPlant(plantId),
      ]);

      setIsCloud(gardenRes.isCloud);

      const foundPlant = gardenRes.plants.find((p) => p.id === plantId) || null;
      setPlant(foundPlant);

      if (diagRes.error) {
        setError(diagRes.error);
      } else {
        setDiagnoses(diagRes.records);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load plant health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [plantId, user]);

  const botanical = plant ? PLANTS_DATA.find((p) => p.slug === plant.plantSlug) : null;
  const healthSummary = getPlantHealthSummary(diagnoses);
  const badgeConfig = getHealthStatusBadgeConfig(healthSummary.status);

  // Treatment status change handler
  const handleTreatmentStatusChange = async (
    treatment: SavedDiagnosisTreatment,
    newStatus: TreatmentStatus
  ) => {
    setUpdatingTreatmentId(treatment.id);
    try {
      const res = await updateTreatmentStatus(treatment.id, newStatus);
      if (res.success) {
        await loadData();
      } else {
        setError(res.error || 'Failed to update treatment status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating treatment status.');
    } finally {
      setUpdatingTreatmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f4] flex flex-col items-center justify-center p-6 text-[#526a57] gap-3">
        <Loader2 size={32} className="animate-spin text-[#144229]" />
        <p className="text-sm font-medium">Loading plant health records...</p>
      </div>
    );
  }

  if (!plant && !loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f4] p-6 sm:p-12">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#ded5c5] p-8 text-center space-y-4">
          <Sprout size={36} className="text-[#8ba391] mx-auto" />
          <h2 className="font-serif font-bold text-2xl text-[#0c2417]">Plant Specimen Not Found</h2>
          <p className="text-sm text-[#526a57]">
            This specimen could not be found in your garden records. It may have been removed or migrated.
          </p>
          <div className="pt-2">
            <Link
              href="/app/my-garden"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#144229] text-white rounded-xl text-xs font-semibold hover:bg-[#0c2417] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to My Garden</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestDiagnosis = diagnoses[0] || null;

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0c2417] pb-16">
      <AppHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/app/my-garden?plantId=${plantId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#144229] hover:underline min-h-[44px] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to {plant?.nickname}&apos;s Garden Journal</span>
          </Link>

          <span className="text-[11px] font-semibold text-[#526a57] bg-white px-3 py-1 rounded-full border border-[#ded5c5]">
            {isCloud ? 'Cloud Synced' : 'Local Demo Mode'}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] rounded-2xl text-xs flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-[#991b1b] font-bold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Specimen Health Header Card */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-[#f0ebe0]">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <Activity size={12} />
                  Health Profile
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badgeConfig.bgClass} ${badgeConfig.textClass} ${badgeConfig.borderClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badgeConfig.dotClass}`} />
                  {badgeConfig.label}
                </span>
                {healthSummary.isFollowUpDue && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] animate-pulse">
                    Follow-Up Due
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2417]">
                {plant?.nickname}
              </h1>
              <p className="text-xs sm:text-sm text-[#526a57] mt-1">
                {botanical?.commonName} (<em>{botanical?.scientificName}</em>) • Planted on {plant?.plantedDate}
                {plant?.location && ` • ${plant.location}`}
                {plant?.tier && ` • ${plant.tier.toUpperCase()} Tier`}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start">
              {latestDiagnosis && (
                <button
                  type="button"
                  onClick={() => setSelectedDiagnosisForFollowUp(latestDiagnosis)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#144229] hover:bg-[#0c2417] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[44px] cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Record Follow-Up</span>
                </button>
              )}

              <Link
                href={`/app/ai-doctor?plantId=${plant?.id}&plantSlug=${plant?.plantSlug}&plantName=${encodeURIComponent(
                  plant?.nickname || ''
                )}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#f4efe6] text-[#144229] border border-[#cfdfcf] rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
              >
                <Stethoscope size={15} />
                <span>New AI Diagnosis</span>
              </Link>
            </div>
          </div>

          {/* Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#647f6c] block text-[11px] mb-0.5">Total Assessments</span>
              <strong className="text-[#0c2417] text-sm font-semibold">{diagnoses.length} logged</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#647f6c] block text-[11px] mb-0.5">Active Issue</span>
              <strong className="text-[#0c2417] text-sm font-semibold truncate block">
                {healthSummary.activeIssue || 'None detected'}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#647f6c] block text-[11px] mb-0.5">Latest Outcome</span>
              <strong className="text-[#0c2417] text-sm font-semibold capitalize">
                {healthSummary.latestFollowUpOutcome || 'Awaiting observation'}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
              <span className="text-[#647f6c] block text-[11px] mb-0.5">Pending Treatments</span>
              <strong className="text-[#0c2417] text-sm font-semibold">
                {healthSummary.pendingTreatmentsCount} action(s)
              </strong>
            </div>
          </div>

          {/* Grounded Next-Action Botanical Guidance */}
          <div className="bg-[#eef5ee] border border-[#cfe0cf] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-[#1e613b]">
            <Sparkles size={20} className="text-[#144229] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-serif font-bold text-sm text-[#0c2417] block">
                Next-Action Guidance:
              </strong>
              <p className="leading-relaxed opacity-95">{healthSummary.nextActionGuidance}</p>
            </div>
          </div>
        </div>

        {/* Chronological Health Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-[#0c2417] flex items-center gap-2">
              <Clock size={18} className="text-[#144229]" />
              <span>Health Timeline & Interventions</span>
            </h2>
            <span className="text-xs text-[#526a57]">
              {diagnoses.length} assessment(s) recorded
            </span>
          </div>

          {diagnoses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-10 sm:p-14 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
                <Stethoscope size={28} />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#0c2417]">
                No Health Assessments Yet
              </h3>
              <p className="text-xs sm:text-sm text-[#526a57] max-w-md mx-auto leading-relaxed">
                {plant?.nickname} has no diagnostic scans or follow-up observations recorded. If you notice yellowing leaves, pests, or wilting, run an AI Doctor assessment.
              </p>
              <div className="pt-2">
                <Link
                  href={`/app/ai-doctor?plantId=${plant?.id}&plantSlug=${plant?.plantSlug}&plantName=${encodeURIComponent(
                    plant?.nickname || ''
                  )}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#144229] hover:bg-[#0c2417] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
                >
                  <Stethoscope size={16} />
                  <span>Start First Diagnostic Scan</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {diagnoses.map((diag, index) => {
                const candidates = diag.candidates || [];
                const treatments = diag.treatments || [];
                const followUps = diag.followUps || [];

                return (
                  <div
                    key={diag.id}
                    className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden"
                  >
                    {/* Entry Badge & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ebe0]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center font-mono text-xs font-bold">
                          #{diagnoses.length - index}
                        </span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#526a57] block">
                            Diagnostic Assessment
                          </span>
                          <span className="font-serif font-bold text-base text-[#0c2417]">
                            {diag.plantIdentification}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-[#526a57] flex items-center gap-1.5 bg-[#fbf9f4] px-3 py-1.5 rounded-xl border border-[#ded5c5]">
                          <Calendar size={13} />
                          {diag.diagnosedAt ? new Date(diag.diagnosedAt).toLocaleDateString() : 'Historical'}
                        </span>
                        <Link
                          href={`/app/ai-doctor/history/${diag.id}`}
                          className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#cfdfcf] hover:bg-[#f4efe6] transition-colors"
                        >
                          <span>Snapshot</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>

                    {/* AI Doctor Diagnostic Hypothesis */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Sparkles size={11} />
                          AI Assessment (Hypothesis)
                        </span>
                        <span className="text-xs text-[#526a57]">
                          Source: {diag.diagnosticSource === 'gemini-vision' ? 'Gemini Multimodal' : 'Agronomic Heuristic'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#2c3d30] leading-relaxed bg-[#fbf9f4] p-4 rounded-2xl border border-[#ded5c5]">
                        {diag.summary}
                      </p>

                      {/* Differential Candidates */}
                      {candidates.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {candidates.map((c) => (
                            <div
                              key={c.id}
                              className="p-3.5 rounded-2xl bg-white border border-[#ded5c5] space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <strong className="font-serif font-bold text-[#0c2417] text-sm">
                                  {c.conditionName}
                                </strong>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4efe6] text-[#526a57]">
                                  {c.confidenceCategory} confidence
                                </span>
                              </div>
                              <p className="text-[#526a57] leading-relaxed">{c.explanation}</p>
                              {c.recommendedNextObservation && (
                                <p className="text-[11px] text-[#144229] pt-1">
                                  <strong>Next Check:</strong> {c.recommendedNextObservation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Treatment Actions Section */}
                    {treatments.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Treatment Checklist ({treatments.filter((t) => t.status === 'completed').length}/{treatments.length})
                          </span>
                        </div>

                        <div className="space-y-2">
                          {treatments.map((t) => {
                            const isUpdating = updatingTreatmentId === t.id;
                            const isDone = t.status === 'completed';
                            const isSkipped = t.status === 'skipped';

                            return (
                              <div
                                key={t.id}
                                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                                  isDone
                                    ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                                    : isSkipped
                                    ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-60'
                                    : 'bg-[#fbf9f4] border-[#ded5c5] text-[#0c2417]'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <strong className={`font-semibold ${isDone ? 'line-through' : ''}`}>
                                      {t.actionTitle}
                                    </strong>
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                                      {t.status}
                                    </span>
                                  </div>
                                  {t.notes && <p className="text-[11px] opacity-85">{t.notes}</p>}
                                </div>

                                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleTreatmentStatusChange(
                                        t,
                                        isDone ? 'planned' : 'completed'
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer min-h-[36px] flex items-center gap-1 ${
                                      isDone
                                        ? 'bg-white text-[#065f46] border border-[#a7f3d0] hover:bg-[#d1fae5]'
                                        : 'bg-[#144229] text-white hover:bg-[#0c2417]'
                                    }`}
                                  >
                                    {isUpdating ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <CheckCircle2 size={12} />
                                    )}
                                    <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                                  </button>

                                  {!isDone && (
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() =>
                                        handleTreatmentStatusChange(
                                          t,
                                          isSkipped ? 'planned' : 'skipped'
                                        )
                                      }
                                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-[#526a57] hover:bg-white transition-colors cursor-pointer min-h-[36px]"
                                    >
                                      {isSkipped ? 'Unskip' : 'Skip'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Follow-Up Observations Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Activity size={12} />
                          Grower Follow-Up Observations ({followUps.length})
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedDiagnosisForFollowUp(diag)}
                          className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1 min-h-[36px] cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add Follow-Up</span>
                        </button>
                      </div>

                      {followUps.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-dashed border-[#ded5c5] text-center space-y-1">
                          <p className="text-xs text-[#526a57]">
                            No follow-up logged yet. Record what happens after applying recommended adjustments.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {followUps.map((f) => {
                            const isImproving = f.outcomeStatus === 'improving';
                            const isResolved = f.outcomeStatus === 'resolved';
                            const isWorsening = f.outcomeStatus === 'worsening';

                            return (
                              <div
                                key={f.id}
                                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                                  isResolved
                                    ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                                    : isImproving
                                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
                                    : isWorsening
                                    ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                                    : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <strong className="font-serif font-bold text-sm capitalize">
                                      Outcome: {f.outcomeStatus}
                                    </strong>
                                  </div>
                                  <span className="text-[11px] opacity-75">
                                    {f.followUpDate}
                                  </span>
                                </div>

                                {f.observationNotes && (
                                  <p className="leading-relaxed opacity-95">{f.observationNotes}</p>
                                )}

                                {f.photoUrl && (
                                  <div className="pt-1">
                                    <img
                                      src={f.photoUrl}
                                      alt="Follow-up photograph"
                                      className="w-20 h-20 object-cover rounded-xl border border-black/10"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Record Follow-Up Modal */}
      {selectedDiagnosisForFollowUp && (
        <RecordFollowUpModal
          isOpen={Boolean(selectedDiagnosisForFollowUp)}
          onClose={() => setSelectedDiagnosisForFollowUp(null)}
          diagnosis={selectedDiagnosisForFollowUp}
          isCloud={isCloud}
          onFollowUpSaved={async () => {
            setSelectedDiagnosisForFollowUp(null);
            await loadData();
          }}
        />
      )}
    </div>
  );
}

