'use client';

import React from 'react';

interface CopilotSourceChipProps {
  provenance: 'recorded' | 'calculated' | 'observed' | 'inferred' | 'recommended' | 'unknown';
}

export function CopilotSourceChip({ provenance }: CopilotSourceChipProps) {
  switch (provenance) {
    case 'recorded':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#EAF1E4] text-[#174C35] border-[#E3DFD2]">
          ● Recorded Fact
        </span>
      );
    case 'calculated':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#E7F2F9] text-[#1B5D88] border-[#65A8D0/30]">
          ▲ Calculated
        </span>
      );
    case 'observed':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#F0ECF7] text-[#594186] border-[#9A83C5/30]">
          ◈ Observed
        </span>
      );
    case 'inferred':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#FFF3D7] text-[#8A6400] border-[#F0C04D/30]">
          ◆ Inferred
        </span>
      );
    case 'recommended':
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#EAF1E4] text-[#174C35] border-[#78A95A/30]">
          ✓ Recommended
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[#F8F6EE] text-[#68766C] border-[#E3DFD2]">
          ○ Unknown
        </span>
      );
  }
}

