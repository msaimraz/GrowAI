'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CopilotAction } from '@/types/grower-copilot';
import { executeCopilotAction } from '@/lib/grower-copilot/action-executor';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface CopilotActionCardProps {
  action: CopilotAction;
  onActionExecuted?: () => void;
}

export function CopilotActionCard({ action, onActionExecuted }: CopilotActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleConfirmAndExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCopilotAction({
        ...action,
        confirmed: true,
      });
      setExecutionResult({
        success: result.success,
        message: result.message,
      });
      if (result.success && onActionExecuted) {
        onActionExecuted();
      }
    } catch (err: any) {
      setExecutionResult({
        success: false,
        message: err.message || 'Execution failed',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl border border-[#cfe0cf] bg-[#f0fdf4] text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#166534] flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-[#15803d]" />
          <span>Proposed Action: {action.label}</span>
        </span>
        {action.requiresConfirmation && !executionResult && (
          <span className="text-[10px] font-semibold text-[#854d0e] bg-[#fef9c3] px-2 py-0.5 rounded-md border border-[#fde047]">
            Confirmation Required
          </span>
        )}
      </div>

      <p className="text-[#14532d] leading-relaxed">{action.description}</p>

      {/* Confirmation & Execution Buttons */}
      {!executionResult ? (
        <div className="flex items-center justify-end gap-2 pt-1">
          {action.requiresConfirmation ? (
            <button
              type="button"
              disabled={isExecuting}
              onClick={handleConfirmAndExecute}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#144229] text-white font-semibold text-xs hover:bg-[#1b5535] transition-colors cursor-pointer min-h-[32px] disabled:opacity-50"
            >
              {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>Confirm & Execute</span>
            </button>
          ) : action.route ? (
            <Link
              href={action.route}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#cfdfcf] text-[#144229] font-semibold text-xs hover:bg-[#eef5ee] transition-colors"
            >
              <span>Open</span>
              <ArrowRight size={13} />
            </Link>
          ) : null}
        </div>
      ) : (
        <div
          className={`p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
            executionResult.success
              ? 'bg-[#dcfce7] text-[#15803d]'
              : 'bg-[#fee2e2] text-[#991b1b]'
          }`}
        >
          {executionResult.success ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{executionResult.message}</span>
        </div>
      )}
    </div>
  );
}

