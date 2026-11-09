'use client';

import React from 'react';
import { GrowPlanStatus, PlanHealthStatus, StepStatus } from '@/types/grow-plan';

interface PlanStatusBadgeProps {
  status?: GrowPlanStatus;
  health?: PlanHealthStatus;
  stepStatus?: StepStatus;
  size?: 'sm' | 'md';
}

export function PlanStatusBadge({ status, health, stepStatus, size = 'sm' }: PlanStatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (status) {
    let colorClass = 'bg-[#f4efe6] text-[#526a57] border border-[#ded5c5]';
    let label = status.replace(/_/g, ' ');

    switch (status) {
      case 'active':
        colorClass = 'bg-[#eef5ee] text-[#144229] border border-[#c2d9c6]';
        break;
      case 'completed':
        colorClass = 'bg-[#f4efe6] text-[#0c2417] border border-[#ded5c5] font-semibold';
        break;
      case 'paused':
        colorClass = 'bg-[#fbf4eb] text-[#8c501e] border border-[#f0d8c2]';
        break;
      case 'cancelled':
        colorClass = 'bg-rose-50 text-rose-700 border border-rose-200';
        break;
      case 'draft':
        colorClass = 'bg-[#f4efe6] text-[#6d8573] border border-[#ded5c5]';
        break;
    }

    return (
      <span className={`inline-flex items-center font-medium rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  if (health) {
    let colorClass = 'bg-[#f4efe6] text-[#526a57] border border-[#ded5c5]';
    let label = health.replace(/_/g, ' ');

    switch (health) {
      case 'on_track':
        colorClass = 'bg-[#eef5ee] text-[#144229] border border-[#c2d9c6]';
        break;
      case 'needs_attention':
        colorClass = 'bg-rose-50 text-rose-700 border border-rose-200';
        break;
      case 'blocked':
        colorClass = 'bg-[#fbf4eb] text-[#8c501e] border border-[#f0d8c2]';
        break;
      case 'waiting_for_observation':
        colorClass = 'bg-[#edf4fb] text-[#1e4d75] border border-[#cbe1f5]';
        break;
      case 'completed':
        colorClass = 'bg-[#f4efe6] text-[#0c2417] border border-[#ded5c5] font-semibold';
        break;
    }

    return (
      <span className={`inline-flex items-center font-medium rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  if (stepStatus) {
    let colorClass = 'bg-[#f4efe6] text-[#526a57] border border-[#ded5c5]';
    let label = stepStatus.replace(/_/g, ' ');

    switch (stepStatus) {
      case 'completed':
        colorClass = 'bg-[#eef5ee] text-[#144229] border border-[#c2d9c6] font-medium';
        break;
      case 'in_progress':
        colorClass = 'bg-[#eef5ee] text-[#144229] border border-[#144229]/40 animate-pulse font-semibold';
        break;
      case 'ready':
        colorClass = 'bg-[#edf4fb] text-[#1e4d75] border border-[#cbe1f5] font-semibold';
        break;
      case 'blocked':
        colorClass = 'bg-[#faf7f2] text-[#8c7e6c] border border-[#ded5c5]';
        break;
      case 'skipped':
        colorClass = 'bg-[#f4efe6] text-[#8c7e6c] line-through border border-[#ded5c5]';
        break;
    }

    return (
      <span className={`inline-flex items-center font-medium rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  return null;
}

