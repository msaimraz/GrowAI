'use client';

import React, { useState, useMemo } from 'react';
import {
  SpaceConfigProfile,
  OptimizationRecommendation,
  RecommendationSeverity,
  RecommendationCategory,
  PlantPackingItem,
} from '@/types/space-optimizer';
import {
  calculateUsableShelfDimensions,
  calculateContainerMetrics,
  evaluateLinearPacking,
  estimateContainerWetWeight,
  evaluateStructuralLoad,
  evaluateVerticalClearance,
  evaluateLightSuitability,
  evaluateBotanicalCompatibility,
  generateOptimizationRecommendations,
  FullTierEvaluationContext,
} from '@/lib/space-optimizer';
import { PLANTS_DATA } from '@/data/plants';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  HelpCircle,
  CheckCircle2,
  Filter,
  Lightbulb,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Ruler,
  Weight,
  Sun,
  ShieldCheck,
} from 'lucide-react';

export interface OptimizationAdvisoryProps {
  profile: SpaceConfigProfile;
  className?: string;
  onSelectTier?: (tierIndex: number) => void;
}

export function OptimizationAdvisory({
  profile,
  className = '',
  onSelectTier,
}: OptimizationAdvisoryProps) {
  const [severityFilter, setSeverityFilter] = useState<'all' | RecommendationSeverity>('all');
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RecommendationCategory>('all');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Toggle evidence drawer on a card
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Compile recommendations across all configured tiers
  const allRecommendations = useMemo(() => {
    const list: (OptimizationRecommendation & { tierIndex: number; tierName: string; id: string })[] = [];

    profile.tiers.forEach((tier) => {
      const shelf = calculateUsableShelfDimensions(tier.shelfDimensions);
      const tierPlacements = profile.placements.filter((p) => p.tierIndex === tier.tierIndex);

      // Build packing items
      const items: PlantPackingItem[] = tierPlacements.map((slot) => {
        const metrics = calculateContainerMetrics(slot.container);
        const plant = PLANTS_DATA.find((p) => p.slug === slot.plantSlug);

        return {
          id: slot.id,
          plantSlug: slot.plantSlug,
          commonName: plant?.commonName || slot.customNickname || 'Plant Container',
          container: metrics,
          botanicalSpacingCm: plant?.potting?.spacingCm,
          matureCanopySpreadCm: undefined, // Never invent missing canopy spread
          matureHeightCm: undefined, // Never invent missing mature height
        };
      });

      const packing = evaluateLinearPacking(items, shelf);

      // Wet weight & structural evaluation
      let totalTierWetLoadKg = 0;
      tierPlacements.forEach((slot) => {
        const metrics = calculateContainerMetrics(slot.container);
        const wetRes = estimateContainerWetWeight(metrics);
        totalTierWetLoadKg += wetRes.totalEstimatedWeightKg || 0;
      });

      const structural = evaluateStructuralLoad(
        totalTierWetLoadKg,
        tier.confirmedShelfLoadRatingKg,
        tier.tierIndex
      );

      // Vertical clearance evaluations
      const clearanceResults = tierPlacements.map((slot) => {
        const metrics = calculateContainerMetrics(slot.container);
        return evaluateVerticalClearance(
          shelf.isValid ? shelf.verticalClearanceCm : undefined,
          metrics.heightCm,
          undefined, // Catalog does not publish mature height
          10.0
        );
      });

      // Light suitability evaluations
      const lightEnv =
        profile.environment === 'indoor'
          ? profile.spaceType === 'indoor_grow_tent'
            ? 'indoor_grow_lights'
            : 'indoor_natural'
          : 'outdoor';

      const lightResults = tierPlacements.map((slot) => {
        const plant = PLANTS_DATA.find((p) => p.slug === slot.plantSlug);
        return evaluateLightSuitability(
          plant?.sunlight,
          lightEnv,
          profile.sunlightHours,
          tier.lightAttenuationMultiplier ?? 1.0,
          true
        );
      });

      // Botanical compatibility (e.g. Spearmint shared soil conflict)
      const isSharedSoil = tierPlacements.some((p) => p.container.shape === 'trough');
      const compatibility = evaluateBotanicalCompatibility(items, isSharedSoil);

      const context: FullTierEvaluationContext = {
        tierIndex: tier.tierIndex,
        tierName: tier.tierName,
        shelf,
        packing,
        structural,
        clearanceResults,
        lightResults,
        compatibility,
      };

      const tierRecs = generateOptimizationRecommendations(context);

      tierRecs.forEach((rec, idx) => {
        list.push({
          ...rec,
          tierIndex: tier.tierIndex,
          tierName: tier.tierName || `Tier ${tier.tierIndex + 1}`,
          id: `rec-${tier.tierIndex}-${idx}-${rec.category}-${rec.severity}`,
        });
      });
    });

    return list;
  }, [profile]);

  // Counts by severity
  const counts = useMemo(() => {
    return {
      all: allRecommendations.length,
      critical: allRecommendations.filter((r) => r.severity === 'critical').length,
      warning: allRecommendations.filter((r) => r.severity === 'warning').length,
      info: allRecommendations.filter((r) => r.severity === 'info').length,
      insufficient_data: allRecommendations.filter((r) => r.severity === 'insufficient_data').length,
      success: allRecommendations.filter((r) => r.severity === 'success').length,
    };
  }, [allRecommendations]);

  // Filtered list
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter((rec) => {
      if (severityFilter !== 'all' && rec.severity !== severityFilter) return false;
      if (tierFilter !== 'all' && rec.tierIndex !== tierFilter) return false;
      if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
      return true;
    });
  }, [allRecommendations, severityFilter, tierFilter, categoryFilter]);

  // Helper for severity badges and styling
  const getSeverityMeta = (severity: RecommendationSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'Critical Issue',
          badgeVariant: 'terracotta' as const,
          borderClass: 'border-l-4 border-l-[#9a3412] bg-[#fffaf8]',
          headerTextClass: 'text-[#9a3412]',
          icon: <ShieldAlert className="w-5 h-5 text-[#9a3412] shrink-0" />,
        };
      case 'warning':
        return {
          label: 'Warning',
          badgeVariant: 'amber' as const,
          borderClass: 'border-l-4 border-l-[#d97706] bg-[#fffcf5]',
          headerTextClass: 'text-[#92400e]',
          icon: <AlertTriangle className="w-5 h-5 text-[#d97706] shrink-0" />,
        };
      case 'info':
        return {
          label: 'Opportunity',
          badgeVariant: 'forest' as const,
          borderClass: 'border-l-4 border-l-[#144229] bg-[#f9faf8]',
          headerTextClass: 'text-[#144229]',
          icon: <Lightbulb className="w-5 h-5 text-[#144229] shrink-0" />,
        };
      case 'insufficient_data':
        return {
          label: 'Data Gap',
          badgeVariant: 'neutral' as const,
          borderClass: 'border-l-4 border-l-[#78716c] bg-[#fafaf9]',
          headerTextClass: 'text-[#57534e]',
          icon: <HelpCircle className="w-5 h-5 text-[#78716c] shrink-0" />,
        };
      case 'success':
        return {
          label: 'Verified Compatible',
          badgeVariant: 'sage' as const,
          borderClass: 'border-l-4 border-l-[#1b5837] bg-[#f5fbf7]',
          headerTextClass: 'text-[#1b5837]',
          icon: <CheckCircle2 className="w-5 h-5 text-[#1b5837] shrink-0" />,
        };
    }
  };

  // Helper for category badge icons
  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'spatial':
        return <Ruler className="w-3.5 h-3.5" />;
      case 'structural':
        return <Weight className="w-3.5 h-3.5" />;
      case 'light':
        return <Sun className="w-3.5 h-3.5" />;
      case 'botanical':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'clearance':
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section
      aria-label="Optimization Advisory Panel"
      className={`bg-[#fbf9f4] border border-[#e2dcce] rounded-xl p-5 md:p-6 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e2dcce]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e7efe7] text-[#144229]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#144229] font-semibold">
              Optimization Advisory Panel
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#526a57] mt-1">
            Actionable physical, structural, and photobiological evaluations generated by the calculation engine.
          </p>
        </div>

        {/* Overall Status Badge */}
        <div className="flex items-center gap-2">
          {counts.critical > 0 ? (
            <Badge variant="terracotta" size="md">
              <ShieldAlert className="w-3.5 h-3.5" />
              {counts.critical} Critical Action{counts.critical > 1 ? 's' : ''}
            </Badge>
          ) : counts.warning > 0 ? (
            <Badge variant="amber" size="md">
              <AlertTriangle className="w-3.5 h-3.5" />
              {counts.warning} Warning{counts.warning > 1 ? 's' : ''}
            </Badge>
          ) : counts.all > 0 ? (
            <Badge variant="sage" size="md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Structure & Spacing Sound
            </Badge>
          ) : (
            <Badge variant="neutral" size="md">
              No Placements Yet
            </Badge>
          )}
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pt-4 pb-3" role="tablist" aria-label="Filter by severity">
        <button
          type="button"
          role="tab"
          aria-selected={severityFilter === 'all'}
          onClick={() => setSeverityFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            severityFilter === 'all'
              ? 'bg-[#144229] text-[#f4f8f4]'
              : 'bg-[#f2eee3] text-[#44403c] hover:bg-[#e7e1d3]'
          }`}
        >
          All Recommendations ({counts.all})
        </button>

        {counts.critical > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={severityFilter === 'critical'}
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              severityFilter === 'critical'
                ? 'bg-[#9a3412] text-white'
                : 'bg-[#fbeee9] text-[#9a3412] hover:bg-[#f6ddd4]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Critical ({counts.critical})
          </button>
        )}

        {counts.warning > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={severityFilter === 'warning'}
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              severityFilter === 'warning'
                ? 'bg-[#d97706] text-white'
                : 'bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Warnings ({counts.warning})
          </button>
        )}

        {counts.info > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={severityFilter === 'info'}
            onClick={() => setSeverityFilter('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              severityFilter === 'info'
                ? 'bg-[#144229] text-white'
                : 'bg-[#e7efe7] text-[#144229] hover:bg-[#cfdfcf]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Opportunities ({counts.info})
          </button>
        )}

        {counts.insufficient_data > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={severityFilter === 'insufficient_data'}
            onClick={() => setSeverityFilter('insufficient_data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              severityFilter === 'insufficient_data'
                ? 'bg-[#57534e] text-white'
                : 'bg-[#f2eee3] text-[#57534e] hover:bg-[#e7e1d3]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Data Gaps ({counts.insufficient_data})
          </button>
        )}

        {counts.success > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={severityFilter === 'success'}
            onClick={() => setSeverityFilter('success')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              severityFilter === 'success'
                ? 'bg-[#1b5837] text-white'
                : 'bg-[#e7efe7] text-[#1b5837] hover:bg-[#cfdfcf]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified ({counts.success})
          </button>
        )}
      </div>

      {/* Secondary Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 text-xs text-[#526a57]">
        {/* Tier filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#526a57]" />
          <span className="font-medium text-[#44403c]">Filter Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-white border border-[#cfdfcf] text-[#144229] rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-[#144229] focus:outline-none"
            aria-label="Filter recommendations by tier"
          >
            <option value="all">All Tiers ({profile.tiers.length})</option>
            {profile.tiers.map((t) => (
              <option key={t.tierIndex} value={t.tierIndex}>
                {t.tierName || `Tier ${t.tierIndex + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#44403c]">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | RecommendationCategory)}
            className="bg-white border border-[#cfdfcf] text-[#144229] rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-[#144229] focus:outline-none"
            aria-label="Filter recommendations by category"
          >
            <option value="all">All Disciplines</option>
            <option value="spatial">Spatial & Packing</option>
            <option value="structural">Structural & Weight</option>
            <option value="light">Photobiology & Sun</option>
            <option value="botanical">Botanical Compatibility</option>
            <option value="clearance">Vertical Headroom</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-[#e2dcce] rounded-xl my-2">
          <div className="inline-flex p-3 rounded-full bg-[#e7efe7] text-[#144229] mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#144229]">
            {allRecommendations.length === 0
              ? 'No Placement Conflicts Detected'
              : 'No Recommendations Match Filters'}
          </h3>
          <p className="text-xs sm:text-sm text-[#526a57] max-w-md mx-auto mt-1.5">
            {allRecommendations.length === 0
              ? 'Add plant containers to tiers in the visualizer above to receive real-time structural, photobiological, and spatial guidance.'
              : 'Try clearing or adjusting your severity, tier, or discipline filters to view all recommendations.'}
          </p>
          {allRecommendations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSeverityFilter('all');
                setTierFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#144229] text-white hover:bg-[#0f2e1d] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Recommendations List */
        <div className="space-y-4 pt-1" role="feed" aria-label="Actionable recommendations">
          {filteredRecommendations.map((rec) => {
            const meta = getSeverityMeta(rec.severity);
            const isExpanded = Boolean(expandedCards[rec.id]);

            return (
              <article
                key={rec.id}
                className={`bg-white border border-[#e2dcce] rounded-xl p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md ${meta.borderClass}`}
              >
                {/* Card Top Row: Badges and Tier Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f0ece1]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={meta.badgeVariant} size="sm">
                      {meta.label}
                    </Badge>
                    <Badge variant="outline" size="sm" className="capitalize flex items-center gap-1">
                      {getCategoryIcon(rec.category)}
                      {rec.category}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => onSelectTier?.(rec.tierIndex)}
                      className="text-xs font-medium text-[#144229] bg-[#e7efe7] hover:bg-[#cfdfcf] px-2 py-0.5 rounded-full transition-colors inline-flex items-center gap-1"
                      title="Jump to this tier in visualizer"
                    >
                      <Layers className="w-3 h-3 text-[#144229]" />
                      {rec.tierName}
                    </button>
                  </div>

                  {/* Estimated vs Confirmed Disclosure */}
                  <div>
                    {rec.isEstimated ? (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-[#78716c] bg-[#fafaf9] border border-[#e7e5e4] px-2 py-0.5 rounded-full"
                        title="Evaluated using simulation assumptions or incomplete input parameters"
                      >
                        <Info className="w-3 h-3 text-[#78716c]" />
                        Simulated / Estimated
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-[#1b5837] bg-[#f5fbf7] border border-[#cfdfcf] px-2 py-0.5 rounded-full"
                        title="Calculated from confirmed physical measurements"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#1b5837]" />
                        Confirmed Metric
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body: 3-Part Structural Diagnosis */}
                <div className="pt-3.5 space-y-3">
                  {/* Part 1: What was detected */}
                  <div>
                    <div className="flex items-start gap-2.5">
                      {meta.icon}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#526a57] block">
                          1. Detected Pattern
                        </span>
                        <h3 className={`text-base font-semibold leading-snug ${meta.headerTextClass}`}>
                          {rec.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Why it matters */}
                  <div className="bg-[#fcfbf7] rounded-lg p-3 border border-[#ede8dd] text-xs sm:text-sm text-[#44403c] leading-relaxed">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#526a57] block mb-1">
                      2. Horticultural & Structural Rationale
                    </span>
                    <p>{rec.explanation}</p>
                  </div>

                  {/* Part 3: What the grower can do */}
                  {rec.suggestedAction && (
                    <div className="bg-[#f5fbf7] rounded-lg p-3 border border-[#cfdfcf] text-xs sm:text-sm text-[#144229]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#1b5837] block mb-1 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        3. Recommended Action
                      </span>
                      <p className="font-medium">{rec.suggestedAction}</p>
                    </div>
                  )}

                  {/* Part 4: Evidence & Input Inspection Drawer */}
                  {rec.evidenceOrInputs && Object.keys(rec.evidenceOrInputs).length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleCardExpansion(rec.id)}
                        className="text-xs text-[#526a57] hover:text-[#144229] font-medium flex items-center gap-1 transition-colors"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Verified Inputs & Diagnostic Evidence
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Inspect Verified Inputs & Diagnostic Evidence
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-[#f7f5ee] border border-[#e2dcce] rounded-lg text-xs font-mono text-[#44403c] space-y-1 overflow-x-auto">
                          <div className="text-[10px] uppercase font-sans font-bold text-[#526a57] mb-1">
                            Engine Calculation Parameters:
                          </div>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(rec.evidenceOrInputs).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-0.5 border-b border-[#e7e1d3]">
                                <dt className="text-[#526a57] font-sans">{key}:</dt>
                                <dd className="font-semibold text-[#144229]">
                                  {typeof value === 'object' && value !== null
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Safety & Photobiology Standards Disclosures */}
      <footer className="mt-6 pt-4 border-t border-[#e2dcce] text-[11px] text-[#78716c] space-y-1.5 leading-relaxed">
        <p className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#526a57] shrink-0 mt-0.5" />
          <span>
            <strong>Photobiology Disclosure:</strong> Ambient sunlight hours and tier attenuation are simulated
            heuristics. Cardinal orientation alone cannot verify photosynthetically active radiation (PAR).
          </span>
        </p>
        <p className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#526a57] shrink-0 mt-0.5" />
          <span>
            <strong>Structural Safety Mandate:</strong> Unknown Safe Working Load (SWL) limits are treated as
            unverified. Never exceed manufacturer shelf ratings. GrowAI does not guarantee specific yields or
            production rates.
          </span>
        </p>
      </footer>
    </section>
  );
}
