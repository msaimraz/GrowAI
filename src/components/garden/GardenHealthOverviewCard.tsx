'use client';

import React from 'react';
import Link from 'next/link';
import { GardenHealthOverview } from '@/types/diagnosis';
import { UserPlant } from '@/types/garden';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

interface GardenHealthOverviewCardProps {
  overview: GardenHealthOverview;
  plants: UserPlant[];
  onSelectPlant?: (plantId: string) => void;
  plantHealthMap: Record<string, { status: string; activeIssue?: string | null; isDue: boolean }>;
}

export function GardenHealthOverviewCard({
  overview,
  plants,
  onSelectPlant,
  plantHealthMap,
}: GardenHealthOverviewCardProps) {
  const hasAssessments = overview.assessedPlants > 0;

  // Find plants needing attention or monitoring for quick action pills
  const attentionPlants = plants.filter(
    (p) => plantHealthMap[p.id]?.status === 'needs_attention'
  );
  const monitoringPlants = plants.filter(
    (p) => plantHealthMap[p.id]?.status === 'monitoring'
  );
  const followUpDuePlants = plants.filter(
    (p) => plantHealthMap[p.id]?.isDue
  );

  return (
    <div className="bg-white rounded-3xl border border-[#E3DFD2] p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#E3DFD2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EAF1E4] text-[#174C35] flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#203027]">
              Plant Health Overview
            </h4>
            <p className="text-[11px] text-[#5F6D63]">
              {hasAssessments
                ? `${overview.assessedPlants} of ${overview.totalPlants} specimen(s) monitored`
                : 'No diagnostic assessments recorded yet'}
            </p>
          </div>
        </div>

        <Link
          href="/app/ai-doctor"
          className="text-xs font-semibold text-[#174C35] hover:underline flex items-center gap-1 min-h-[36px]"
        >
          <Stethoscope size={13} />
          <span>AI Doctor</span>
        </Link>
      </div>

      {!hasAssessments ? (
        <div className="p-4 rounded-2xl bg-[#F8F6EE] border border-dashed border-[#E3DFD2] text-center space-y-2">
          <p className="text-xs text-[#5F6D63] leading-relaxed">
            No health assessments yet. Diagnose chlorosis, spots, or pests with the AI Doctor to start monitoring.
          </p>
          <Link
            href="/app/ai-doctor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174C35] hover:underline pt-1"
          >
            <span>Scan your first plant</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Status metrics grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-center">
            <div
              className={`p-2 sm:p-2.5 rounded-xl border ${
                overview.needsAttentionCount > 0
                  ? 'bg-[#FBE9E2] border-[#E4775D/30] text-[#963A23]'
                  : 'bg-[#F8F6EE] border-[#E3DFD2] text-[#5F6D63]'
              }`}
            >
              <strong className="block text-base sm:text-lg font-bold font-serif">
                {overview.needsAttentionCount}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block leading-tight break-words">
                Needs Attention
              </span>
            </div>

            <div
              className={`p-2 sm:p-2.5 rounded-xl border ${
                overview.monitoringCount > 0
                  ? 'bg-[#FFF3D7] border-[#F0C04D/30] text-[#8A6400]'
                  : 'bg-[#F8F6EE] border-[#E3DFD2] text-[#5F6D63]'
              }`}
            >
              <strong className="block text-base sm:text-lg font-bold font-serif">
                {overview.monitoringCount}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block leading-tight break-words">
                Monitoring
              </span>
            </div>

            <div
              className={`p-2 sm:p-2.5 rounded-xl border ${
                overview.followUpsDueCount > 0
                  ? 'bg-[#FBE9E2] border-[#E4775D/30] text-[#963A23] animate-pulse'
                  : 'bg-[#F8F6EE] border-[#E3DFD2] text-[#5F6D63]'
              }`}
            >
              <strong className="block text-base sm:text-lg font-bold font-serif">
                {overview.followUpsDueCount}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block leading-tight break-words">
                Follow-Up Due
              </span>
            </div>
          </div>

          {/* Quick links to plants needing action */}
          {(attentionPlants.length > 0 || followUpDuePlants.length > 0) && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6D63] block">
                Action Required:
              </span>
              <div className="space-y-1">
                {attentionPlants.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlant?.(p.id)}
                    className="p-2 rounded-xl bg-[#FBE9E2] border border-[#E4775D/30] text-[11px] text-[#963A23] flex items-center justify-between cursor-pointer hover:bg-[#FBE9E2] transition-colors"
                  >
                    <span className="font-semibold truncate">
                      {p.nickname}: {plantHealthMap[p.id]?.activeIssue || 'Foliar issue'}
                    </span>
                    <span className="text-[10px] underline ml-2 shrink-0">View Plant</span>
                  </div>
                ))}

                {followUpDuePlants.filter((p) => !attentionPlants.includes(p)).slice(0, 1).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlant?.(p.id)}
                    className="p-2 rounded-xl bg-[#FFF3D7] border border-[#F0C04D/30] text-[11px] text-[#8A6400] flex items-center justify-between cursor-pointer hover:bg-[#FFF3D7] transition-colors"
                  >
                    <span className="font-semibold truncate">
                      {p.nickname}: Follow-up check overdue
                    </span>
                    <span className="text-[10px] underline ml-2 shrink-0">View Plant</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

