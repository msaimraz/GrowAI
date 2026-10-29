import React from 'react';
import Link from 'next/link';
import { Sprout, CheckCircle2, Calendar, Ruler, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function GrowthTrackerDemo() {
  const stages = [
    { name: 'Seed', day: 'Day 0', desc: 'Moistened medium & depth' },
    { name: 'Germination', day: 'Day 3–7', desc: 'Cotyledons break soil' },
    { name: 'Seedling', day: 'Day 14–21', desc: 'True leaves & roots emerge' },
    { name: 'Growing', day: 'Day 28–45', desc: 'Rapid vegetative foliage' },
    { name: 'Mature', day: 'Day 50–70', desc: 'Flowers & fruit setting' },
    { name: 'Harvested', day: 'Day 75+', desc: 'Fresh kitchen harvest' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#fbf9f4] border-b border-[#e5dfd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Methodology */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="sage" size="md">Developmental Milestones</Badge>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c2417] tracking-tight">
              Track Real Growth.{' '}
              <span className="italic font-normal text-[#1e613b]">
                Never Settle for Guesswork.
              </span>
            </h2>

            <p className="text-base text-[#3e5644] leading-relaxed">
              Plants do not mature overnight. GrowAI structures plant development across standardized botanical stages, letting you log observations, record height benchmarks, and anticipate upcoming care requirements.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-[#e7efe7] text-[#144229] mt-0.5">
                  <CheckCircle2 size={16} />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#0c2417]">Dated Botanical Growth Notes</h4>
                  <p className="text-xs text-[#526a57]">Record soil moisture, branching, and pest inspections over time.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-[#e7efe7] text-[#144229] mt-0.5">
                  <CheckCircle2 size={16} />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#0c2417]">Height & Node Tracking</h4>
                  <p className="text-xs text-[#526a57]">Measure growth in centimeters to determine the exact moment to pinch tips.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-[#e7efe7] text-[#144229] mt-0.5">
                  <CheckCircle2 size={16} />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#0c2417]">Care Task Checklist</h4>
                  <p className="text-xs text-[#526a57]">Never forget a deep base watering, organic compost feed, or harvest date.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/app/my-garden"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#144229] text-white hover:bg-[#0c2417] px-6 py-3 rounded-xl shadow-xs transition-colors"
              >
                <span>Open Growth Tracker Demo</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Stage Progression & Sample Log Card */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Stage Bar */}
            <div className="bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#144229] mb-4 flex items-center justify-between">
                <span>Standardized 6-Stage Growth Pipeline</span>
                <span className="text-[11px] font-normal text-[#58735f] normal-case">Roma Tomato Example</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {stages.map((st, idx) => (
                  <div
                    key={st.name}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      idx === 3
                        ? 'bg-[#144229] text-white border-[#0f2e1d] shadow-xs'
                        : idx < 3
                        ? 'bg-[#eef5ee] text-[#1e613b] border-[#cfe0cf]'
                        : 'bg-[#f8f6f0] text-[#716858] border-[#e8e2d4]'
                    }`}
                  >
                    <span className="text-[10px] font-mono block opacity-80">{st.day}</span>
                    <p className="text-xs font-bold mt-0.5">{st.name}</p>
                    <p className="text-[10px] mt-1 leading-tight opacity-75">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Live Log Timeline Preview */}
            <div className="bg-white p-6 rounded-2xl border border-[#ded5c5] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe0]">
                <div className="flex items-center gap-2">
                  <Sprout size={18} className="text-[#1e613b]" />
                  <span className="font-serif font-bold text-sm text-[#0c2417]">
                    Recent Growth Notes Log
                  </span>
                </div>
                <Badge variant="sage" size="sm">Genovese Basil • Active</Badge>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#f7f5ed] border border-[#e5dfd3] flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#0c2417]">Stage: Growing</span>
                      <span className="text-[#64826b]">•</span>
                      <span className="text-[#64826b] flex items-center gap-1">
                        <Calendar size={12} /> Oct 27
                      </span>
                    </div>
                    <p className="text-[#3a4f40]">
                      Pinched center tip above the second leaf node. Side shoots emerging from leaf axils.
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-semibold text-[#1e613b] bg-white px-2 py-1 rounded border border-[#cfdfcf] flex items-center gap-1">
                    <Ruler size={11} /> 9.0 cm
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#f7f5ed] border border-[#e5dfd3] flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#0c2417]">Stage: Seedling</span>
                      <span className="text-[#64826b]">•</span>
                      <span className="text-[#64826b] flex items-center gap-1">
                        <Calendar size={12} /> Oct 20
                      </span>
                    </div>
                    <p className="text-[#3a4f40]">
                      First pair of true aromatic leaves fully expanded. Moved to full morning balcony sun.
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-semibold text-[#1e613b] bg-white px-2 py-1 rounded border border-[#cfdfcf] flex items-center gap-1">
                    <Ruler size={11} /> 4.5 cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
