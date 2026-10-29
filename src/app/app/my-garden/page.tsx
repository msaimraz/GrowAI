'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { PLANTS_DATA } from '@/data/plants';
import { useAuth } from '@/context/AuthContext';
import {
  getSavedUserPlants,
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
} from 'lucide-react';

const GROWTH_STAGES: GrowthStage[] = [
  'Seed',
  'Germination',
  'Seedling',
  'Growing',
  'Mature',
  'Harvested',
];

function MyGardenContent() {
  const searchParams = useSearchParams();
  const highlightPlantId = searchParams.get('plantId');
  const { user, isConfigured } = useAuth();

  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [noteText, setNoteText] = useState('');
  const [noteHeight, setNoteHeight] = useState<string>('');
  const [noteDate, setNoteDate] = useState<string>('2026-10-29');
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
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title="My Garden & Growth Log"
        subtitle="Record dated growth observations, update developmental stages, and complete care tasks."
        actionHref="/app/plants"
        actionLabel="Add from Library"
        actionIcon="plus"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Error Alert Banner */}
        {errorBanner && (
          <div className="bg-[#fbeee9] border border-[#f8d7cb] p-4 rounded-xl flex items-start gap-3 text-xs text-[#9a3412] shadow-xs">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Operation Failed</span>
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-[#9a3412] underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sync Mode Banner */}
        <div className="bg-[#f7f5ed] border border-[#ded5c5] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4b6351]">
          <div className="flex items-center gap-2.5">
            {isCloud ? (
              <>
                <Cloud size={18} className="text-[#1b5837] shrink-0" />
                <span>
                  <strong>Cloud Synchronized:</strong> Logged in as{' '}
                  <strong className="text-[#0c2417]">{user?.email}</strong>. All garden additions,
                  stages, and notes are securely isolated via PostgreSQL Row Level Security.
                </span>
              </>
            ) : (
              <>
                <Database size={18} className="text-[#c77712] shrink-0" />
                <span>
                  <strong>Local Demo Mode:</strong> Plants are currently saved in this browser&apos;s local storage.
                  {isConfigured && (
                    <>
                      {' '}
                      <Link href="/auth/login" className="font-semibold text-[#144229] underline hover:no-underline">
                        Sign In
                      </Link>{' '}
                      to persist your garden to Supabase cloud.
                    </>
                  )}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {!isCloud && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="text-xs font-semibold text-[#144229] hover:underline cursor-pointer"
              >
                Reset Demo Data
              </button>
            )}
          </div>
        </div>

        {/* Import Banner when logged in and local plants exist */}
        {isCloud && hasLocalDemoData() && (
          <div className="bg-[#eef5ee] border border-[#cfe0cf] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1e613b]">
            <div className="flex items-center gap-2">
              <UploadCloud size={18} className="text-[#144229] shrink-0" />
              <div>
                <strong className="block text-[#0c2417]">Local Demo Plants Detected</strong>
                <span>
                  You have plants saved in your local browser storage. You can import them into your cloud account now.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleImportLocalToCloud}
              disabled={importing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#144229] hover:bg-[#0c2417] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
            >
              {importing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={13} />
                  <span>Import to Cloud</span>
                </>
              )}
            </button>
          </div>
        )}

        {importStatus && (
          <div className="bg-[#eef5ee] border border-[#cfe0cf] p-3 rounded-xl text-xs text-[#1e613b] flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && userPlants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ded5c5] p-12 text-center space-y-4 max-w-lg mx-auto">
            <span className="w-14 h-14 rounded-full bg-[#f4f8f4] text-[#144229] flex items-center justify-center mx-auto">
              <Sprout size={28} />
            </span>
            <h3 className="font-serif font-bold text-xl text-[#0c2417]">
              {isCloud ? 'Your Cloud Garden is Empty' : 'Your Garden is Currently Empty'}
            </h3>
            <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed">
              Explore our 16 curated plant profiles and add your first plant to begin logging developmental stages, notes, and care tasks.
            </p>
            <div className="pt-2">
              <Link
                href="/app/plants"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] text-white px-5 py-2.5 rounded-xl shadow-xs"
              >
                <Plus size={16} />
                <span>Browse Plant Library</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Plant Selection Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold text-[#0c2417]">
                  My Plant Collection ({userPlants.length})
                </h3>
                <Link
                  href="/app/plants"
                  className="text-xs font-semibold text-[#144229] hover:underline flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add Plant</span>
                </Link>
              </div>

              <div className="space-y-2.5">
                {userPlants.map((plant) => {
                  const isSelected = plant.id === activePlant?.id;
                  const botanical = PLANTS_DATA.find((p) => p.slug === plant.plantSlug);

                  return (
                    <div
                      key={plant.id}
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#144229] text-white border-[#0f2e1d] shadow-sm'
                          : 'bg-white text-[#0c2417] border-[#ded5c5] hover:bg-[#fbf9f4]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm truncate">
                            {plant.nickname}
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isSelected
                                ? 'bg-[#257a4d] text-white'
                                : 'bg-[#eef5ee] text-[#1e613b]'
                            }`}
                          >
                            {plant.currentStage}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-[#bed4c5]' : 'text-[#647f6c]'
                          }`}
                        >
                          {botanical?.commonName} • {plant.notes?.length || 0} note(s)
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={isSelected ? 'text-white' : 'text-[#8ba391]'}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Plant Care Tasks */}
              <div className="bg-white p-5 rounded-2xl border border-[#ded5c5] space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229] flex items-center justify-between">
                  <span>Care Tasks</span>
                  <span className="text-[11px] font-normal normal-case text-[#647f6c]">
                    {careTasks.filter((t) => !t.completed).length} to do
                  </span>
                </h4>

                <div className="space-y-2">
                  {careTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskToggle(task)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                        task.completed
                          ? 'bg-[#f7f5ed] border-[#e2dbce] opacity-60'
                          : 'bg-white border-[#ded5c5] hover:border-[#144229]'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-[#144229] focus:outline-none cursor-pointer"
                        aria-label={`Toggle task ${task.title}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={15} className="text-[#257a4d]" />
                        ) : (
                          <Circle size={15} className="text-[#9ab8a3]" />
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
                        <p className="text-[10px] text-[#6d8573]">
                          {task.plantName.split('(')[0]} • {task.dueDate}
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
                <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-serif font-bold text-[#0c2417]">
                          {activePlant.nickname}
                        </h2>
                        <Badge variant="sage" size="md">{activePlant.currentStage}</Badge>
                      </div>
                      <p className="text-xs text-[#526a57] mt-0.5">
                        {activeBotanical?.commonName} ({activeBotanical?.scientificName}) • Planted on{' '}
                        {activePlant.plantedDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeBotanical && (
                        <Link
                          href={`/app/plants/${activeBotanical.slug}`}
                          className="text-xs font-semibold text-[#144229] hover:bg-[#f4f8f4] px-3 py-1.5 rounded-lg border border-[#cfdfcf]"
                        >
                          Botanical Profile
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePlant(activePlant.id)}
                        className="p-1.5 text-[#b95835] hover:bg-[#fbeee9] rounded-lg transition-colors cursor-pointer"
                        title="Remove plant"
                        aria-label="Remove plant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Growth Stage Selector Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#144229] block">
                      Update Current Growth Stage:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {GROWTH_STAGES.map((st) => {
                        const isCurrent = activePlant.currentStage === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStageChange(activePlant.id, st)}
                            className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#144229] text-white border-[#0f2e1d] shadow-xs'
                                : 'bg-[#fbf9f4] text-[#4b6351] border-[#ded5c5] hover:bg-[#eef5ee]'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Environment & Placement Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                    <div className="p-3 rounded-xl bg-[#f7f5ed] border border-[#e2dbce]">
                      <span className="text-[#6d8573] block text-[11px]">Location</span>
                      <strong className="text-[#0c2417]">{activePlant.location || 'Balcony Rack'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f7f5ed] border border-[#e2dbce]">
                      <span className="text-[#6d8573] block text-[11px]">Rack Tier</span>
                      <strong className="text-[#0c2417] capitalize">{activePlant.tier || 'Middle'} Shelf</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f7f5ed] border border-[#e2dbce] col-span-2 sm:col-span-1">
                      <span className="text-[#6d8573] block text-[11px]">Container Depth</span>
                      <strong className="text-[#0c2417]">{activeBotanical?.potting.minDepthCm || 20} cm depth</strong>
                    </div>
                  </div>
                </div>

                {/* Add New Dated Growth Note Form */}
                <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#0c2417] flex items-center gap-2">
                    <Sprout size={18} className="text-[#1e613b]" />
                    <span>Record Growth Observation</span>
                  </h3>

                  <form onSubmit={handleAddNote} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                          Log Date
                        </label>
                        <input
                          type="date"
                          value={noteDate}
                          onChange={(e) => setNoteDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                          Measured Height (cm, optional)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 14.5"
                          value={noteHeight}
                          onChange={(e) => setNoteHeight(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0c2417] mb-1">
                        Observation / Action Taken
                      </label>
                      <textarea
                        rows={2}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="e.g. Pinched center bud, saw first true leaf, watered with diluted seaweed..."
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#ded5c5] bg-[#fbf9f4] text-[#0c2417] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b5837]"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={submittingNote}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#144229] hover:bg-[#0c2417] disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        {submittingNote ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Saving Observation...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Add Observation to Log</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Growth History Timeline */}
                <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
                    <h3 className="font-serif font-bold text-base text-[#0c2417] flex items-center gap-2">
                      <Clock size={18} className="text-[#1e613b]" />
                      <span>Developmental History ({activePlant.notes?.length || 0} records)</span>
                    </h3>
                    <span className="text-xs text-[#647f6c]">Chronological order</span>
                  </div>

                  {!activePlant.notes || activePlant.notes.length === 0 ? (
                    <p className="text-xs text-[#647f6c] italic text-center py-6">
                      No growth notes recorded yet. Add your first note using the form above!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activePlant.notes
                        .slice()
                        .reverse()
                        .map((note) => (
                          <div
                            key={note.id}
                            className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] flex items-start justify-between gap-4 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="sage" size="sm">{note.stage}</Badge>
                                <span className="text-[#647f6c] flex items-center gap-1 text-[11px]">
                                  <Calendar size={12} /> {note.date}
                                </span>
                              </div>
                              <p className="text-[#2c3d30] leading-relaxed pt-0.5">
                                {note.text}
                              </p>
                            </div>

                            {note.heightCm !== undefined && (
                              <span className="shrink-0 font-mono text-[11px] font-semibold text-[#1e613b] bg-white px-2.5 py-1 rounded-lg border border-[#cfdfcf] flex items-center gap-1">
                                <Ruler size={12} /> {note.heightCm} cm
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
        <div className="min-h-screen flex items-center justify-center text-xs text-[#526a57]">
          Loading your garden log...
        </div>
      }
    >
      <MyGardenContent />
    </React.Suspense>
  );
}
