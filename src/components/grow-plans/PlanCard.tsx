'use client';

import React from 'react';
import Link from 'next/link';
import { GrowPlan } from '@/types/grow-plan';
import { PlanStatusBadge } from './PlanStatusBadge';

interface PlanCardProps {
  plan: GrowPlan;
  plantNickname?: string;
}

export function PlanCard({ plan, plantNickname }: PlanCardProps) {
  const taskPct = Math.round(plan.progress?.taskCompletionPercentage || 0);
  const nextStep = plan.steps.find((s) => s.status === 'ready' || s.status === 'in_progress');

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PlanStatusBadge status={plan.status} />
              <PlanStatusBadge health={plan.healthStatus} />
              <span className="text-xs px-2 py-0.5 rounded capitalize bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                {plan.scope}
              </span>
            </div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              <Link href={`/app/grow-plans/${plan.id}`} className="hover:underline">
                {plan.name}
              </Link>
            </h3>
            {plantNickname && (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Plant: <span className="font-medium text-stone-700 dark:text-stone-300">{plantNickname}</span>
              </p>
            )}
          </div>
        </div>

        {plan.description && (
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
            {plan.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-stone-600 dark:text-stone-400 mb-1.5 font-medium">
            <span>Execution Progress</span>
            <span>{taskPct}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
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
          <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 mt-1">
            <span>{plan.steps.filter((s) => s.status === 'completed').length} of {plan.steps.length} steps</span>
            {plan.progress?.observationalProgressPercentage !== undefined && plan.progress?.observationalProgressPercentage !== null && (
              <span>Obs: {Math.round(plan.progress.observationalProgressPercentage)}%</span>
            )}
          </div>
        </div>

        {/* Next Actionable Step */}
        {nextStep && plan.status === 'active' && (
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-3 mb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
              Next Action Step
            </span>
            <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-0.5">
              {nextStep.title}
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs">
        <span className="text-stone-500 dark:text-stone-400">
          Created {new Date(plan.createdAt).toLocaleDateString()}
        </span>
        <Link
          href={`/app/grow-plans/${plan.id}`}
          className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          View Plan →
        </Link>
      </div>
    </div>
  );
}
