import React from 'react';
import Link from 'next/link';
import { PLANTS_DATA } from '@/data/plants';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Thermometer, Sun, Clock, Layers } from 'lucide-react';

export function FeaturedPlantsSection() {
  const featured = PLANTS_DATA.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-20 lg:py-28 bg-[#f5f2e8] border-b border-[#e5dfd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="forest" size="md">Curated Plant Profiles</Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c2417] tracking-tight">
              Curated for Balconies, Windowsills & Vertical Racks
            </h2>
            <p className="text-base text-[#445b4a]">
              Every plant profile includes verified temperature limits in Celsius, precise light requirements, realistic harvest horizons, and tier suitability ratings.
            </p>
          </div>

          <Link
            href="/app/plants"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#144229] hover:text-[#0c2417] bg-white px-5 py-2.5 rounded-xl border border-[#cfdfcf] shadow-xs hover:shadow transition-all shrink-0 self-start md:self-auto"
          >
            <span>View All 16 Species</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Plant Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((plant) => (
            <div
              key={plant.id}
              className="bg-white rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="sage" size="sm">
                    {plant.category.replace('-', ' ')}
                  </Badge>
                  {plant.badge && (
                    <span className="text-[10px] font-semibold text-[#9a3412] bg-[#fbeee9] px-2 py-0.5 rounded-full border border-[#f8d7cb]">
                      {plant.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-[#0c2417] group-hover:text-[#1e613b] transition-colors">
                    {plant.commonName}
                  </h3>
                  <p className="text-xs italic text-[#6a8370] font-sans">
                    {plant.scientificName}
                  </p>
                </div>

                <p className="text-xs text-[#4b6351] line-clamp-2 leading-relaxed">
                  {plant.summary}
                </p>

                {/* Key Metrics */}
                <div className="pt-3 border-t border-[#f0ebe0] space-y-2 text-xs text-[#3a4f40]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#5f7a65]">
                      <Thermometer size={14} /> Temp
                    </span>
                    <span className="font-semibold text-[#0c2417]">
                      {plant.temperatureRange.min}°C – {plant.temperatureRange.max}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#5f7a65]">
                      <Clock size={14} /> Harvest
                    </span>
                    <span className="font-semibold text-[#0c2417]">
                      {plant.timelines.harvestDays
                        ? `${plant.timelines.harvestDays.min}–${plant.timelines.harvestDays.max} days`
                        : `${plant.timelines.maturityDays.min}–${plant.timelines.maturityDays.max} days`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#5f7a65]">
                      <Layers size={14} /> Rack Tier
                    </span>
                    <span className="font-semibold capitalize text-[#1e613b]">
                      {plant.verticalSuitability.recommendedTier} Shelf
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <Link
                  href={`/app/plants/${plant.slug}`}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-[#f4f8f4] hover:bg-[#144229] text-[#144229] hover:text-white py-2.5 rounded-xl border border-[#cfdfcf] hover:border-[#144229] transition-all"
                >
                  <span>Explore Full Profile</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
