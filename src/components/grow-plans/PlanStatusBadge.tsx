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
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  if (status) {
    let colorClass = 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
    let label = status.replace(/_/g, ' ');

    switch (status) {
      case 'active':
        colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
        break;
      case 'completed':
        colorClass = 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800';
        break;
      case 'paused':
        colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
        break;
      case 'cancelled':
        colorClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
        break;
      case 'draft':
        colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
        break;
    }

    return (
      <span className={`inline-flex items-center font-medium rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  if (health) {
    let colorClass = 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
    let label = health.replace(/_/g, ' ');

    switch (health) {
      case 'on_track':
        colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
        break;
      case 'needs_attention':
        colorClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
        break;
      case 'blocked':
        colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
        break;
      case 'waiting_for_observation':
        colorClass = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
        break;
      case 'completed':
        colorClass = 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300';
        break;
    }

    return (
      <span className={`inline-flex items-center font-medium rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  if (stepStatus) {
    let colorClass = 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
    let label = stepStatus.replace(/_/g, ' ');

    switch (stepStatus) {
      case 'completed':
        colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
        break;
      case 'in_progress':
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse';
        break;
      case 'ready':
        colorClass = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300';
        break;
      case 'blocked':
        colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
        break;
      case 'skipped':
        colorClass = 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400 line-through';
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

