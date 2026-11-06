import React from 'react';

export interface GrowthStageItem {
  stage: string;
  emoji: string;
  label: string;
  description?: string;
  timing?: string;
}

interface VisualProgressProps {
  currentStageIndex?: number;
  stages?: GrowthStageItem[];
  className?: string;
}

const DEFAULT_STAGES: GrowthStageItem[] = [
  {
    stage: 'start',
    emoji: '🌱',
    label: 'Start',
    description: 'Sow seeds or plant cutting in moist soil',
    timing: 'Day 1–7',
  },
  {
    stage: 'grow',
    emoji: '🌿',
    label: 'Grow',
    description: 'First true leaves and strong stem branching',
    timing: 'Day 8–25',
  },
  {
    stage: 'mature',
    emoji: '🌳',
    label: 'Mature',
    description: 'Full bushy foliage or flower buds forming',
    timing: 'Day 26–50',
  },
  {
    stage: 'harvest',
    emoji: '✂️',
    label: 'Harvest',
    description: 'Pinch fresh leaves or gather ripe crops',
    timing: 'Day 50+',
  },
];

export function VisualProgress({
  currentStageIndex = 1,
  stages = DEFAULT_STAGES,
  className = '',
}: VisualProgressProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Desktop Horizontal Line */}
      <div className="hidden sm:grid grid-cols-4 gap-3 relative">
        {stages.map((stg, idx) => {
          const isCurrent = idx === currentStageIndex;
          const isDone = idx < currentStageIndex;

          return (
            <div
              key={stg.stage}
              className={`p-3.5 rounded-xl border transition-all text-center space-y-1.5 ${
                isCurrent
                  ? 'bg-[#E6F0E3] border-[#174C35] shadow-xs'
                  : isDone
                  ? 'bg-white border-[#CEE4C9]'
                  : 'bg-[#FBF9F4] border-[#E8E4DA] opacity-70'
              }`}
            >
              <div className="flex items-center justify-center">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-2xs ${
                    isCurrent
                      ? 'bg-white ring-2 ring-[#174C35]'
                      : isDone
                      ? 'bg-[#E6F0E3]'
                      : 'bg-white'
                  }`}
                >
                  {stg.emoji}
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F2A23]">
                {stg.label}
              </h4>
              {stg.timing && (
                <span className="text-[10px] font-mono text-[#68736B] block">
                  {stg.timing}
                </span>
              )}
              {stg.description && (
                <p className="text-[11px] text-[#68736B] leading-snug line-clamp-2">
                  {stg.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Flow */}
      <div className="sm:hidden space-y-2.5">
        {stages.map((stg, idx) => {
          const isCurrent = idx === currentStageIndex;
          const isDone = idx < currentStageIndex;

          return (
            <div
              key={stg.stage}
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                isCurrent
                  ? 'bg-[#E6F0E3] border-[#174C35]'
                  : isDone
                  ? 'bg-white border-[#CEE4C9]'
                  : 'bg-[#FBF9F4] border-[#E8E4DA] opacity-75'
              }`}
            >
              <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-lg shrink-0 shadow-2xs">
                {stg.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className="font-serif font-bold text-sm text-[#1F2A23]">
                    {stg.label}
                  </h4>
                  {stg.timing && (
                    <span className="text-[10px] font-mono text-[#68736B]">
                      {stg.timing}
                    </span>
                  )}
                </div>
                {stg.description && (
                  <p className="text-xs text-[#68736B] truncate">
                    {stg.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

