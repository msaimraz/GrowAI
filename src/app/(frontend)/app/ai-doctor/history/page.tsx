'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { fetchDiagnosisHistory, deleteDiagnosisRecord } from '@/lib/ai-doctor/persistence';
import { SavedDiagnosisRecord, PrimaryClassification } from '@/types/diagnosis';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  Search,
  WifiOff,
  Loader2,
  ExternalLink,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

export default function DiagnosisHistoryPage() {
  const { user } = useAuth();
  const { isOffline } = usePwa();

  const [records, setRecords] = useState<SavedDiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | PrimaryClassification>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchDiagnosisHistory();
      setRecords(res.records || []);
    } catch (err) {
      console.error('Failed to load diagnosis history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteDiagnosisRecord(id);
      if (res.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete diagnosis record:', err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.primaryClassification === filter;
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EE]">
      <AppHeader
        title="Plant Diagnosis History"
        subtitle="Historical AI Doctor assessments, differential candidate snapshots, and treatment records."
        actionHref="/app/ai-doctor"
        actionLabel="New Consultation"
        actionIcon="sparkles"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-[#203027] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#174C35] text-white">
                <Stethoscope size={18} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#78A95A]">
                Garden Health Journal
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Past Consultations & Treatment Tracking
            </h2>
            <p className="text-xs sm:text-sm text-[#EAF1E4] leading-relaxed">
              Every saved diagnosis preserves the botanical reasoning, differential candidates, and recommended cultural actions captured at the moment of evaluation.
            </p>
          </div>

          <Link
            href="/app/ai-doctor"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F8F6EE] text-[#203027] text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs min-h-[44px]"
          >
            <Sparkles size={16} className="text-[#174C35]" />
            <span>Consult AI Doctor</span>
          </Link>
        </div>

        {/* Offline Notice */}
        {isOffline && (
          <div className="bg-[#FFF3D7] border border-[#F0C04D/30] p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-[#8A6400]">
            <WifiOff size={18} className="shrink-0 text-[#8A6400]" />
            <span>
              You are offline. Showing cached local diagnosis records. Cloud synchronization requires an active connection.
            </span>
          </div>
        )}

        {/* Filter Pills */}
        {records.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-[#68766C] mr-1">Filter by:</span>
            {(['all', 'biotic', 'abiotic', 'mixed', 'undetermined'] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setFilter(cls)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer capitalize ${
                  filter === cls
                    ? 'bg-[#174C35] text-white shadow-2xs'
                    : 'bg-white border border-[#E3DFD2] text-[#203027] hover:bg-[#F8F6EE]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#68766C]">
            <Loader2 size={32} className="animate-spin text-[#174C35]" />
            <p className="text-sm font-medium">Retrieving diagnosis history...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-[#E3DFD2] p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center mx-auto">
              <Stethoscope size={28} />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-serif font-bold text-xl text-[#203027]">
                {filter === 'all'
                  ? 'No Saved Diagnoses Yet'
                  : `No ${filter} diagnoses found`}
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] leading-relaxed">
                {filter === 'all'
                  ? 'When you consult the AI Plant Doctor about leaf spots, yellowing, or pests, you can save the assessment to track treatments and recovery over time.'
                  : `Try switching the filter back to 'All' or start a new diagnosis consultation.`}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/app/ai-doctor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#174C35] hover:bg-[#203027] text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <Sparkles size={16} />
                <span>Start First Consultation</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Records List */
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const formattedDate = new Date(record.diagnosedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-[#E3DFD2] p-5 sm:p-6 shadow-xs hover:border-[#174C35] transition-all space-y-4"
                >
                  {/* Top Bar: Date, Provenance, Badges, Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E3DFD2]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#68766C] flex items-center gap-1 font-medium">
                        <Calendar size={14} />
                        {formattedDate}
                      </span>
                      <span className="text-[#E3DFD2]">•</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8F6EE] border border-[#E3DFD2] text-[#203027] font-medium">
                        {record.diagnosticSource === 'gemini-vision'
                          ? 'Gemini 3.8 Flash Vision'
                          : 'Agronomic Heuristic'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAF1E4] text-[#174C35] font-medium border border-[#E3DFD2]">
                        v{record.schemaVersion}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getHealthBadgeVariant(record.overallHealth)} size="sm">
                        {record.overallHealth.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" size="sm" className="capitalize">
                        {record.primaryClassification || 'undetermined'}
                      </Badge>

                      {/* Delete Action with inline confirm */}
                      {deleteConfirmId === record.id ? (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(record.id)}
                            disabled={deletingId === record.id}
                            className="px-2 py-1 text-xs rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                          >
                            {deletingId === record.id ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs rounded border border-[#E3DFD2] text-[#68766C] hover:bg-[#F8F6EE]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(record.id)}
                          className="p-1.5 text-[#68766C] hover:text-red-600 transition-colors rounded-lg cursor-pointer ml-1"
                          title="Delete diagnosis record"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body: Plant identification & Summary */}
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-lg text-[#203027]">
                      {record.plantIdentification}
                    </h4>

                    {record.symptoms && (
                      <p className="text-xs text-[#68766C] line-clamp-2">
                        <span className="font-semibold text-[#203027]">Observed Symptoms:</span>{' '}
                        {record.symptoms}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-[#203027] leading-relaxed line-clamp-3">
                      {record.summary}
                    </p>
                  </div>

                  {/* Bottom: Next actions & Details Link */}
                  <div className="pt-3 border-t border-[#E3DFD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-[#68766C]">
                      {record.immediateActions?.length > 0 && (
                        <span>
                          <strong className="text-[#203027]">Immediate Step:</strong>{' '}
                          {record.immediateActions[0]}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/app/ai-doctor/history/${record.id}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#174C35] hover:underline cursor-pointer self-start sm:self-auto"
                    >
                      <span>View Full Diagnosis & Actions</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

