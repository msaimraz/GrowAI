'use client';

import React from 'react';
import Link from 'next/link';
import { CopilotEvidence } from '@/types/grower-copilot';
import { CopilotSourceChip } from './CopilotSourceChip';
import { ExternalLink } from 'lucide-react';

interface CopilotEvidenceCardProps {
  evidence: CopilotEvidence;
}

export function CopilotEvidenceCard({ evidence }: CopilotEvidenceCardProps) {
  const CardContent = (
    <div className="p-3 rounded-2xl border border-[#E3DFD2] bg-[#F8F6EE] hover:bg-white hover:border-[#174C35]/40 transition-all text-xs space-y-1.5 group">
      <div className="flex items-center justify-between gap-2">
        <CopilotSourceChip provenance={evidence.provenance} />
        {evidence.recordedAt && (
          <span className="text-[10px] text-[#5F6D63]">
            {evidence.recordedAt.split('T')[0]}
          </span>
        )}
      </div>
      <p className="text-[#203027] font-medium leading-relaxed">
        {evidence.description}
      </p>
      {evidence.route && (
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#174C35] pt-0.5 group-hover:underline">
          <span>View Record</span>
          <ExternalLink size={11} />
        </div>
      )}
    </div>
  );

  if (evidence.route) {
    return (
      <Link href={evidence.route} className="block no-underline">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

