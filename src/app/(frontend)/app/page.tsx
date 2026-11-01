'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader, InformationCard, EmptyState } from '@/components/ui/SharedBotanical';
import { PLANTS_DATA, getFeaturedPlants } from '@/data/plants';
import { useAuth } from '@/context/AuthContext';
import {
  fetchUserGarden,
  fetchCareTasks,
  toggleTaskStatus,
  resetToDemoData,
} from '@/lib/storage';
import { UserPlant, CareTask } from '@/types/garden';
import {
  DidYouKnowCard,
  GardeningChallengeCard,
  PlantQuizCard,
} from '@/components/plants/PlantEducation';
import {
  Sprout,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen,
  Droplets,
  RotateCcw,
  Plus,
  Compass,
  Calendar,
  Check,
  Library,
  Sun,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [gardenRes, tasksRes] = await Promise.all([
        fetchUserGarden(),
        fetchCareTasks(),
      ]);
      setUserPlants(gardenRes.plants);
      setCareTasks(tasksRes.tasks);
      setIsCloud(gardenRes.isCloud);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setMounted(true);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleTaskToggle = async (task: CareTask) => {
    await toggleTaskStatus(task.id, task.completed);
    await loadDashboardData();
  };

  const handleResetData = async () => {
    resetToDemoData();
    await loadDashboardData();
  };

  const featuredPlants = getFeaturedPlants().slice(0, 3);
  const primaryPlant =
    (userPlants.length > 0 && PLANTS_DATA.find((p) => p.slug === userPlants[0].plantSlug)) ||
    featuredPlants[0] ||
    PLANTS_DATA[0];

  // Authentic statistics calculated from real application sources
  const totalPlantsCount = userPlants.length;
  const activePlantsCount = userPlants.filter((p) => p.currentStage !== 'Harvested').length;
  const pendingTasksCount = careTasks.filter((t) => !t.completed).length;
  const completedTasksCount = careTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="Garden Dashboard"
        subtitle="Manage your vertical tiers, monitor crop stages, and complete today's care tasks."
        actionHref="/app/plants"
        actionLabel="Explore Plants"
        actionIcon="plus"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10">
        {/* =========================================================
            A. WELCOME SECTION
        ========================================================= */}
        <section className="bg-[#144229] text-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#a3c2a3] px-3 py-1 rounded-full bg-[#0d2a1b] border border-[#205e3b]">
                <Sprout size={14} className="text-[#86efac]" />
                Balcony & Vertical Agriculture OS
              </span>
              {isCloud ? (
                <span className="text-xs text-[#86efac] font-medium px-2.5 py-0.5 rounded-full bg-[#0d2e1c]">
                  ☁️ Cloud Sync Active
                </span>
              ) : (
                <span className="text-xs text-[#d1e6d7] font-medium px-2.5 py-0.5 rounded-full bg-[#0d2e1c]">
                  💾 Local Storage Mode
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
              Welcome to Your Garden, {user ? user.email?.split('@')[0] : 'Grower'}.
            </h1>

            <p className="text-base sm:text-lg text-[#e2ede2] leading-relaxed">
              {totalPlantsCount > 0 ? (
                <>
                  You have <strong className="text-white">{totalPlantsCount} active {totalPlantsCount === 1 ? 'plant' : 'plants'}</strong> thriving in your personal garden journal. You have <strong className="text-white">{pendingTasksCount} care {pendingTasksCount === 1 ? 'task' : 'tasks'}</strong> scheduled for today.
                </>
              ) : (
                <>
                  Welcome to GrowAI! Start by exploring our 19 curated botanical profiles and adding your first home container to the garden journal.
                </>
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/app/my-garden"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-white text-[#144229] hover:bg-[#f7f5ed] px-5 py-3 rounded-xl transition-all min-h-[44px] shadow-xs active:scale-[0.98]"
              >
                <span>Open My Garden Journal</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/app/plants"
                className="inline-flex items-center justify-center gap-2 font-semibold text-white bg-[#1e663f] hover:bg-[#257a4d] px-5 py-3 rounded-xl transition-all min-h-[44px] shadow-xs border border-[#348b56]"
              >
                <Plus size={16} />
                <span>Add Plants</span>
              </Link>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#a3c2a3] hover:text-white px-3 py-2 rounded-xl transition-colors min-h-[44px] ml-auto cursor-pointer"
                title="Reset sample garden data"
              >
                <RotateCcw size={14} />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================
            B. REAL GARDEN OVERVIEW METRICS
        ========================================================= */}
        <section className="space-y-4">
          <SectionHeader
            category="Garden Health Metrics"
            title="Overview & Care Status"
            description="Live overview of your personal container crops and daily maintenance schedule."
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Plants */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#5a7662]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Total Plants
                </span>
                <span className="w-8 h-8 rounded-xl bg-[#f4f8f4] border border-[#cfe0cf] flex items-center justify-center text-[#144229]">
                  <Sprout size={18} />
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#071c11]">
                {totalPlantsCount}
              </p>
              <p className="text-xs sm:text-sm text-[#5a7662]">
                {totalPlantsCount === 0 ? 'No plants added yet' : 'In your active garden log'}
              </p>
            </div>

            {/* Metric 2: Active Growing */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#5a7662]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Active Stages
                </span>
                <span className="w-8 h-8 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] flex items-center justify-center text-[#144229]">
                  <Compass size={18} />
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#071c11]">
                {activePlantsCount}
              </p>
              <p className="text-xs sm:text-sm text-[#5a7662]">
                Currently in vegetative or harvest stage
              </p>
            </div>

            {/* Metric 3: Pending Care Tasks */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#5a7662]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Pending Tasks
                </span>
                <span className="w-8 h-8 rounded-xl bg-[#fef9ee] border border-[#fed7aa] flex items-center justify-center text-[#c77712]">
                  <Droplets size={18} />
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#071c11]">
                {pendingTasksCount}
              </p>
              <p className="text-xs sm:text-sm text-[#5a7662]">
                {pendingTasksCount === 0 ? 'All care tasks up to date! 🎉' : 'Needs your attention today'}
              </p>
            </div>

            {/* Metric 4: Completed Care Tasks */}
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#5a7662]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Completed Care
                </span>
                <span className="w-8 h-8 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] flex items-center justify-center text-[#144229]">
                  <CheckCircle2 size={18} />
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#071c11]">
                {completedTasksCount}
              </p>
              <p className="text-xs sm:text-sm text-[#5a7662]">
                Tasks logged in this session
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            E. QUICK NAVIGATION HUB
        ========================================================= */}
        <section className="space-y-4">
          <SectionHeader
            category="Application Modules"
            title="Quick Navigation"
            description="Explore GrowAI's specialized gardening, diagnostics, and planning tools."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/app/plants"
              className="group bg-white p-6 rounded-3xl border border-[#ded5c5] shadow-xs hover:border-[#144229]/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] text-[#144229] flex items-center justify-center group-hover:bg-[#144229] group-hover:text-white transition-colors">
                    <Library size={22} />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f4f8f4] border border-[#cfdfcf] text-[#144229]">
                    19 Species
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#071c11] group-hover:text-[#144229] transition-colors">
                    Plant Library
                  </h3>
                  <p className="text-sm text-[#2e4435] mt-1 leading-relaxed">
                    Search verified sunlight, temperature, and harvest timelines for 19 curated crops.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#144229] group-hover:underline">
                <span>Browse Index</span>
                <ChevronRight size={14} />
              </div>
            </Link>

            <Link
              href="/app/my-garden"
              className="group bg-white p-6 rounded-3xl border border-[#ded5c5] shadow-xs hover:border-[#144229]/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-[#eef5ee] border border-[#cfe0cf] text-[#144229] flex items-center justify-center group-hover:bg-[#144229] group-hover:text-white transition-colors">
                    <Sprout size={22} />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f4f8f4] border border-[#cfdfcf] text-[#144229]">
                    Journal
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#071c11] group-hover:text-[#144229] transition-colors">
                    My Garden & Tracker
                  </h3>
                  <p className="text-sm text-[#2e4435] mt-1 leading-relaxed">
                    Record stage updates, growth measurements, and personal observations.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#144229] group-hover:underline">
                <span>Open Journal</span>
                <ChevronRight size={14} />
              </div>
            </Link>

            <Link
              href="/app/planner"
              className="group bg-white p-6 rounded-3xl border border-[#ded5c5] shadow-xs hover:border-[#144229]/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] flex items-center justify-center group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                    <Layers size={22} />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb]">
                    3-Tier Rack
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#071c11] group-hover:text-[#144229] transition-colors">
                    Vertical Planner
                  </h3>
                  <p className="text-sm text-[#2e4435] mt-1 leading-relaxed">
                    Arrange sun-loving vegetables on top and shade greens in middle tiers.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] group-hover:underline">
                <span>Plan Layout</span>
                <ChevronRight size={14} />
              </div>
            </Link>

            <Link
              href="/app/ai-doctor"
              className="group bg-white p-6 rounded-3xl border border-[#ded5c5] shadow-xs hover:border-[#144229]/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-[#fef9ee] border border-[#fed7aa] text-[#c77712] flex items-center justify-center group-hover:bg-[#c77712] group-hover:text-white transition-colors">
                    <Sparkles size={22} />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#fef9ee] border border-[#fed7aa] text-[#c77712]">
                    Gemini Vision
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#071c11] group-hover:text-[#144229] transition-colors">
                    AI Plant Doctor
                  </h3>
                  <p className="text-sm text-[#2e4435] mt-1 leading-relaxed">
                    Upload a leaf photograph for multimodal diagnostics and safe organic remedies.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#c77712] group-hover:underline">
                <span>Start Consultation</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================
            C & D: TASKS & GARDEN HIGHLIGHTS (2-Column Grid)
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* C. Today's Gardening Tasks */}
          <div className="lg:col-span-6 space-y-4">
            <SectionHeader
              category="Daily Maintenance"
              title="Today's Gardening Tasks"
              description="Watering, soil checks, and daily cultural care."
              badge={`${pendingTasksCount} Pending`}
            />

            <div className="space-y-3">
              {careTasks.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#ded5c5] p-8 text-center text-[#5a7662]">
                  No pending care tasks scheduled for today.
                </div>
              ) : (
                careTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskToggle(task)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 shadow-2xs ${
                      task.completed
                        ? 'bg-[#f7f5ed] border-[#ded5c5] opacity-65'
                        : 'bg-white border-[#ded5c5] hover:border-[#144229]'
                    }`}
                  >
                    <button
                      type="button"
                      className="text-[#144229] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      aria-label={`Toggle task ${task.title}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={22} className="text-[#144229]" />
                      ) : (
                        <Circle size={22} className="text-[#8ba391]" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-base font-semibold leading-snug ${
                          task.completed ? 'line-through text-[#5a7662]' : 'text-[#071c11]'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs sm:text-sm text-[#5a7662] mt-0.5">
                        {task.plantName} • Due {task.dueDate}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Tip Callout */}
            <div className="p-5 rounded-3xl bg-[#f7f5ed] border border-[#ded5c5] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#92400e]">
                <Sun size={15} />
                <span>Beginner Tip: Sub-Irrigation</span>
              </div>
              <p className="text-sm text-[#2e4435] leading-relaxed">
                Bottom-watering shallow planter trays for 15 minutes allows roots to draw moisture naturally while keeping surface soil dry to avoid mold and fungus gnats.
              </p>
            </div>
          </div>

          {/* D. Garden Highlights */}
          <div className="lg:col-span-6 space-y-4">
            <SectionHeader
              category="Recent Crops"
              title="Garden Highlights"
              description="Plants in your collection showing recent growth progress."
              actionHref="/app/my-garden"
              actionLabel="View All"
            />

            {userPlants.length === 0 ? (
              <EmptyState
                title="Your Garden Journal is Empty"
                description="Add crops from the Plant Library to track their progress from seed to harvest."
                actionHref="/app/plants"
                actionLabel="Browse 19 Species"
              />
            ) : (
              <div className="space-y-3.5">
                {userPlants.slice(0, 3).map((plant) => {
                  const botanical = PLANTS_DATA.find((p) => p.slug === plant.plantSlug);
                  const lastNote = plant.notes[plant.notes.length - 1];

                  return (
                    <div
                      key={plant.id}
                      className="bg-white rounded-3xl border border-[#ded5c5] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#144229]/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-lg text-[#071c11]">
                            {plant.nickname}
                          </h4>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#eef5ee] border border-[#cfe0cf] text-[#144229]">
                            {plant.currentStage}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5a7662]">
                          {botanical?.scientificName || plant.plantSlug} • Planted {plant.plantedDate}
                        </p>
                        {lastNote && (
                          <p className="text-xs sm:text-sm text-[#144229] italic pt-1 line-clamp-1">
                            &ldquo;{lastNote.text}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/app/my-garden?plantId=${plant.id}`}
                          className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#f4f8f4] hover:bg-[#144229] text-[#144229] hover:text-white border border-[#cfdfcf] transition-all flex items-center justify-center"
                        >
                          Log Note
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            F. EDUCATIONAL DISCOVERY SECTION
        ========================================================= */}
        <section className="space-y-6 pt-4 border-t border-[#ded5c5]">
          <SectionHeader
            category="Interactive Learning"
            title="Educational Discovery"
            description="Verified botanical science, daily activities, and quick knowledge checks."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* 1. Did You Know? Card */}
            <DidYouKnowCard plant={primaryPlant} />

            {/* 2. Today's Gardening Challenge */}
            <GardeningChallengeCard plant={primaryPlant} />
          </div>

          {/* Collapsible Knowledge Check for Teenagers & Beginners */}
          <div className="pt-2">
            {!showQuiz ? (
              <button
                type="button"
                onClick={() => setShowQuiz(true)}
                className="w-full min-h-[48px] p-4 rounded-2xl bg-white border border-[#ded5c5] text-left hover:border-[#144229]/50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#fef9ee] border border-[#fed7aa] flex items-center justify-center text-[#c77712] shrink-0">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <span className="font-serif font-bold text-base text-[#071c11] block">
                      Take Today's Botanical Knowledge Quiz
                    </span>
                    <span className="text-xs text-[#5a7662]">
                      3 short questions about plant safety, sunlight, and evidence
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#eef5ee] text-[#144229] shrink-0">
                  Start Quiz →
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuiz(false)}
                    className="text-xs font-semibold text-[#5a7662] hover:text-[#071c11] min-h-[36px]"
                  >
                    Hide Quiz ✕
                  </button>
                </div>
                <PlantQuizCard plant={primaryPlant} />
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            RECOMMENDED FOR VERTICAL COMPACT SPACES
        ========================================================= */}
        <section className="space-y-4 pt-4 border-t border-[#ded5c5]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#144229] block">
                Catalog Highlights
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#071c11]">
                Recommended for Compact Balconies
              </h3>
            </div>
            <Link
              href="/app/plants"
              className="text-sm font-semibold text-[#144229] hover:underline min-h-[44px] flex items-center"
            >
              Browse all 19 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-3xl border border-[#ded5c5] p-6 shadow-xs hover:border-[#144229]/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="sage" size="sm">
                      {plant.category.replace('-', ' ')}
                    </Badge>
                    <span className="text-xs font-mono font-semibold text-[#144229]">
                      {plant.timelines.harvestDays
                        ? `${plant.timelines.harvestDays.min}d harvest`
                        : `${plant.timelines.maturityDays.min}d`}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-[#071c11]">
                    {plant.commonName}
                  </h4>
                  <p className="text-xs italic text-[#5a7662]">{plant.scientificName}</p>
                  <p className="text-sm text-[#2e4435] line-clamp-2 leading-relaxed">
                    {plant.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f0ebe0] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#144229] capitalize">
                    {plant.verticalSuitability.recommendedTier} Shelf
                  </span>
                  <Link
                    href={`/app/plants/${plant.slug}`}
                    className="text-sm font-semibold text-[#144229] hover:underline flex items-center gap-1 min-h-[44px]"
                  >
                    <span>Profile Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
