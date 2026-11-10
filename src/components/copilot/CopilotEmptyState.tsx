'use client';

import React from 'react';
import { ShieldCheck, Sprout } from 'lucide-react';

interface CopilotEmptyStateProps {
  activePlantNickname?: string | null;
  onSelectQuestion?: (question: string) => void;
}

export function CopilotEmptyState({ activePlantNickname, onSelectQuestion }: CopilotEmptyStateProps) {
  const promptOptions = activePlantNickname
    ? [
        { label: `🌿 How is ${activePlantNickname} doing?`, query: `How is ${activePlantNickname} doing?` },
        { label: '✅ What should I do today?', query: 'What should I do today?' },
        { label: '💧 When was it last fed?', query: 'When was it last fed?' },
        { label: '🔍 Something looks wrong', query: 'Something looks wrong' },
      ]
    : [
        { label: '🌿 How is my garden doing?', query: 'How is my garden doing?' },
        { label: '✅ What should I do today?', query: 'What should I do today?' },
        { label: '🪴 What should I grow here?', query: 'What should I grow here?' },
        { label: '🔍 Something looks wrong', query: 'Something looks wrong' },
      ];

  return (
    <div className="p-6 sm:p-8 text-center rounded-3xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-4">
      <div className="w-14 h-14 rounded-3xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center mx-auto text-2xl shadow-xs">
        🌱
      </div>
      <div className="space-y-1">
        <h3 className="font-serif font-bold text-lg sm:text-xl text-[#203027]">
          {activePlantNickname ? `Ask GrowAI about ${activePlantNickname}` : 'Ask GrowAI'}
        </h3>
        <p className="text-xs sm:text-sm text-[#5F6D63] max-w-md mx-auto">
          What would you like help with? Tap a quick question or type your own below.
        </p>
      </div>

      {onSelectQuestion && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-lg mx-auto">
          {promptOptions.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(opt.query)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#174C35] text-[#203027] text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-[11px] text-[#5F6D63] pt-2">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#174C35]" />
          <span>Factual Grounding</span>
        </span>
        <span className="flex items-center gap-1">
          <Sprout size={13} className="text-[#174C35]" />
          <span>Zero Fabricated Dosages</span>
        </span>
      </div>
    </div>
  );
}
