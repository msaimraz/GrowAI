'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/navigation/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchUserGarden } from '@/lib/storage';
import { UserPlant } from '@/types/garden';
import { GrowPlan, GrowPlanStatus } from '@/types/grow-plan';
import { fetchGrowPlans, getPendingPlanMutationsCount, syncPendingPlanMutations } from '@/lib/grow-plans/storage';
import { PlanCard } from '@/components/grow-plans/PlanCard';
import { CreatePlanModal } from '@/components/grow-plans/CreatePlanModal';
import { Plus, Search, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

function GrowPlansContent() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [plans, setPlans] = useState<GrowPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
      setPlans(plansRes.plans);

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

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1F2A23] pb-24">
      <AppHeader title="Grow Plans" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2A23]">
                Grow Plans
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#68736B] mt-1">
              Step-by-step growing journeys from seed to harvest 🌱
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
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#174C35] hover:bg-[#0f3424] text-white shadow-xs transition cursor-pointer min-h-[44px]"
            >
              <Plus size={16} />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Plans' },
              { id: 'active', label: 'Active' },
              { id: 'needs_attention', label: 'Needs Attention' },
              { id: 'paused', label: 'Paused' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse p-5"
              />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              No Grow Plans Found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery || statusFilter !== 'all'
                ? 'No plans match your current filters. Try resetting search.'
                : 'Create your first adaptive grow plan to track establishment, health follow-ups, or propagation milestones.'}
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Create Grow Plan
            </button>
          </div>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading Grow Plans...</div>}>
      <GrowPlansContent />
    </Suspense>
  );
}
