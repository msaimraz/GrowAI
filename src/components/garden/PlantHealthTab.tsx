'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlant } from '@/types/garden';
import {
  SavedDiagnosisRecord,
  SavedDiagnosisTreatment,
  TreatmentStatus,
} from '@/types/diagnosis';
import {
  fetchDiagnosesForPlant,
  updateTreatmentStatus,
} from '@/lib/ai-doctor/persistence';
import {
  getPlantHealthSummary,
  getHealthStatusBadgeConfig,
} from '@/lib/plant-health-status';
import { PlantHealthBadge } from './PlantHealthBadge';
import { RecordFollowUpModal } from '@/components/diagnosis/RecordFollowUpModal';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
  Stethoscope,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface PlantHealthTabProps {
  plant: UserPlant;
  isCloud: boolean;
  onRefreshNeeded?: () => void;
}

export function PlantHealthTab({ plant, isCloud, onRefreshNeeded }: PlantHealthTabProps) {
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiagnosisForFollowUp, setSelectedDiagnosisForFollowUp] =
    useState<SavedDiagnosisRecord | null>(null);
  const [updatingTreatmentId, setUpdatingTreatmentId] = useState<string | null>(null);

  const loadPlantDiagnoses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDiagnosesForPlant(plant.id);
      if (res.error) {
        setError(res.error);
      } else {
        setDiagnoses(res.records);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlantDiagnoses();
  }, [plant.id]);

  const summary = getPlantHealthSummary(diagnoses);
  const badgeConfig = getHealthStatusBadgeConfig(summary.status);
  const latestDiagnosis = diagnoses[0] || null;

  const handleToggleTreatment = async (treatment: SavedDiagnosisTreatment) => {
    setUpdatingTreatmentId(treatment.id);
    const newStatus: TreatmentStatus =
      treatment.status === 'completed' ? 'planned' : 'completed';
    try {
      const res = await updateTreatmentStatus(treatment.id, newStatus);
      if (res.success) {
        await loadPlantDiagnoses();
        onRefreshNeeded?.();
      }
    } catch {
      // Ignore
    } finally {
      setUpdatingTreatmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#ded5c5] p-8 text-center space-y-3 shadow-xs">
        <Loader2 size={24} className="animate-spin text-[#144229] mx-auto" />
        <p className="text-xs text-[#526a57]">Loading health history for {plant.nickname}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Health Status Banner */}
      <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Activity size={12} />
                Health Profile
              </span>
              <PlantHealthBadge status={summary.status} size="sm" />
              {summary.isFollowUpDue && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] animate-pulse">
                  Follow-Up Due
                </span>
              )}
            </div>
            <h3 className="font-serif font-bold text-xl text-[#0c2417]">
              Plant Health & Monitoring
            </h3>
            <p className="text-xs text-[#526a57] mt-0.5">
              {summary.lastCheckedDate
                ? `Last evaluated on ${new Date(summary.lastCheckedDate).toLocaleDateString()}`
                : 'No diagnostic assessments recorded yet'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {latestDiagnosis && (
              <button
                type="button"
                onClick={() => setSelectedDiagnosisForFollowUp(latestDiagnosis)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#144229] hover:bg-[#0c2417] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[40px] cursor-pointer"
              >
                <Plus size={14} />
                <span>Record Follow-Up</span>
              </button>
            )}

            <Link
              href={`/app/my-garden/${plant.id}/health`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f4efe6] text-[#144229] border border-[#cfdfcf] rounded-xl text-xs font-semibold transition-colors min-h-[40px]"
            >
              <span>Full History</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
            <span className="text-[#647f6c] block text-[11px] mb-0.5">Active Issue</span>
            <strong className="text-[#0c2417] text-sm font-semibold truncate block">
              {summary.activeIssue || 'None detected'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
            <span className="text-[#647f6c] block text-[11px] mb-0.5">Latest Outcome</span>
            <strong className="text-[#0c2417] text-sm font-semibold capitalize">
              {summary.latestFollowUpOutcome || 'Awaiting check'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
            <span className="text-[#647f6c] block text-[11px] mb-0.5">Pending Actions</span>
            <strong className="text-[#0c2417] text-sm font-semibold">
              {summary.pendingTreatmentsCount} task(s)
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
            <span className="text-[#647f6c] block text-[11px] mb-0.5">Total Assessments</span>
            <strong className="text-[#0c2417] text-sm font-semibold">{diagnoses.length} logs</strong>
          </div>
        </div>

        {/* Next Action Guidance */}
        <div className="bg-[#eef5ee] border border-[#cfe0cf] p-4 rounded-2xl flex items-start gap-3 text-xs text-[#1e613b]">
          <Sparkles size={18} className="text-[#144229] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-serif font-bold text-sm text-[#0c2417] block">
              Agronomic Guidance:
            </strong>
            <p className="leading-relaxed opacity-95">{summary.nextActionGuidance}</p>
          </div>
        </div>
      </div>

      {/* 2. Recent Diagnoses & Follow-Ups */}
      <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
          <h4 className="font-serif font-bold text-base text-[#0c2417] flex items-center gap-2">
            <Clock size={16} className="text-[#144229]" />
            <span>Health Assessments & Interventions</span>
          </h4>

          <Link
            href={`/app/ai-doctor?plantId=${plant.id}&plantSlug=${plant.plantSlug}&plantName=${encodeURIComponent(
              plant.nickname
            )}`}
            className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1 min-h-[36px]"
          >
            <Stethoscope size={13} />
            <span>Scan Specimen</span>
          </Link>
        </div>

        {diagnoses.length === 0 ? (
          <div className="text-center py-10 space-y-3 bg-[#fbf9f4] rounded-2xl border border-dashed border-[#ded5c5]">
            <Stethoscope size={28} className="text-[#8ba391] mx-auto" />
            <p className="text-sm font-serif font-bold text-[#0c2417]">No Health Records Yet</p>
            <p className="text-xs text-[#526a57] max-w-sm mx-auto">
              Scan this {plant.nickname} with AI Doctor to diagnose foliar stress, track disease recovery, and log treatments.
            </p>
            <div className="pt-2">
              <Link
                href={`/app/ai-doctor?plantId=${plant.id}&plantSlug=${plant.plantSlug}&plantName=${encodeURIComponent(
                  plant.nickname
                )}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#144229] hover:bg-[#0c2417] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[40px]"
              >
                <Stethoscope size={15} />
                <span>Start Health Assessment</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {diagnoses.slice(0, 3).map((diag) => {
              const treatments = diag.treatments || [];
              const followUps = diag.followUps || [];

              return (
                <div
                  key={diag.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#0c2417]">
                        {diag.candidates?.[0]?.conditionName || diag.plantIdentification}
                      </span>
                      {diag.candidates?.[0]?.confidenceCategory && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#ded5c5] text-[#526a57]">
                          {diag.candidates[0].confidenceCategory} confidence
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#526a57] flex items-center gap-1">
                      <Calendar size={12} />
                      {diag.diagnosedAt ? new Date(diag.diagnosedAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <p className="text-[#3c5240] leading-relaxed line-clamp-2">{diag.summary}</p>

                  {/* Treatments list if any */}
                  {treatments.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <strong className="text-[11px] font-bold uppercase tracking-wider text-[#144229] block">
                        Care Actions:
                      </strong>
                      <div className="space-y-1">
                        {treatments.slice(0, 3).map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleToggleTreatment(t)}
                            className="p-2 rounded-xl bg-white border border-[#ded5c5] flex items-center justify-between cursor-pointer hover:border-[#144229] transition-colors"
                          >
                            <span className={t.status === 'completed' ? 'line-through text-[#6d8573]' : 'text-[#0c2417] font-medium'}>
                              {t.actionTitle}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-[#144229]">
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Latest follow-up outcome */}
                  {followUps.length > 0 && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#1e613b] bg-[#eef5ee] p-2.5 rounded-xl border border-[#cfe0cf]">
                      <span className="font-semibold capitalize">
                        Latest Follow-up: {followUps[0].outcomeStatus}
                      </span>
                      <span>{followUps[0].followUpDate}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {diagnoses.length > 3 && (
              <div className="text-center pt-2">
                <Link
                  href={`/app/my-garden/${plant.id}/health`}
                  className="text-xs font-semibold text-[#144229] hover:underline"
                >
                  View all {diagnoses.length} assessments in full timeline →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follow-up modal */}
      {selectedDiagnosisForFollowUp && (
        <RecordFollowUpModal
          isOpen={Boolean(selectedDiagnosisForFollowUp)}
          onClose={() => setSelectedDiagnosisForFollowUp(null)}
          diagnosis={selectedDiagnosisForFollowUp}
          isCloud={isCloud}
          onFollowUpSaved={async () => {
            setSelectedDiagnosisForFollowUp(null);
            await loadPlantDiagnoses();
            onRefreshNeeded?.();
          }}
        />
      )}
    </div>
  );
}

