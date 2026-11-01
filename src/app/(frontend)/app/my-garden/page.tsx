'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader, InformationCard } from '@/components/ui/SharedBotanical';
import { PLANTS_DATA } from '@/data/plants';
import { useAuth } from '@/context/AuthContext';
import {
  fetchUserGarden,
  fetchCareTasks,
  updateGardenPlantStage,
  createGrowthNote,
  deleteGardenPlant,
  toggleTaskStatus,
  resetToDemoData,
  hasLocalDemoData,
  importLocalDemoDataToCloud,
} from '@/lib/storage';
import { UserPlant, GrowthStage, CareTask } from '@/types/garden';
import {
  Sprout,
  Plus,
  Calendar,
  Ruler,
  Clock,
  Layers,
  Trash2,
  CheckCircle2,
  Circle,
  Database,
  ArrowRight,
  Info,
  ChevronRight,
  Sparkles,
  Cloud,
  UploadCloud,
  AlertCircle,
  Loader2,
  Droplets,
  Sun,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';

import { usePwa } from '@/context/PwaContext';

const GROWTH_STAGES: GrowthStage[] = [
  'Seed',
  'Germination',
  'Seedling',
  'Growing',
  'Mature',
  'Harvested',
];

function getStageSupportiveMessage(plantNickname: string, stage: GrowthStage, commonName?: string): string {
  switch (stage) {
    case 'Seed':
      return `Your ${plantNickname} is resting as a dormant seed. Maintain gentle moisture and ambient warmth to trigger emergence.`;
    case 'Germination':
      return `Your ${plantNickname} is waking up! Watch for the embryonic radicle and baby cotyledons breaking the surface.`;
    case 'Seedling':
      return `Your ${plantNickname} is at the seedling stage. Ensure 6+ hours of filtered sunlight and bottom-water gently to protect delicate stems.`;
    case 'Growing':
      return `Your ${plantNickname} is growing vigorously! Foliage is expanding and root architecture is establishing healthy container depth.`;
    case 'Mature':
      return `Your ${plantNickname} has reached prime maturity. Leaves and stems are ready for regular harvesting or bloom maintenance.`;
    case 'Harvested':
      return `Your ${plantNickname} has completed its harvest cycle. You can celebrate this yield and prepare your planter for succession sowing!`;
    default:
      return `Your ${plantNickname} is thriving under mindful daily botanical care.`;
  }
}

function MyGardenContent() {
  const searchParams = useSearchParams();
  const highlightPlantId = searchParams.get('plantId');
  const { user, isConfigured } = useAuth();
  const { isOffline } = usePwa();

  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [noteText, setNoteText] = useState('');
  const [noteHeight, setNoteHeight] = useState<string>('');
  const [noteDate, setNoteDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  const loadGardenData = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const [gardenRes, tasksRes] = await Promise.all([
        fetchUserGarden(),
        fetchCareTasks(),
      ]);

      setIsCloud(gardenRes.isCloud);
      if (gardenRes.error) {
        setErrorBanner(`Failed to load cloud garden: ${gardenRes.error}`);
      } else {
        setUserPlants(gardenRes.plants);
        if (gardenRes.plants.length > 0) {
          if (highlightPlantId && gardenRes.plants.some((p) => p.id === highlightPlantId)) {
            setSelectedPlantId(highlightPlantId);
          } else if (!selectedPlantId || !gardenRes.plants.some((p) => p.id === selectedPlantId)) {
            setSelectedPlantId(gardenRes.plants[0].id);
          }
        }
      }

      if (tasksRes.error) {
        setErrorBanner((prev) => prev || `Failed to load care tasks: ${tasksRes.error}`);
      } else {
        setCareTasks(tasksRes.tasks);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Error loading garden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNoteDate(new Date().toISOString().split('T')[0]);
    loadGardenData();
  }, [user, highlightPlantId]);

  const activePlant = userPlants.find((p) => p.id === selectedPlantId) || userPlants[0];
  const activeBotanical = activePlant
    ? PLANTS_DATA.find((p) => p.slug === activePlant.plantSlug)
    : null;

  const handleStageChange = async (plantId: string, newStage: GrowthStage) => {
    if (isOffline && isCloud) {
      setErrorBanner('You are currently offline. Cloud synchronization requires an active internet connection to update stages.');
      return;
    }
    setErrorBanner(null);
    const res = await updateGardenPlantStage(plantId, newStage);
    if (res.error) {
      setErrorBanner(`Failed to update stage in cloud: ${res.error}`);
      return;
    }
    await loadGardenData();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlant || !noteText.trim()) return;

    if (isOffline && isCloud) {
      setErrorBanner('You are currently offline. Cloud synchronization requires an active internet connection to record new growth observations.');
      return;
    }

    setSubmittingNote(true);
    setErrorBanner(null);

    const res = await createGrowthNote(activePlant.id, {
      stage: activePlant.currentStage,
      text: noteText.trim(),
      heightCm: noteHeight ? parseFloat(noteHeight) : undefined,
      date: noteDate,
    });

    if (res.error) {
      setErrorBanner(`Failed to save note to cloud: ${res.error}`);
      setSubmittingNote(false);
      return;
    }

    setNoteText('');
    setNoteHeight('');
    setSubmittingNote(false);
    await loadGardenData();
  };

  const handleDeletePlant = async (plantId: string) => {
    if (confirm('Are you sure you want to remove this plant from your garden?')) {
      setErrorBanner(null);
      const res = await deleteGardenPlant(plantId);
      if (res.error) {
        setErrorBanner(`Failed to delete plant: ${res.error}`);
        return;
      }
      await loadGardenData();
    }
  };

  const handleTaskToggle = async (task: CareTask) => {
    setErrorBanner(null);
    const res = await toggleTaskStatus(task.id, task.completed);
    if (res.error) {
      setErrorBanner(`Failed to update task: ${res.error}`);
      return;
    }
    await loadGardenData();
  };

  const handleResetDemo = () => {
    resetToDemoData();
    loadGardenData();
  };

  const handleImportLocalToCloud = async () => {
    setImporting(true);
    setImportStatus(null);
    setErrorBanner(null);

    try {
      const res = await importLocalDemoDataToCloud();
      if (res.error) {
        setErrorBanner(`Cloud import failed: ${res.error}`);
      } else {
        setImportStatus(
          `Successfully imported ${res.importedCount} plant(s) to your cloud account! (${res.skippedCount} skipped as duplicate)`
        );
        await loadGardenData();
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      <AppHeader
        title="My Garden Journal"
        subtitle="Track developmental milestones, log daily observations, and manage container care."
        actionHref="/app/plants"
        actionLabel="Add from Library"
        actionIcon="plus"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Error Alert Banner */}
        {errorBanner && (
          <div className="bg-[#fbeee9] border border-[#f8d7cb] p-4 rounded-2xl flex items-start gap-3.5 text-sm text-[#9a3412] shadow-xs">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Action Alert</span>
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-[#9a3412] underline font-semibold min-h-[44px] flex items-center cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sync Mode Banner */}
        <div className="bg-white border border-[#ded5c5] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#4b6351] shadow-xs">
          <div className="flex items-center gap-3">
            {isCloud ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center shrink-0">
                  <Cloud size={20} />
                </div>
                <div>
                  <span className="font-bold text-[#0c2417] block">Supabase Cloud Synchronized</span>
                  <span className="text-xs text-[#526a57]">
                    Logged in as <strong>{user?.email}</strong>. Data isolated with PostgreSQL Row Level Security.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <span className="font-bold text-[#0c2417] block">Local Browser Storage Mode</span>
                  <span className="text-xs text-[#526a57]">
                    Plants are safely cached on this device.{' '}
                    {isConfigured && (
                      <Link href="/auth/login" className="font-semibold text-[#144229] underline hover:no-underline">
                        Sign In
                      </Link>
                    )}{' '}
                    to enable multi-device Supabase cloud sync.
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {!isCloud && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="text-xs font-semibold text-[#144229] hover:underline cursor-pointer min-h-[44px] flex items-center"
              >
                Reset Demo Plants
              </button>
            )}
          </div>
        </div>

        {/* Import Banner when logged in and local plants exist */}
        {isCloud && hasLocalDemoData() && (
          <div className="bg-[#eef5ee] border border-[#cfe0cf] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#1e613b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d8ebd8] text-[#144229] flex items-center justify-center shrink-0">
                <UploadCloud size={20} />
              </div>
              <div>
                <strong className="block text-[#0c2417] font-serif text-base">Local Browser Plants Detected</strong>
                <span className="text-xs text-[#3d6e49]">
                  You have plants saved from local browsing. Bring them into your cloud account in one tap.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleImportLocalToCloud}
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#144229] hover:bg-[#0c2417] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0 min-h-[44px]"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Import to Cloud</span>
                </>
              )}
            </button>
          </div>
        )}

        {importStatus && (
          <div className="bg-[#eef5ee] border border-[#cfe0cf] p-4 rounded-2xl text-xs sm:text-sm text-[#1e613b] flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && userPlants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#ded5c5] p-12 sm:p-16 text-center space-y-5 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#eef5ee] text-[#144229] flex items-center justify-center mx-auto shadow-inner">
              <Sprout size={32} />
            </div>
            <h3 className="font-serif font-bold text-2xl text-[#0c2417]">
              {isCloud ? 'Your Cloud Garden is Empty' : 'Your Garden Journal is Ready'}
            </h3>
            <p className="text-sm text-[#526a57] leading-relaxed max-w-md mx-auto">
              Add your first companion plant from our curated 19 botanical profiles. You will be able to log daily observations, track growth stages, and complete care tasks.
            </p>
            <div className="pt-2">
              <Link
                href="/app/plants"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] text-white px-6 py-3 rounded-xl shadow-xs transition-colors min-h-[44px]"
              >
                <Plus size={18} />
                <span>Explore Plant Catalog</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Plant Selection Sidebar */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0c2417]">
                    My Garden ({userPlants.length})
                  </h3>
                  <p className="text-xs text-[#526a57]">Select a specimen to open its journal</p>
                </div>
                <Link
                  href="/app/plants"
                  className="text-xs font-semibold text-[#144229] hover:text-[#0c2417] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cfdfcf] bg-white hover:bg-[#f4f8f4] transition-colors min-h-[44px]"
                >
                  <Plus size={14} />
                  <span>Add Plant</span>
                </Link>
              </div>

              {/* Plant selection list */}
              <div className="space-y-3">
                {userPlants.map((plant) => {
                  const isSelected = plant.id === activePlant?.id;
                  const botanical = PLANTS_DATA.find((p) => p.slug === plant.plantSlug);

                  return (
                    <div
                      key={plant.id}
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between min-h-[56px] ${
                        isSelected
                          ? 'bg-[#144229] text-white border-[#0f2e1d] shadow-sm ring-2 ring-[#144229]/20'
                          : 'bg-white text-[#0c2417] border-[#ded5c5] hover:bg-[#fbf9f4] hover:border-[#144229]'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base truncate">
                            {plant.nickname}
                          </h4>
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                              isSelected
                                ? 'bg-[#257a4d] text-white'
                                : 'bg-[#eef5ee] text-[#144229]'
                            }`}
                          >
                            {plant.currentStage}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate mt-1 ${
                            isSelected ? 'text-[#bed4c5]' : 'text-[#526a57]'
                          }`}
                        >
                          {botanical?.commonName} • {plant.notes?.length || 0} observation(s)
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className={isSelected ? 'text-white' : 'text-[#8ba391]'}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Plant Care Tasks Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ded5c5] space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#f0ebe0]">
                  <h4 className="font-serif font-bold text-sm text-[#0c2417] flex items-center gap-2">
                    <Droplets size={16} className="text-[#144229]" />
                    <span>Care Tasks</span>
                  </h4>
                  <span className="text-xs font-semibold text-[#144229] bg-[#eef5ee] px-2.5 py-0.5 rounded-full">
                    {careTasks.filter((t) => !t.completed).length} pending
                  </span>
                </div>

                <div className="space-y-2.5">
                  {careTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskToggle(task)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer flex items-start gap-3 transition-colors min-h-[48px] ${
                        task.completed
                          ? 'bg-[#f7f5ed] border-[#e2dbce] opacity-60'
                          : 'bg-[#fbf9f4] border-[#ded5c5] hover:border-[#144229] hover:bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-[#144229] focus:outline-none cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
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
                          className={`font-medium ${
                            task.completed ? 'line-through text-[#6d8573]' : 'text-[#0c2417]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-[#6d8573] mt-0.5">
                          {task.plantName.split('(')[0]} • Due {task.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Active Plant Detail & Growth Log */}
            {activePlant && (
              <div className="lg:col-span-8 space-y-6">
                {/* Active Plant Banner Card */}
                <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f0ebe0]">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2417]">
                          {activePlant.nickname}
                        </h2>
                        <Badge variant="sage" size="md">{activePlant.currentStage}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-[#526a57] mt-1">
                        {activeBotanical?.commonName} (<em>{activeBotanical?.scientificName}</em>) • Planted on{' '}
                        {activePlant.plantedDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeBotanical && (
                        <Link
                          href={`/app/plants/${activeBotanical.slug}`}
                          className="text-xs sm:text-sm font-semibold text-[#144229] hover:bg-[#eef5ee] px-4 py-2.5 rounded-xl border border-[#cfdfcf] bg-white transition-colors flex items-center gap-1.5 min-h-[44px]"
                        >
                          <BookOpen size={15} />
                          <span>Botanical Guide</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePlant(activePlant.id)}
                        className="p-2.5 text-[#b95835] hover:bg-[#fbeee9] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Remove plant"
                        aria-label="Remove plant"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Supportive Botanical Message Box */}
                  <div className="bg-[#eef5ee] border border-[#cfe0cf] p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-[#1e613b]">
                    <Sparkles size={20} className="text-[#144229] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#0c2417] font-serif text-sm sm:text-base mb-0.5">
                        Botanist Guidance
                      </strong>
                      <p className="leading-relaxed">
                        {getStageSupportiveMessage(activePlant.nickname, activePlant.currentStage, activeBotanical?.commonName)}
                      </p>
                    </div>
                  </div>

                  {/* Growth Stage Stepper */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
                      Growth Stage Milestone (Click to update):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      {GROWTH_STAGES.map((st, index) => {
                        const isCurrent = activePlant.currentStage === st;
                        const currentIndex = GROWTH_STAGES.indexOf(activePlant.currentStage);
                        const isPast = index < currentIndex;

                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStageChange(activePlant.id, st)}
                            className={`py-3 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                              isCurrent
                                ? 'bg-[#144229] text-white border-[#0f2e1d] shadow-sm ring-2 ring-[#144229]/20 font-bold'
                                : isPast
                                ? 'bg-[#eef5ee] text-[#1e613b] border-[#cfe0cf] hover:bg-[#d8ebd8]'
                                : 'bg-[#fbf9f4] text-[#526a57] border-[#ded5c5] hover:bg-white'
                            }`}
                          >
                            <span className="text-[10px] opacity-75">Step {index + 1}</span>
                            <span>{st}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Environment & Placement Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm pt-2">
                    <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                      <span className="text-[#6d8573] block text-xs mb-1">Assigned Location</span>
                      <strong className="text-[#0c2417] text-sm">{activePlant.location || 'Balcony Vertical Rack'}</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                      <span className="text-[#6d8573] block text-xs mb-1">Recommended Shelf</span>
                      <strong className="text-[#0c2417] text-sm capitalize">{activePlant.tier || 'Middle'} Shelf</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5]">
                      <span className="text-[#6d8573] block text-xs mb-1">Container Depth</span>
                      <strong className="text-[#0c2417] text-sm">{activeBotanical?.potting.minDepthCm || 20} cm depth</strong>
                    </div>
                  </div>
                </div>

                {/* Add New Dated Growth Note Form */}
                <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#f0ebe0]">
                    <div className="w-9 h-9 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
                      <Sprout size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#0c2417]">
                        Record Growth Observation
                      </h3>
                      <p className="text-xs text-[#526a57]">
                        Log height, stem branching, pests, or watering adjustments
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                          Observation Date
                        </label>
                        <input
                          type="date"
                          value={noteDate}
                          onChange={(e) => setNoteDate(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                          Measured Height (cm, optional)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 14.5"
                          value={noteHeight}
                          onChange={(e) => setNoteHeight(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0c2417] mb-1.5">
                        Botanical Notes & Actions Taken
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="e.g. Emergence of third set of serrated leaves, trimmed center tip to encourage side branching, topsoil moist..."
                        required
                        className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144229] leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submittingNote}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer min-h-[44px] transition-colors"
                      >
                        {submittingNote ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Saving Observation...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            <span>Save to Plant Log</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Growth History Timeline */}
                <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#eef5ee] text-[#144229] flex items-center justify-center">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#0c2417]">
                          Observation Timeline
                        </h3>
                        <p className="text-xs text-[#526a57]">
                          {activePlant.notes?.length || 0} chronological records logged
                        </p>
                      </div>
                    </div>
                  </div>

                  {!activePlant.notes || activePlant.notes.length === 0 ? (
                    <div className="text-center py-10 space-y-2 bg-[#fbf9f4] rounded-2xl border border-dashed border-[#ded5c5]">
                      <Sprout size={28} className="text-[#8ba391] mx-auto" />
                      <p className="text-sm font-serif font-bold text-[#0c2417]">No Observations Yet</p>
                      <p className="text-xs text-[#526a57] max-w-sm mx-auto">
                        Record your first dated entry above to start building this plant&apos;s botanical growth timeline.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {activePlant.notes
                        .slice()
                        .reverse()
                        .map((note) => (
                          <div
                            key={note.id}
                            className="p-4 sm:p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs sm:text-sm"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2.5">
                                <Badge variant="sage" size="sm">{note.stage}</Badge>
                                <span className="text-[#647f6c] flex items-center gap-1.5 text-xs">
                                  <Calendar size={13} /> {note.date}
                                </span>
                              </div>
                              <p className="text-[#2c3d30] leading-relaxed pt-1 text-sm">
                                {note.text}
                              </p>
                            </div>

                            {note.heightCm !== undefined && (
                              <span className="shrink-0 font-mono text-xs font-semibold text-[#144229] bg-white px-3 py-1.5 rounded-xl border border-[#cfe0cf] flex items-center gap-1.5 self-start sm:self-auto">
                                <Ruler size={13} /> {note.heightCm} cm
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyGardenPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#526a57] bg-[#fbf9f4]">
          Loading your garden journal...
        </div>
      }
    >
      <MyGardenContent />
    </React.Suspense>
  );
}
