'use client';

import * as React from 'react';
import { useState, useEffect, type FormEvent } from 'react';
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
  calculatePlantAge,
  calculateHarvestWindow,
  createPropagatedPlant,
} from '@/lib/storage';
import { UserPlant, GrowthStage, CareTask } from '@/types/garden';
import { PlantPhotoGallery } from '@/components/garden/PlantPhotoGallery';
import { PlantImage } from '@/components/plants/PlantImage';
import { PropagationModal } from '@/components/garden/PropagationModal';
import { PlantLineageBadge } from '@/components/garden/PlantLineageBadge';
import { PlantHealthBadge } from '@/components/garden/PlantHealthBadge';
import { GardenHealthOverviewCard } from '@/components/garden/GardenHealthOverviewCard';
import { PlantHealthTab } from '@/components/garden/PlantHealthTab';
import { PlantTimelineTab } from '@/components/garden/PlantTimelineTab';
import { PlantRemindersCard } from '@/components/garden/PlantRemindersCard';
import { FriendlyEmptyState } from '@/components/ui/FriendlyEmptyState';
import { useGrowToast } from '@/components/ui/GrowSuccessToast';
import { PlantIntelligenceTab } from '@/components/garden/PlantIntelligenceTab';
import { PlantConditionsTab } from '@/components/garden/PlantConditionsTab';
import { PlantFeedingTab } from '@/components/garden/PlantFeedingTab';
import { PlantProductionTab } from '@/components/garden/PlantProductionTab';
import {
  fetchGrowingConditions,
  fetchFeedingRecords,
  fetchPropagationEvents,
  fetchHarvestRecords,
} from '@/lib/grow-intelligence/storage';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  HarvestRecord,
} from '@/types/grow-intelligence';
import { fetchAllGardenDiagnoses } from '@/lib/ai-doctor/persistence';
import {
  getGardenHealthOverview,
  getPlantHealthSummary,
} from '@/lib/plant-health-status';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
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
  Camera,
  Scissors,
  Activity,
  GitBranch,
  Bell,
  Thermometer,
  ShoppingBag,
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
  const { showSuccess } = useGrowToast();

  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [diagnosesByPlantId, setDiagnosesByPlantId] = useState<Record<string, SavedDiagnosisRecord[]>>({});
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'journal' | 'photos' | 'health' | 'timeline' | 'reminders' | 'intelligence' | 'conditions' | 'feeding' | 'production'
  >('journal');
  const [conditions, setConditions] = useState<GrowingConditionObservation[]>([]);
  const [feedings, setFeedings] = useState<FeedingRecord[]>([]);
  const [propagations, setPropagations] = useState<PropagationEvent[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [showPropagationModal, setShowPropagationModal] = useState<boolean>(false);
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
      // Step 1: Immediately fetch and render primary garden & tasks
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
        setErrorBanner((prev: string | null) => prev || `Failed to load care tasks: ${tasksRes.error}`);
      } else {
        setCareTasks(tasksRes.tasks);
      }

      // Allow UI to render immediately with primary specimens
      setLoading(false);

      // Step 2: Progressively fetch secondary telemetry in parallel
      const [healthRes, condRes, feedRes, propRes, harvRes] = await Promise.all([
        fetchAllGardenDiagnoses(),
        fetchGrowingConditions(),
        fetchFeedingRecords(),
        fetchPropagationEvents(),
        fetchHarvestRecords(),
      ]);

      if (healthRes.diagnosesByPlantId) {
        setDiagnosesByPlantId(healthRes.diagnosesByPlantId);
      }

      setConditions(condRes.observations || []);
      setFeedings(feedRes.records || []);
      setPropagations(propRes.events || []);
      setHarvests(harvRes.records || []);
    } catch (err: any) {
      setErrorBanner(err.message || 'Error loading garden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'health') {
      setActiveTab('health');
    } else if (tabParam === 'timeline') {
      setActiveTab('timeline');
    } else if (tabParam === 'reminders') {
      setActiveTab('reminders');
    } else if (tabParam === 'intelligence') {
      setActiveTab('intelligence');
    } else if (tabParam === 'conditions') {
      setActiveTab('conditions');
    } else if (tabParam === 'feeding') {
      setActiveTab('feeding');
    } else if (tabParam === 'production') {
      setActiveTab('production');
    }
    setNoteDate(new Date().toISOString().split('T')[0]);
    loadGardenData();
  }, [user, highlightPlantId, searchParams]);

  const activePlant = userPlants.find((p: UserPlant) => p.id === selectedPlantId) || userPlants[0];
  const activeBotanical = activePlant
    ? PLANTS_DATA.find((p) => p.slug === activePlant.plantSlug)
    : null;
  const plantAge = activePlant ? calculatePlantAge(activePlant.plantedDate) : null;
  const harvestWindow = activePlant
    ? calculateHarvestWindow(
      activePlant.plantedDate,
      activePlant.plantSlug,
      activePlant.currentStage,
      activePlant.actualHarvestDate
    )
    : null;

  // Health calculations
  const plantHealthMap: Record<string, { status: string; activeIssue?: string | null; isDue: boolean }> = {};
  for (const p of userPlants) {
    const list = diagnosesByPlantId[p.id] || [];
    const sum = getPlantHealthSummary(list);
    plantHealthMap[p.id] = {
      status: sum.status,
      activeIssue: sum.activeIssue,
      isDue: sum.isFollowUpDue,
    };
  }

  const gardenOverview = getGardenHealthOverview(userPlants, diagnosesByPlantId);
  const activePlantDiagnoses = activePlant ? (diagnosesByPlantId[activePlant.id] || []) : [];
  const activePlantHealthSummary = getPlantHealthSummary(activePlantDiagnoses);

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
    showSuccess('🌱 Milestone updated!', `${activePlant?.nickname || 'Your plant'} moved to the ${newStage} stage.`, '🌱');
  };

  const handleAddNote = async (e: FormEvent) => {
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
    showSuccess('🌱 Note saved!', 'Your observation has been recorded in the journal.', '🌱');
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
    if (!task.completed) {
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
    <div className="min-h-screen flex flex-col bg-[#F8F6EE]">
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
          <div className="bg-[#FBE9E2] border border-[#E4775D/30] p-4 rounded-2xl flex items-start gap-3.5 text-sm text-[#963A23] shadow-xs">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Action Alert</span>
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-[#963A23] underline font-semibold min-h-[44px] flex items-center cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sync Mode Banner */}
        <div className="bg-white border border-[#E3DFD2] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#5F6D63] shadow-xs">
          <div className="flex items-center gap-3">
            {isCloud ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0">
                  <Cloud size={20} />
                </div>
                <div>
                  <span className="font-bold text-[#203027] block">Synced to Your Account</span>
                  <span className="text-xs text-[#5F6D63]">
                    Logged in as <strong>{user?.email}</strong>. Your garden data is securely backed up.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#FFF3D7] text-[#8A6400] flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <span className="font-bold text-[#203027] block">Guest Mode</span>
                  <span className="text-xs text-[#5F6D63]">
                    Plants are safely saved on this device.{' '}
                    {isConfigured && (
                      <Link href="/auth/login" className="font-semibold text-[#174C35] underline hover:no-underline">
                        Sign In
                      </Link>
                    )}{' '}
                    to sync across your devices.
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
                className="text-xs font-semibold text-[#174C35] hover:underline cursor-pointer min-h-[44px] flex items-center"
              >
                Reset Demo Plants
              </button>
            )}
          </div>
        </div>

        {/* Import Banner when logged in and local plants exist */}
        {isCloud && hasLocalDemoData() && (
          <div className="bg-[#EAF1E4] border border-[#E3DFD2] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#174C35]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0">
                <UploadCloud size={20} />
              </div>
              <div>
                <strong className="block text-[#203027] font-serif text-base">Local Browser Plants Detected</strong>
                <span className="text-xs text-[#174C35]">
                  You have plants saved from local browsing. Bring them into your cloud account in one tap.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleImportLocalToCloud}
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#174C35] hover:bg-[#203027] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0 min-h-[44px]"
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
          <div className="bg-[#EAF1E4] border border-[#E3DFD2] p-4 rounded-2xl text-xs sm:text-sm text-[#174C35] flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Loading & Empty States */}
        {loading && userPlants.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 max-w-full animate-pulse">
            <div className="col-span-1 lg:col-span-4 space-y-4">
              <div className="h-6 w-36 bg-[#E3DFD2] rounded-md" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white border border-[#E3DFD2] flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#E3DFD2] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 bg-[#E3DFD2] rounded-md" />
                      <div className="h-3 w-40 bg-[#EAF1E4] rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 lg:col-span-8">
              <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 space-y-5">
                <div className="h-8 w-48 bg-[#E3DFD2] rounded-xl" />
                <div className="h-4 w-72 bg-[#EAF1E4] rounded-md" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !loading && userPlants.length === 0 ? (
          <FriendlyEmptyState
            emoji="🌱"
            title={isCloud ? 'Your Cloud Garden is Empty' : 'Your Garden Journal is Ready'}
            description="Add your first companion plant from our curated botanical profiles. Track growth stages, care tasks, and daily observations."
            actionHref="/app/plants"
            actionLabel="Explore Plant Catalog"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 max-w-full">
            {/* Mobile / Tablet Compact Plant Selector Rail (< lg) */}
            <div className="lg:hidden col-span-1 space-y-3 min-w-0 max-w-full">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#203027]">
                    My Garden ({userPlants.length})
                  </h3>
                  <p className="text-xs text-[#5F6D63]">Tap a specimen to view its journal</p>
                </div>
                <Link
                  href="/app/plants"
                  className="text-xs font-semibold text-[#174C35] hover:text-[#203027] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#EAF1E4] transition-colors min-h-[40px]"
                >
                  <Plus size={14} />
                  <span>Add Plant</span>
                </Link>
              </div>

              {/* Horizontally scrollable plant rail */}
              <div
                className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
              >
                {userPlants.map((plant) => {
                  const isSelected = plant.id === activePlant?.id;
                  const botanical = PLANTS_DATA.find((p) => p.slug === plant.plantSlug);

                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer shrink-0 min-h-[52px] text-left select-none ${isSelected
                          ? 'bg-[#174C35] text-white border-[#174C35] shadow-sm ring-2 ring-[#174C35]/20'
                          : 'bg-white text-[#203027] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-black/5 relative">
                        <PlantImage
                          src={botanical?.imageUrl}
                          alt={plant.nickname}
                          category={botanical?.category || 'herbs-greens'}
                          aspectRatio="square"
                          sizes="40px"
                        />
                      </div>
                      <div className="pr-1.5 max-w-[140px]">
                        <p className="font-serif font-bold text-xs truncate">
                          {plant.nickname}
                        </p>
                        <p
                          className={`text-[10px] truncate ${isSelected ? 'text-[#E3DFD2]' : 'text-[#5F6D63]'
                            }`}
                        >
                          {plant.currentStage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Left Column: Plant Selection Sidebar (Desktop only ≥ lg) */}
            <div className="hidden lg:block lg:col-span-4 space-y-5 min-w-0 max-w-full">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#203027]">
                    My Garden ({userPlants.length})
                  </h3>
                  <p className="text-xs text-[#5F6D63]">Select a specimen to open its journal</p>
                </div>
                <Link
                  href="/app/plants"
                  className="text-xs font-semibold text-[#174C35] hover:text-[#203027] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DFD2] bg-white hover:bg-[#EAF1E4] transition-colors min-h-[40px]"
                >
                  <Plus size={14} />
                  <span>Add Plant</span>
                </Link>
              </div>

              {/* Plant selection list */}
              <div className="space-y-2.5">
                {userPlants.map((plant) => {
                  const isSelected = plant.id === activePlant?.id;
                  const botanical = PLANTS_DATA.find((p) => p.slug === plant.plantSlug);

                  return (
                    <div
                      key={plant.id}
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between min-h-[56px] ${isSelected
                          ? 'bg-[#174C35] text-white border-[#174C35] shadow-sm ring-2 ring-[#174C35]/20'
                          : 'bg-white text-[#203027] border-[#E3DFD2] hover:bg-[#EAF1E4] hover:border-[#174C35]'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-black/5 relative">
                          <PlantImage
                            src={botanical?.imageUrl}
                            alt={plant.nickname}
                            category={botanical?.category || 'herbs-greens'}
                            aspectRatio="square"
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif font-bold text-sm sm:text-base truncate">
                              {plant.nickname}
                            </h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${isSelected
                                  ? 'bg-white/25 text-white'
                                  : 'bg-[#EAF1E4] text-[#174C35]'
                                }`}
                            >
                              {plant.currentStage}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <p
                              className={`text-xs truncate ${isSelected ? 'text-[#E3DFD2]' : 'text-[#5F6D63]'
                                }`}
                            >
                              {botanical?.commonName} • {plant.notes?.length || 0} note(s)
                            </p>
                            {plantHealthMap[plant.id]?.status !== 'unknown' && (
                              <PlantHealthBadge
                                status={plantHealthMap[plant.id].status as any}
                                size="xs"
                                className={isSelected ? '!bg-white/20 !text-white !border-white/30' : ''}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`shrink-0 ${isSelected ? 'text-white' : 'text-[#5F6D63]'}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Garden-Wide Health Overview Card */}
              <GardenHealthOverviewCard
                overview={gardenOverview}
                plants={userPlants}
                onSelectPlant={(id) => {
                  setSelectedPlantId(id);
                  setActiveTab('health');
                }}
                plantHealthMap={plantHealthMap}
              />

              {/* Plant Care Tasks Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E3DFD2] space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD2]">
                  <h4 className="font-serif font-bold text-sm text-[#203027] flex items-center gap-2">
                    <Droplets size={16} className="text-[#174C35]" />
                    <span>Care Tasks</span>
                  </h4>
                  <span className="text-xs font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-0.5 rounded-full">
                    {careTasks.filter((t) => !t.completed).length} pending
                  </span>
                </div>

                <div className="space-y-2.5">
                  {careTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskToggle(task)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer flex items-start gap-3 transition-colors min-h-[48px] ${task.completed
                          ? 'bg-[#F8F6EE] border-[#E3DFD2] opacity-60'
                          : 'bg-[#F8F6EE] border-[#E3DFD2] hover:border-[#174C35] hover:bg-white'
                        }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-[#174C35] focus:outline-none cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
                        aria-label={`Toggle task ${task.title}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={18} className="text-[#174C35]" />
                        ) : (
                          <Circle size={18} className="text-[#78A95A]" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${task.completed ? 'line-through text-[#5F6D63]' : 'text-[#203027]'
                            }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-[#5F6D63] mt-0.5">
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
              <div className="lg:col-span-8 space-y-6 min-w-0 max-w-full">
                {/* Active Plant Banner Card */}
                <div className="bg-white rounded-3xl border border-[#E3DFD2] p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6 min-w-0 max-w-full overflow-hidden">
                  <div className="flex flex-col sm:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-5 border-b border-[#E3DFD2]">
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      {activeBotanical?.imageUrl && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-[#E3DFD2] shadow-xs relative">
                          <PlantImage
                            src={activeBotanical.imageUrl}
                            alt={activePlant.nickname}
                            category={activeBotanical.category}
                            aspectRatio="square"
                            sizes="64px"
                            priority={true}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h2 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-[#203027] truncate max-w-full">
                            {activePlant.nickname}
                          </h2>
                          <Badge variant="sage" size="md">{activePlant.currentStage}</Badge>
                          <PlantHealthBadge status={activePlantHealthSummary.status} size="sm" />
                          {activePlantHealthSummary.activeIssue && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF3D7] text-[#8A6400] border border-[#F0C04D/30]">
                              <AlertCircle size={13} />
                              Issue: {activePlantHealthSummary.activeIssue}
                            </span>
                          )}
                          {plantAge && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF1E4] text-[#174C35] border border-[#E3DFD2]">
                              <Sprout size={13} className="text-[#174C35]" />
                              Day {plantAge.daysSincePlanting} ({plantAge.formattedPlantedDate})
                            </span>
                          )}
                          {harvestWindow && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${harvestWindow.status === 'in_window'
                                  ? 'bg-[#EAF1E4] text-[#174C35] border-[#EAF1E4] animate-pulse'
                                  : harvestWindow.status === 'harvested'
                                    ? 'bg-[#FFF3D7] text-[#8A6400] border-[#F0C04D/30]'
                                    : harvestWindow.status === 'past_window'
                                      ? 'bg-[#FFF3D7] text-[#8A6400] border-[#FFF3D7]'
                                      : 'bg-[#F8F6EE] text-[#5F6D63] border-[#E3DFD2]'
                                }`}
                            >
                              <Calendar size={13} />
                              {harvestWindow.headline}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[#5F6D63] mt-1.5">
                          {activeBotanical?.commonName} (<em>{activeBotanical?.scientificName}</em>) • Planted on{' '}
                          {activePlant.plantedDate}
                          {activePlant.actualHarvestDate && (
                            <span className="ml-2 font-medium text-[#8A6400]">
                              • Confirmed Harvest: {activePlant.actualHarvestDate}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="w-full min-w-0 pt-2 sm:pt-0">
                      {/* Responsive Action Tabs Rail */}
                      <div
                        className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full min-w-0 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap"
                        style={{
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveTab('intelligence')}
                          className={`text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0 cursor-pointer ${activeTab === 'intelligence'
                              ? 'bg-[#174C35] text-white border-[#174C35] shadow-xs'
                              : 'bg-white text-[#174C35] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                            }`}
                          title="View Grow Intelligence synthesis"
                        >
                          <Sparkles size={15} />
                          <span>Intelligence</span>
                        </button>
                        <Link
                          href={`/app/my-garden/${activePlant.id}/timeline`}
                          className="text-xs sm:text-sm font-semibold text-[#174C35] hover:bg-[#EAF1E4] px-3.5 sm:px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-white transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0"
                          title="View complete longitudinal growth timeline"
                        >
                          <GitBranch size={15} />
                          <span>Timeline</span>
                        </Link>
                        <Link
                          href={`/app/my-garden/${activePlant.id}/health`}
                          className="text-xs sm:text-sm font-semibold text-[#174C35] hover:bg-[#EAF1E4] px-3.5 sm:px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-white transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0"
                          title="View complete health history and follow-ups"
                        >
                          <Activity size={15} />
                          <span>Health</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveTab('reminders')}
                          className={`text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0 cursor-pointer ${activeTab === 'reminders'
                              ? 'bg-[#174C35] text-white border-[#174C35] shadow-xs'
                              : 'bg-white text-[#174C35] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                            }`}
                          title="View reminders for this plant"
                        >
                          <Bell size={15} />
                          <span>Reminders</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPropagationModal(true)}
                          className="text-xs sm:text-sm font-semibold text-[#174C35] hover:bg-[#EAF1E4] px-3.5 sm:px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-white transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0 cursor-pointer"
                          title="Propagate this plant"
                        >
                          <Scissors size={15} />
                          <span>Propagate</span>
                        </button>
                        {activeBotanical && (
                          <Link
                            href={`/app/plants/${activeBotanical.slug}`}
                            className="text-xs sm:text-sm font-semibold text-[#174C35] hover:bg-[#EAF1E4] px-3.5 sm:px-4 py-2.5 rounded-xl border border-[#E3DFD2] bg-white transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0"
                          >
                            <BookOpen size={15} />
                            <span>Botanical Guide</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePlant(activePlant.id)}
                          className="p-2.5 text-[#963A23] hover:bg-[#FBE9E2] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 ml-auto"
                          title="Remove plant"
                          aria-label="Remove plant"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Plant Lineage & Offspring Badge */}
                  <PlantLineageBadge
                    currentPlant={activePlant}
                    allPlants={userPlants}
                    onSelectPlant={(plantId) => setSelectedPlantId(plantId)}
                    onOpenPropagationModal={() => setShowPropagationModal(true)}
                  />

                  {/* Supportive Botanical Message Box */}
                  <div className="bg-[#EAF1E4] border border-[#E3DFD2] p-3.5 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-3.5 text-xs sm:text-sm text-[#174C35]">
                    <Sparkles size={20} className="text-[#174C35] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#203027] font-serif text-sm sm:text-base mb-0.5">
                        Botanist Guidance
                      </strong>
                      <p className="leading-relaxed">
                        {getStageSupportiveMessage(activePlant.nickname, activePlant.currentStage, activeBotanical?.commonName)}
                      </p>
                    </div>
                  </div>

                  {/* Harvest Timeline & Phenology Intelligence */}
                  {harvestWindow && (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 text-xs sm:text-sm ${harvestWindow.status === 'in_window'
                          ? 'bg-[#EAF1E4] border-[#EAF1E4] text-[#174C35]'
                          : harvestWindow.status === 'harvested'
                            ? 'bg-[#FFF3D7] border-[#F0C04D/30] text-[#8A6400]'
                            : harvestWindow.status === 'past_window'
                              ? 'bg-[#FFF3D7] border-[#F0C04D/30] text-[#963A23]'
                              : 'bg-[#F8F6EE] border-[#E3DFD2] text-[#174C35]'
                        }`}
                    >
                      <div className="p-2 rounded-xl bg-white/80 shrink-0">
                        <Sparkles size={18} className="text-[#174C35]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <strong className="font-serif font-bold text-sm text-[#203027]">
                            {harvestWindow.headline}
                          </strong>
                          {harvestWindow.estimatedMinDate && (
                            <span className="text-xs font-mono font-medium opacity-80">
                              Estimated Window: {harvestWindow.estimatedMinDate} – {harvestWindow.estimatedMaxDate}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 leading-relaxed opacity-90">{harvestWindow.detail}</p>
                      </div>
                    </div>
                  )}

                  {/* Growth Stage Stepper */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#174C35] block">
                      Growth Stage Milestone (Click to update):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                      {GROWTH_STAGES.map((st, index) => {
                        const isCurrent = activePlant.currentStage === st;
                        const currentIndex = GROWTH_STAGES.indexOf(activePlant.currentStage);
                        const isPast = index < currentIndex;

                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStageChange(activePlant.id, st)}
                            className={`py-2 sm:py-3 px-1.5 sm:px-2 text-xs font-semibold rounded-xl border text-center transition-all duration-75 active:scale-95 select-none touch-manipulation cursor-pointer min-h-[44px] flex flex-col items-center justify-center gap-1 ${isCurrent
                                ? 'bg-[#174C35] text-white border-[#123C2A] shadow-sm ring-2 ring-[#174C35]/20 font-bold'
                                : isPast
                                  ? 'bg-[#EAF1E4] text-[#174C35] border-[#E3DFD2] hover:bg-[#EAF1E4]'
                                  : 'bg-[#F8F6EE] text-[#5F6D63] border-[#E3DFD2] hover:bg-white'
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
                    <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2]">
                      <span className="text-[#5F6D63] block text-xs mb-1">Assigned Location</span>
                      <strong className="text-[#203027] text-sm">{activePlant.location || 'Balcony Vertical Rack'}</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2]">
                      <span className="text-[#5F6D63] block text-xs mb-1">Vertical Tier Zone</span>
                      <strong className="text-[#203027] text-sm capitalize">{activePlant.tier || 'Middle'} Tier</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2]">
                      <span className="text-[#5F6D63] block text-xs mb-1">Container Depth</span>
                      <strong className="text-[#203027] text-sm">{activeBotanical?.potting.minDepthCm || 20} cm depth</strong>
                    </div>
                  </div>
                </div>

                {/* Journal View Switcher: Intelligence vs Conditions vs Feeding vs Production vs Care vs Photos vs Health vs Timeline vs Reminders */}
                <div
                  className="flex items-center gap-2 border-b border-[#E3DFD2] pb-3 overflow-x-auto scrollbar-none w-full min-w-0 sm:flex-wrap"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('intelligence')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'intelligence'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Sparkles size={15} />
                    <span>Intelligence</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('conditions')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'conditions'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Thermometer size={15} />
                    <span>Conditions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('feeding')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'feeding'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Droplets size={15} />
                    <span>Feeding</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('production')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'production'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <ShoppingBag size={15} />
                    <span>Production & Yield</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('journal')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'journal'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Clock size={15} />
                    <span>Care ({activePlant.notes?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('photos')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'photos'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Camera size={15} />
                    <span>Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('health')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'health'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Activity size={15} />
                    <span>Health ({activePlantDiagnoses.length})</span>
                    {activePlantHealthSummary.status !== 'unknown' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('timeline')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'timeline'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <GitBranch size={15} />
                    <span>Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('reminders')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${activeTab === 'reminders'
                        ? 'bg-[#174C35] text-white shadow-xs'
                        : 'bg-white text-[#5F6D63] hover:bg-[#EAF1E4] hover:text-[#174C35] border border-[#E3DFD2]'
                      }`}
                  >
                    <Bell size={15} />
                    <span>Reminders</span>
                  </button>
                </div>

                {/* Tab 1: Care & Observations */}
                {activeTab === 'journal' && (
                  <>
                    {/* Add New Dated Growth Note Form */}
                    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-5">
                      <div className="flex items-center gap-3 pb-3 border-b border-[#E3DFD2]">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
                          <Sprout size={20} />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#203027]">
                            Record Growth Observation
                          </h3>
                          <p className="text-xs text-[#5F6D63]">
                            Log height, stem branching, pests, or watering adjustments
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAddNote} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#203027] mb-1.5">
                              Observation Date
                            </label>
                            <input
                              type="date"
                              value={noteDate}
                              onChange={(e) => setNoteDate(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#203027] mb-1.5">
                              Measured Height (cm, optional)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="e.g. 14.5"
                              value={noteHeight}
                              onChange={(e) => setNoteHeight(e.target.value)}
                              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] min-h-[44px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#203027] mb-1.5">
                            Botanical Notes & Actions Taken
                          </label>
                          <textarea
                            rows={3}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="e.g. Emergence of third set of serrated leaves, trimmed center tip to encourage side branching, topsoil moist..."
                            required
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-[#E3DFD2] bg-[#F8F6EE] text-[#203027] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174C35] leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={submittingNote}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold bg-[#174C35] hover:bg-[#203027] disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer min-h-[44px] transition-colors"
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
                    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 sm:p-8 shadow-xs space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD2]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center">
                            <Clock size={20} />
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-[#203027]">
                              Observation Timeline
                            </h3>
                            <p className="text-xs text-[#5F6D63]">
                              {activePlant.notes?.length || 0} chronological records logged
                            </p>
                          </div>
                        </div>
                      </div>

                      {!activePlant.notes || activePlant.notes.length === 0 ? (
                        <div className="text-center py-10 space-y-2 bg-[#F8F6EE] rounded-2xl border border-dashed border-[#E3DFD2]">
                          <Sprout size={28} className="text-[#5F6D63] mx-auto" />
                          <p className="text-sm font-serif font-bold text-[#203027]">No Observations Yet</p>
                          <p className="text-xs text-[#5F6D63] max-w-sm mx-auto">
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
                                className="p-4 sm:p-5 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs sm:text-sm"
                              >
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2.5">
                                    <Badge variant="sage" size="sm">{note.stage}</Badge>
                                    <span className="text-[#5F6D63] flex items-center gap-1.5 text-xs">
                                      <Calendar size={13} /> {note.date}
                                    </span>
                                  </div>
                                  <p className="text-[#203027] leading-relaxed pt-1 text-sm">
                                    {note.text}
                                  </p>
                                </div>

                                {note.heightCm !== undefined && (
                                  <span className="shrink-0 font-mono text-xs font-semibold text-[#174C35] bg-white px-3 py-1.5 rounded-xl border border-[#E3DFD2] flex items-center gap-1.5 self-start sm:self-auto">
                                    <Ruler size={13} /> {note.heightCm} cm
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Tab: Grow Intelligence Synthesis */}
                {activeTab === 'intelligence' && (
                  <PlantIntelligenceTab
                    plant={activePlant}
                    diagnoses={activePlantDiagnoses}
                    conditions={conditions}
                    feedings={feedings}
                    propagations={propagations}
                    harvests={harvests}
                    onNavigateTab={(tab) => setActiveTab(tab as any)}
                  />
                )}

                {/* Tab: Growing Conditions */}
                {activeTab === 'conditions' && (
                  <PlantConditionsTab
                    plant={activePlant}
                    conditions={conditions}
                    onConditionAdded={loadGardenData}
                  />
                )}

                {/* Tab: Feeding & Fertilization */}
                {activeTab === 'feeding' && (
                  <PlantFeedingTab
                    plant={activePlant}
                    feedings={feedings}
                    onFeedingAdded={loadGardenData}
                  />
                )}

                {/* Tab: Production, Propagation & Yield */}
                {activeTab === 'production' && (
                  <PlantProductionTab
                    plant={activePlant}
                    allPlants={userPlants}
                    propagations={propagations}
                    harvests={harvests}
                    onDataChanged={loadGardenData}
                    onSelectPlant={(plantId) => setSelectedPlantId(plantId)}
                  />
                )}

                {/* Tab: Photo Journal */}
                {activeTab === 'photos' && (
                  <PlantPhotoGallery
                    plantId={activePlant.id}
                    plantNickname={activePlant.nickname}
                    currentStage={activePlant.currentStage}
                    isCloud={isCloud}
                  />
                )}

                {/* Tab: Health & Follow-ups */}
                {activeTab === 'health' && (
                  <PlantHealthTab
                    plant={activePlant}
                    isCloud={isCloud}
                    onRefreshNeeded={loadGardenData}
                  />
                )}

                {/* Tab: Growth Timeline */}
                {activeTab === 'timeline' && (
                  <PlantTimelineTab
                    plant={activePlant}
                    parentPlant={
                      activePlant.parentPlantId
                        ? userPlants.find((p) => p.id === activePlant.parentPlantId) || null
                        : null
                    }
                    isCloud={isCloud}
                    diagnoses={activePlantDiagnoses}
                    tasks={careTasks}
                    conditions={conditions}
                    feedings={feedings}
                    propagations={propagations}
                    harvests={harvests}
                    onRefreshNeeded={loadGardenData}
                  />
                )}

                {/* Tab: Plant Reminders */}
                {activeTab === 'reminders' && (
                  <PlantRemindersCard
                    plant={activePlant}
                    onRefreshNeeded={loadGardenData}
                  />
                )}

                {/* Mobile / Tablet: Garden Health Overview & Care Tasks (< lg) */}
                <div className="lg:hidden space-y-5 pt-4 min-w-0 max-w-full">
                  <GardenHealthOverviewCard
                    overview={gardenOverview}
                    plants={userPlants}
                    onSelectPlant={(id) => {
                      setSelectedPlantId(id);
                      setActiveTab('health');
                    }}
                    plantHealthMap={plantHealthMap}
                  />

                  {/* Plant Care Tasks Card */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E3DFD2] space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD2]">
                      <h4 className="font-serif font-bold text-sm text-[#203027] flex items-center gap-2">
                        <Droplets size={16} className="text-[#174C35]" />
                        <span>Care Tasks</span>
                      </h4>
                      <span className="text-xs font-semibold text-[#174C35] bg-[#EAF1E4] px-2.5 py-0.5 rounded-full">
                        {careTasks.filter((t) => !t.completed).length} pending
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {careTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleTaskToggle(task)}
                          className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer flex items-start gap-3 transition-colors min-h-[48px] ${task.completed
                              ? 'bg-[#F8F6EE] border-[#E3DFD2] opacity-60'
                              : 'bg-[#F8F6EE] border-[#E3DFD2] hover:border-[#174C35] hover:bg-white'
                            }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-[#174C35] focus:outline-none cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
                            aria-label={`Toggle task ${task.title}`}
                          >
                            {task.completed ? (
                              <CheckCircle2 size={18} className="text-[#174C35]" />
                            ) : (
                              <Circle size={18} className="text-[#78A95A]" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${task.completed ? 'line-through text-[#5F6D63]' : 'text-[#203027]'
                                }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-xs text-[#5F6D63] mt-0.5">
                              {task.plantName.split('(')[0]} • Due {task.dueDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Propagation Workflow Modal */}
        {showPropagationModal && activePlant && (
          <PropagationModal
            parentPlant={activePlant}
            isOpen={showPropagationModal}
            onClose={() => setShowPropagationModal(false)}
            onPropagateSuccess={async (newPlant) => {
              await loadGardenData();
              setSelectedPlantId(newPlant.id);
              setShowPropagationModal(false);
            }}
            createPropagatedPlantFn={createPropagatedPlant}
          />
        )}
      </div>
    </div>
  );
}

export default function MyGardenPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#5F6D63] bg-[#F8F6EE]">
          Loading your garden journal...
        </div>
      }
    >
      <MyGardenContent />
    </React.Suspense>
  );
}
