'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { PlantTimelineTab } from '@/components/garden/PlantTimelineTab';
import { fetchUserGarden, fetchCareTasks } from '@/lib/storage';
import { fetchDiagnosesForPlant } from '@/lib/ai-doctor/persistence';
import { UserPlant, CareTask } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import { PLANTS_DATA } from '@/data/plants';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Sprout,
  Loader2,
  AlertCircle,
  RefreshCw,
  Home,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PlantTimelineClientProps {
  plantId: string;
}

export function PlantTimelineClient({ plantId }: PlantTimelineClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [plant, setPlant] = useState<UserPlant | null>(null);
  const [parentPlant, setParentPlant] = useState<UserPlant | null>(null);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosisRecord[]>([]);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gardenRes, tasksRes, healthRes] = await Promise.all([
        fetchUserGarden(),
        fetchCareTasks(),
        fetchDiagnosesForPlant(plantId),
      ]);

      setIsCloud(gardenRes.isCloud);

      if (gardenRes.error) {
        setError(gardenRes.error);
        return;
      }

      const targetPlant = gardenRes.plants.find((p) => p.id === plantId);
      if (!targetPlant) {
        setError('Plant not found in your garden journal.');
        return;
      }

      setPlant(targetPlant);

      // Check for parent plant if propagated
      if (targetPlant.parentPlantId) {
        const parent = gardenRes.plants.find((p) => p.id === targetPlant.parentPlantId);
        setParentPlant(parent || null);
      } else {
        setParentPlant(null);
      }

      setTasks(tasksRes.tasks || []);
      setDiagnoses(healthRes.records || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load plant timeline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlantData();
  }, [plantId, user]);

  const botanicalInfo = plant
    ? PLANTS_DATA.find((p) => p.slug === plant.plantSlug)
    : null;

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0c2417] flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-2 text-xs text-[#526a57]">
            <Link
              href="/app/my-garden"
              className="inline-flex items-center gap-1.5 hover:text-[#144229] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>My Garden</span>
            </Link>
            <ChevronRight size={12} className="text-[#a89f91]" />
            <span className="font-semibold text-[#0c2417]">
              {plant?.nickname || 'Plant Timeline'}
            </span>
            <ChevronRight size={12} className="text-[#a89f91]" />
            <span className="text-[#6d8573]">Growth Timeline</span>
          </nav>

          <button
            type="button"
            onClick={loadPlantData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#ded5c5] hover:bg-[#eef5ee] text-[#144229] transition-all cursor-pointer min-h-[36px]"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#ded5c5]">
            <Loader2 size={32} className="animate-spin text-[#144229] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0c2417]">
              Loading longitudinal timeline...
            </p>
            <p className="text-xs text-[#526a57] mt-1">
              Aggregating lifecycle milestones, growth observations, care tasks, photos, and health events.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
            <AlertCircle size={36} className="text-rose-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#0c2417] mb-1">
              Timeline Unavailable
            </h3>
            <p className="text-xs text-[#526a57] max-w-sm mx-auto mb-4">{error}</p>
            <Link
              href="/app/my-garden"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#144229] text-white hover:bg-[#0c2417] transition-all cursor-pointer"
            >
              <Home size={14} />
              <span>Return to My Garden</span>
            </Link>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && plant && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-[#144229] to-[#0c2417] text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 mb-1">
                    <Sprout size={14} />
                    <span>Botanical Growth Timeline</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                    {plant.nickname}
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    {botanicalInfo?.commonName || plant.plantSlug}
                    {botanicalInfo?.scientificName ? ` • ${botanicalInfo.scientificName}` : ''}
                    {plant.location ? ` • ${plant.location}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/my-garden?plantId=${plant.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer min-h-[40px]"
                  >
                    <span>View in Garden</span>
                  </Link>
                  <Link
                    href={`/app/ai-doctor?plantId=${plant.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-[#0c2417] font-bold transition-all cursor-pointer min-h-[40px]"
                  >
                    <Sparkles size={14} />
                    <span>Check Health</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Timeline Tab Component (Standalone View) */}
            <PlantTimelineTab
              plant={plant}
              parentPlant={parentPlant}
              isCloud={isCloud}
              diagnoses={diagnoses}
              tasks={tasks}
              onRefreshNeeded={loadPlantData}
              showFullTimelineLink={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
