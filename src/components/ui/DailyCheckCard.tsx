'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowRight, Camera, HelpCircle } from 'lucide-react';

interface DailyCheckCardProps {
  userPlantNames?: string[];
  className?: string;
}

interface QuestionTemplate {
  category: string;
  icon: string;
  getQuestion: (plantName?: string) => string;
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    category: 'Leaves & Health',
    icon: '🍃',
    getQuestion: (name) =>
      name ? `Did you notice any new spots or curling on ${name}'s leaves?` : 'Did you notice any spots or curling on your plant leaves?',
  },
  {
    category: 'Watering',
    icon: '💧',
    getQuestion: (name) =>
      name ? `Does the soil in ${name}'s container feel dry to touch today?` : 'Does the top soil layer feel dry to touch today?',
  },
  {
    category: 'Sunlight',
    icon: '☀️',
    getQuestion: (name) =>
      name ? `Is ${name} getting enough bright light where it is sitting?` : 'Are your plants receiving enough bright light today?',
  },
  {
    category: 'Growth',
    icon: '🌱',
    getQuestion: (name) =>
      name ? `Has ${name} unfurled any new baby leaves this week?` : 'Have your plants grown any new leaves or shoots this week?',
  },
  {
    category: 'Environment',
    icon: '🌡️',
    getQuestion: (name) =>
      name ? `Is the temperature and air draft feeling comfortable around ${name}?` : 'Is the air around your growing space feeling fresh and moderate?',
  },
  {
    category: 'Roots & Moisture',
    icon: '🪴',
    getQuestion: (name) =>
      name ? `Is excess drainage water clearing smoothly under ${name}'s pot?` : 'Is drainage clearing cleanly from your planters?',
  },
  {
    category: 'Pests & Wildlife',
    icon: '🐛',
    getQuestion: (name) =>
      name ? `Checked the undersides of ${name}'s foliage for tiny bugs?` : 'Did a quick inspection under the leaves turn up anything unexpected?',
  },
  {
    category: 'Harvest & Care',
    icon: '✂️',
    getQuestion: (name) =>
      name ? `Ready to pinch the top growing tips of ${name} for bushy growth?` : 'Any tender herbs ready for a fresh kitchen pinch today?',
  },
];

export function DailyCheckCard({ userPlantNames = [], className = '' }: DailyCheckCardProps) {
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [questionData, setQuestionData] = useState(() => ({
    category: QUESTION_TEMPLATES[0].category,
    icon: QUESTION_TEMPLATES[0].icon,
    text: QUESTION_TEMPLATES[0].getQuestion(userPlantNames[0]),
    todayKey: 'growai_daily_check_today',
  }));

  // Deterministically select today's question based on day of year on client mount
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const templateIndex = dayOfYear % QUESTION_TEMPLATES.length;
    const template = QUESTION_TEMPLATES[templateIndex];

    const chosenPlant =
      userPlantNames.length > 0
        ? userPlantNames[dayOfYear % userPlantNames.length]
        : undefined;

    const todayKey = `growai_daily_check_${now.toISOString().split('T')[0]}`;
    setQuestionData({
      category: template.category,
      icon: template.icon,
      text: template.getQuestion(chosenPlant),
      todayKey,
    });

    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        setAnsweredOption(saved);
      }
    } catch {}
  }, [userPlantNames]);

  const { category, icon, text, todayKey } = questionData;

  const handleSelectOption = (option: string) => {
    setAnsweredOption(option);
    try {
      localStorage.setItem(todayKey, option);
    } catch {}
  };

  const handleResetCheck = () => {
    setAnsweredOption(null);
    try {
      localStorage.removeItem(todayKey);
    } catch {}
  };

  return (
    <div
      className={`rounded-2xl border border-[#E8E4DA] bg-gradient-to-br from-[#FFF0D8]/60 via-[#FBF9F4] to-[#E6F0E3]/40 p-5 sm:p-6 shadow-xs space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-white border border-[#E8E4DA] flex items-center justify-center text-base shadow-2xs select-none">
            {icon}
          </span>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#68736B] block">
              Daily Plant Check · {category}
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1F2A23] leading-tight">
              {text}
            </h3>
          </div>
        </div>

        {answeredOption && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6F0E3] text-[#174C35] border border-[#CEE4C9]">
            <CheckCircle2 size={13} />
            Checked
          </span>
        )}
      </div>

      {/* Interactive Options */}
      {!answeredOption ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleSelectOption('good')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-[#F3F6EC] border border-[#E8E4DA] hover:border-[#174C35]/30 text-sm font-medium text-[#1F2A23] transition-all cursor-pointer shadow-2xs active:scale-[0.99] min-h-[44px]"
          >
            <span>Everything looks good</span>
            <span className="text-base">🌿</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectOption('different')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-[#FFF0D8] border border-[#E8E4DA] hover:border-[#C86B4A]/40 text-sm font-medium text-[#1F2A23] transition-all cursor-pointer shadow-2xs active:scale-[0.99] min-h-[44px]"
          >
            <span>Something looks different</span>
            <span className="text-base">👀</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectOption('unsure')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-[#EEE8F6] border border-[#E8E4DA] hover:border-[#68736B]/30 text-sm font-medium text-[#1F2A23] transition-all cursor-pointer shadow-2xs active:scale-[0.99] min-h-[44px]"
          >
            <span>I’m not sure</span>
            <span className="text-base">🤔</span>
          </button>
        </div>
      ) : (
        /* Response Feedback */
        <div className="p-4 rounded-xl bg-white border border-[#E8E4DA] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              {answeredOption === 'good' && (
                <>
                  <p className="text-sm font-medium text-[#174C35] flex items-center gap-1.5">
                    <span>🎉</span> Wonderful! Everything is on track.
                  </p>
                  <p className="text-xs text-[#68736B] leading-relaxed">
                    Consistent daily check-ins help you notice small growth changes before any stress develops.
                  </p>
                </>
              )}

              {answeredOption === 'different' && (
                <>
                  <p className="text-sm font-medium text-[#A84A2A] flex items-center gap-1.5">
                    <span>👀</span> Good eye! Notice anything specific?
                  </p>
                  <p className="text-xs text-[#68736B] leading-relaxed">
                    If leaves are drooping, discolored, or showing spots, snapping a quick photo will help investigate.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/app/ai-doctor"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#174C35] text-white hover:bg-[#0f3424] transition-colors"
                    >
                      <Camera size={13} />
                      <span>Check with Plant Doctor</span>
                    </Link>
                  </div>
                </>
              )}

              {answeredOption === 'unsure' && (
                <>
                  <p className="text-sm font-medium text-[#1F2A23] flex items-center gap-1.5">
                    <span>🤔</span> No worries at all!
                  </p>
                  <p className="text-xs text-[#68736B] leading-relaxed">
                    Gently press your fingertip 2cm into the soil. If it feels cool and damp, you have plenty of moisture.
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetCheck}
              className="text-[11px] font-mono text-[#68736B] hover:text-[#174C35] underline cursor-pointer shrink-0"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

