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
          <div className="relative max-w-2xl space-y-3">
            <Badge variant="forest" size="md">
              <Sprout size={12} className="text-[#64b584]" />
              Balcony & Indoor Urban Agriculture
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Welcome to Your Garden, Grower.
            </h2>
            <p className="text-sm text-[#bed4c5] leading-relaxed">
              You are currently monitoring {userPlants.length} active plants across your home vertical setup. Today is an ideal day for morning bottom-watering and pest checks.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <Link
                href="/app/my-garden"
                className="inline-flex items-center gap-1.5 font-semibold bg-[#257a4d] hover:bg-[#1e613b] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>View My Garden Log</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 font-medium text-[#9dc2a8] hover:text-white px-3 py-2 rounded-lg border border-[#1e5235] hover:bg-[#143a25] transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/app/ai-doctor"
            className="group bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                <Sparkles size={20} />
              </span>
              <Badge variant="sage" size="sm">Demo Mode</Badge>
            </div>
            <h3 className="font-serif font-bold text-base text-[#0c2417] mb-1">
              AI Plant Doctor
            </h3>
            <p className="text-xs text-[#526a57] leading-relaxed">
              Diagnose leaf yellowing, tip burn, or pests with heuristic agronomy.
            </p>
          </Link>

          <Link
            href="/app/planner"
            className="group bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                <Layers size={20} />
              </span>
              <Badge variant="sage" size="sm">3-Tier Rack</Badge>
            </div>
            <h3 className="font-serif font-bold text-base text-[#0c2417] mb-1">
              Vertical Planner
            </h3>
            <p className="text-xs text-[#526a57] leading-relaxed">
              Configure sun-loving crops up top and shade greens in middle tiers.
            </p>
          </Link>

          <Link
            href="/app/plants"
            className="group bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                <Sprout size={20} />
              </span>
              <Badge variant="sage" size="sm">16 Plants</Badge>
            </div>
            <h3 className="font-serif font-bold text-base text-[#0c2417] mb-1">
              Plant Library
            </h3>
            <p className="text-xs text-[#526a57] leading-relaxed">
              Search temperature ranges, lighting requirements, and harvest days.
            </p>
          </Link>

          <Link
            href="/app/learn"
            className="group bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                <BookOpen size={20} />
              </span>
              <Badge variant="sage" size="sm">3R Principles</Badge>
            </div>
            <h3 className="font-serif font-bold text-base text-[#0c2417] mb-1">
              Learn & Sustainability
            </h3>
            <p className="text-xs text-[#526a57] leading-relaxed">
              Upcycled containers, water reduction, and balcony composting.
            </p>
          </Link>
        </div>

        {/* Main Grid: My Plants Progress & Upcoming Care Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: My Active Plants Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#0c2417]">
                  My Plant Collection & Growth
                </h3>
                <p className="text-xs text-[#526a57]">
                  Stages tracked in browser demo state
                </p>
              </div>
              <Link
                href="/app/my-garden"
                className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
              >
                <span>Manage Garden</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Plants List or Empty State */}
            {mounted && userPlants.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#ded5c5] text-center space-y-3">
                <span className="w-12 h-12 rounded-full bg-[#f4f8f4] text-[#144229] flex items-center justify-center mx-auto">
                  <Sprout size={24} />
                </span>
                <h4 className="font-serif font-bold text-base text-[#0c2417]">
                  No Plants Added Yet
                </h4>
                <p className="text-xs text-[#526a57] max-w-sm mx-auto">
                  Add your first plant from the plant library to begin logging developmental stages and notes.
                </p>
                <Link
                  href="/app/plants"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#144229] text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={14} />
                  <span>Browse Plant Library</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userPlants.map((userPlant) => {
                  const botanical = PLANTS_DATA.find((p) => p.slug === userPlant.plantSlug);
                  const lastNote = userPlant.notes[userPlant.notes.length - 1];

                  return (
                    <div
                      key={userPlant.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ded5c5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-[#0c2417]">
                            {userPlant.nickname}
                          </h4>
                          <Badge variant="sage" size="sm">
                            {userPlant.currentStage}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#526a57]">
                          {botanical?.commonName || userPlant.plantSlug} • Planted {userPlant.plantedDate}
                        </p>
                        {lastNote && (
                          <p className="text-xs text-[#394f3f] italic pt-1 line-clamp-1">
                            &ldquo;{lastNote.text}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {userPlant.tier && (
                          <span className="text-[11px] font-medium text-[#1e613b] bg-[#f4f8f4] px-2.5 py-1 rounded-md border border-[#cfdfcf] capitalize">
                            {userPlant.tier} Tier
                          </span>
                        )}
                        <Link
                          href={`/app/my-garden?plantId=${userPlant.id}`}
                          className="text-xs font-semibold text-[#144229] hover:bg-[#f4f8f4] px-3 py-1.5 rounded-lg border border-[#cfdfcf] transition-colors"
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
                <h3 className="text-lg font-serif font-bold text-[#0c2417]">
                  Upcoming Care Tasks
                </h3>
                <p className="text-xs text-[#526a57]">Click to mark complete</p>
              </div>
              <span className="text-xs font-medium text-[#1e613b] bg-[#eef5ee] px-2 py-0.5 rounded-md border border-[#cfe0cf]">
                {careTasks.filter((t) => !t.completed).length} Pending
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs space-y-3">
              {careTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    task.completed
                      ? 'bg-[#f7f5ed] border-[#e2dbce] opacity-70'
                      : 'bg-white border-[#ded5c5] hover:border-[#144229]'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-[#144229] focus:outline-none"
                    aria-label={`Toggle task ${task.title}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={18} className="text-[#257a4d]" />
                    ) : (
                      <Circle size={18} className="text-[#9ab8a3]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-[#6d8573]' : 'text-[#0c2417]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[11px] text-[#6d8573] mt-0.5">
                      {task.plantName} • Due {task.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Sustainable Gardening Tip */}
            <div className="bg-[#f7f5ed] p-5 rounded-2xl border border-[#ded5c5] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#92400e]">
                <Sun size={14} />
                <span>Gardener Tip: Bottom Watering</span>
              </div>
              <p className="text-xs text-[#394f3f] leading-relaxed">
                Placing your potted herbs into a 2 cm water tray for 15 minutes allows roots to draw moisture by capillary action while keeping the surface dry, significantly cutting fungal gnats and leaf blights.
              </p>
              <Link
                href="/app/learn"
                className="inline-block text-xs font-semibold text-[#144229] hover:underline pt-1"
              >
                Read more in Learn & 3Rs →
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Recommendations from Library */}
        <div className="space-y-4 pt-4 border-t border-[#e2dcce]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#0c2417]">
                Recommended for Compact Spaces
              </h3>
              <p className="text-xs text-[#526a57]">High-yield species from our curated catalog</p>
            </div>
            <Link
              href="/app/plants"
              className="text-xs font-semibold text-[#144229] hover:underline"
            >
              Browse all 16 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white p-5 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="sage" size="sm">{plant.category.replace('-', ' ')}</Badge>
                    <span className="text-[11px] font-mono font-medium text-[#1e613b]">
                      {plant.timelines.harvestDays ? `${plant.timelines.harvestDays.min}d harvest` : `${plant.timelines.maturityDays.min}d`}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#0c2417]">
                    {plant.commonName}
                  </h4>
                  <p className="text-xs text-[#526a57] line-clamp-2">
                    {plant.summary}
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-[#f0ebe0] flex items-center justify-between">
                  <span className="text-xs text-[#394f3f] capitalize">
                    {plant.verticalSuitability.recommendedTier} Shelf
                  </span>
                  <Link
                    href={`/app/plants/${plant.slug}`}
                    className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight size={12} />
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
