'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Camera, ArrowRight, RotateCcw } from 'lucide-react';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';

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
      name
        ? `Have you noticed any new spots on ${name}'s leaves?`
        : 'Have you noticed any new spots on the leaves?',
  },
  {
    category: 'Watering',
    icon: '💧',
    getQuestion: (name) =>
      name ? `Does the soil feel dry in ${name}'s pot today?` : 'Does the soil feel dry today?',
  },
  {
    category: 'Sunlight',
    icon: '☀️',
    getQuestion: (name) =>
      name ? `Is ${name} getting enough light today?` : 'Is your plant getting enough light today?',
  },
  {
    category: 'Growth',
    icon: '🌱',
    getQuestion: (name) =>
      name ? `Has ${name} grown any new leaves?` : 'Has your plant grown any new leaves?',
  },
  {
    category: 'Environment',
    icon: '🌡️',
    getQuestion: (name) =>
      name
        ? `Does the temperature feel comfortable around ${name}?`
        : 'Does the temperature feel comfortable around your plants?',
  },
  {
    category: 'Pests & Wildlife',
    icon: '🐛',
    getQuestion: (name) =>
      name ? `Have you noticed any tiny insects on ${name}?` : 'Have you noticed any tiny insects?',
  },
  {
    category: 'Harvest & Care',
    icon: '✂️',
    getQuestion: (name) =>
      name
        ? `Does ${name} look ready for a gentle pinch or harvest?`
        : 'Do any of your plants look ready for a harvest or trim?',
  },
];

export function DailyCheckCard({ userPlantNames = [], className = '' }: DailyCheckCardProps) {
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  const [noticedDetail, setNoticedDetail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [questionData, setQuestionData] = useState(() => ({
    category: QUESTION_TEMPLATES[0].category,
    icon: QUESTION_TEMPLATES[0].icon,
    text: QUESTION_TEMPLATES[0].getQuestion(userPlantNames[0]),
    plantName: userPlantNames[0] || 'your plant',
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
      plantName: chosenPlant || 'your plant',
      todayKey,
    });

    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        if (saved.startsWith('different:')) {
          setAnsweredOption('different');
          setNoticedDetail(saved.replace('different:', ''));
        } else {
          setAnsweredOption(saved);
        }
      }
    } catch {}
  }, [userPlantNames]);

  const { category, icon, text, plantName, todayKey } = questionData;
  const { showSuccess } = useGrowToast();

  const handleSelectOption = (option: string) => {
    setAnsweredOption(option);
    setNoticedDetail(null);
    try {
      localStorage.setItem(todayKey, option);
    } catch {}

    if (option === 'good') {
      showSuccess('🌿 Looking good!', 'Your plant check is complete for today.', '🌿');
    } else if (option === 'different') {
      showSuccess('👀 Good catch!', 'Let’s take a closer look at your plant.', '👀');
    } else if (option === 'unsure') {
      showSuccess('🌱 No worries!', 'We’ll help you figure it out.', '🌱');
    }
  };

  const handleSelectDetail = (detail: string) => {
    setNoticedDetail(detail);
    try {
      localStorage.setItem(todayKey, `different:${detail}`);
    } catch {}
  };

  const handleResetCheck = () => {
    setAnsweredOption(null);
    setNoticedDetail(null);
    try {
      localStorage.removeItem(todayKey);
    } catch {}
  };

  return (
    <div
      className={`rounded-3xl border border-[#E8E4DA] bg-gradient-to-br from-[#FFF0D8]/60 via-[#FBF9F4] to-[#E6F0E3]/40 p-5 sm:p-6 shadow-xs space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-white border border-[#E8E4DA] flex items-center justify-center text-lg shadow-2xs select-none">
            {icon}
          </span>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#68736B] block">
              Daily Plant Check · {category}
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F2A23] leading-snug">
              {text}
            </h3>
          </div>
        </div>

        {answeredOption && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#E6F0E3] text-[#174C35] border border-[#CEE4C9]">
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
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#F3F6EC] border border-[#E8E4DA] hover:border-[#174C35]/30 text-sm font-semibold text-[#1F2A23] transition-all cursor-pointer shadow-2xs active:scale-[0.99] min-h-[44px]"
          >
            <span>Everything looks good</span>
            <span className="text-base">🌿</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectOption('different')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#FFF0D8] border border-[#E8E4DA] hover:border-[#C86B4A]/40 text-sm font-semibold text-[#1F2A23] transition-all cursor-pointer shadow-2xs active:scale-[0.99] min-h-[44px]"
          >
            <span>Something looks different</span>
            <span className="text-base">👀</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectOption('unsure')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#EEE8F6] border border-[#E8E4DA] hover:border-[#68736B]/30 text-sm font-semibold text-[#1F2A23] transition-all cursor-pointer shadow-2xs active:scale-[0.99] min-h-[44px]"
          >
            <span>I’m not sure</span>
            <span className="text-base">🤔</span>
          </button>
        </div>
      ) : (
        /* Immediate Response Feedback */
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              {/* Option: GOOD */}
              {answeredOption === 'good' && (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#174C35] flex items-center gap-1.5">
                    <span>✓</span> Got it
                  </p>
                  <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed">
                    We’ll keep an eye on {plantName}. Everything looks happy and healthy today.
                  </p>
                </div>
              )}

              {/* Option: SOMETHING LOOKS DIFFERENT */}
              {answeredOption === 'different' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#9A3412] flex items-center gap-1.5">
                      <span>✓</span> Got it
                    </p>
                    <p className="text-xs sm:text-sm text-[#1F2A23] font-medium">
                      What did you notice?
                    </p>
                  </div>

                  {/* 1-Tap Notice Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {[
                      { id: 'Leaves', label: '🍃 Leaves' },
                      { id: 'Soil', label: '💧 Soil' },
                      { id: 'Bugs', label: '🐛 Bugs' },
                      { id: 'Light', label: '☀️ Light' },
                      { id: 'Growth', label: '🌱 Growth' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectDetail(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          noticedDetail === item.id
                            ? 'bg-[#174C35] text-white border-[#174C35]'
                            : 'bg-[#FBF9F4] text-[#1F2A23] border-[#E8E4DA] hover:bg-[#F3F6EC]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    <Link
                      href="/app/ai-doctor"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#174C35] text-white hover:bg-[#0f3424] transition-colors shadow-2xs"
                    >
                      <Camera size={13} />
                      <span>Take a photo</span>
                    </Link>
                  </div>

                  {noticedDetail && (
                    <p className="text-xs text-[#68736B] pt-1">
                      Noted: {noticedDetail} issue for {plantName}. We’ll monitor this in your garden journal.
                    </p>
                  )}
                </div>
              )}

              {/* Option: NOT SURE */}
              {answeredOption === 'unsure' && (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#1F2A23] flex items-center gap-1.5">
                    <span>✓</span> Got it
                  </p>
                  <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed">
                    No worries! A quick look under the leaves or touching the topsoil can tell you a lot.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetCheck}
              className="text-[11px] font-mono text-[#68736B] hover:text-[#174C35] underline cursor-pointer shrink-0"
              title="Reset question"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
