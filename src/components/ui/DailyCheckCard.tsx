'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
        className={`rounded-3xl border border-[#E8E4DA] bg-gradient-to-br from-[#FFF0D8]/60 via-[#FBF9F4] to-[#E6F0E3]/40 p-5 sm:p-6 shadow-xs space-y-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-white border border-[#E8E4DA] flex items-center justify-center text-xl shadow-2xs select-none">
            🌱
          </span>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#68736B] block">
              Daily Plant Check
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F2A23] leading-snug">
              Ready to start your daily plant checks?
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed">
          Add your first plant to start building your daily growing habit and track its progress every day.
        </p>
        <Link
          href="/app/plants"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#0f3424] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer min-h-[40px] select-none touch-manipulation w-fit"
        >
          <span>Pick a Plant</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-[#E8E4DA] bg-gradient-to-br from-[#FFF0D8]/60 via-[#FBF9F4] to-[#E6F0E3]/40 p-4 sm:p-6 shadow-xs space-y-4 ${className}`}
    >
      {/* 1. GARDEN HABIT PROGRESS BAR (PART 3.6) */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#E8E4DA] p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold font-serif text-[#1F2A23]">
            <span>🌱</span>
            <span>YOUR GARDEN TODAY</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#174C35]">
            {progressState.checkedCount} of {progressState.totalCount} plants checked
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-[#EFEAE0] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#526A57] to-[#174C35] transition-all duration-500 rounded-full"
            style={{ width: `${progressState.percentage}%` }}
          />
        </div>

        <p className="text-[11px] text-[#68736B]">
          {progressState.isAllChecked
            ? '✨ All plants checked today! You’re building wonderful growing habits.'
            : 'Keep getting to know your plants.'}
        </p>
      </div>

      {/* 2. MULTI-PLANT SELECTION CHIPS IF > 1 PLANT */}
      {effectivePlants.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {effectivePlants.map((plant) => {
            const isSelected = plant.id === currentPlant?.id;
            const isChecked = progressState.checkedPlantIds.includes(plant.id);

            return (
              <button
                key={plant.id}
                type="button"
                onClick={() => setSelectedPlantId(plant.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none shrink-0 min-h-[36px] touch-manipulation ${
                  isSelected
                    ? 'bg-[#174C35] text-white border-[#174C35] shadow-2xs'
                    : isChecked
                    ? 'bg-[#E6F0E3] text-[#174C35] border-[#CEE4C9]'
                    : 'bg-white text-[#1F2A23] border-[#E8E4DA] hover:bg-[#F3F6EC]'
                }`}
              >
                <span>{isChecked ? '✓' : '🌿'}</span>
                <span>{plant.nickname}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. QUESTION HEADER */}
      {currentQuestion && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-white border border-[#E8E4DA] flex items-center justify-center text-xl shadow-2xs select-none shrink-0 mt-0.5">
              {currentQuestion.icon}
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#68736B] block font-semibold">
                Daily Plant Check · {currentQuestion.category} · {currentPlant?.nickname}
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F2A23] leading-snug whitespace-normal break-words pt-0.5">
                {currentQuestion.text}
              </h3>
            </div>
          </div>

          {activeCheckRecord && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F0E3] text-[#174C35] border border-[#CEE4C9] shrink-0">
              <CheckCircle2 size={13} />
              <span>Checked</span>
            </span>
          )}
        </div>
      )}

      {/* 4. THREE ANSWER CHOICES OR RESPONSE FEEDBACK */}
      {!activeCheckRecord ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Option 1: Everything looks good */}
          <button
            type="button"
            onClick={() => handleSelectOption('good')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#F3F6EC] border border-[#E8E4DA] hover:border-[#174C35]/30 text-xs sm:text-sm font-semibold text-[#1F2A23] transition-all duration-75 cursor-pointer shadow-2xs active:scale-95 min-h-[48px] select-none touch-manipulation"
          >
            <span className="text-base">🌿</span>
            <span>Everything looks good</span>
          </button>

          {/* Option 2: Something looks different */}
          <button
            type="button"
            onClick={() => handleSelectOption('different')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#FFF0D8] border border-[#E8E4DA] hover:border-[#C86B4A]/40 text-xs sm:text-sm font-semibold text-[#1F2A23] transition-all duration-75 cursor-pointer shadow-2xs active:scale-95 min-h-[48px] select-none touch-manipulation"
          >
            <span className="text-base">👀</span>
            <span>Something looks different</span>
          </button>

          {/* Option 3: I'm not sure */}
          <button
            type="button"
            onClick={() => handleSelectOption('unsure')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#EEE8F6] border border-[#E8E4DA] hover:border-[#68736B]/30 text-xs sm:text-sm font-semibold text-[#1F2A23] transition-all duration-75 cursor-pointer shadow-2xs active:scale-95 min-h-[48px] select-none touch-manipulation"
          >
            <span className="text-base">🤔</span>
            <span>I’m not sure</span>
          </button>
        </div>
      ) : (
        /* Response Feedback */
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              {/* Option: GOOD */}
              {activeCheckRecord.selectedAnswer === 'good' && (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#174C35] flex items-center gap-1.5">
                    <span>✓</span> Nice! Your daily plant check is complete.
                  </p>
                  <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed">
                    We’ve logged that {currentPlant?.nickname} is looking happy and healthy today.
                  </p>
                </div>
              )}

              {/* Option: SOMETHING LOOKS DIFFERENT */}
              {activeCheckRecord.selectedAnswer === 'different' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#9A3412] flex items-center gap-1.5">
                      <span>✓</span> Good catch! Let’s take a closer look.
                    </p>
                    <p className="text-xs sm:text-sm text-[#1F2A23] font-medium">
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
                            : 'bg-[#FBF9F4] text-[#1F2A23] border-[#E8E4DA] hover:bg-[#F3F6EC]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    <Link
                      href={`/app/ai-doctor?plant=${currentPlant?.plantSlug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#174C35] text-white hover:bg-[#0f3424] transition-all shadow-2xs min-h-[38px] active:scale-95 touch-manipulation"
                    >
                      <Camera size={14} />
                      <span>Add a photo</span>
                    </Link>
                  </div>

                  {activeCheckRecord.noticedDetail && (
                    <p className="text-xs text-[#68736B] pt-1">
                      Observation saved: {activeCheckRecord.noticedDetail} noted in {currentPlant?.nickname}’s timeline.
                    </p>
                  )}
                </div>
              )}

              {/* Option: UNSURE */}
              {activeCheckRecord.selectedAnswer === 'unsure' && (
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-[#1F2A23] flex items-center gap-1.5">
                    <span>✓</span> No worries. Let’s check together.
                  </p>
                  {currentQuestion?.guidanceTip && (
                    <div className="p-3 bg-[#FBF9F4] rounded-xl border border-[#E8E4DA] text-xs text-[#526A57] leading-relaxed">
                      💡 <strong>Quick tip:</strong> {currentQuestion.guidanceTip}
                    </div>
                  )}
                  <p className="text-xs text-[#68736B] leading-relaxed">
                    Observing small changes is how all great growers learn. You’re doing great!
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetCheck}
              className="text-[11px] font-mono text-[#68736B] hover:text-[#174C35] underline cursor-pointer shrink-0 min-h-[36px] flex items-center gap-1"
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
