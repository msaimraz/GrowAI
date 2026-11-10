'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface CopilotSuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export function CopilotSuggestedQuestions({
  questions,
  onSelectQuestion,
  disabled = false,
}: CopilotSuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-semibold text-[#5F6D63] flex items-center gap-1">
        <Sparkles size={12} className="text-[#174C35]" />
        <span>Suggested Inquiries:</span>
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {questions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(q)}
            className="text-left px-3 py-1.5 rounded-full bg-[#F8F6EE] hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#174C35]/40 text-[#174C35] text-xs font-medium transition-all disabled:opacity-50 cursor-pointer min-h-[32px]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

