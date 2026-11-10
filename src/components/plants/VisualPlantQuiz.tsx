'use client';

import React, { useState } from 'react';
import { Plant } from '@/types/plant';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { Trophy, Check, X, RotateCcw, ArrowRight } from 'lucide-react';

interface VisualQuizQuestion {
  question: string;
  options: {
    emoji: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

interface VisualPlantQuizProps {
  plant: Plant;
  className?: string;
}

export function VisualPlantQuiz({ plant, className = '' }: VisualPlantQuizProps) {
  const { showSuccess, showInfo } = useGrowToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const isOrnamental =
    plant.medicinalProfile?.suitabilityForConsumption?.edibilityCategory === 'strictly-ornamental' ||
    plant.medicinalProfile?.suitabilityForConsumption?.edibilityCategory === 'toxic-inedible';

  const questions: VisualQuizQuestion[] = [
    {
      question: `How much light does ${plant.commonName} love?`,
      options: [
        {
          emoji: '☀️',
          text: plant.sunlight.includes('full') ? 'Bright direct light' : 'Full blazing sun',
          isCorrect: plant.sunlight.includes('full'),
        },
        {
          emoji: '🌤️',
          text: plant.sunlight.includes('partial') ? 'Gentle partial sun' : 'Morning sun only',
          isCorrect: plant.sunlight.includes('partial') || !plant.sunlight.includes('full'),
        },
        {
          emoji: '🌑',
          text: 'Complete total darkness',
          isCorrect: false,
        },
      ],
      explanation: `${plant.commonName} thrives with ${plant.sunlightHours || 'moderate sun'} daily.`,
    },
    {
      question: `When should you water ${plant.commonName}?`,
      options: [
        {
          emoji: '💧',
          text: 'When the top soil layer feels dry',
          isCorrect: true,
        },
        {
          emoji: '🌊',
          text: 'Flood it until it’s soaking wet',
          isCorrect: false,
        },
        {
          emoji: '🌵',
          text: 'Leave bone dry for 6 months',
          isCorrect: false,
        },
      ],
      explanation: `Container roots need moist aeration—checking top soil avoids root rot.`,
    },
    {
      question: `Is ${plant.commonName} grown for the kitchen or decoration?`,
      options: [
        {
          emoji: isOrnamental ? '🏠' : '🥗',
          text: isOrnamental ? 'Decorative indoor foliage' : 'Fresh culinary harvests',
          isCorrect: true,
        },
        {
          emoji: isOrnamental ? '🥗' : '🏠',
          text: isOrnamental ? 'Salad greens' : 'Just plastic looks',
          isCorrect: false,
        },
      ],
      explanation: isOrnamental
        ? `${plant.commonName} is an ornamental houseplant for biophilia and air freshness.`
        : `${plant.commonName} is a wholesome, delicious culinary crop!`,
    },
  ];

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIndex !== null) return;
    setSelectedOptionIndex(idx);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      showSuccess('🌿 You got it!', 'That’s correct.', '🌿');
    } else {
      showInfo('🌱 Almost!', currentQ.explanation, '🌱');
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIndex(null);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      showSuccess('🏆 Great job!', `You completed the ${plant.commonName} quiz.`, '🏆');
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div
      className={`rounded-2xl border border-[#E3DFD2] bg-white p-5 sm:p-7 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#EAF1E4]">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#FFF3D7] text-[#8A6400] flex items-center justify-center text-base shadow-2xs">
            🏆
          </span>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#68766C] block">
              Quick Knowledge Check
            </span>
            <h4 className="font-serif font-bold text-base text-[#203027] leading-tight">
              Test your {plant.commonName} skills
            </h4>
          </div>
        </div>

        {!quizFinished && (
          <span className="text-xs font-mono text-[#68766C]">
            {currentQuestionIndex + 1} of {questions.length}
          </span>
        )}
      </div>

      {!quizFinished ? (
        <div className="space-y-4">
          <h5 className="font-serif text-lg font-bold text-[#203027]">
            {currentQ.question}
          </h5>

          {/* Visual Options Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const hasAnswered = selectedOptionIndex !== null;

              let btnStyle = 'bg-[#F8F6EE] border-[#E3DFD2] text-[#203027] hover:bg-[#EAF1E4]';
              if (hasAnswered) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-[#EAF1E4] border-[#174C35] text-[#174C35] font-semibold ring-2 ring-[#174C35]/20';
                } else if (isSelected) {
                  btnStyle = 'bg-[#FBE9E2] border-[#963A23] text-[#963A23] opacity-80';
                } else {
                  btnStyle = 'bg-[#F8F6EE] border-[#E3DFD2] opacity-50';
                }
              }

              return (
                <button
                  key={opt.text}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer min-h-[90px] shadow-2xs ${btnStyle}`}
                >
                  <span className="text-2xl select-none">{opt.emoji}</span>
                  <span className="text-xs leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Advance Button */}
          {selectedOptionIndex !== null && (
            <div className="p-3.5 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="text-xs text-[#203027] space-y-0.5">
                <span className="font-bold flex items-center gap-1 text-[#174C35]">
                  {currentQ.options[selectedOptionIndex].isCorrect ? (
                    <>
                      <Check size={14} strokeWidth={3} /> Correct
                    </>
                  ) : (
                    <>
                      <X size={14} strokeWidth={3} /> Not quite
                    </>
                  )}
                </span>
                <p className="text-[#68766C] leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#174C35] hover:bg-[#123C2A] text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
              >
                <span>{currentQuestionIndex + 1 < questions.length ? 'Next' : 'See Score'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="p-6 text-center space-y-3 bg-[#EAF1E4] rounded-xl border border-[#E3DFD2]">
          <span className="text-3xl select-none block">🎉</span>
          <h5 className="font-serif text-xl font-bold text-[#203027]">
            {score === questions.length ? 'Botanical Master!' : 'Great Check-In!'}
          </h5>
          <p className="text-xs text-[#68766C] max-w-xs mx-auto">
            You scored {score} of {questions.length} on {plant.commonName}. You’re ready to grow!
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#E3DFD2] text-xs font-medium text-[#174C35] hover:bg-[#EAF1E4] transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

