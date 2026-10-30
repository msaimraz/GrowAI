'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
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
  Sprout,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen,
  Thermometer,
  Sun,
  Droplets,
  RotateCcw,
  Plus,
  Cloud,
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

  const featuredPlants = getFeaturedPlants().slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title="Grower Overview"
        subtitle="Manage your vertical tiers, track stage progress, and complete today's care tasks."
        actionHref="/app/plants"
        actionLabel="Explore Plants"
        actionIcon="plus"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#0e2a1b] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-botanical-pattern opacity-10 pointer-events-none" />
          <div className="relative max-w-2xl space-y-3.5">
            <Badge variant="forest" size="md">
              <Sprout size={14} className="text-[#64b584]" />
              Balcony & Indoor Urban Agriculture
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Welcome to Your Garden, Grower.
            </h2>
            <p className="text-sm sm:text-base text-[#d1e6d7] leading-relaxed">
              You are currently monitoring {userPlants.length} active plants across your home vertical setup. Today is an ideal day for morning bottom-watering and pest checks.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-sm">
              <Link
                href="/app/my-garden"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-[#257a4d] hover:bg-[#1e613b] text-white px-5 py-3 rounded-xl transition-colors min-h-[44px] shadow-xs"
              >
                <span>View My Garden Log</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center justify-center gap-2 font-medium text-[#c0dec8] hover:text-white px-4 py-3 rounded-xl border border-[#235839] hover:bg-[#143a25] transition-colors min-h-[44px] cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/app/ai-doctor"
            className="group bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="p-3 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                  <Sparkles size={22} />
                </span>
                <Badge variant="sage" size="sm">Vision AI</Badge>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#071c11] mb-1.5">
                AI Plant Doctor
              </h3>
              <p className="text-sm text-[#2e4435] leading-relaxed">
                Diagnose leaf yellowing, tip burn, or pests with multimodal Gemini Vision analysis.
              </p>
            </div>
          </Link>

          <Link
            href="/app/planner"
            className="group bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="p-3 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                  <Layers size={22} />
                </span>
                <Badge variant="sage" size="sm">3-Tier Rack</Badge>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#071c11] mb-1.5">
                Vertical Planner
              </h3>
              <p className="text-sm text-[#2e4435] leading-relaxed">
                Configure sun-loving crops up top and shade greens in middle tiers for max yield.
              </p>
            </div>
          </Link>

          <Link
            href="/app/plants"
            className="group bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="p-3 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                  <Sprout size={22} />
                </span>
                <Badge variant="sage" size="sm">16 Species</Badge>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#071c11] mb-1.5">
                Plant Library
              </h3>
              <p className="text-sm text-[#2e4435] leading-relaxed">
                Search verified temperature ranges, sunlight requirements, and harvest windows.
              </p>
            </div>
          </Link>

          <Link
            href="/app/learn"
            className="group bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="p-3 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                  <BookOpen size={22} />
                </span>
                <Badge variant="sage" size="sm">3R Principles</Badge>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#071c11] mb-1.5">
                Learn & Sustainability
              </h3>
              <p className="text-sm text-[#2e4435] leading-relaxed">
                Upcycled containers, water reduction techniques, and organic balcony composting.
              </p>
            </div>
          </Link>
        </div>

        {/* Main Grid: My Plants Progress & Upcoming Care Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: My Active Plants Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#071c11]">
                  My Plant Collection & Growth
                </h3>
                <p className="text-sm text-[#2e4435] mt-0.5">
                  Stages tracked in browser demo state
                </p>
              </div>
              <Link
                href="/app/my-garden"
                className="text-sm font-semibold text-[#144229] hover:underline flex items-center gap-1.5 min-h-[44px]"
              >
                <span>Manage Garden</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Plants List or Empty State */}
            {mounted && userPlants.length === 0 ? (
              <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#ded5c5] text-center space-y-4">
                <span className="w-14 h-14 rounded-full bg-[#f4f8f4] text-[#144229] flex items-center justify-center mx-auto">
                  <Sprout size={28} />
                </span>
                <h4 className="font-serif font-bold text-lg text-[#071c11]">
                  No Plants Added Yet
                </h4>
                <p className="text-sm text-[#2e4435] max-w-sm mx-auto leading-relaxed">
                  Add your first plant from the plant library to begin logging developmental stages and notes.
                </p>
                <Link
                  href="/app/plants"
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] text-white px-5 py-3 rounded-xl min-h-[44px]"
                >
                  <Plus size={16} />
                  <span>Browse Plant Library</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {userPlants.map((userPlant) => {
                  const botanical = PLANTS_DATA.find((p) => p.slug === userPlant.plantSlug);
                  const lastNote = userPlant.notes[userPlant.notes.length - 1];

                  return (
                    <div
                      key={userPlant.id}
                      className="bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-serif font-bold text-lg text-[#071c11]">
                            {userPlant.nickname}
                          </h4>
                          <Badge variant="sage" size="sm">
                            {userPlant.currentStage}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#2e4435]">
                          {botanical?.commonName || userPlant.plantSlug} • Planted {userPlant.plantedDate}
                        </p>
                        {lastNote && (
                          <p className="text-sm text-[#144229] italic pt-0.5 line-clamp-1">
                            &ldquo;{lastNote.text}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {userPlant.tier && (
                          <span className="text-xs font-semibold text-[#144229] bg-[#f4f8f4] px-3 py-1.5 rounded-lg border border-[#cfdfcf] capitalize">
                            {userPlant.tier} Tier
                          </span>
                        )}
                        <Link
                          href={`/app/my-garden?plantId=${userPlant.id}`}
                          className="min-h-[40px] flex items-center justify-center text-xs sm:text-sm font-semibold text-[#144229] hover:bg-[#f4f8f4] px-3.5 py-2 rounded-xl border border-[#cfdfcf] transition-colors"
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

          {/* Right Column: Upcoming Care Tasks & Tip */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#071c11]">
                  Upcoming Care Tasks
                </h3>
                <p className="text-sm text-[#2e4435] mt-0.5">Click to mark complete</p>
              </div>
              <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-3 py-1 rounded-full border border-[#cfe0cf]">
                {careTasks.filter((t) => !t.completed).length} Pending
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs space-y-3">
              {careTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    task.completed
                      ? 'bg-[#f7f5ed] border-[#e2dbce] opacity-70'
                      : 'bg-white border-[#ded5c5] hover:border-[#144229]'
                  }`}
                >
                  <button
                    type="button"
                    className="p-1 text-[#144229] focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    aria-label={`Toggle task ${task.title}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={20} className="text-[#257a4d]" />
                    ) : (
                      <Circle size={20} className="text-[#8ba391]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-[#5f7966]' : 'text-[#071c11]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs sm:text-sm text-[#2e4435] mt-0.5">
                      {task.plantName} • Due {task.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Sustainable Gardening Tip */}
            <div className="bg-[#f7f5ed] p-6 rounded-2xl border border-[#ded5c5] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#92400e]">
                <Sun size={16} />
                <span>Gardener Tip: Bottom Watering</span>
              </div>
              <p className="text-sm text-[#2e4435] leading-relaxed">
                Placing your potted herbs into a 2 cm water tray for 15 minutes allows roots to draw moisture by capillary action while keeping the surface dry, significantly cutting fungal gnats and leaf blights.
              </p>
              <Link
                href="/app/learn"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#144229] hover:underline pt-1 min-h-[40px]"
              >
                <span>Read more in Learn & 3Rs</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Recommendations from Library */}
        <div className="space-y-4 pt-4 border-t border-[#e2dcce]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#071c11]">
                Recommended for Compact Spaces
              </h3>
              <p className="text-sm text-[#2e4435] mt-0.5">High-yield species from our curated catalog</p>
            </div>
            <Link
              href="/app/plants"
              className="text-sm font-semibold text-[#144229] hover:underline min-h-[44px] flex items-center"
            >
              Browse all 16 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="sage" size="sm">{plant.category.replace('-', ' ')}</Badge>
                    <span className="text-xs font-mono font-medium text-[#144229]">
                      {plant.timelines.harvestDays ? `${plant.timelines.harvestDays.min}d harvest` : `${plant.timelines.maturityDays.min}d`}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-[#071c11]">
                    {plant.commonName}
                  </h4>
                  <p className="text-sm text-[#2e4435] line-clamp-2 leading-relaxed">
                    {plant.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#f0ebe0] flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-[#2e4435] capitalize">
                    {plant.verticalSuitability.recommendedTier} Shelf
                  </span>
                  <Link
                    href={`/app/plants/${plant.slug}`}
                    className="text-sm font-semibold text-[#144229] hover:underline flex items-center gap-1 min-h-[40px]"
                  >
                    <span>Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
