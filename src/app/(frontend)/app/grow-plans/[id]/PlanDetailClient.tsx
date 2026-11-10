'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { fetchUserGarden } from '@/lib/storage';
import { UserPlant } from '@/types/garden';
import { GrowPlan } from '@/types/grow-plan';
import { getGrowPlanById, updateGrowPlan, recordPlanEvent } from '@/lib/grow-plans/storage';
import { completePlanStep, skipPlanStep, evaluateAllPlanSteps } from '@/lib/grow-plans/plan-step-engine';
import { calculatePlanProgress } from '@/lib/grow-plans/plan-progress';
import { PlanStatusBadge } from '@/components/grow-plans/PlanStatusBadge';
import { PlanStepItem } from '@/components/grow-plans/PlanStepItem';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  AlertTriangle,
  History,
  ShieldCheck,
  CheckCircle2,
  Sprout,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface PlanDetailClientProps {
  planId: string;
}

export function PlanDetailClient({ planId }: PlanDetailClientProps) {
  const router = useRouter();
  const { showSuccess, showInfo } = useGrowToast();

  const [plan, setPlan] = useState<GrowPlan | null>(null);
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [executingStepId, setExecutingStepId] = useState<string | null>(null);

  // Consequential action confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'pause' | 'resume' | 'cancel' | 'start' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: null,
    title: '',
    message: '',
  });

  const loadPlan = async () => {
    setLoading(true);
    try {
      const [gardenRes, planRes] = await Promise.all([
        fetchUserGarden(),
        getGrowPlanById(planId),
      ]);
      setPlants(gardenRes.plants || []);
      if (planRes.plan) {
        setPlan(planRes.plan);
      } else {
        setError('Grow plan could not be found.');
      }
    } catch (err: any) {
      console.error('Failed to load grow plan:', err);
      setError('An error occurred while loading this plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [planId]);

  // Step Completion Handler
  const handleCompleteStep = async (stepId: string, notes?: string) => {
    if (!plan) return;
    setExecutingStepId(stepId);

    try {
      const stepObj = plan.steps.find((s) => s.id === stepId);
      const updatedPlan = completePlanStep(plan, stepId, notes);
      const isComplete = updatedPlan.progress?.completionPercentage === 100;

      const res = await updateGrowPlan(plan.id, {
        steps: updatedPlan.steps,
        progress: updatedPlan.progress,
        status: updatedPlan.status,
        completedAt: updatedPlan.completedAt,
        healthStatus: updatedPlan.healthStatus,
        updatedAt: new Date().toISOString(),
      });

      if (res.error) {
        showInfo("Couldn't complete step", res.error || "Your progress wasn't saved. Please try again.");
        return;
      }

      await recordPlanEvent({
        userId: plan.userId,
        planId: plan.id,
        stepId,
        eventType: 'plan_step_completed',
        metadata: {
          stepTitle: stepObj?.title,
          notes,
          completedAt: new Date().toISOString(),
        },
      });

      const nextPlan = res.plan || updatedPlan;
      setPlan(nextPlan);

      if (isComplete) {
        showSuccess('🎉 Amazing work, Grower!', 'You’ve completed your grow plan.', '🎉');
      } else {
        showSuccess('🌱 Step complete!', 'Nice work keeping your grow plan moving.', '🌱');
      }
    } catch (err: any) {
      console.error('Failed to complete step:', err);
      showInfo("Couldn't complete step", err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setExecutingStepId(null);
    }
  };

  // Step Skip Handler
  const handleSkipStep = async (stepId: string, reason?: string) => {
    if (!plan) return;
    setExecutingStepId(stepId);

    try {
      const stepObj = plan.steps.find((s) => s.id === stepId);
      const updatedPlan = skipPlanStep(plan, stepId, reason);

      const res = await updateGrowPlan(plan.id, {
        steps: updatedPlan.steps,
        progress: updatedPlan.progress,
        status: updatedPlan.status,
        healthStatus: updatedPlan.healthStatus,
        updatedAt: new Date().toISOString(),
      });

      if (res.error) {
        showInfo("Couldn't skip step", res.error || "Your progress wasn't saved. Please try again.");
        return;
      }

      await recordPlanEvent({
        userId: plan.userId,
        planId: plan.id,
        stepId,
        eventType: 'plan_step_skipped',
        metadata: {
          stepTitle: stepObj?.title,
          reason,
          skippedAt: new Date().toISOString(),
        },
      });

      const nextPlan = res.plan || updatedPlan;
      setPlan(nextPlan);
      showInfo('Step skipped', 'Step skipped and subsequent steps updated.');
    } catch (err: any) {
      console.error('Failed to skip step:', err);
      showInfo("Couldn't skip step", err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setExecutingStepId(null);
    }
  };

  // Step Observation Recording Handler
  const handleRecordObservation = async (stepId: string, observationNotes: string) => {
    if (!plan) return;
    setExecutingStepId(stepId);

    try {
      const now = new Date().toISOString();
      const updatedSteps = plan.steps.map((s) => {
        if (s.id === stepId) {
          return {
            ...s,
            notes: observationNotes ? (s.notes ? `${s.notes} | Obs: ${observationNotes}` : observationNotes) : s.notes,
            metadata: {
              ...s.metadata,
              observationRecorded: true,
              observedAt: now,
              observationText: observationNotes,
            },
            updatedAt: now,
          };
        }
        return s;
      });

      const res = await updateGrowPlan(plan.id, {
        steps: updatedSteps,
        updatedAt: now,
      });

      if (res.error) {
        showInfo("Couldn't save observation", res.error || "Your observation wasn't saved. Please try again.");
        return;
      }

      await recordPlanEvent({
        userId: plan.userId,
        planId: plan.id,
        stepId,
        eventType: 'plan_adjusted',
        metadata: {
          trigger: 'observation_recorded',
          observationText: observationNotes,
          recordedAt: now,
        },
      });

      if (res.plan) {
        setPlan(res.plan);
      } else {
        setPlan({ ...plan, steps: updatedSteps });
      }
      showSuccess('🔍 Observation recorded!', 'Observation saved for this step.', '🔍');
    } catch (err: any) {
      console.error('Failed to record observation:', err);
      showInfo("Couldn't record observation", err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setExecutingStepId(null);
    }
  };

  // Plan Status Mutation (Pause, Resume, Cancel)
  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'cancelled') => {
    if (!plan) return;
    if (plan.status === 'completed' || plan.status === 'cancelled') {
      console.warn(`Cannot change status from terminal state "${plan.status}"`);
      return;
    }
    try {
      const updates: Partial<GrowPlan> = {
        status: newStatus,
        pausedAt: newStatus === 'paused' ? new Date().toISOString() : null,
        cancelledAt: newStatus === 'cancelled' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      };

      const res = await updateGrowPlan(plan.id, updates);
      if (res.error) {
        showInfo("Couldn't update plan status", res.error);
        return;
      }

      if (res.plan) {
        setPlan(res.plan);
        if (newStatus === 'active') {
          showSuccess('🌱 Plan active!', 'Your grow plan is in progress.', '🌱');
        } else if (newStatus === 'paused') {
          showInfo('⏸️ Plan paused', 'Your progress is saved and waiting for you.', '⏸️');
        } else if (newStatus === 'cancelled') {
          showInfo('Plan cancelled', 'This plan has been retired.');
        }
      }
    } catch (err: any) {
      console.error('Failed to update plan status:', err);
      showInfo("Couldn't update plan status", err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6EE] animate-pulse pb-20">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="h-4 w-28 bg-[#E3DFD2] rounded-md" />
          <div className="bg-white border border-[#E3DFD2] rounded-3xl p-6 space-y-4">
            <div className="flex gap-2 items-center">
              <div className="h-5 w-20 bg-[#E3DFD2] rounded-md" />
              <div className="h-5 w-16 bg-[#E3DFD2] rounded-md" />
            </div>
            <div className="h-7 w-64 bg-[#E3DFD2] rounded-xl" />
            <div className="h-4 w-full max-w-xl bg-[#EAF1E4] rounded-md" />
            <div className="h-4 w-40 bg-[#EAF1E4] rounded-md pt-2" />
          </div>
          <div className="bg-white border border-[#E3DFD2] rounded-3xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-[#E3DFD2] rounded-md" />
              <div className="h-5 w-12 bg-[#E3DFD2] rounded-md" />
            </div>
            <div className="h-3 w-full bg-[#E3DFD2] rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white border border-[#E3DFD2] rounded-3xl p-4" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-[#F8F6EE] pb-20">
        <AppHeader />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF3D7] border border-[#F0C04D/30] text-[#8A6400] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#203027] mb-2">
            {error || 'Plan Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-[#68766C] mb-6 leading-relaxed">
            The requested grow plan could not be located in local or cloud storage.
          </p>
          <Link
            href="/app/grow-plans"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#174C35] text-white hover:bg-[#203027] min-h-[44px] transition active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Grow Plans
          </Link>
        </div>
      </div>
    );
  }

  const primaryPlant = plants.find((p) => p.id === plan.plantId);
  const taskPct = Math.round(plan.progress?.taskCompletionPercentage ?? plan.progress?.completionPercentage ?? 0);

  return (
    <div className="min-h-screen bg-[#F8F6EE] pb-20">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 min-w-0 max-w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/app/grow-plans"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68766C] hover:text-[#203027] min-h-[36px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </Link>
        </div>

        {/* Plan Header Card */}
        <div className="bg-white border border-[#E3DFD2] rounded-3xl p-5 sm:p-6 mb-6 shadow-xs min-w-0 max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-lg capitalize bg-[#F8F6EE] text-[#68766C] font-medium border border-[#E3DFD2]/60">
                  {plan.scope} Scope
                </span>
                <PlanStatusBadge status={plan.status} />
                <PlanStatusBadge health={plan.healthStatus} />
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#203027] truncate">
                {plan.name}
              </h1>
              {plan.description && (
                <p className="text-xs sm:text-sm text-[#68766C] mt-1.5 leading-relaxed max-w-xl">
                  {plan.description}
                </p>
              )}
              {primaryPlant && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#68766C] flex-wrap">
                  <span className="font-medium text-[#203027]">Associated Specimen:</span>
                  <Link
                    href={`/app/my-garden`}
                    className="text-[#174C35] hover:underline font-semibold"
                  >
                    {primaryPlant.nickname} ({primaryPlant.plantSlug || 'Specimen'})
                  </Link>
                </div>
              )}
            </div>

            {/* Plan Consequential Actions */}
            <div className="flex items-center gap-2 self-start flex-wrap pt-1 sm:pt-0">
              {plan.status === 'active' && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      action: 'pause',
                      title: 'Pause Grow Plan?',
                      message: 'Pausing this plan will temporarily suspend step notifications and active reminder schedules until resumed.',
                    })
                  }
                  className="px-3.5 py-2 min-h-[40px] rounded-xl border border-[#E3DFD2] text-xs font-semibold text-[#203027] hover:bg-[#F8F6EE] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Pause className="w-3.5 h-3.5 text-[#8A6400]" /> Pause Plan
                </button>
              )}

              {plan.status === 'paused' && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      action: 'resume',
                      title: 'Resume Grow Plan?',
                      message: 'Resuming will reactivate actionable steps and sync scheduled reminders with your garden calendar.',
                    })
                  }
                  className="px-3.5 py-2 min-h-[40px] rounded-xl border border-[#E3DFD2] bg-[#EAF1E4] text-xs font-semibold text-[#174C35] hover:bg-[#EAF1E4] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 text-[#174C35]" /> Resume Plan
                </button>
              )}

              {plan.status !== 'cancelled' && plan.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      action: 'cancel',
                      title: 'Cancel Grow Plan?',
                      message: 'Are you sure you want to cancel this plan? Steps will no longer be scheduled and associated reminders will be dismissed.',
                    })
                  }
                  className="px-3 py-2 min-h-[40px] rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Indicators */}
          <div className="mt-6 pt-5 border-t border-[#E3DFD2]/60">
            <div className="flex justify-between items-center text-xs text-[#68766C] mb-2 font-medium">
              <span className="font-semibold text-[#203027]">Overall Execution Progress</span>
              <span className="font-bold text-[#203027]">{taskPct}%</span>
            </div>
            <div className="w-full bg-[#F8F6EE] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  taskPct === 100
                    ? 'bg-[#174C35]'
                    : plan.healthStatus === 'needs_attention'
                    ? 'bg-rose-500'
                    : 'bg-[#174C35]'
                }`}
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-[#F8F6EE] p-3 rounded-2xl border border-[#E3DFD2]/60 text-center">
                <span className="text-[10px] text-[#68766C] uppercase tracking-wider block font-semibold">Total Steps</span>
                <span className="text-sm sm:text-base font-bold text-[#203027]">{plan.steps.length}</span>
              </div>
              <div className="bg-[#F8F6EE] p-3 rounded-2xl border border-[#E3DFD2]/60 text-center">
                <span className="text-[10px] text-[#68766C] uppercase tracking-wider block font-semibold">Completed</span>
                <span className="text-sm sm:text-base font-bold text-[#174C35]">
                  {plan.steps.filter((s) => s.status === 'completed').length}
                </span>
              </div>
              <div className="bg-[#F8F6EE] p-3 rounded-2xl border border-[#E3DFD2]/60 text-center">
                <span className="text-[10px] text-[#68766C] uppercase tracking-wider block font-semibold">Actionable Today</span>
                <span className="text-sm sm:text-base font-bold text-[#174C35]">
                  {plan.steps.filter((s) => s.status === 'ready' || s.status === 'in_progress').length}
                </span>
              </div>
              <div className="bg-[#F8F6EE] p-3 rounded-2xl border border-[#E3DFD2]/60 text-center">
                <span className="text-[10px] text-[#68766C] uppercase tracking-wider block font-semibold">Blocked Steps</span>
                <span className="text-sm sm:text-base font-bold text-[#68766C]">
                  {plan.steps.filter((s) => s.status === 'blocked').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step List Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#203027]">
              Execution Sequence ({plan.steps.length} Steps)
            </h2>
            <span className="text-xs text-[#68766C]">
              Deterministic sequence • Prerequisites strictly enforced
            </span>
          </div>

          <div className="space-y-3">
            {plan.steps.map((step) => (
              <PlanStepItem
                key={step.id}
                step={step}
                allSteps={plan.steps}
                isExecuting={executingStepId === step.id}
                onComplete={(notes) => handleCompleteStep(step.id, notes)}
                onSkip={(reason) => handleSkipStep(step.id, reason)}
                onRecordObservation={(notes) => handleRecordObservation(step.id, notes)}
              />
            ))}
          </div>
        </div>

        {/* Evidence & Provenance Section */}
        {plan.evidence && plan.evidence.length > 0 && (
          <div className="bg-white border border-[#E3DFD2] rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#174C35]" />
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#203027]">
                Evidence Basis & Deterministic Provenance
              </h3>
            </div>
            <div className="space-y-2.5">
              {plan.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="text-xs p-3.5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-[#203027]">
                      {ev.description}
                    </span>
                    {ev.value !== undefined && ev.value !== null && (
                      <span className="ml-2 text-[#68766C] font-mono text-[11px]">
                        [{String(ev.value)}]
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg font-mono uppercase tracking-wider self-start sm:self-auto bg-[#F8F6EE] text-[#68766C] border border-[#E3DFD2]/60">
                    {ev.provenance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Adjustment History Section */}
        {plan.adjustmentHistory && plan.adjustmentHistory.length > 0 && (
          <div className="bg-white border border-[#E3DFD2] rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-[#174C35]" />
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#203027]">
                Plan Adaptation History
              </h3>
            </div>
            <div className="space-y-2.5">
              {plan.adjustmentHistory.map((adj, idx) => (
                <div
                  key={idx}
                  className="text-xs p-3.5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2]/60"
                >
                  <div className="flex justify-between items-center text-[10px] text-[#68766C] mb-1">
                    <span className="font-mono uppercase font-bold text-[#174C35]">
                      Trigger: {adj.trigger}
                    </span>
                    <span>{new Date(adj.adjustedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-[#203027] font-medium leading-relaxed">
                    {adj.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Consequential Actions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#F8F6EE] border border-[#E3DFD2] rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#8A6400] shrink-0" />
              <h3 className="font-serif text-base font-bold text-[#203027]">
                {confirmModal.title}
              </h3>
            </div>
            <p className="text-xs text-[#68766C] mb-5 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E3DFD2] text-[#68766C] hover:text-[#203027] hover:bg-white transition cursor-pointer min-h-[40px]"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.action === 'pause') handleStatusChange('paused');
                  else if (confirmModal.action === 'resume') handleStatusChange('active');
                  else if (confirmModal.action === 'cancel') handleStatusChange('cancelled');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition active:scale-95 cursor-pointer min-h-[40px] shadow-xs ${
                  confirmModal.action === 'cancel'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-[#174C35] hover:bg-[#203027]'
                }`}
              >
                Confirm {confirmModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
