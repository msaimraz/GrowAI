import React from 'react';

export interface GrowthStageBadgeProps {
  stage?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function getGrowthStageStyle(stage?: string): {
  bg: string;
  text: string;
  border: string;
} {
  const s = (stage || '').toLowerCase().trim();

  // 1. Seed: Soft Yellow (#FFF3D7, #8A6400, #F0C04D)
  if (s === 'seed' || s.startsWith('seed') && !s.includes('seedling')) {
    return {
      bg: 'bg-[#FFF3D7]',
      text: 'text-[#8A6400]',
      border: 'border-[#F0C04D]/35',
    };
  }

  // 2. Germination: Soft Sage (#EAF1E4, #2E5A3E, #78A95A)
  if (s.includes('germin')) {
    return {
      bg: 'bg-[#EAF1E4]',
      text: 'text-[#2E5A3E]',
      border: 'border-[#78A95A]/30',
    };
  }

  // 3. Seedling: Soft Fresh Green (#EAF1E4, #174C35, #78A95A)
  if (s.includes('seedling')) {
    return {
      bg: 'bg-[#EAF1E4]',
      text: 'text-[#174C35]',
      border: 'border-[#78A95A]/45 font-medium',
    };
  }

  // 4. Flowering: Soft Coral / Lavender (#FBE9E2, #963A23, #E4775D)
  if (s.includes('flower') || s.includes('bloom')) {
    return {
      bg: 'bg-[#FBE9E2]',
      text: 'text-[#963A23]',
      border: 'border-[#E4775D]/35',
    };
  }

  // 5. Harvested / Ready: Warm Coral (#FBE9E2, #E4775D, #E4775D)
  if (s.includes('harvest')) {
    return {
      bg: 'bg-[#FBE9E2]',
      text: 'text-[#E4775D]',
      border: 'border-[#E4775D]/45 font-semibold',
    };
  }

  // 6. Growing (Default Active Vegetative Stage): Deep Botanical Green (#174C35, white)
  return {
    bg: 'bg-[#174C35]',
    text: 'text-white',
    border: 'border-[#174C35] shadow-2xs font-semibold',
  };
}

export function GrowthStageBadge({
  stage,
  size = 'sm',
  className = '',
}: GrowthStageBadgeProps) {
  if (!stage) return null;

  const style = getGrowthStageStyle(stage);

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 leading-none',
    sm: 'text-xs px-2.5 py-1 leading-none',
    md: 'text-xs sm:text-sm px-3 py-1.5 leading-none font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className} transition-colors select-none`}
    >
      {stage}
    </span>
  );
}

