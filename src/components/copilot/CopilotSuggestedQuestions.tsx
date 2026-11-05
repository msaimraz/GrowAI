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
      <span className="text-[11px] font-semibold text-[#6d8573] flex items-center gap-1">
        <Sparkles size={12} className="text-[#144229]" />
        <span>Suggested Inquiries:</span>
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {questions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(q)}
            className="text-left px-3 py-1.5 rounded-full bg-[#fbf9f4] hover:bg-[#eef5ee] border border-[#ded5c5] hover:border-[#144229]/40 text-[#144229] text-xs font-medium transition-all disabled:opacity-50 cursor-pointer min-h-[32px]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

