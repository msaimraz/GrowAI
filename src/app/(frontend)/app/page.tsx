'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  fetchUserGarden,
  fetchCareTasks,
  toggleTaskStatus,
  resetToDemoData,
} from '@/lib/storage';
import { UserPlant, CareTask } from '@/types/garden';
import { PLANTS_DATA, getFeaturedPlants } from '@/data/plants';
import { PlantCard } from '@/components/ui/PlantCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { DailyCheckCard } from '@/components/ui/DailyCheckCard';
import { FriendlyEmptyState } from '@/components/ui/FriendlyEmptyState';
import { CareBadge } from '@/components/ui/CareBadge';
import {
  Plus,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  ClipboardList,
  Compass,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

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

  const [greeting, setGreeting] = useState('Welcome back');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    setCurrentDate(
      new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    );
  }, []);

  const userName = user ? user.email?.split('@')[0] : 'Grower';
  const pendingTasks = careTasks.filter((t) => !t.completed);
  const plantNames = userPlants.map((p) => p.nickname || p.plantSlug);

  // Map user plants to catalog definitions for display
  const plantsWithData = userPlants.map((up) => {
    const catalog = PLANTS_DATA.find((p) => p.slug === up.plantSlug);
    return { up, catalog };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1F2A23]">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        {/* =========================================================
            1. PERSONAL FRIENDLY GREETING & DAILY SUMMARY
        ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              {currentDate && (
                <span className="text-xs font-mono uppercase tracking-wider text-[#68736B] block">
                  {currentDate}
                </span>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2A23] tracking-tight">
                {greeting}, {userName} 🌱
              </h1>
              <p className="text-sm sm:text-base text-[#68736B] mt-1">
                Here’s what your garden needs today.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/app/plants"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#0f3424] text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer min-h-[40px]"
              >
                <Plus size={15} />
                <span>Add Plant</span>
              </Link>

              <button
                type="button"
                onClick={handleResetData}
                className="p-2 rounded-xl border border-[#E8E4DA] bg-white text-[#68736B] hover:text-[#174C35] text-xs transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Reset sample garden state"
                aria-label="Reset sample garden state"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Quick Daily Summary Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0D8] text-[#9A5B00] border border-[#FDE3B8] font-medium">
              <span>☀️</span>
              <span>Bright conditions today</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6F0E3] text-[#174C35] border border-[#CEE4C9] font-medium">
              <span>💧</span>
              <span>
                {pendingTasks.length > 0
                  ? `${pendingTasks.length} ${pendingTasks.length === 1 ? 'task' : 'tasks'} to do`
                  : 'All care up to date'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEE8F6] text-[#5C3FA3] border border-[#DDD2EE] font-medium">
              <span>🌿</span>
              <span>{userPlants.length} active plants</span>
            </span>

            {isCloud ? (
              <span className="text-[11px] font-mono text-[#68736B] px-2.5 py-1">
                ☁️ Cloud Synced
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#68736B] px-2.5 py-1">
                💾 Local Device Mode
              </span>
            )}
          </div>
        </section>

        {/* =========================================================
            2. DAILY QUESTION HABIT CARD
        ========================================================= */}
        <section>
          <DailyCheckCard userPlantNames={plantNames} />
        </section>

        {/* =========================================================
            3. TODAY'S GARDEN CARE TASKS
        ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💧</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F2A23]">
                Today’s Care
              </h2>
            </div>
            {careTasks.length > 0 && (
              <span className="text-xs font-mono text-[#68736B]">
                {careTasks.filter((t) => t.completed).length} of {careTasks.length} done
              </span>
            )}
          </div>

          {careTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#E8E4DA] text-center text-xs text-[#68736B] space-y-1">
              <span className="text-2xl block select-none">🎉</span>
              <p className="font-medium text-[#1F2A23]">No tasks scheduled for today</p>
              <p>Your garden is happy and hydrated. Enjoy watching it grow!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {careTasks.slice(0, 6).map((task) => (
                <ActionCard
                  key={task.id}
                  id={task.id}
                  icon={task.type === 'water' ? '💧' : task.type === 'fertilize' ? '🌱' : '✂️'}
                  title={task.title}
                  subtitle={task.plantName}
                  tag={task.dueDate || 'Today'}
                  completed={task.completed}
                  onToggle={() => handleTaskToggle(task)}
                />
              ))}
            </div>
          )}
        </section>

        {/* =========================================================
            4. YOUR PLANTS (VISUAL PLANT CARDS)
        ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F2A23]">
                My Plants
              </h2>
            </div>

            {userPlants.length > 0 && (
              <Link
                href="/app/my-garden"
                className="text-xs font-semibold text-[#174C35] hover:underline flex items-center gap-1"
              >
                <span>View All ({userPlants.length})</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {userPlants.length === 0 ? (
            <FriendlyEmptyState
              emoji="🪴"
              title="Your garden is empty"
              description="Start your growing journey! Pick your first herb, salad leafy green, or windowsill vegetable."
              actionHref="/app/plants"
              actionLabel="Add Your First Plant"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {plantsWithData.slice(0, 4).map(({ up, catalog }) => {
                if (catalog) {
                  return (
                    <PlantCard
                      key={up.id}
                      plant={{
                        ...catalog,
                        commonName: up.nickname || catalog.commonName,
                      }}
                    />
                  );
                }
                return (
                  <div
                    key={up.id}
                    className="p-5 rounded-2xl bg-white border border-[#E8E4DA] space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌱</span>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1F2A23]">
                          {up.nickname || up.plantSlug}
                        </h4>
                        <span className="text-xs text-[#68736B] font-mono">
                          {up.currentStage}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/app/my-garden`}
                      className="text-xs font-semibold text-[#174C35] hover:underline block pt-2 border-t border-[#F3F6EC]"
                    >
                      View in Garden →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================
            5. FRIENDLY ACTION CENTER
        ========================================================= */}
        <section className="pt-4 border-t border-[#E8E4DA] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#68736B] font-bold">
              Explore Garden Tools
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/app/ai-doctor"
              className="p-4 rounded-2xl bg-white hover:bg-[#F3F6EC] border border-[#E8E4DA] hover:border-[#174C35]/30 transition-all flex items-center gap-3.5 shadow-2xs group"
            >
              <span className="w-10 h-10 rounded-xl bg-[#FFF0D8] text-xl flex items-center justify-center shrink-0">
                📷
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#1F2A23] group-hover:text-[#174C35]">
                  Plant Check
                </h4>
                <p className="text-xs text-[#68736B] truncate">
                  Check symptoms with a photo
                </p>
              </div>
            </Link>

            <Link
              href="/app/planner"
              className="p-4 rounded-2xl bg-white hover:bg-[#F3F6EC] border border-[#E8E4DA] hover:border-[#174C35]/30 transition-all flex items-center gap-3.5 shadow-2xs group"
            >
              <span className="w-10 h-10 rounded-xl bg-[#E6F0E3] text-xl flex items-center justify-center shrink-0">
                🪴
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#1F2A23] group-hover:text-[#174C35]">
                  Space Planner
                </h4>
                <p className="text-xs text-[#68736B] truncate">
                  Organize your vertical tiers
                </p>
              </div>
            </Link>

            <Link
              href="/app/grow-plans"
              className="p-4 rounded-2xl bg-white hover:bg-[#F3F6EC] border border-[#E8E4DA] hover:border-[#174C35]/30 transition-all flex items-center gap-3.5 shadow-2xs group"
            >
              <span className="w-10 h-10 rounded-xl bg-[#EEE8F6] text-xl flex items-center justify-center shrink-0">
                📋
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#1F2A23] group-hover:text-[#174C35]">
                  Grow Plans
                </h4>
                <p className="text-xs text-[#68736B] truncate">
                  Step-by-step growing journeys
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
