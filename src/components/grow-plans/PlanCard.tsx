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
  const taskPct = Math.round(plan.progress?.taskCompletionPercentage ?? plan.progress?.completionPercentage ?? 0);
  const nextStep = plan.steps.find((s) => s.status === 'ready' || s.status === 'in_progress');

  return (
    <div className="bg-white border border-[#ded5c5] rounded-3xl p-5 hover:border-[#144229]/40 hover:shadow-md transition flex flex-col justify-between shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <PlanStatusBadge status={plan.status} />
              <PlanStatusBadge health={plan.healthStatus} />
              <span className="text-xs px-2 py-0.5 rounded-lg capitalize bg-[#f4efe6] text-[#526a57] font-medium border border-[#ded5c5]/60">
                {plan.scope}
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#0c2417] leading-snug">
              <Link href={`/app/grow-plans/${plan.id}`} className="hover:underline">
                {plan.name}
              </Link>
            </h3>
            {plantNickname && (
              <p className="text-xs text-[#526a57] mt-0.5">
                Plant: <span className="font-semibold text-[#0c2417]">{plantNickname}</span>
              </p>
            )}
          </div>
        </div>

        {plan.description && (
          <p className="text-xs text-[#526a57] line-clamp-2 mb-4 leading-relaxed">
            {plan.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-[#526a57] mb-1.5 font-medium">
            <span>Execution Progress</span>
            <span className="font-bold text-[#0c2417]">{taskPct}%</span>
          </div>
          <div className="w-full bg-[#f4efe6] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                taskPct === 100
                  ? 'bg-[#144229]'
                  : plan.healthStatus === 'needs_attention'
                  ? 'bg-rose-500'
                  : 'bg-[#1e663f]'
              }`}
              style={{ width: `${taskPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#6d8573] mt-1.5">
            <span>{plan.steps.filter((s) => s.status === 'completed').length} of {plan.steps.length} steps complete</span>
            {plan.progress?.observationalProgressPercentage !== undefined && plan.progress?.observationalProgressPercentage !== null && (
              <span>Obs: {Math.round(plan.progress.observationalProgressPercentage)}%</span>
            )}
          </div>
        </div>

        {/* Next Actionable Step */}
        {nextStep && plan.status === 'active' && (
          <div className="bg-[#eef5ee] border border-[#c2d9c6] rounded-2xl p-3 mb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#144229] block">
              Next Action Step
            </span>
            <p className="text-xs font-semibold text-[#0c2417] mt-0.5">
              {nextStep.title}
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-[#f4efe6] flex justify-between items-center text-xs">
        <span className="text-[#6d8573]">
          Created {new Date(plan.createdAt).toLocaleDateString()}
        </span>
        <Link
          href={`/app/grow-plans/${plan.id}`}
          className="font-semibold text-[#144229] hover:text-[#0c2417] min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-[#eef5ee] active:scale-95 transition-all select-none touch-manipulation cursor-pointer"
        >
          <span>View Plan</span>
          <span className="text-base leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}
