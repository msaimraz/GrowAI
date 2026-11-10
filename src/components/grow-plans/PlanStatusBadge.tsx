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
    let colorClass = 'bg-[#F8F6EE] text-[#5F6D63] border border-[#E3DFD2]';
    let label = status.replace(/_/g, ' ');

    switch (status) {
      case 'active':
        // Semantic Active: Fresh Botanical Green
        colorClass = 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/35 font-medium';
        break;
      case 'completed':
        // Semantic Completed: Fresh Green
        colorClass = 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/45 font-semibold';
        break;
      case 'paused':
        // Semantic Paused: Warm Amber / Sunshine
        colorClass = 'bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35';
        break;
      case 'cancelled':
        // Semantic Cancelled: Muted Coral
        colorClass = 'bg-[#FBE9E2] text-[#963A23] border border-[#E4775D]/35';
        break;
      case 'draft':
        colorClass = 'bg-[#F8F6EE] text-[#5F6D63] border border-[#E3DFD2]';
        break;
    }

    return (
      <span className={`inline-flex items-center rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  if (health) {
    let colorClass = 'bg-[#F8F6EE] text-[#5F6D63] border border-[#E3DFD2]';
    let label = health.replace(/_/g, ' ');

    switch (health) {
      case 'on_track':
        colorClass = 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/35 font-medium';
        break;
      case 'needs_attention':
        // Semantic Needs Attention: Muted Coral
        colorClass = 'bg-[#FBE9E2] text-[#963A23] border border-[#E4775D]/35 font-medium';
        break;
      case 'blocked':
        // Semantic Blocked: Muted Amber
        colorClass = 'bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35';
        break;
      case 'waiting_for_observation':
        colorClass = 'bg-[#E7F2F9] text-[#1B5D88] border border-[#65A8D0]/35';
        break;
      case 'completed':
        colorClass = 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/45 font-semibold';
        break;
    }

    return (
      <span className={`inline-flex items-center rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  if (stepStatus) {
    let colorClass = 'bg-[#F8F6EE] text-[#5F6D63] border border-[#E3DFD2]';
    let label = stepStatus.replace(/_/g, ' ');

    switch (stepStatus) {
      case 'completed':
        colorClass = 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/45 font-medium';
        break;
      case 'in_progress':
        colorClass = 'bg-[#EAF1E4] text-[#174C35] border border-[#174C35]/40 animate-pulse font-semibold';
        break;
      case 'ready':
        colorClass = 'bg-[#E7F2F9] text-[#1B5D88] border border-[#65A8D0]/35 font-semibold';
        break;
      case 'blocked':
        colorClass = 'bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35';
        break;
      case 'skipped':
        colorClass = 'bg-[#F8F6EE] text-[#5F6D63] line-through border border-[#E3DFD2]';
        break;
    }

    return (
      <span className={`inline-flex items-center rounded-full capitalize ${sizeClasses} ${colorClass}`}>
        {label}
      </span>
    );
  }

  return null;
}
