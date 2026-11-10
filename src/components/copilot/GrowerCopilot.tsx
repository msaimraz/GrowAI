'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserPlant } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  ProductionSpaceMetrics,
} from '@/types/grow-intelligence';
import { Reminder } from '@/types/reminder';
import { CopilotMessage as CopilotMessageType, CopilotResponse } from '@/types/grower-copilot';
import { executeCopilotQuery } from '@/lib/grower-copilot';
import { usePwa } from '@/context/PwaContext';
import { CopilotMessage } from './CopilotMessage';
import { CopilotInput } from './CopilotInput';
import { CopilotSuggestedQuestions } from './CopilotSuggestedQuestions';
import { CopilotEmptyState } from './CopilotEmptyState';
import { CopilotLoadingState } from './CopilotLoadingState';
import { CopilotSafetyNotice } from './CopilotSafetyNotice';
import {
  Compass,
  Sparkles,
  RotateCcw,
  WifiOff,
  ShieldCheck,
  Bot,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface GrowerCopilotProps {
  activePlant?: UserPlant | null;
  plants?: UserPlant[];
  diagnoses?: SavedDiagnosisRecord[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  harvests?: HarvestRecord[];
  reminders?: Reminder[];
  spaceMetrics?: ProductionSpaceMetrics | null;
  onRefreshNeeded?: () => void;
  compactMode?: boolean;
}

export function GrowerCopilot({
  activePlant,
  plants = [],
  diagnoses = [],
  conditions = [],
  feedings = [],
  propagations = [],
  cycles = [],
  harvests = [],
  reminders = [],
  spaceMetrics,
  onRefreshNeeded,
  compactMode = false,
}: GrowerCopilotProps) {
  const { isOffline } = usePwa();
  const [messages, setMessages] = useState<CopilotMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePlantId = activePlant?.id || null;
  const activePlantNickname = activePlant?.nickname || null;

  // Context-aware suggested questions
  const defaultQuestions = activePlantNickname
    ? [
        `How is ${activePlantNickname} doing?`,
        'What should I do today?',
        'When was it last fed?',
        'Something looks wrong',
      ]
    : [
        'How is my garden doing?',
        'What should I do today?',
        'What should I grow here?',
        'Something looks wrong',
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessageId = `msg-u-${Date.now()}`;
    const assistantMessageId = `msg-a-${Date.now() + 1}`;

    const userMsg: CopilotMessageType = {
      id: userMessageId,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let response: CopilotResponse;

      // If offline, bypass network and execute deterministic local intelligence directly
      if (isOffline) {
        response = await executeCopilotQuery({
          query: queryText,
          activePlantId,
          activePlantNickname,
          plants,
          conditions,
          feedings,
          propagations,
          cycles,
          harvests,
          diagnoses,
          reminders,
          spaceMetrics,
          forceDeterministic: true,
        });

        response.answer = `[Offline Mode] ${response.answer} (AI conversational generation is paused until internet is restored).`;
      } else {
        // Online: call server-side API endpoint with rate limiting and secure auth
        const res = await fetch('/api/copilot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: queryText,
            activePlantId,
            activePlantNickname,
            plants,
            conditions,
            feedings,
            propagations,
            cycles,
            harvests,
            diagnoses,
            reminders,
            spaceMetrics,
          }),
        });

        if (!res.ok) {
          if (res.status === 429) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Rate limit reached. Please wait before asking another question.');
          }
          throw new Error('Failed to query Grower Copilot endpoint.');
        }

        response = await res.json();
      }

      const assistantMsg: CopilotMessageType = {
        id: assistantMessageId,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        response,
        status: 'success',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      // Deterministic fallback on error
      const fallbackResponse = await executeCopilotQuery({
        query: queryText,
        activePlantId,
        activePlantNickname,
        plants,
        conditions,
        feedings,
        propagations,
        cycles,
        harvests,
        diagnoses,
        reminders,
        spaceMetrics,
        forceDeterministic: true,
      });

      const assistantMsg: CopilotMessageType = {
        id: assistantMessageId,
        role: 'assistant',
        content: fallbackResponse.answer,
        timestamp: new Date().toISOString(),
        response: fallbackResponse,
        status: 'success',
        errorMessage: err.message,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
  };

  return (
    <div
      className={`bg-white border border-[#E3DFD2] rounded-3xl shadow-xs flex flex-col ${
        compactMode ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
      }`}
    >
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DFD2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0 border border-[#E3DFD2]">
            <Compass size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#203027]">
                Grower Copilot
              </h3>
              {activePlantNickname && (
                <span className="text-[11px] font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-0.5 rounded-full border border-[#E3DFD2]">
                  Scoped to {activePlantNickname}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6D63] mt-0.5">
              Grounded conversational assistant answering strictly from your recorded garden data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {isOffline && (
            <span className="text-[11px] font-semibold text-[#8A6400] bg-[#FFF3D7] px-2.5 py-1 rounded-full border border-[#F0C04D/30] flex items-center gap-1">
              <WifiOff size={12} />
              <span>Offline (Deterministic)</span>
            </span>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetConversation}
              className="p-2 rounded-xl text-[#5F6D63] hover:bg-[#F8F6EE] hover:text-[#174C35] border border-[#E3DFD2] transition-colors cursor-pointer text-xs flex items-center gap-1 min-h-[36px]"
              title="Reset conversation"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className={`overflow-y-auto space-y-4 my-4 pr-1 ${
          compactMode ? 'max-h-[420px] min-h-[220px]' : 'max-h-[560px] min-h-[280px]'
        }`}
      >
        {messages.length === 0 ? (
          <CopilotEmptyState
            activePlantNickname={activePlantNickname}
            onSelectQuestion={handleSendMessage}
          />
        ) : (
          messages.map((msg) => (
            <CopilotMessage
              key={msg.id}
              message={msg}
              onActionExecuted={onRefreshNeeded}
            />
          ))
        )}

        {isLoading && <CopilotLoadingState />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions & Input Bar */}
      <div className="space-y-3 pt-3 border-t border-[#E3DFD2]">
        <CopilotSuggestedQuestions
          questions={
            messages.length > 0 &&
            messages[messages.length - 1].role === 'assistant' &&
            messages[messages.length - 1].response?.suggestedQuestions
              ? messages[messages.length - 1].response!.suggestedQuestions!
              : defaultQuestions
          }
          onSelectQuestion={handleSendMessage}
          disabled={isLoading}
        />

        <CopilotInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={
            activePlantNickname
              ? `Ask about ${activePlantNickname}'s health, conditions, or feeding...`
              : 'Ask about tasks, plant health, conditions, feeding, or yields...'
          }
        />

        <CopilotSafetyNotice />
      </div>
    </div>
  );
}

