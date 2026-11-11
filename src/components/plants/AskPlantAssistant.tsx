'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plant } from '@/types/plant';
import { UserPlant } from '@/types/garden';
import { CopilotMessage, CopilotResponse } from '@/types/grower-copilot';
import { executeCopilotQuery } from '@/lib/grower-copilot';
import { PlantImage } from '@/components/plants/PlantImage';
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface AskPlantAssistantProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
  userPlants?: UserPlant[];
}

export function AskPlantAssistant({
  plant,
  isOpen,
  onClose,
  userPlants = [],
}: AskPlantAssistantProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeSlugRef = useRef<string>(plant.slug);

  // Cross-plant session isolation (Section 14):
  // When switching plant slugs, reset conversation memory to the new plant.
  useEffect(() => {
    if (activeSlugRef.current !== plant.slug) {
      activeSlugRef.current = plant.slug;
      setMessages([]);
      setError(null);
      setLastFailedQuery(null);
      setInputValue('');
    }
  }, [plant.slug]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus input on open after animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Contextual suggested questions (Section 5)
  // Tailored to the current species and available botanical attributes.
  const suggestedQuestions = useMemo(() => {
    const questions: string[] = [];

    // 1. Sunlight question tailored to requirement
    if (plant.sunlight.includes('full')) {
      questions.push('What if it gets less sunlight?');
    } else {
      questions.push('Does it need direct sunlight?');
    }

    // 2. Watering question (always relevant)
    questions.push('What happens if I forget to water it?');

    // 3. Problem / Symptom question
    questions.push('What should I look for on its leaves?');

    // 4. Care / Growth question
    questions.push('How can I help it grow better?');

    // 5. Benefits / Culinary (if practical uses or edible)
    if (
      (plant.practicalUses && plant.practicalUses.length > 0) ||
      plant.medicinalProfile?.suitabilityForConsumption?.isEdible
    ) {
      questions.push('What can I use this plant for?');
    }

    // 6. Harvest question (only for plants with documented harvest days)
    if (plant.timelines?.harvestDays && plant.timelines.harvestDays.max > 0) {
      questions.push('When is it ready to harvest?');
    }

    // 7. Traditional / Medicinal (only if plant has documented traditional role)
    if (plant.medicinalProfile?.traditionalMedicineRole) {
      questions.push('Does it have traditional medicinal uses?');
    }

    // Return 4 to 6 questions
    return questions.slice(0, 5);
  }, [plant]);

  // Send query handler
  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setLastFailedQuery(null);
    setInputValue('');

    const userMessageId = `msg-user-${Date.now()}`;
    const assistantMessageId = `msg-ai-${Date.now() + 1}`;

    const userMsg: CopilotMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let response: CopilotResponse;

      // Online API call to /api/copilot with rate-limiting and Supabase session auth
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          activePlantSlug: plant.slug,
          activePlantNickname: plant.commonName,
          botanicalPlant: plant,
          plants: userPlants,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              'Question limit reached. Please wait a moment before asking another question.'
          );
        }
        throw new Error('Could not reach the assistant. Trying offline intelligence...');
      }

      response = await res.json();

      const assistantMsg: CopilotMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        response,
        status: 'success',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      // Deterministic fallback if API fails or network is offline
      try {
        const fallbackResponse = await executeCopilotQuery({
          query: trimmed,
          activePlantSlug: plant.slug,
          activePlantNickname: plant.commonName,
          botanicalPlant: plant,
          plants: userPlants,
          forceDeterministic: true,
        });

        const assistantMsg: CopilotMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: fallbackResponse.answer,
          timestamp: new Date().toISOString(),
          response: fallbackResponse,
          status: 'success',
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (fallbackErr) {
        setError('Sorry, I couldn’t answer that right now. Please try again.');
        setLastFailedQuery(trimmed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setError(null);
    setLastFailedQuery(null);
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ask about ${plant.commonName}`}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Drawer Container (Desktop: Right slide-over | Mobile: Bottom sheet) */}
      <div className="fixed inset-x-0 bottom-0 max-h-[88vh] sm:max-h-screen sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] w-full bg-white sm:border-l border-[#E3DFD2] rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-200">
        {/* =========================================================
            1. HEADER: Plant Identity & Title
        ========================================================= */}
        <header className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-[#E3DFD2] bg-[#F8F6EE]/90 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E3DFD2] shrink-0 bg-white shadow-2xs">
              <PlantImage
                src={plant.imageUrl}
                alt={plant.commonName}
                category={plant.category}
                aspectRatio="square"
                sizes="40px"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#174C35] flex items-center gap-1">
                  <Sparkles size={12} className="text-[#78A95A]" />
                  Ask Your Plant
                </span>
              </div>
              <h2 className="font-serif font-bold text-sm sm:text-base text-[#203027] truncate">
                {plant.commonName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearConversation}
                title="Start fresh"
                aria-label="Start fresh conversation"
                className="p-2 rounded-xl text-[#5F6D63] hover:text-[#174C35] hover:bg-[#EAF1E4] transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close"
              aria-label="Close assistant"
              className="p-2 rounded-xl text-[#5F6D63] hover:text-[#203027] hover:bg-[#EAF1E4] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Supporting Banner Message */}
        <div className="px-4 py-2 bg-[#EAF1E4]/70 border-b border-[#78A95A]/20 text-[11px] text-[#174C35] flex items-center gap-1.5 shrink-0">
          <span>🌱</span>
          <span className="font-medium">
            Questions about your plant? GrowAI is here to help.
          </span>
        </div>

        {/* =========================================================
            2. SCROLLABLE CONVERSATION AREA
        ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 [scrollbar-width:thin]">
          {/* Welcome state when conversation is empty */}
          {messages.length === 0 && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-2">
                <p className="text-xs sm:text-sm text-[#203027] leading-relaxed">
                  Hi there! 🌿 I’m your botanical growing companion for{' '}
                  <strong>{plant.commonName}</strong> (<em>{plant.scientificName}</em>).
                </p>
                <p className="text-xs text-[#5F6D63] leading-relaxed">
                  Ask me anything about light, watering, soil, common leaf issues, or verified
                  culinary and practical uses.
                </p>
              </div>

              {/* Contextual Suggested Questions Section */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5F6D63] font-semibold block">
                  Suggested Questions
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#78A95A]/40 text-xs font-medium text-[#203027] transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] touch-manipulation flex items-center justify-between gap-2"
                    >
                      <span>{q}</span>
                      <span className="text-[#78A95A] shrink-0">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } space-y-1`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#174C35] text-white shadow-2xs rounded-br-xs'
                    : 'bg-[#F8F6EE] text-[#203027] border border-[#E3DFD2] shadow-2xs rounded-bl-xs space-y-2.5'
                }`}
              >
                {/* Assistant or User Content */}
                <div className="whitespace-pre-line break-words">{msg.content}</div>

                {/* Structured Assistant Extras (Evidence, Action, Citations) */}
                {msg.role === 'assistant' && msg.response && (
                  <div className="space-y-2 pt-1 border-t border-[#E3DFD2]/60">
                    {/* What GrowAI Found Fact Badges */}
                    {msg.response.whatGrowAiFound && msg.response.whatGrowAiFound.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#174C35] font-bold block">
                          Verified Botanical Records
                        </span>
                        <ul className="text-[11px] text-[#5F6D63] space-y-0.5 list-disc pl-3">
                          {msg.response.whatGrowAiFound.slice(0, 3).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Next Step */}
                    {msg.response.recommendedNextStep && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-[#E3DFD2] text-[11px] text-[#203027] space-y-0.5">
                        <strong className="text-[#174C35] block font-semibold flex items-center gap-1">
                          <span>🌱</span>
                          <span>What you can do:</span>
                        </strong>
                        <p className="text-[#5F6D63] leading-relaxed">
                          {msg.response.recommendedNextStep}
                        </p>
                      </div>
                    )}

                    {/* Verified Botanical Citations / Reference URLs */}
                    {plant.sourceUrls && plant.sourceUrls.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#5F6D63]">
                          Sources:
                        </span>
                        {plant.sourceUrls.slice(0, 2).map((url, idx) => {
                          let label = 'Botanical Reference';
                          try {
                            const domain = new URL(url).hostname.replace('www.', '');
                            label = domain;
                          } catch {}
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#174C35] bg-white px-2 py-0.5 rounded-md border border-[#E3DFD2] hover:bg-[#EAF1E4] transition-colors"
                            >
                              <span>{label}</span>
                              <ExternalLink size={9} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] font-mono text-[#5F6D63] px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}

          {/* Loading Indicator (Section 16) */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] text-xs text-[#174C35] w-fit shadow-2xs">
              <span className="inline-block animate-spin text-base">🌱</span>
              <span className="font-medium animate-pulse">Growing an answer...</span>
            </div>
          )}

          {/* Error Message with Retry */}
          {error && (
            <div className="p-3 rounded-2xl bg-[#FBE9E2] border border-[#E4775D]/40 text-xs text-[#963A23] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
              {lastFailedQuery && (
                <button
                  type="button"
                  onClick={() => handleSendMessage(lastFailedQuery)}
                  className="text-[11px] underline font-medium hover:text-[#203027] cursor-pointer"
                >
                  Click to retry: &ldquo;{lastFailedQuery}&rdquo;
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================
            3. SUGGESTED PILLS (When messages exist)
        ========================================================= */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 py-2 border-t border-[#E3DFD2]/60 bg-[#F8F6EE]/40 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] shrink-0">
            <span className="text-[10px] font-mono uppercase text-[#5F6D63] shrink-0">
              Ask:
            </span>
            {suggestedQuestions.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-[11px] font-medium text-[#174C35] bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] px-2.5 py-1 rounded-full shrink-0 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* =========================================================
            4. INPUT FORM
        ========================================================= */}
        <footer className="p-3 sm:p-4 border-t border-[#E3DFD2] bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask about ${plant.commonName}...`}
                disabled={isLoading}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-[#E3DFD2] focus:border-[#174C35] focus:ring-1 focus:ring-[#174C35] bg-[#F8F6EE]/60 text-xs sm:text-sm text-[#203027] placeholder:text-[#5F6D63]/70 transition-all outline-hidden min-h-[42px]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-[#174C35] hover:bg-[#123E2A] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center active:scale-95 touch-manipulation"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Safety & Educational Disclaimer */}
          <p className="text-[10px] text-[#5F6D63] text-center pt-2 leading-tight flex items-center justify-center gap-1">
            <ShieldAlert size={10} className="text-[#78A95A]" />
            <span>Botanical companion for gardening education. Not medical advice.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
