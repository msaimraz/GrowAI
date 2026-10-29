'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plant } from '@/types/plant';
import { Badge } from '@/components/ui/Badge';
import { AddToGardenModal } from '@/components/plants/AddToGardenModal';
import {
  Thermometer,
  Sun,
  Droplets,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Plus,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Sparkles,
  Info,
  Bug,
  Leaf,
} from 'lucide-react';

interface PlantDetailClientProps {
  plant: Plant;
}

export function PlantDetailClient({ plant }: PlantDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-[#e5dfd3] px-4 sm:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/app/plants"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144229] hover:text-[#0c2417]"
          >
            <ArrowLeft size={16} />
            <span>Back to Plant Library</span>
          </Link>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#144229] hover:bg-[#0c2417] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all hover:shadow"
          >
            <Plus size={16} />
            <span>Add to My Garden</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Plant Header Card */}
        <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="sage" size="md">
                  {plant.category.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" size="sm">
                  {plant.difficulty.level.toUpperCase()} (Score: {plant.difficulty.score}/5)
                </Badge>
                {plant.badge && (
                  <span className="text-xs font-semibold text-[#9a3412] bg-[#fbeee9] px-2.5 py-0.5 rounded-full border border-[#f8d7cb]">
                    {plant.badge}
                  </span>
                )}
                <span className="text-xs font-medium text-[#1e613b] flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Status: {plant.dataReviewStatus}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c2417] tracking-tight">
                {plant.commonName}
              </h1>

              <p className="text-sm font-serif italic text-[#55715c]">
                {plant.scientificName}
              </p>

              <p className="text-sm sm:text-base text-[#384e3e] leading-relaxed">
                {plant.summary}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                {plant.environments.map((env) => (
                  <span
                    key={env}
                    className="px-2.5 py-1 rounded-lg bg-[#f4f8f4] text-[#1e613b] border border-[#cfdfcf] capitalize"
                  >
                    ✓ {env.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Summary Pill Box */}
            <div className="bg-[#f7f5ed] p-5 rounded-2xl border border-[#ded5c5] space-y-3 shrink-0 md:w-72">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229]">
                Vertical Rack Readiness
              </h4>
              <div className="space-y-2 text-xs text-[#354a3b]">
                <div className="flex items-center justify-between">
                  <span className="text-[#647f6c]">Suitability:</span>
                  <span className="font-semibold capitalize text-[#1e613b]">
                    {plant.verticalSuitability.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#647f6c]">Recommended Tier:</span>
                  <span className="font-semibold capitalize text-[#0c2417]">
                    {plant.verticalSuitability.recommendedTier} Shelf
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#647f6c]">Min Pot Depth:</span>
                  <span className="font-semibold text-[#0c2417]">
                    {plant.potting.minDepthCm} cm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#647f6c]">Plant Spacing:</span>
                  <span className="font-semibold text-[#0c2417]">
                    {plant.potting.spacingCm} cm
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#556e5c] border-t border-[#e5dfd3] pt-2 italic">
                {plant.verticalSuitability.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Growth Timeline Section */}
        <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#0c2417]">
                Visual Growth & Harvest Timeline
              </h2>
              <p className="text-xs text-[#526a57]">
                Sourced from temperate horticulture extensions; times vary by ambient temperature
              </p>
            </div>
            <Badge variant="sage" size="sm">Evidence-Based</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Germination */}
            <div className="p-4 rounded-xl bg-[#f7f5ed] border border-[#e2dbce] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#92400e]">
                Phase 1: Germination
              </span>
              <p className="text-lg font-serif font-bold text-[#0c2417]">
                {plant.timelines.germinationDays.min === 0
                  ? 'Cutting / Division'
                  : `${plant.timelines.germinationDays.min}–${plant.timelines.germinationDays.max} Days`}
              </p>
              <p className="text-xs text-[#526a57]">
                Moist soil in gentle warm zone before green cotyledon emergence.
              </p>
            </div>

            {/* Seedling & True Leaves */}
            <div className="p-4 rounded-xl bg-[#eef5ee] border border-[#cfe0cf] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#1e613b]">
                Phase 2: Seedling
              </span>
              <p className="text-lg font-serif font-bold text-[#0c2417]">
                {plant.timelines.seedlingDays.min}–{plant.timelines.seedlingDays.max} Days
              </p>
              <p className="text-xs text-[#526a57]">
                Root system anchors and first true leaves begin photosynthesis.
              </p>
            </div>

            {/* Harvest or Flower */}
            <div className="p-4 rounded-xl bg-[#f4f8f4] border border-[#cfe0cf] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#144229]">
                {plant.timelines.harvestDays ? 'Phase 3: First Harvest' : 'Phase 3: Flowering'}
              </span>
              <p className="text-lg font-serif font-bold text-[#0c2417]">
                {plant.timelines.harvestDays
                  ? `${plant.timelines.harvestDays.min}–${plant.timelines.harvestDays.max} Days`
                  : plant.timelines.floweringDays
                  ? `${plant.timelines.floweringDays.min}–${plant.timelines.floweringDays.max} Days`
                  : `${plant.timelines.maturityDays.min} Days`}
              </p>
              <p className="text-xs text-[#526a57]">
                Initial picking window for tender culinary foliage or blooms.
              </p>
            </div>

            {/* Full Maturity */}
            <div className="p-4 rounded-xl bg-[#f7f5ed] border border-[#e2dbce] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6c5940]">
                Phase 4: Full Maturity
              </span>
              <p className="text-lg font-serif font-bold text-[#0c2417]">
                {plant.timelines.maturityDays.min}–{plant.timelines.maturityDays.max} Days
              </p>
              <p className="text-xs text-[#526a57]">
                Full physiological plant size and sustained productive horizon.
              </p>
            </div>
          </div>

          {plant.timelines.timelineNotes && (
            <p className="text-xs text-[#4b6351] bg-[#fbf9f4] p-3 rounded-xl border border-[#ded5c5] flex items-center gap-2">
              <Info size={16} className="text-[#1e613b] shrink-0" />
              <span>{plant.timelines.timelineNotes}</span>
            </p>
          )}
        </div>

        {/* Growing Conditions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature, Sunlight, and Humidity */}
          <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-5">
            <h3 className="text-base font-serif font-bold text-[#0c2417] pb-3 border-b border-[#f0ebe0] flex items-center gap-2">
              <Sun size={18} className="text-[#c77712]" />
              <span>Climate, Temperature & Light</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-[#0c2417] flex items-center gap-1.5">
                  <Thermometer size={14} className="text-[#144229]" />
                  Temperature Tolerance:
                </span>
                <span className="text-right text-[#354b3c]">
                  <strong>{plant.temperatureRange.min}°C to {plant.temperatureRange.max}°C</strong>
                  {plant.temperatureRange.idealRange && (
                    <span className="block text-[11px] text-[#698570]">
                      Ideal: {plant.temperatureRange.idealRange}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-[#0c2417]">Sunlight Requirement:</span>
                <span className="text-right text-[#354b3c] capitalize">
                  {plant.sunlight.replace('-', ' ')} ({plant.sunlightHours})
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-[#0c2417]">Humidity Guidance:</span>
                <span className="text-right text-[#354b3c]">
                  {plant.humidity ? (
                    <>
                      <strong>{plant.humidity.min}% – {plant.humidity.max}% RH</strong>
                      {plant.humidity.note && (
                        <span className="block text-[11px] text-[#698570]">
                          {plant.humidity.note}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#718576] italic">Tolerant to ambient household humidity</span>
                  )}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-[#0c2417]">Soil pH:</span>
                <span className="text-right text-[#354b3c]">
                  {plant.ph ? (
                    <>
                      <strong>{plant.ph.min} – {plant.ph.max} pH</strong>
                      {plant.ph.note && (
                        <span className="block text-[11px] text-[#698570]">
                          {plant.ph.note}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#718576] italic">Standard neutral range (6.0–7.0)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Watering, Soil & Nutrition Guidance */}
          <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-5">
            <h3 className="text-base font-serif font-bold text-[#0c2417] pb-3 border-b border-[#f0ebe0] flex items-center gap-2">
              <Droplets size={18} className="text-[#3b82f6]" />
              <span>Watering, Soil & Nutrition</span>
            </h3>

            <div className="space-y-4 text-xs text-[#354b3c]">
              <div>
                <span className="font-semibold text-[#0c2417] block mb-1">
                  Watering Frequency ({plant.watering.moistureLevel} moisture):
                </span>
                <p className="leading-relaxed text-[#4b6351]">
                  {plant.watering.frequency}. {plant.watering.guidance}
                </p>
              </div>

              <div>
                <span className="font-semibold text-[#0c2417] block mb-1">
                  Soil Structure & Drainage:
                </span>
                <p className="leading-relaxed text-[#4b6351]">
                  {plant.soil.type}. Drainage: {plant.soil.drainage}
                </p>
              </div>

              {plant.soil.recommendedMix && (
                <div className="p-3 rounded-xl bg-[#f7f5ed] border border-[#e2dbce]">
                  <span className="font-bold text-[#144229] block mb-0.5">
                    Recommended Potting Recipe:
                  </span>
                  <p className="text-[11px] text-[#556e5c]">
                    {plant.soil.recommendedMix}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Common Problems and Preventive Care */}
        <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
            <div className="flex items-center gap-2">
              <Bug size={20} className="text-[#9a3412]" />
              <h3 className="text-lg font-serif font-bold text-[#0c2417]">
                Common Problems & Preventive Care
              </h3>
            </div>
            <span className="text-xs text-[#637d6a]">Organic & Non-Toxic Remedies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plant.commonProblems.map((prob) => (
              <div
                key={prob.issue}
                className="p-4 rounded-xl bg-[#fbf9f4] border border-[#ded5c5] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0c2417] text-sm">{prob.issue}</h4>
                  <Badge variant="terracotta" size="sm">Watch Out</Badge>
                </div>
                <p className="text-[#556e5c]">
                  <strong className="text-[#0c2417]">Symptoms:</strong> {prob.symptoms}
                </p>
                <p className="text-[#556e5c]">
                  <strong className="text-[#0c2417]">Prevention:</strong> {prob.prevention}
                </p>
                <p className="text-[#1e613b] bg-white p-2.5 rounded-lg border border-[#cfdfcf] mt-2">
                  <strong>Organic Remedy:</strong> {prob.organicRemedy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Uses, Benefits & Safety Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0c2417] flex items-center gap-2 pb-3 border-b border-[#f0ebe0]">
              <Leaf size={18} className="text-[#1e613b]" />
              <span>Practical Uses & Culinary Benefits</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#354b3c]">
              {plant.practicalUses.map((use) => (
                <li key={use} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1e613b] mt-1.5 shrink-0" />
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-[#ded5c5] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0c2417] flex items-center gap-2 pb-3 border-b border-[#f0ebe0]">
              <AlertTriangle size={18} className="text-[#92400e]" />
              <span>Safety & Pet Considerations</span>
            </h3>
            <p className="text-xs text-[#4b6351] leading-relaxed">
              {plant.safetyNotes || 'Non-toxic under normal culinary handling.'}
            </p>
            <div className="p-3 rounded-xl bg-[#fef3c7]/60 border border-[#fde68a] text-[11px] text-[#92400e] leading-relaxed">
              GrowAI provides educational botanical guidance. Do not use home garden plants to substitute prescribed medical treatments.
            </div>
          </div>
        </div>

        {/* References & Scientific Sources */}
        <div className="bg-[#f7f5ed] p-6 rounded-2xl border border-[#ded5c5] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#144229]">
            Horticultural Sources & Agronomic References
          </h4>
          <div className="flex flex-wrap gap-3 text-xs">
            {plant.sourceUrls.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[#1e613b] hover:text-[#0c2417] hover:underline bg-white px-3 py-1.5 rounded-lg border border-[#cfdfcf]"
              >
                <span>Reference {i + 1} ({new URL(url).hostname})</span>
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Add To Garden Modal Dialog */}
      <AddToGardenModal
        plant={plant}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
