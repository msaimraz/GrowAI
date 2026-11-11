'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, Camera, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { UserPlant } from '@/types/garden';
import { PLANTS_DATA } from '@/data/plants';
import { createGrowthNote } from '@/lib/storage';
import {
  generateDailyQuestionForPlant,
  saveDailyCheckRecord,
  getDailyCheckForPlant,
  deleteDailyCheckForPlant,
  getTodayGardenCheckProgress,
  getLocalTodayDateStr,
  syncDailyChecksFromUserPlants,
  formatDailyCheckNoteText,
  DailyCheckRecord,
} from '@/lib/daily-check/daily-check-engine';

interface DailyCheckCardProps {
  userPlants?: UserPlant[];
  userPlantNames?: string[];
  className?: string;
  onCheckCompleted?: () => void;
}

export function DailyCheckCard({
  userPlants = [],
  userPlantNames = [],
  className = '',
  onCheckCompleted,
}: DailyCheckCardProps) {
  const { showSuccess } = useGrowToast();
  const [mounted, setMounted] = useState(false);

  // Normalize effective plants
  const effectivePlants: UserPlant[] = useMemo(() => {
    if (userPlants.length > 0) return userPlants;
    if (userPlantNames.length > 0) {
      return userPlantNames.map((name, idx) => ({
        id: `demo-${idx}-${name.toLowerCase().replace(/\s+/g, '-')}`,
        plantSlug: 'genovese-basil',
        nickname: name,
        plantedDate: new Date().toISOString().split('T')[0],
        currentStage: 'Growing' as const,
        notes: [],
      }));
    }
    return [];
  }, [userPlants, userPlantNames]);

  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [activeCheckRecord, setActiveCheckRecord] = useState<DailyCheckRecord | null>(null);
  const [progressState, setProgressState] = useState({
    checkedCount: 0,
    totalCount: 0,
    percentage: 0,
    isAllChecked: false,
    checkedPlantIds: [] as string[],
  });

  const todayStr = useMemo(() => getLocalTodayDateStr(), []);

  // Multi-plant chips horizontal scroll affordance
  const chipsRailRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkChipsScroll = () => {
    const el = chipsRailRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  };

  useEffect(() => {
    checkChipsScroll();
    const el = chipsRailRef.current;
    if (el) {
      el.addEventListener('scroll', checkChipsScroll, { passive: true });
      window.addEventListener('resize', checkChipsScroll, { passive: true });
      return () => {
        el.removeEventListener('scroll', checkChipsScroll);
        window.removeEventListener('resize', checkChipsScroll);
      };
    }
  }, [effectivePlants]);

  // Ensure active plant chip is scrolled into view smoothly
  useEffect(() => {
    if (selectedPlantId && chipsRailRef.current) {
      const selectedBtn = chipsRailRef.current.querySelector(
        '[data-selected="true"]'
      ) as HTMLElement | null;
      if (selectedBtn) {
        selectedBtn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [selectedPlantId]);

  // Update garden habit progress
  const refreshProgress = () => {
    if (effectivePlants.length === 0) return;
    const progress = getTodayGardenCheckProgress(effectivePlants, todayStr);
    setProgressState(progress);
  };

  useEffect(() => {
    setMounted(true);
    syncDailyChecksFromUserPlants(effectivePlants);
    refreshProgress();
  }, [effectivePlants, todayStr]);

  // Set default selected plant: pick first unchecked plant, or first plant
  useEffect(() => {
    if (!mounted || effectivePlants.length === 0) return;

    if (!selectedPlantId || !effectivePlants.some((p) => p.id === selectedPlantId)) {
      const unchecked = effectivePlants.find(
        (p) => !progressState.checkedPlantIds.includes(p.id)
      );
      setSelectedPlantId(unchecked ? unchecked.id : effectivePlants[0].id);
    }
  }, [mounted, effectivePlants, progressState.checkedPlantIds, selectedPlantId]);

  // Current active plant
  const currentPlant = useMemo(() => {
    return effectivePlants.find((p) => p.id === selectedPlantId) || effectivePlants[0] || null;
  }, [effectivePlants, selectedPlantId]);

  // Load existing saved check for currently selected plant
  useEffect(() => {
    if (!currentPlant || !mounted) return;
    const saved = getDailyCheckForPlant(currentPlant.id, todayStr);
    setActiveCheckRecord(saved);
  }, [currentPlant, mounted, todayStr]);

  // Question generated dynamically based on real plant context
  const currentQuestion = useMemo(() => {
    if (!currentPlant) return null;
    const catalog = PLANTS_DATA.find((p) => p.slug === currentPlant.plantSlug);
    return generateDailyQuestionForPlant(currentPlant, catalog, todayStr);
  }, [currentPlant, todayStr]);

  // ---------------------------------------------------------------------------
  // INTERACTIVE ANSWER HANDLERS
  // ---------------------------------------------------------------------------

  const handleSelectOption = async (option: 'good' | 'different' | 'unsure') => {
    if (!currentPlant || !currentQuestion) return;

    const newRecord: DailyCheckRecord = {
      id: `check-${currentPlant.id}-${todayStr}`,
      plantId: currentPlant.id,
      plantName: currentPlant.nickname,
      plantSlug: currentPlant.plantSlug,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      category: currentQuestion.category,
      selectedAnswer: option,
      noticedDetail: null,
      timestamp: new Date().toISOString(),
      date: todayStr,
    };

    saveDailyCheckRecord(newRecord);
    setActiveCheckRecord(newRecord);
    refreshProgress();

    // Idempotent persistent note creation (saved to Supabase in auth mode or localStorage in guest mode)
    try {
      const noteText = formatDailyCheckNoteText(newRecord);
      await createGrowthNote(currentPlant.id, {
        stage: currentPlant.currentStage,
        text: noteText,
        date: todayStr,
      });
    } catch {}

    // Positive feedback toasts & audit growth note
    if (option === 'good') {
      showSuccess('🌱 Nice work!', 'Your daily plant check is complete.', '🌿');
    } else if (option === 'different') {
      showSuccess('👀 Good catch!', 'Let’s take a closer look.', '👀');
    } else if (option === 'unsure') {
      showSuccess('🌿 No worries!', 'We’ll check together.', '🌱');
    }

    if (onCheckCompleted) onCheckCompleted();
  };

  const handleSelectDetail = async (detail: string) => {
    if (!currentPlant || !activeCheckRecord) return;

    const updated: DailyCheckRecord = {
      ...activeCheckRecord,
      noticedDetail: detail,
      timestamp: new Date().toISOString(),
    };

    saveDailyCheckRecord(updated);
    setActiveCheckRecord(updated);
    showSuccess('📷 Observation noted!', `Marked ${detail.toLowerCase()} for follow-up inspection.`, '🔍');

    try {
      const noteText = formatDailyCheckNoteText(updated);
      await createGrowthNote(currentPlant.id, {
        stage: currentPlant.currentStage,
        text: noteText,
        date: todayStr,
      });
    } catch {}

    refreshProgress();
    if (onCheckCompleted) onCheckCompleted();
  };

  const handleResetCheck = () => {
    if (!currentPlant) return;
    deleteDailyCheckForPlant(currentPlant.id, todayStr);
    setActiveCheckRecord(null);
    refreshProgress();
  };

  // If no plants in user garden, show friendly invitation
  if (effectivePlants.length === 0) {
    return (
      <div
        className={`rounded-3xl border border-[#E3DFD2] bg-white p-5 sm:p-6 shadow-xs space-y-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#EAF1E4] border border-[#78A95A]/30 flex items-center justify-center text-xl shrink-0">
            🌱
          </span>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5F6D63] block">
              Daily Plant Check
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#203027] leading-snug">
              Ready to start your daily plant checks?
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#5F6D63] leading-relaxed">
          Add your first plant to start building your daily growing habit and track its progress every day.
        </p>
        <Link
          href="/app/plants"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#123E2A] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer min-h-[40px] select-none touch-manipulation w-fit"
        >
          <span>Pick a Plant</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-[#E3DFD2] bg-gradient-to-br from-[#FFF3D7]/40 via-white to-[#EAF1E4]/50 p-4 sm:p-6 shadow-xs space-y-4 overflow-hidden ${className}`}
    >
      {/* 1. GARDEN HABIT PROGRESS BAR (PART 3.6 & NEW PALETTE) */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#E3DFD2] p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold font-serif text-[#203027] shrink-0 min-w-0">
            <span className="text-[#78A95A] text-sm shrink-0">🌱</span>
            <span className="text-[11px] sm:text-xs tracking-wide whitespace-nowrap">YOUR GARDEN TODAY</span>
          </div>
          <span className="font-mono text-[10.5px] sm:text-[11px] font-semibold text-[#174C35] whitespace-nowrap shrink-0 ml-auto">
            {progressState.checkedCount} of {progressState.totalCount}{' '}
            <span className="hidden sm:inline">plants </span>checked
          </span>
        </div>

        {/* Visual Progress Bar: warm neutral track -> fresh leaf green -> deep botanical green */}
        <div className="w-full h-2.5 bg-[#E3DFD2] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#78A95A] to-[#174C35] transition-all duration-500 rounded-full"
            style={{ width: `${progressState.percentage}%` }}
          />
        </div>

        <p className="text-[11px] text-[#5F6D63]">
          {progressState.isAllChecked
            ? '✨ All plants checked today! You’re building wonderful growing habits.'
            : 'Keep getting to know your plants.'}
        </p>
      </div>

      {/* 2. MULTI-PLANT SELECTION CHIPS IF > 1 PLANT */}
      {effectivePlants.length > 1 && (
        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
          {/* Left subtle edge fade affordance (Mobile) */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 bottom-1 w-6 sm:w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Horizontally scrollable chips rail */}
          <div
            ref={chipsRailRef}
            onScroll={checkChipsScroll}
            className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 pt-0.5 scrollbar-none scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {effectivePlants.map((plant) => {
              const isSelected = plant.id === currentPlant?.id;
              const isChecked = progressState.checkedPlantIds.includes(plant.id);

              return (
                <button
                  key={plant.id}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => setSelectedPlantId(plant.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none shrink-0 min-h-[36px] touch-manipulation whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#174C35] text-white border-[#174C35] shadow-2xs font-bold'
                      : isChecked
                      ? 'bg-[#EAF1E4] text-[#174C35] border-[#78A95A]/40'
                      : 'bg-white text-[#203027] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                  }`}
                >
                  <span className="shrink-0">{isChecked ? '✓' : '🌿'}</span>
                  <span>{plant.nickname}</span>
                </button>
              );
            })}
          </div>

          {/* Right subtle edge fade affordance (Mobile) */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-0 top-0 bottom-1 w-6 sm:w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      )}

      {/* 3. QUESTION HEADER */}
      {currentQuestion && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-[#EAF1E4] border border-[#78A95A]/30 flex items-center justify-center text-xl shadow-2xs select-none shrink-0 mt-0.5 text-[#174C35]">
              {currentQuestion.icon}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wide sm:tracking-wider text-[#5F6D63] block font-semibold truncate">
                <span className="hidden sm:inline">Daily Plant </span>Check · {currentQuestion.category} · {currentPlant?.nickname}
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#203027] leading-snug whitespace-normal break-words pt-0.5">
                {currentQuestion.text}
              </h3>
            </div>
          </div>

          {activeCheckRecord && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/40 shrink-0">
              <CheckCircle2 size={13} />
              <span>Checked</span>
            </span>
          )}
        </div>
      )}

      {/* 4. THREE ANSWER CHOICES OR RESPONSE FEEDBACK */}
      {!activeCheckRecord ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Option 1: Everything looks good (Fresh Green) */}
          <button
            type="button"
            onClick={() => handleSelectOption('good')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#78A95A]/40 text-xs sm:text-sm font-semibold text-[#203027] transition-all duration-75 cursor-pointer shadow-2xs active:scale-95 min-h-[48px] select-none touch-manipulation"
          >
            <span className="text-base text-[#78A95A]">🌿</span>
            <span>Everything looks good</span>
          </button>

          {/* Option 2: Something looks different (Warm Coral / Amber) */}
          <button
            type="button"
            onClick={() => handleSelectOption('different')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#FBE9E2] border border-[#E3DFD2] hover:border-[#E4775D]/40 text-xs sm:text-sm font-semibold text-[#203027] transition-all duration-75 cursor-pointer shadow-2xs active:scale-95 min-h-[48px] select-none touch-manipulation"
          >
            <span className="text-base text-[#E4775D]">👀</span>
            <span>Something looks different</span>
          </button>

          {/* Option 3: I'm not sure (Soft Blue / Sage) */}
          <button
            type="button"
            onClick={() => handleSelectOption('unsure')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#E7F2F9] border border-[#E3DFD2] hover:border-[#65A8D0]/40 text-xs sm:text-sm font-semibold text-[#203027] transition-all duration-75 cursor-pointer shadow-2xs active:scale-95 min-h-[48px] select-none touch-manipulation"
          >
            <span className="text-base text-[#65A8D0]">🤔</span>
            <span>I’m not sure</span>
          </button>
        </div>
      ) : (
        /* Response Feedback */
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DFD2] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              {/* Option: GOOD */}
              {activeCheckRecord.selectedAnswer === 'good' && (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#174C35] flex items-center gap-1.5">
                    <span>✓</span> Nice! Your daily plant check is complete.
                  </p>
                  <p className="text-xs sm:text-sm text-[#5F6D63] leading-relaxed">
                    We’ve logged that {currentPlant?.nickname} is looking happy and healthy today.
                  </p>
                </div>
              )}

              {/* Option: SOMETHING LOOKS DIFFERENT */}
              {activeCheckRecord.selectedAnswer === 'different' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#963A23] flex items-center gap-1.5">
                      <span>✓</span> Good catch! Let’s take a closer look.
                    </p>
                    <p className="text-xs sm:text-sm text-[#203027] font-medium">
                      What did you notice on {currentPlant?.nickname}?
                    </p>
                  </div>

                  {/* Follow-up category chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {[
                      { id: 'Leaves', label: '🍃 Leaves' },
                      { id: 'Soil', label: '💧 Soil' },
                      { id: 'Insects', label: '🐛 Insects' },
                      { id: 'Light', label: '☀️ Light' },
                      { id: 'Growth', label: '🌱 Growth' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectDetail(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[38px] touch-manipulation select-none active:scale-95 ${
                          activeCheckRecord.noticedDetail === item.id
                            ? 'bg-[#174C35] text-white border-[#174C35]'
                            : 'bg-[#F8F6EE] text-[#203027] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    <Link
                      href={`/app/ai-doctor?plant=${currentPlant?.plantSlug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#174C35] text-white hover:bg-[#123E2A] transition-all shadow-2xs min-h-[38px] active:scale-95 touch-manipulation"
                    >
                      <Camera size={14} />
                      <span>Add a photo</span>
                    </Link>
                  </div>

                  {activeCheckRecord.noticedDetail && (
                    <p className="text-xs text-[#5F6D63] pt-1">
                      Observation saved: {activeCheckRecord.noticedDetail} noted in {currentPlant?.nickname}’s timeline.
                    </p>
                  )}
                </div>
              )}

              {/* Option: UNSURE */}
              {activeCheckRecord.selectedAnswer === 'unsure' && (
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-[#203027] flex items-center gap-1.5">
                    <span>✓</span> No worries. Let’s check together.
                  </p>
                  {currentQuestion?.guidanceTip && (
                    <div className="p-3 bg-[#E7F2F9] rounded-xl border border-[#65A8D0]/30 text-xs text-[#1B5D88] leading-relaxed">
                      💡 <strong>Quick tip:</strong> {currentQuestion.guidanceTip}
                    </div>
                  )}
                  <p className="text-xs text-[#5F6D63] leading-relaxed">
                    Observing small changes is how all great growers learn. You’re doing great!
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetCheck}
              className="text-[11px] font-mono text-[#5F6D63] hover:text-[#174C35] underline cursor-pointer shrink-0 min-h-[36px] flex items-center gap-1"
              title="Change answer"
            >
              <RotateCcw size={11} />
              <span>Change</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
