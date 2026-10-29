import React from 'react';
import Link from 'next/link';
import { Droplet, Recycle, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function SustainabilitySection() {
  const threeRs = [
    {
      title: 'Reduce',
      subtitle: 'Targeted Resource Conservation',
      icon: Droplet,
      badge: 'Water & Soil',
      color: 'bg-[#e7efe7] text-[#144229] border-[#cfdfcf]',
      description:
        'Vertical rack runoff can be captured in bottom trays to eliminate water waste. Micro-dosing organic nutrients prevents groundwater leeching and soil nutrient lock.',
      actions: [
        'Collect AC condensation or rainwater for non-food irrigation',
        'Use coconut coir mulch to cut evaporation by up to 40%',
        'Water early mornings at the root base, never foliage',
      ],
    },
    {
      title: 'Reuse',
      subtitle: 'Upcycled Container Planters',
      icon: RefreshCw,
      badge: 'Zero Single-Use',
      color: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
      description:
        'Turn clean food-grade tubs, wooden crates, and glass jars into thriving vertical pots. All you need is proper drilled bottom drainage and adequate depth.',
      actions: [
        'Drill 8 mm drainage holes into food-grade plastic tubs',
        'Repurpose egg cartons for seed germination trays',
        'Build vertical tier ladders from scrap pallet timber',
      ],
    },
    {
      title: 'Recycle',
      subtitle: 'Home Organic Composting',
      icon: Recycle,
      badge: 'Nutrient Loop',
      color: 'bg-[#fbeee9] text-[#9a3412] border-[#f8d7cb]',
      description:
        'Transform kitchen vegetable trimmings, coffee grounds, and dry leaves into living dark humus. Worm bins (vermicomposting) operate odor-free on small balconies.',
      actions: [
        'Balance green nitrogen scraps with dry brown carbon leaves',
        'Maintain an indoor odorless red-wiggler worm bin',
        'Brew compost tea to fertilize flowering tomato and basil tiers',
      ],
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#fbf9f4] border-b border-[#e5dfd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="sage" size="md">Sustainable Urban Agriculture</Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c2417] tracking-tight">
            The 3Rs of Home Gardening:{' '}
            <span className="italic font-normal text-[#1e613b]">
              Reduce, Reuse, Recycle
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#3e5644] leading-relaxed">
            Gardening should nourish your family without producing plastic landfill waste. GrowAI integrates ecological closed-loop principles directly into your daily routine.
          </p>
        </div>

        {/* 3Rs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {threeRs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-7 border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`p-3 rounded-xl border ${item.color}`}>
                      <Icon size={24} className="stroke-[2.2]" />
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f2eee3] text-[#44403c] border border-[#e2dcce]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-[#0c2417] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-[#1e613b] mb-3">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-[#4b6351] leading-relaxed mb-5">
                    {item.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-[#f0ebe0]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#144229]">
                      Practical Home Steps:
                    </p>
                    {item.actions.map((act) => (
                      <div key={act} className="flex items-start gap-2 text-xs text-[#354c3b]">
                        <CheckCircle2 size={14} className="text-[#1e613b] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#f0ebe0]">
                  <Link
                    href="/app/learn"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#144229] hover:underline"
                  >
                    <span>Read Full 3R Guide</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
