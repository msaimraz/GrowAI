'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePwa } from '@/context/PwaContext';
import { PLANTS_DATA } from '@/data/plants';
import {
  fetchUserGarden,
  fetchCareTasks,
  toggleTaskStatus,
  resetToDemoData,
} from '@/lib/storage';
import { UserPlant, CareTask } from '@/types/garden';
import { PlantCard } from '@/components/ui/PlantCard';
import { DailyCheckCard } from '@/components/ui/DailyCheckCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { FriendlyEmptyState } from '@/components/ui/FriendlyEmptyState';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import {
  Plus,
  ArrowRight,
  Droplets,
  Calendar,
  Sparkles,
  Camera,
  Grid,
  CheckCircle2,
} from 'lucide-react';

export default function AppDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#5F6D63] bg-[#F8F6EE]">
          Loading your garden...
        </div>
      }
    >
      <AppDashboardContent />
    </React.Suspense>
  );
}

function AppDashboardContent() {
  const { user } = useAuth();
  const { isOffline } = usePwa();
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isCloud, setIsCloud] = useState(false);
  const [loading, setLoading] = useState(true);

  // Time & Greeting (mounted in useEffect to guarantee static prerendering stability)
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

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [{ plants, isCloud: cloudMode }, tasksResult] = await Promise.all([
        fetchUserGarden(),
        fetchCareTasks(),
      ]);
      setUserPlants(plants);
      setIsCloud(cloudMode);
      setCareTasks(tasksResult.tasks || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const { showSuccess } = useGrowToast();

  const handleTaskToggle = async (task: CareTask) => {
    try {
      const willBeCompleted = !task.completed;
      await toggleTaskStatus(task.id, willBeCompleted);
      const updated = careTasks.map((t) =>
        t.id === task.id ? { ...t, completed: willBeCompleted } : t
      );
      setCareTasks(updated);

      if (willBeCompleted) {
        if (task.type === 'water') {
          showSuccess('💧 Nice work!', 'Watering task completed.', '💧');
        } else if (task.type === 'fertilize') {
          showSuccess('🌱 Good job!', 'Feeding task completed.', '🌱');
        } else if (task.type === 'prune') {
          showSuccess('✂️ Nicely done!', 'Pruning task completed.', '✂️');
        } else if (task.type === 'harvest') {
          showSuccess('✂️ Nicely done!', 'Harvest recorded successfully.', '✂️');
        } else {
          showSuccess('🌱 Good job!', 'Your plant care is up to date.', '🌱');
        }
      }
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const userName = user ? user.email?.split('@')[0] : 'Grower';
  const pendingTasks = careTasks.filter((t) => !t.completed);
  const completedTasks = careTasks.filter((t) => t.completed);
  const [showCompleted, setShowCompleted] = useState(false);
  const plantNames = userPlants.map((p) => p.nickname || p.plantSlug);

  // Format task action so action is always clear without ugly truncation
  const formatTaskAction = (task: CareTask) => {
    const plant = task.plantName ? task.plantName.split('(')[0].trim() : 'Plant';
    let action = `Care for ${plant}`;
    let subtitle = task.title;

    if (task.type === 'water') {
      action = `Water ${plant}`;
      subtitle = 'Check the top layer of soil first.';
    } else if (task.type === 'fertilize') {
      action = `Feed ${plant}`;
      subtitle = 'Diluted organic feed or compost.';
    } else if (task.type === 'prune') {
      action = `Prune ${plant}`;
      subtitle = 'Pinch growing tips to promote branching.';
    } else if (task.type === 'harvest') {
      action = `Harvest ${plant}`;
      subtitle = 'Snip outer leaves for kitchen use.';
    } else if (task.type === 'inspect') {
      action = `Inspect ${plant}`;
      subtitle = 'Look for pests or leaf discoloration.';
    } else if (task.type === 'repot') {
      action = `Repot ${plant}`;
      subtitle = 'Check container volume and soil aeration.';
    }
    return { action, subtitle };
  };

  // Map user plants to catalog definitions and real recorded observations for display
  const plantsWithData = userPlants.map((up) => {
    const catalog = PLANTS_DATA.find((p) => p.slug === up.plantSlug);
    const latestNote = up.notes && up.notes.length > 0 ? up.notes[up.notes.length - 1] : null;
    const latestObservation = latestNote ? latestNote.text : undefined;

    const timelineMarkers: string[] = [];
    if (up.plantedDate) timelineMarkers.push('🌱 Added');
    if (up.currentStage) timelineMarkers.push(`🌿 ${up.currentStage}`);
    if (up.notes && up.notes.length > 0) {
      timelineMarkers.push(`📷 ${up.notes.length} note${up.notes.length === 1 ? '' : 's'}`);
    }

    return { up, catalog, latestObservation, timelineMarkers };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EE] text-[#203027]">
      <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 max-w-full space-y-5 sm:space-y-8">
        {/* =========================================================
            1. PERSONAL FRIENDLY GREETING & TODAY'S STATUS
        ========================================================= */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              {currentDate && (
                <span className="text-xs font-mono uppercase tracking-wider text-[#5F6D63] block">
                  {currentDate}
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#203027] tracking-tight">
                {greeting}, {userName} 🌱
              </h1>
              <p className="text-sm sm:text-base text-[#5F6D63] mt-1">
                Here’s what your garden needs today.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/app/plants"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#123E2A] active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-75 cursor-pointer min-h-[40px] select-none touch-manipulation"
              >
                <Plus size={15} />
                <span>Add Plant</span>
              </Link>
            </div>
          </div>

          {/* Quick Daily Summary Chips (Semantic Coordinated Palette) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35 font-medium">
              <span>☀️</span>
              <span>Bright conditions</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E7F2F9] text-[#1B5D88] border border-[#65A8D0]/35 font-medium">
              <span>💧</span>
              <span>
                {pendingTasks.length > 0
                  ? `${pendingTasks.length} ${pendingTasks.length === 1 ? 'task' : 'tasks'} to do`
                  : 'All care up to date'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/35 font-medium">
              <span>🌿</span>
              <span>{userPlants.length} active plants</span>
            </span>

            {isCloud && user ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF1E4] text-[#174C35] border border-[#78A95A]/35 font-medium">
                <span>☁️</span>
                <span>Synced</span>
              </span>
            ) : isOffline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D]/35 font-medium">
                <span>⚡</span>
                <span>Offline mode</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF1E4] text-[#5F6D63] border border-[#E3DFD2] font-medium">
                <span>🌱</span>
                <span>Guest mode</span>
              </span>
            )}
          </div>
        </section>

        {/* =========================================================
            2. DAILY QUESTION HABIT CARD
        ========================================================= */}
        <section>
          <DailyCheckCard
            userPlants={userPlants}
            userPlantNames={plantNames}
            onCheckCompleted={loadDashboardData}
          />
        </section>

        {/* =========================================================
            3. TODAY'S GARDEN CARE TASKS
        ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💧</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#203027]">
                Today’s Care
              </h2>
            </div>
            {careTasks.length > 0 && (
              <span className="text-xs font-mono text-[#5F6D63]">
                {completedTasks.length} of {careTasks.length} done
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-white border border-[#E3DFD2] animate-pulse p-4 space-y-2"
                >
                  <div className="h-4 w-32 bg-[#E3DFD2] rounded-md" />
                  <div className="h-3 w-48 bg-[#EAF1E4] rounded-md" />
                </div>
              ))}
            </div>
          ) : careTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#E3DFD2] text-center text-xs text-[#5F6D63] space-y-1">
              <span className="text-2xl block select-none">🎉</span>
              <p className="font-medium text-[#203027]">No tasks scheduled for today</p>
              <p>Your garden is happy and hydrated. Enjoy watching it grow!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active Pending Tasks — Single column on narrow mobile, multi-column on tablet/desktop */}
              {pendingTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingTasks.map((task) => {
                    const { action, subtitle } = formatTaskAction(task);
                    return (
                      <ActionCard
                        key={task.id}
                        id={task.id}
                        icon={task.type === 'water' ? '💧' : task.type === 'fertilize' ? '🌱' : task.type === 'harvest' ? '✂️' : '🌿'}
                        category={task.type}
                        title={action}
                        subtitle={subtitle}
                        tag={task.dueDate || 'Today'}
                        completed={false}
                        onToggle={() => handleTaskToggle(task)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EAF1E4] border border-[#78A95A]/35 text-xs text-[#174C35] font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>All tasks for today are complete! Nice job keeping your garden thriving.</span>
                </div>
              )}

              {/* Completed Tasks (Quiet, muted, collapsible when multiple) */}
              {completedTasks.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#5F6D63] font-bold">
                      Completed Today ({completedTasks.length})
                    </span>
                    {completedTasks.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="text-xs font-semibold text-[#174C35] hover:underline cursor-pointer select-none"
                      >
                        {showCompleted ? 'Hide completed' : 'Show completed'}
                      </button>
                    )}
                  </div>

                  {(showCompleted || completedTasks.length <= 2) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {completedTasks.map((task) => {
                        const { action } = formatTaskAction(task);
                        return (
                          <ActionCard
                            key={task.id}
                            id={task.id}
                            icon="✓"
                            title={action}
                            subtitle="Completed"
                            completed={true}
                            onToggle={() => handleTaskToggle(task)}
                            className="opacity-60 bg-[#F8F6EE]"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#203027]">
                My Plants
              </h2>
            </div>

            {userPlants.length > 0 && (
              <Link
                href="/app/my-garden"
                className="text-xs font-semibold text-[#174C35] hover:text-[#123E2A] hover:underline flex items-center gap-1"
              >
                <span>View All ({userPlants.length})</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-[#E3DFD2] animate-pulse overflow-hidden"
                >
                  <div className="aspect-4/3 bg-[#EAF1E4]" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 w-32 bg-[#E3DFD2] rounded-md" />
                    <div className="h-3 w-20 bg-[#EAF1E4] rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : userPlants.length === 0 ? (
            <FriendlyEmptyState
              emoji="🪴"
              title="Your garden is empty"
              description="Start your growing journey! Pick your first herb, salad leafy green, or windowsill vegetable."
              actionHref="/app/plants"
              actionLabel="Add Your First Plant"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {plantsWithData.slice(0, 4).map(({ up, catalog, latestObservation, timelineMarkers }) => {
                if (catalog) {
                  return (
                    <PlantCard
                      key={up.id}
                      plant={catalog}
                      nickname={up.nickname}
                      stage={up.currentStage}
                      nextAction="Water today"
                      latestObservation={latestObservation}
                      timelinePreview={timelineMarkers}
                      hideScientific={true}
                    />
                  );
                }
                return (
                  <div
                    key={up.id}
                    className="p-5 rounded-3xl bg-white border border-[#E3DFD2] space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF1E4] flex items-center justify-center text-2xl">
                        🌱
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#203027] leading-snug">
                          {up.nickname || up.plantSlug}
                        </h4>
                        <span className="text-xs text-[#174C35] font-semibold">
                          {up.currentStage}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/app/my-garden`}
                      className="text-xs font-semibold text-[#174C35] hover:underline block pt-2 border-t border-[#E3DFD2]"
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
            5. QUICK TOOLS
        ========================================================= */}
        <section className="pt-4 border-t border-[#E3DFD2] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#5F6D63] font-bold">
              Quick Tools
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/app/ai-doctor"
              className="p-4 rounded-2xl bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#174C35]/35 transition-all flex items-center gap-3.5 shadow-2xs group active:scale-95 touch-manipulation min-h-[56px] select-none"
            >
              <span className="w-10 h-10 rounded-xl bg-[#E7F2F9] text-[#1B5D88] text-xl flex items-center justify-center shrink-0">
                📷
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#203027] group-hover:text-[#174C35]">
                  Plant Check
                </h4>
                <p className="text-xs text-[#5F6D63] whitespace-normal leading-normal">
                  Check a plant
                </p>
              </div>
            </Link>

            <Link
              href="/app/planner"
              className="p-4 rounded-2xl bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#174C35]/35 transition-all flex items-center gap-3.5 shadow-2xs group active:scale-95 touch-manipulation min-h-[56px] select-none"
            >
              <span className="w-10 h-10 rounded-xl bg-[#EAF1E4] text-[#174C35] text-xl flex items-center justify-center shrink-0">
                🪴
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#203027] group-hover:text-[#174C35]">
                  Space Planner
                </h4>
                <p className="text-xs text-[#5F6D63] whitespace-normal leading-normal">
                  Plan your space
                </p>
              </div>
            </Link>

            <Link
              href="/app/grow-plans"
              className="p-4 rounded-2xl bg-white hover:bg-[#EAF1E4] border border-[#E3DFD2] hover:border-[#174C35]/35 transition-all flex items-center gap-3.5 shadow-2xs group active:scale-95 touch-manipulation min-h-[56px] select-none"
            >
              <span className="w-10 h-10 rounded-xl bg-[#F0ECF7] text-[#594186] text-xl flex items-center justify-center shrink-0">
                📋
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#203027] group-hover:text-[#174C35]">
                  Grow Plans
                </h4>
                <p className="text-xs text-[#5F6D63] whitespace-normal leading-normal">
                  Follow a growing journey
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
