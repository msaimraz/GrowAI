'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchUserGarden } from '@/lib/storage';
import { UserPlant } from '@/types/garden';
import { GrowPlan } from '@/types/grow-plan';
import { fetchGrowPlans, getPendingPlanMutationsCount, syncPendingPlanMutations } from '@/lib/grow-plans/storage';
import { PlanCard } from '@/components/grow-plans/PlanCard';
import { CreatePlanModal } from '@/components/grow-plans/CreatePlanModal';
import { Plus, Search, RefreshCw, X, Sprout } from 'lucide-react';

function GrowPlansContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || searchParams?.get('filter') || 'all';

  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [plans, setPlans] = useState<GrowPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const gardenRes = await fetchUserGarden();
      setPlants(gardenRes.plants || []);

      const plansRes = await fetchGrowPlans();
      setPlans(plansRes.plans || []);

      setPendingSyncCount(getPendingPlanMutationsCount());
    } catch (err) {
      console.error('Failed to load grow plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingPlanMutations();
      await loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePlanCreated = (newPlan: GrowPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setPendingSyncCount(getPendingPlanMutationsCount());
  };

  const counts = useMemo(() => {
    return {
      all: plans.length,
      active: plans.filter((p) => p.status === 'active').length,
      needs_attention: plans.filter((p) => p.healthStatus === 'needs_attention').length,
      paused: plans.filter((p) => p.status === 'paused').length,
      completed: plans.filter((p) => p.status === 'completed').length,
    };
  }, [plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Filter by status tab
      if (statusFilter === 'active' && plan.status !== 'active') return false;
      if (statusFilter === 'needs_attention' && plan.healthStatus !== 'needs_attention') return false;
      if (statusFilter === 'completed' && plan.status !== 'completed') return false;
      if (statusFilter === 'paused' && plan.status !== 'paused') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = plan.name.toLowerCase().includes(q);
        const matchesDesc = (plan.description || '').toLowerCase().includes(q);
        const matchesObj = plan.objective.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesObj;
      }

      return true;
    });
  }, [plans, statusFilter, searchQuery]);

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '';

  const renderEmptyState = () => {
    // 1. Search with no matches
    if (searchQuery.trim()) {
      return (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#ded5c5] max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f4efe6] text-[#526a57] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0c2417]">
              No Matching Plans Found
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] max-w-sm mx-auto mt-1">
              No grow plans match &ldquo;{searchQuery}&rdquo;. Try another search term or clear your filters.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition cursor-pointer min-h-[40px]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      );
    }

    // 2. Paused tab empty
    if (statusFilter === 'paused') {
      return (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#ded5c5] max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f4efe6] text-[#526a57] flex items-center justify-center mx-auto">
            <span className="text-xl">⏸</span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0c2417]">
              No Paused Plans
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] max-w-sm mx-auto mt-1">
              {counts.active > 0
                ? `Your current plans are still moving forward. You have ${counts.active} active grow plan${counts.active === 1 ? '' : 's'}.`
                : 'You don’t have any paused plans. All current journeys are active or completed.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {counts.active > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition cursor-pointer min-h-[40px]"
              >
                View Active Plans ({counts.active})
              </button>
            )}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#fbf9f4] border border-[#ded5c5] text-[#0c2417] hover:bg-[#f4efe6] transition cursor-pointer min-h-[40px]"
            >
              View All Plans
            </button>
          </div>
        </div>
      );
    }

    // 3. Completed tab empty
    if (statusFilter === 'completed') {
      return (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#ded5c5] max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0c2417]">
              No Completed Plans Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] max-w-sm mx-auto mt-1">
              Your finished growing journeys will appear here once all steps are completed.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {counts.active > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition cursor-pointer min-h-[40px]"
              >
                View Active Plans ({counts.active})
              </button>
            )}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#fbf9f4] border border-[#ded5c5] text-[#0c2417] hover:bg-[#f4efe6] transition cursor-pointer min-h-[40px]"
            >
              View All Plans
            </button>
          </div>
        </div>
      );
    }

    // 4. Needs Attention tab empty
    if (statusFilter === 'needs_attention') {
      return (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#ded5c5] max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
            <span className="text-xl">🩺</span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0c2417]">
              All Plans Look Healthy
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] max-w-sm mx-auto mt-1">
              No active issues need immediate attention. Your plants are on track!
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition cursor-pointer min-h-[40px]"
            >
              View All Plans
            </button>
          </div>
        </div>
      );
    }

    // 5. Active tab empty but other plans exist
    if (statusFilter === 'active' && counts.all > 0) {
      return (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#ded5c5] max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0c2417]">
              No Active Plans
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] max-w-sm mx-auto mt-1">
              All your plans are currently completed or paused.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition cursor-pointer min-h-[40px]"
            >
              Create Grow Plan
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#fbf9f4] border border-[#ded5c5] text-[#0c2417] hover:bg-[#f4efe6] transition cursor-pointer min-h-[40px]"
            >
              View All Plans
            </button>
          </div>
        </div>
      );
    }

    // 6. Default: All plans empty
    return (
      <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#ded5c5] max-w-lg mx-auto shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-[#0c2417]">
            No Grow Plans Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#526a57] max-w-sm mx-auto mt-1">
            Start a guided growing journey for one of your plants with step-by-step care milestones.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] text-white hover:bg-[#0c2417] transition cursor-pointer min-h-[40px]"
          >
            Create Grow Plan
          </button>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All Plans', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'needs_attention', label: 'Needs Attention', count: counts.needs_attention },
    { id: 'paused', label: 'Paused', count: counts.paused },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1F2A23] pb-24">
      <AppHeader
        title="Grow Plans"
        subtitle="Step-by-step growing journeys from seed to harvest 🌱"
        actionHref="/app/my-garden"
        actionLabel="My Garden"
        actionIcon="none"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0c2417]">
                Grow Plans
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#526a57] mt-1">
              Structured developmental roadmaps with evidence-based milestones and reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingSyncCount} pending sync</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#144229] hover:bg-[#0c2417] text-white shadow-xs transition cursor-pointer min-h-[44px]"
            >
              <Plus size={16} />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-[#ded5c5] shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#144229] text-white shadow-xs'
                    : 'text-[#526a57] hover:bg-[#f4efe6]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-[#f4efe6] text-[#526a57]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box & Clear Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#526a57]" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:outline-none focus:ring-1 focus:ring-[#144229]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[#526a57] hover:text-[#0c2417]"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-[#526a57] hover:bg-[#f4efe6] hover:text-[#0c2417] transition cursor-pointer whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-white border border-[#ded5c5] animate-pulse p-5"
              />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => {
              const plant = plan.plantId ? plants.find((p) => p.id === plan.plantId) : undefined;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  plantNickname={plant?.nickname}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlanCreated={handlePlanCreated}
        plants={plants}
      />
    </div>
  );
}

export default function GrowPlansPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#526a57]">Loading Grow Plans...</div>}>
      <GrowPlansContent />
    </Suspense>
  );
}
