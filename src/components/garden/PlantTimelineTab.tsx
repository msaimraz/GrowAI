'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlantTimelineEvent,
  PlantTimelineFilter,
  PlantGrowthSummary,
} from '@/types/timeline';
import { UserPlant, CareTask, PlantPhoto } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import { buildPlantTimeline, filterTimelineEvents, formatTimelineDate } from '@/lib/plant-timeline';
import { fetchPlantPhotos } from '@/lib/photo-storage';
import {
  Sprout,
  Calendar,
  Sparkles,
  Camera,
  Activity,
  HeartHandshake,
  CheckCircle2,
  Scissors,
  GitBranch,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Clock,
  Ruler,
  AlertCircle,
  HelpCircle,
  Thermometer,
  Droplets,
  ShoppingBag,
} from 'lucide-react';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  HarvestRecord,
} from '@/types/grow-intelligence';

interface PlantTimelineTabProps {
  plant: UserPlant;
  parentPlant?: UserPlant | null;
  isCloud: boolean;
  diagnoses?: SavedDiagnosisRecord[];
  tasks?: CareTask[];
  onRefreshNeeded?: () => void;
  showFullTimelineLink?: boolean;
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  harvests?: HarvestRecord[];
}

export function PlantTimelineTab({
  plant,
  parentPlant,
  isCloud,
  diagnoses = [],
  tasks = [],
  onRefreshNeeded,
  showFullTimelineLink = true,
  conditions = [],
  feedings = [],
  propagations = [],
  harvests = [],
}: PlantTimelineTabProps) {
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(true);
  const [filter, setFilter] = useState<PlantTimelineFilter>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadPhotos() {
      setLoadingPhotos(true);
      try {
        const res = await fetchPlantPhotos(plant.id, isCloud);
        if (isMounted) {
          setPhotos(res.photos || []);
        }
      } catch (err) {
        console.error('Failed to load photos for timeline:', err);
      } finally {
        if (isMounted) setLoadingPhotos(false);
      }
    }
    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [plant.id, isCloud]);

  // Aggregate timeline deterministically
  const plantTasks = tasks.filter((t) => t.plantId === plant.id);
  const { events, summary } = buildPlantTimeline({
    plant,
    parentPlant,
    photos,
    tasks: plantTasks,
    diagnoses,
    conditions,
    feedings,
    propagations,
    harvests,
  });

  const filteredEvents = filterTimelineEvents(events, filter);

  // Category counts for filter badges
  const counts: Record<PlantTimelineFilter, number> = {
    all: events.length,
    growth: filterTimelineEvents(events, 'growth').length,
    photos: filterTimelineEvents(events, 'photos').length,
    health: filterTimelineEvents(events, 'health').length,
    care: filterTimelineEvents(events, 'care').length,
    harvest: filterTimelineEvents(events, 'harvest').length,
    propagation: filterTimelineEvents(events, 'propagation').length,
    intelligence: filterTimelineEvents(events, 'intelligence').length,
  };

  const getEventIcon = (event: PlantTimelineEvent) => {
    switch (event.eventType) {
      case 'planting':
        return <Sprout size={16} className="text-[#144229]" />;
      case 'plant_added':
        return <Calendar size={16} className="text-[#526a57]" />;
      case 'germination':
        return <Sparkles size={16} className="text-emerald-600" />;
      case 'transplant':
        return <Layers size={16} className="text-teal-600" />;
      case 'stage_change':
        return <Sprout size={16} className="text-[#144229]" />;
      case 'growth_observation':
        return <Clock size={16} className="text-[#526a57]" />;
      case 'photo':
        return <Camera size={16} className="text-amber-600" />;
      case 'health_assessment':
        return <Activity size={16} className="text-emerald-700" />;
      case 'treatment':
        return <HeartHandshake size={16} className="text-indigo-600" />;
      case 'health_follow_up':
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case 'care':
        return <CheckCircle2 size={16} className="text-blue-600" />;
      case 'feeding':
        return <Droplets size={16} className="text-emerald-600" />;
      case 'condition_observation':
        return <Thermometer size={16} className="text-amber-600" />;
      case 'propagation':
        return <GitBranch size={16} className="text-purple-600" />;
      case 'harvest':
        return <Scissors size={16} className="text-emerald-800" />;
      default:
        return <Clock size={16} className="text-[#526a57]" />;
    }
  };

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'critical':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'accent':
        return 'bg-[#eef5ee] text-[#144229] border-[#c2d9c6] font-semibold';
      default:
        return 'bg-[#f4efe6] text-[#526a57] border-[#ded5c5]';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Compact Growth Summary Card */}
      <div className="p-5 rounded-2xl bg-[#fbf9f4] border border-[#ded5c5] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ded5c5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6d8573]">
                Growth Timeline & Journal
              </span>
              {summary.hasPropagationLineage && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Propagated Lineage
                </span>
              )}
              {summary.isHarvested && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Harvested
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#0c2417] font-bold mt-1">
              {summary.nickname}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#144229] text-white shadow-xs">
              {summary.ageDisplay}
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#ded5c5] text-[#0c2417]">
              Stage: {summary.currentStage}
            </span>
            {summary.healthStatus && summary.healthStatus !== 'unknown' && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
                Health: {summary.healthStatusLabel || summary.healthStatus}
              </span>
            )}
            {showFullTimelineLink && (
              <Link
                href={`/app/my-garden/${plant.id}/timeline`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#144229] border border-[#144229] hover:bg-[#eef5ee] transition-all cursor-pointer min-h-[36px]"
              >
                <span>Full Timeline</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* Stage Progression Chain */}
        {summary.stageHistory.length > 1 && (
          <div className="py-3 border-b border-[#ded5c5] flex flex-wrap items-center gap-1.5 text-xs text-[#526a57]">
            <span className="font-semibold text-[#0c2417]">Observed Stages:</span>
            {summary.stageHistory.map((stg, idx) => (
              <React.Fragment key={stg}>
                <span
                  className={`px-2 py-0.5 rounded-md ${
                    stg === summary.currentStage
                      ? 'bg-[#144229] text-white font-bold'
                      : 'bg-white border border-[#ded5c5] text-[#526a57]'
                  }`}
                >
                  {stg}
                </span>
                {idx < summary.stageHistory.length - 1 && (
                  <ChevronRight size={13} className="text-[#a89f91]" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Botanical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 bg-white rounded-xl border border-[#ded5c5]">
            <span className="text-[#6d8573] block mb-0.5">Planted Date</span>
            <strong className="text-[#0c2417] text-sm">{summary.plantedDateDisplay}</strong>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#ded5c5]">
            <span className="text-[#6d8573] block mb-0.5">Last Observation</span>
            <strong className="text-[#0c2417] text-sm">{summary.lastObservationDateDisplay}</strong>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#ded5c5]">
            <span className="text-[#6d8573] block mb-0.5">Photo Journal</span>
            <strong className="text-[#0c2417] text-sm">{summary.totalPhotosCount} photos</strong>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#ded5c5]">
            <span className="text-[#6d8573] block mb-0.5">AI Health Records</span>
            <strong className="text-[#0c2417] text-sm">
              {summary.totalHealthAssessmentsCount} assessments
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Timeline Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-[#ded5c5] overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'growth', label: 'Growth' },
            { id: 'photos', label: 'Photos' },
            { id: 'health', label: 'Health' },
            { id: 'care', label: 'Care' },
            { id: 'harvest', label: 'Harvest' },
            { id: 'propagation', label: 'Propagation' },
          ] as const
        ).map((tab) => {
          const count = counts[tab.id];
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                isActive
                  ? 'bg-[#144229] text-white shadow-xs'
                  : 'bg-white text-[#526a57] hover:bg-[#eef5ee] hover:text-[#144229] border border-[#ded5c5]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#ded5c5] text-[#0c2417]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Chronological Botanical Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#ded5c5]">
          <Sprout className="w-10 h-10 text-[#6d8573] mx-auto mb-3 opacity-60" />
          <h4 className="font-serif text-lg font-bold text-[#0c2417] mb-1">
            No events in this category yet
          </h4>
          <p className="text-xs text-[#526a57] max-w-sm mx-auto mb-4">
            {filter === 'photos'
              ? 'Add progress photos from the Photo Journal tab to record visual changes.'
              : filter === 'health'
              ? 'Diagnose issues in AI Doctor to save assessments and follow-up observations.'
              : filter === 'harvest'
              ? 'Record a harvest date or set growth stage to Harvested to log lifecycle yields.'
              : 'Add care notes, observations, or photos to build this plant’s living story.'}
          </p>
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="text-xs font-semibold text-[#144229] underline cursor-pointer"
            >
              Show all timeline events
            </button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:sm:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#ded5c5]">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Stem Node Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-[#144229] flex items-center justify-center shadow-xs">
                  {getEventIcon(evt)}
                </div>
              </div>

              {/* Event Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ded5c5] hover:border-[#144229]/40 transition-all shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#144229]">
                      {formatTimelineDate(evt.eventDate)}
                    </span>
                    {evt.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeClasses(
                          evt.badge.variant
                        )}`}
                      >
                        {evt.badge.text}
                      </span>
                    )}
                    {evt.metadata?.heightCm && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef5ee] text-[#144229] border border-[#c2d9c6]">
                        {evt.metadata.heightCm} cm
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-[#6d8573] capitalize">
                    {evt.category}
                  </span>
                </div>

                <h4 className="font-serif text-base sm:text-lg font-bold text-[#0c2417] mb-1">
                  {evt.title}
                </h4>

                <p className="text-xs sm:text-sm text-[#526a57] leading-relaxed mb-3">
                  {evt.description}
                </p>

                {/* Optional Media Preview */}
                {evt.media?.signedUrl && (
                  <div className="mb-3">
                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-[#ded5c5] bg-[#fbf9f4]">
                      <img
                        src={evt.media.signedUrl}
                        alt={evt.media.caption || evt.title}
                        className="w-full h-48 object-cover hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      {evt.media.caption && (
                        <div className="p-2 text-[11px] text-[#526a57] bg-white/90 border-t border-[#ded5c5]">
                          {evt.media.caption}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Link (e.g. AI Doctor assessment link) */}
                {evt.actionLink && (
                  <div className="pt-2 border-t border-[#ded5c5]/60">
                    <Link
                      href={evt.actionLink.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144229] hover:underline cursor-pointer"
                    >
                      <span>{evt.actionLink.label}</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

