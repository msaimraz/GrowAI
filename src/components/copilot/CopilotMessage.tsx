'use client';

import React from 'react';
import { CopilotMessage as CopilotMessageType } from '@/types/grower-copilot';
import { CopilotEvidenceCard } from './CopilotEvidenceCard';
import { CopilotActionCard } from './CopilotActionCard';
import { Sparkles, User, AlertCircle, Compass, CheckCircle2 } from 'lucide-react';

interface CopilotMessageProps {
  message: CopilotMessageType;
  onActionExecuted?: () => void;
}

export function CopilotMessage({ message, onActionExecuted }: CopilotMessageProps) {
  const isUser = message.role === 'user';
  const response = message.response;

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 max-w-3xl ml-auto">
        <div className="bg-[#144229] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm shadow-xs leading-relaxed">
          {message.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-[#eef5ee] text-[#144229] flex items-center justify-center shrink-0 mt-0.5 border border-[#cfe0cf]">
          <User size={15} />
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex items-start gap-3 max-w-3xl">
      <div className="w-8 h-8 rounded-full bg-[#144229] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
        <Compass size={16} />
      </div>

      <div className="flex-1 space-y-3.5 bg-white border border-[#ded5c5] rounded-3xl rounded-tl-xs p-5 sm:p-6 shadow-xs text-xs sm:text-sm">
        {/* Answer */}
        <div className="space-y-1">
          <p className="text-[#0c2417] leading-relaxed font-medium">
            {response ? response.answer : message.content}
          </p>
        </div>

        {/* What GrowAI Found */}
        {response?.whatGrowAiFound && response.whatGrowAiFound.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] space-y-1.5 text-xs">
            <span className="font-bold text-[#0c2417] block">What GrowAI Found:</span>
            <ul className="space-y-1 text-[#526a57]">
              {response.whatGrowAiFound.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#144229] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why */}
        {response?.why && (
          <div className="text-xs text-[#526a57] leading-relaxed">
            <strong className="text-[#0c2417] font-semibold">Why: </strong>
            {response.why}
          </div>
        )}

        {/* Recommended Next Step */}
        {response?.recommendedNextStep && (
          <div className="p-3.5 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] text-xs text-[#144229] font-medium flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#144229] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#0c2417] mb-0.5">Recommended Next Step:</strong>
              {response.recommendedNextStep}
            </div>
          </div>
        )}

        {/* Traceable Evidence Cards */}
        {response?.evidence && response.evidence.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-[#f0ebe0]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d8573] block">
              Supporting Garden Records ({response.evidence.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {response.evidence.map((ev, idx) => (
                <CopilotEvidenceCard key={idx} evidence={ev} />
              ))}
            </div>
          </div>
        )}

        {/* Proposed Actions (Explicit Confirmation Required for Writes) */}
        {response?.suggestedActions && response.suggestedActions.length > 0 && (
          <div className="space-y-2 pt-1">
            {response.suggestedActions.map((act) => (
              <CopilotActionCard
                key={act.id}
                action={act}
                onActionExecuted={onActionExecuted}
              />
            ))}
          </div>
        )}

        {/* Source & Provenance Tag Footer */}
        {response && (
          <div className="flex items-center justify-between pt-2 border-t border-[#f0ebe0] text-[10px] text-[#6d8573]">
            <span>
              Source:{' '}
              {response.source === 'gemini_grounded'
                ? 'Grounded Gemini Language Layer'
                : 'Deterministic GrowAI Engine'}
            </span>
            <span className="capitalize">Confidence: {response.confidence}</span>
          </div>
        )}
      </div>
    </div>
  );
}

