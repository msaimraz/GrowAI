import React from 'react';
import { PlantHealthStatus } from '@/types/diagnosis';
import { getHealthStatusBadgeConfig } from '@/lib/plant-health-status';

interface PlantHealthBadgeProps {
  status: PlantHealthStatus;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export function PlantHealthBadge({
  status,
  size = 'sm',
  showDot = true,
  className = '',
}: PlantHealthBadgeProps) {
  const config = getHealthStatusBadgeConfig(status);

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1 gap-2',
  }[size];

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses} ${className}`}
      title={config.description}
    >
      {showDot && <span className={`rounded-full shrink-0 ${config.dotClass} ${dotSizes}`} />}
      <span>{config.label}</span>
    </span>
  );
}

