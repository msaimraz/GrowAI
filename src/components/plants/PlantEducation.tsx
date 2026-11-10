'use client';

import React, { useState, useEffect } from 'react';
import { Plant } from '@/types/plant';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Compass,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Eye,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

/* ==========================================================================
   A. DID YOU KNOW? COMPONENT
   ========================================================================== */

interface DidYouKnowCardProps {
  plant: Plant;
}

const DID_YOU_KNOW_DATA: Record<string, string> = {
  'golden-pothos':
    "In tropical rainforests, wild Golden Pothos vines can climb over 60 feet up tree trunks and develop leaves as big as 3 feet wide! Inside home pots, it stays in its youthful 'juvenile' vine stage with charming palm-sized leaves.",
  'snake-plant':
    "Snake plants use a special desert survival strategy called CAM photosynthesis: they keep their pores tightly closed during hot daylight to save water, then open them at night to release fresh oxygen while you sleep!",
  'butterhead-lettuce':
    "Ancient Egyptian wall paintings from over 4,500 years ago depict lettuce as a sacred symbol of life and vitality, and Roman emperors often ate lettuce at the end of feasts to encourage restful sleep.",
  'french-radish':
    "Radishes were one of the first European vegetables planted by settlers in the Americas, and their crisp peppery kick comes from a natural sulfur defense that wild plants produce to deter soil insects!",
  'mung-bean-sprouts':
    "During germination, sprouting multiplies the vitamin C in mung beans by up to 20 times compared to dry seeds, while naturally breaking down the complex starches that cause tummy gas and bloating!",
  'broccoli-sprouts':
    "Just a handful of 3-day-old broccoli sprouts contains up to 100 times more glucoraphanin—the compound that creates sulforaphane—than an entire mature head of grocery store broccoli!",
  'alfalfa-sprouts':
    "In Arabic, Alfalfa ('al-fasfasa') means 'father of all foods.' In the wild, its roots can dive over 20 feet deep into the earth to pull up trace minerals from deep underground!",
  'broccoli-microgreens':
    "Microgreens are not sprouts! Sprouts are germinated seeds grown in moist darkness without soil and eaten root-and-all, while microgreens are grown in light until they unfurl emerald true leaves and are cut above the soil.",
  'tomato-bush':
    "Botanically, tomatoes are actually berries because they develop from a single flower ovary and contain internal seeds. They were once nicknamed 'love apples' when introduced to Europe!",
  'cherry-tomato':
    "Cherry tomatoes were selectively cultivated to pack high sugar and acidity into bite-sized fruits. A single healthy patio container can produce over 200 sweet cherry tomatoes in a summer!",
  'spinach':
    "While 1930s cartoons claimed spinach made you super-strong due to iron, modern nutritionists love spinach for its rich lutein and zeaxanthin, which act like natural internal sunglasses for your eyes!",
  'spearmint':
    "Spearmint leaves are covered in microscopic glandular hairs that store cool, aromatic essential oils. Brushing past the leaves bursts these tiny spheres, perfuming the garden air instantly!",
  'genovese-basil':
    "You can always recognize plants in the mint family (like Basil) by rolling their stem between your fingers—unlike most round-stemmed plants, basil stems are distinctly square!",
  'coriander':
    "Coriander is a two-in-one botanical wonder: its fresh green leaves are called 'cilantro', while its round dried seeds are ground into the warm citrus spice called 'coriander'!",
  'aloe-vera':
    "The clear gel inside an Aloe Vera leaf is 99% pure water stored in specialized succulent cells, cushioned by natural soothing plant sugars that help the plant survive years of desert drought.",
  'holy-basil-tulsi':
    "In India, Tulsi is revered as the 'Queen of Herbs' and an adaptogen—a plant believed in traditional Ayurvedic practice to help the body maintain calmness during physical and mental stress.",
  'french-marigold':
    "French Marigold roots exude natural alpha-terthienyl compounds into the soil that repel harmful microscopic root nematodes, making them the ultimate protective companion plant for garden vegetables!",
  'dwarf-zinnia':
    "In 2016, Zinnias became the very first flowering plants ever grown and bloomed inside the International Space Station's Veggie microgravity greenhouse!",
  'lemongrass':
    "Lemongrass produces citral, an intense natural citrus oil. In nature, wild grasses produce citral to protect their stalks from hungry insects and fungal spores.",
};

export function DidYouKnowCard({ plant }: DidYouKnowCardProps) {
  const fact =
    DID_YOU_KNOW_DATA[plant.slug] ||
    `${plant.commonName} (${plant.scientificName}) is selectively adapted to grow in container gardens and compact spaces, using sunlight and water efficiently.`;

  return (
    <div className="bg-[#F8F6EE] rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2.5 pb-3 border-b border-[#E3DFD2]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-white border border-[#E3DFD2] flex items-center justify-center text-[#F0C04D] shrink-0 shadow-2xs">
              <Lightbulb size={20} />
            </span>
            <div className="min-w-0">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#174C35] block">
                Fascinating Science
              </span>
              <h4 className="text-lg sm:text-xl font-serif font-bold text-[#203027] leading-tight">
                Did You Know?
              </h4>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-[#E3DFD2] text-[#174C35] shrink-0">
            Verified Botanical Fact
          </span>
        </div>

        <p className="text-base text-[#203027] leading-relaxed">
          {fact}
        </p>
      </div>

      <div className="pt-2 text-xs text-[#68766C] flex items-center gap-1.5 font-medium border-t border-[#E3DFD2]/60">
        <Sparkles size={14} className="text-[#F0C04D]" />
        <span>Curated photobiology & agronomic trivia</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   B. TODAY'S GARDENING CHALLENGE COMPONENT
   ========================================================================== */

interface GardeningChallengeProps {
  plant: Plant;
}

export function GardeningChallengeCard({ plant }: GardeningChallengeProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [storageKey, setStorageKey] = useState<string>('');

  useEffect(() => {
    const key = `growai_challenge_${plant.slug}_${new Date().toISOString().split('T')[0]}`;
    setStorageKey(key);
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'true') setIsCompleted(true);
    } catch {}
  }, [plant.slug]);

  const toggleChallenge = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(nextState));
      } catch {}
    }
  };

  // Safe, age-appropriate gardening challenge tailored to the plant
  const getChallengeActivity = () => {
    if (plant.slug.includes('sprout')) {
      return {
        title: 'Sprout Freshness & Cleanliness Inspection',
        step: 'Smell your sprouts and inspect their moisture. Fresh sprouts should smell clean, crisp, and nutty with no sour odors. Remember to rinse twice daily with cool water and always cook thoroughly before eating!',
        tip: 'Safety check: Store harvested sprouts at 2°C–4°C in a ventilated container.',
      };
    }

    if (plant.category === 'indoor-decorative') {
      return {
        title: 'Dust & Foliage Health Check',
        step: 'Take a soft, damp cloth and gently wipe the dust off one or two leaves. Dust can block sunlight and reduce the plant’s ability to photosynthesize!',
        tip: 'Reminder: This is an ornamental houseplant—wash your hands with soap after handling.',
      };
    }

    if (plant.watering.moistureLevel === 'low') {
      return {
        title: 'The 2-Centimeter Finger Moisture Test',
        step: 'Gently push your index finger 2 cm deep into the potting soil. If it feels cool and damp, the plant does not need water. If it feels dry and powdery, give it a modest drink!',
        tip: 'Over-watering causes more plant loss than under-watering.',
      };
    }

    return {
      title: 'Sunlight & Angle Observation',
      step: 'Observe where the light hits your plant right now. Notice if the leaves are naturally tilting towards the window or lamp—plants perform phototropism, leaning towards their light source!',
      tip: 'Rotate your container a quarter-turn each week for balanced, even growth.',
    };
  };

  const challenge = getChallengeActivity();

  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2.5 pb-3 border-b border-[#E3DFD2]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#EAF1E4] border border-[#E3DFD2] flex items-center justify-center text-[#174C35] shrink-0">
              <Compass size={20} />
            </span>
            <div className="min-w-0">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#174C35] block">
                Hands-On Activity
              </span>
              <h4 className="text-lg sm:text-xl font-serif font-bold text-[#203027] leading-tight">
                Today’s Gardening Challenge
              </h4>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F8F6EE] border border-[#E3DFD2] text-[#203027] shrink-0">
            Beginner-Friendly • 3 Min
          </span>
        </div>

        <div className="space-y-2.5">
          <h5 className="font-bold text-base text-[#203027]">
            {challenge.title}
          </h5>
          <p className="text-sm sm:text-base text-[#203027] leading-relaxed">
            {challenge.step}
          </p>
          <p className="text-xs sm:text-sm text-[#68766C] bg-[#F8F6EE] p-3 rounded-xl border border-[#E3DFD2] leading-relaxed">
            💡 <strong>Gardener’s Tip:</strong> {challenge.tip}
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E3DFD2]">
        <button
          type="button"
          onClick={toggleChallenge}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isCompleted
              ? 'bg-[#174C35] text-white shadow-xs'
              : 'bg-[#EAF1E4] text-[#174C35] hover:bg-[#EAF1E4] border border-[#E3DFD2]'
          }`}
        >
          <Check size={16} />
          <span>{isCompleted ? 'Challenge Completed Today! ✓' : 'Mark Challenge as Complete'}</span>
        </button>

        {isCompleted && (
          <span className="text-xs sm:text-sm font-semibold text-[#174C35] flex items-center justify-center sm:justify-start gap-1.5 animate-fadeIn">
            <Sparkles size={16} className="text-[#F0C04D]" />
            Great job tending your garden!
          </span>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   C. QUICK KNOWLEDGE CHECK (INTERACTIVE QUIZ)
   ========================================================================== */

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PlantQuizProps {
  plant: Plant;
}

export function PlantQuizCard({ plant }: PlantQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dynamic 3-question quiz generated specifically for this species
  const getQuestions = (): QuizQuestion[] => {
    const isOrnamental =
      plant.medicinalProfile?.suitabilityForConsumption?.edibilityCategory === 'strictly-ornamental' ||
      plant.medicinalProfile?.suitabilityForConsumption?.edibilityCategory === 'toxic-inedible';
    const isSprout = plant.slug.includes('sprout');

    const q1: QuizQuestion = isOrnamental
      ? {
          question: `Is it safe to taste or consume ${plant.commonName}?`,
          options: [
            'Yes, all houseplants can be eaten safely in salads.',
            `No, ${plant.commonName} is strictly an ornamental plant and contains natural defense chemicals that are toxic if ingested.`,
            'Yes, as long as it is blended into a smoothie.',
          ],
          correctIndex: 1,
          explanation: `Correct! ${plant.commonName} is strictly for ornamental decoration and air biophilia. It produces natural protective chemicals (like calcium oxalate or saponins) that cause mucosal burning and stomach distress if ingested.`,
        }
      : isSprout
      ? {
          question: `What is the most important food-safety practice when preparing ${plant.commonName}?`,
          options: [
            'Just rinse them with cold water for 5 seconds.',
            'Leave them on the warm counter for a week.',
            'Cook them thoroughly to a core temperature of at least 74°C (165°F) before eating.',
          ],
          correctIndex: 2,
          explanation: `Correct! Raw sprouts grow in warm, humid conditions that bacteria love. Thorough cooking kills vegetative foodborne bacteria like Salmonella and E. coli.`,
        }
      : {
          question: `How is ${plant.commonName} classified for home consumption?`,
          options: [
            'It is a culinary vegetable/herb suitable for dietary food use.',
            'It is an approved prescription pharmaceutical medication that cures diseases.',
            'It is strictly poisonous and cannot be eaten.',
          ],
          correctIndex: 0,
          explanation: `Correct! ${plant.commonName} is an everyday culinary plant that provides wholesome nutrition, vitamins, and minerals. It is a nutritious dietary food, not a medical cure.`,
        };

    const q2: QuizQuestion = {
      question: `What is the sunlight requirement for ${plant.commonName}?`,
      options: [
        'Complete 24-hour total darkness.',
        `${plant.sunlight.replace('-', ' ')} (${plant.sunlightHours}).`,
        'Must be kept under scorching direct desert heat.',
      ],
      correctIndex: 1,
      explanation: `Correct! ${plant.commonName} thrives in ${plant.sunlight.replace('-', ' ')} with approximately ${plant.sunlightHours} of light per day.`,
    };

    const q3: QuizQuestion = {
      question: `What does 'Preliminary Research' mean in GrowAI's evidence badges?`,
      options: [
        'A guaranteed human medical cure approved by hospitals.',
        'An ancient myth with no real science.',
        'Early laboratory or animal research that shows interesting biological mechanisms, but has not yet been proven in human clinical trials.',
      ],
      correctIndex: 2,
      explanation: `Exactly right! Preliminary research means scientists observed interesting biological pathways in cell cultures or animals, but it is NOT proven human medical treatment.`,
    };

    return [q1, q2, q3];
  };

  const questions = getQuestions();

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = isSubmitted
    ? questions.reduce(
        (acc, q, idx) => acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0),
        0
      )
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E3DFD2]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-2xl bg-[#FFF3D7] border border-[#F0C04D/30] flex items-center justify-center text-[#F0C04D] shrink-0">
            <Trophy size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#203027] leading-tight">
              Quick Knowledge Check
            </h3>
            <p className="text-xs sm:text-sm text-[#68766C] mt-0.5">
              Test what you’ve learned about {plant.commonName} with this 3-question quiz!
            </p>
          </div>
        </div>

        <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-[#EAF1E4] border border-[#E3DFD2] text-[#174C35] shrink-0 self-start sm:self-auto">
          3 Questions • Instant Feedback
        </span>
      </div>

      {/* Quiz Questions */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const hasAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={qIdx}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-3.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#174C35] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <h4 className="font-bold text-base text-[#203027] leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="space-y-2 sm:pl-8">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  let optionStyle =
                    'bg-white border-[#E3DFD2] text-[#203027] hover:bg-[#F8F6EE]';

                  if (hasAnswered) {
                    if (optIdx === q.correctIndex) {
                      optionStyle =
                        'bg-[#EAF1E4] border-[#78A95A] text-[#174C35] font-medium';
                    } else if (isThisSelected) {
                      optionStyle =
                        'bg-[#FBE9E2] border-[#E4775D/30] text-[#963A23]';
                    } else {
                      optionStyle = 'opacity-60 bg-white border-[#E3DFD2]';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer min-h-[48px] ${optionStyle}`}
                    >
                      <span className="leading-snug">{option}</span>
                      {hasAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 size={18} className="text-[#174C35] shrink-0" />
                      )}
                      {hasAnswered && isThisSelected && optIdx !== q.correctIndex && (
                        <XCircle size={18} className="text-[#963A23] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant explanation */}
              {hasAnswered && (
                <div
                  className={`mt-2 sm:ml-8 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    isCorrect
                      ? 'bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2]'
                      : 'bg-[#FBE9E2] text-[#963A23] border border-[#E4775D/30]'
                  }`}
                >
                  <strong>{isCorrect ? '✓ Spot on! ' : 'Note: '}</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Footer & Score */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E3DFD2]">
        <div>
          {answeredCount === 3 && (
            <p className="text-sm sm:text-base font-bold text-[#174C35]">
              Quiz Completed! Score: {score} of 3 correct 🎉
            </p>
          )}
          {answeredCount < 3 && (
            <p className="text-xs sm:text-sm text-[#68766C]">
              Select an answer above for immediate feedback.
            </p>
          )}
        </div>

        {answeredCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl border border-[#E3DFD2] text-xs sm:text-sm font-semibold text-[#203027] hover:bg-[#F8F6EE] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   D. SECTION EXPLORATION TRACKER
   ========================================================================== */

interface SectionExploredProps {
  sectionId: string;
  sectionTitle: string;
  onExploredToggle?: (sectionId: string, isExplored: boolean) => void;
  isInitiallyExplored?: boolean;
}

export function SectionExploredToggle({
  sectionId,
  sectionTitle,
  onExploredToggle,
  isInitiallyExplored = false,
}: SectionExploredProps) {
  const [isExplored, setIsExplored] = useState(isInitiallyExplored);

  useEffect(() => {
    setIsExplored(isInitiallyExplored);
  }, [isInitiallyExplored]);

  const toggle = () => {
    const next = !isExplored;
    setIsExplored(next);
    if (onExploredToggle) onExploredToggle(sectionId, next);
  };

  return (
    <div className="pt-4 border-t border-[#E3DFD2] flex items-center justify-between gap-3">
      <span className="text-xs text-[#68766C]">
        Track your learning:
      </span>
      <button
        type="button"
        onClick={toggle}
        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
          isExplored
            ? 'bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]'
            : 'bg-white border border-[#E3DFD2] text-[#203027] hover:bg-[#F8F6EE]'
        }`}
      >
        <Check size={14} className={isExplored ? 'text-[#174C35]' : 'opacity-40'} />
        <span>{isExplored ? `Completed ${sectionTitle} ✓` : `Mark ${sectionTitle} as Explored`}</span>
      </button>
    </div>
  );
}
