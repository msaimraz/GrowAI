'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchUserGarden } from '@/lib/storage';
import { UserPlant } from '@/types/garden';
import { GrowPlan } from '@/types/grow-plan';
import { getGrowPlanById, updateGrowPlan } from '@/lib/grow-plans/storage';
import { completePlanStep, skipPlanStep, evaluateAllPlanSteps } from '@/lib/grow-plans/plan-step-engine';
import { calculatePlanProgress } from '@/lib/grow-plans/plan-progress';
import { PlanStatusBadge } from '@/components/grow-plans/PlanStatusBadge';
import { PlanStepItem } from '@/components/grow-plans/PlanStepItem';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  AlertTriangle,
  History,
  ShieldCheck,
  CheckCircle2,
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
    try {
      const updatedSteps = completePlanStep(stepId, plan.steps);
      const reevaluated = evaluateAllPlanSteps(updatedSteps);
      const progress = calculatePlanProgress(reevaluated);
      const isComplete = progress.completionPercentage === 100;

      const updatedPlan: Partial<GrowPlan> = {
        steps: reevaluated,
        progress,
        status: isComplete ? 'completed' : plan.status,
        completedAt: isComplete ? new Date().toISOString() : plan.completedAt,
        updatedAt: new Date().toISOString(),
      };

      const res = await updateGrowPlan(plan.id, updatedPlan);
      if (res.plan) {
        setPlan(res.plan);
        if (isComplete) {
          showSuccess('🎉 Amazing work, Grower!', 'You’ve completed your grow plan.', '🎉');
        } else {
          showSuccess('🌱 Step complete!', 'Nice work keeping your grow plan moving.', '🌱');
        }
      }
    } catch (err) {
      console.error('Failed to complete step:', err);
    }
  };

  // Step Skip Handler
  const handleSkipStep = async (stepId: string) => {
    if (!plan) return;
    try {
      const updatedSteps = skipPlanStep(stepId, plan.steps);
      const reevaluated = evaluateAllPlanSteps(updatedSteps);
      const progress = calculatePlanProgress(reevaluated);

      const res = await updateGrowPlan(plan.id, {
        steps: reevaluated,
        progress,
        updatedAt: new Date().toISOString(),
      });
      if (res.plan) {
        setPlan(res.plan);
      }
    } catch (err) {
      console.error('Failed to skip step:', err);
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
      if (res.plan) {
        setPlan(res.plan);
        if (newStatus === 'active') {
          showSuccess('🌱 Plan active!', 'Your grow plan is in progress.', '🌱');
        } else if (newStatus === 'paused') {
          showInfo('⏸️ Plan paused', 'Your progress is saved and waiting for you.', '⏸️');
        }
      }
    } catch (err) {
      console.error('Failed to update plan status:', err);
    } finally {
      setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] animate-pulse pb-20">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="h-4 w-28 bg-[#E8E4DA] rounded-md" />
          <div className="bg-white border border-[#ded5c5] rounded-2xl p-6 space-y-4">
            <div className="flex gap-2 items-center">
              <div className="h-5 w-20 bg-[#E8E4DA] rounded-md" />
              <div className="h-5 w-16 bg-[#E8E4DA] rounded-md" />
            </div>
            <div className="h-7 w-64 bg-[#E8E4DA] rounded-xl" />
            <div className="h-4 w-full max-w-xl bg-[#EFEAE0] rounded-md" />
            <div className="h-4 w-40 bg-[#EFEAE0] rounded-md pt-2" />
          </div>
          <div className="bg-white border border-[#ded5c5] rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-[#E8E4DA] rounded-md" />
              <div className="h-5 w-12 bg-[#E8E4DA] rounded-md" />
            </div>
            <div className="h-3 w-full bg-[#E8E4DA] rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white border border-[#ded5c5] rounded-2xl p-4" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
            {error || 'Plan Not Found'}
          </h2>
          <p className="text-xs text-stone-500 mb-5">
            The requested grow plan could not be located in local or cloud storage.
          </p>
          <Link
            href="/app/grow-plans"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Grow Plans
          </Link>
        </div>
      </div>
    );
  }

  const primaryPlant = plants.find((p) => p.id === plan.plantId);
  const taskPct = plan.progress?.completionPercentage || 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 min-w-0 max-w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/app/grow-plans"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Plans
          </Link>
        </div>

        {/* Plan Header Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 mb-6 shadow-sm min-w-0 max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs px-2 py-0.5 rounded capitalize bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  {plan.scope} Scope
                </span>
                <PlanStatusBadge status={plan.status} />
                <PlanStatusBadge health={plan.healthStatus} />
              </div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                {plan.name}
              </h1>
              {plan.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed max-w-xl">
                  {plan.description}
                </p>
              )}
              {primaryPlant && (
                <div className="mt-3 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 flex-wrap">
                  <span className="font-medium text-stone-800 dark:text-stone-200">Associated Specimen:</span>
                  <Link
                    href={`/app/my-garden`}
                    className="text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
                  >
                    {primaryPlant.nickname} ({primaryPlant.plantSlug})
                  </Link>
                </div>
              )}
            </div>

            {/* Plan Consequential Actions */}
            <div className="flex items-center gap-2 self-start flex-wrap">
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
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-500" /> Pause Plan
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
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600" /> Resume Plan
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
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Indicators */}
          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800">
            <div className="flex justify-between items-center text-xs text-stone-600 dark:text-stone-400 mb-1.5 font-medium">
              <span>Overall Execution Progress</span>
              <span>{taskPct}%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  taskPct === 100
                    ? 'bg-emerald-500'
                    : plan.healthStatus === 'needs_attention'
                    ? 'bg-rose-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700/50 text-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Total Steps</span>
                <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{plan.steps.length}</span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700/50 text-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Completed</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {plan.steps.filter((s) => s.status === 'completed').length}
                </span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700/50 text-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Actionable Today</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {plan.steps.filter((s) => s.status === 'ready' || s.status === 'in_progress').length}
                </span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700/50 text-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Blocked Steps</span>
                <span className="text-sm font-bold text-stone-500 dark:text-stone-400">
                  {plan.steps.filter((s) => s.status === 'blocked').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step List Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Execution Sequence ({plan.steps.length} Steps)
            </h2>
            <span className="text-xs text-stone-500">
              Deterministic sequence • Prerequisites strictly enforced
            </span>
          </div>

          <div className="space-y-3">
            {plan.steps.map((step) => (
              <PlanStepItem
                key={step.id}
                step={step}
                allSteps={plan.steps}
                onComplete={(notes) => handleCompleteStep(step.id, notes)}
                onSkip={() => handleSkipStep(step.id)}
              />
            ))}
          </div>
        </div>

        {/* Evidence & Provenance Section */}
        {plan.evidence && plan.evidence.length > 0 && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Evidence Basis & Deterministic Provenance
              </h3>
            </div>
            <div className="space-y-2">
              {plan.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {ev.description}
                    </span>
                    {ev.value !== undefined && ev.value !== null && (
                      <span className="ml-2 text-stone-500 font-mono text-[11px]">
                        [{String(ev.value)}]
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider self-start sm:self-auto bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    {ev.provenance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Adjustment History Section */}
        {plan.adjustmentHistory && plan.adjustmentHistory.length > 0 && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Plan Adaptation History
              </h3>
            </div>
            <div className="space-y-2.5">
              {plan.adjustmentHistory.map((adj, idx) => (
                <div
                  key={idx}
                  className="text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/50"
                >
                  <div className="flex justify-between items-center text-[10px] text-stone-500 mb-1">
                    <span className="font-mono uppercase font-bold text-stone-600 dark:text-stone-400">
                      Trigger: {adj.trigger}
                    </span>
                    <span>{new Date(adj.adjustedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 font-medium">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {confirmModal.title}
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-5 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
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
                className={`px-4 py-1.5 text-xs font-medium rounded-xl text-white ${
                  confirmModal.action === 'cancel'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
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
