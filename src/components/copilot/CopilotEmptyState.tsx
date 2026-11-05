'use client';

import React from 'react';
import { Compass, Sparkles, Sprout, ShieldCheck } from 'lucide-react';

interface CopilotEmptyStateProps {
  activePlantNickname?: string | null;
}

export function CopilotEmptyState({ activePlantNickname }: CopilotEmptyStateProps) {
  return (
    <div className="p-6 sm:p-8 text-center rounded-3xl bg-[#fbf9f4] border border-[#ded5c5] space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
        <Compass size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2417]">
          {activePlantNickname ? `Grower Copilot: ${activePlantNickname}` : 'Grower Copilot Workspace'}
        </h3>
        <p className="text-xs sm:text-sm text-[#526a57] max-w-md mx-auto leading-relaxed">
          Ask questions about health observations, environmental microclimates, feeding logs,
          harvests, reminders, or recommended next steps. All answers are grounded strictly in your
          recorded garden data.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px] text-[#6d8573] pt-2">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#144229]" />
          <span>Factual Grounding</span>
        </span>
        <span className="flex items-center gap-1">
          <Sprout size={13} className="text-[#144229]" />
          <span>Zero Fabricated Dosages</span>
        </span>
      </div>
    </div>
  );
}

