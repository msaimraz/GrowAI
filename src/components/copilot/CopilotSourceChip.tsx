'use client';

import React from 'react';

interface CopilotSourceChipProps {
  provenance: 'recorded' | 'calculated' | 'observed' | 'inferred' | 'recommended' | 'unknown';
}

export function CopilotSourceChip({ provenance }: CopilotSourceChipProps) {
  switch (provenance) {
    case 'recorded':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#eef5ee] text-[#144229] border-[#cfe0cf]">
          ● Recorded Fact
        </span>
      );
    case 'calculated':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]">
          ▲ Calculated
        </span>
      );
    case 'observed':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#f5f3ff] text-[#5b21b6] border-[#ddd6fe]">
          ◈ Observed
        </span>
      );
    case 'inferred':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#fffbeb] text-[#92400e] border-[#fde68a]">
          ◆ Inferred
        </span>
      );
    case 'recommended':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]">
          ✓ Recommended
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]">
          ○ Unknown
        </span>
      );
  }
}

