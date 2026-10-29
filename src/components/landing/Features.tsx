import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Sprout,
  Layers,
  BookOpen,
  ArrowRight,
  Droplets,
  Calendar,
  Sun,
  ActivitySquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Features() {
  const features = [
    {
      title: 'Curated Plant Library',
      description:
        'Explore 16 precisely documented balcony, indoor, and vertical agriculture species with temperature ranges in Celsius, light requirements, and realistic timelines.',
      icon: BookOpen,
      href: '/app/plants',
      badge: '16 Verified Species',
      highlight: 'Germination, seedling, and harvest days cleanly distinguished.',
    },
    {
      title: 'Plant Growth Tracker',
      description:
        'Log planting dates, select developmental stages from Seed to Harvested, record dated observations with measurements, and complete timely care tasks.',
      icon: Sprout,
      href: '/app/my-garden',
      badge: 'Interactive Demo Log',
      highlight: 'Visual timelines and historical growth logging.',
    },
    {
      title: 'Vertical Garden Planner',
      description:
        'Arrange compatible herbs, greens, and fruiting crops across a multi-tiered vertical rack. Understand light gradients, soil depth limits, and water drainage dynamics.',
      icon: Layers,
      href: '/app/planner',
      badge: '3-Tier Interactive Rack',
      highlight: 'Top, middle, and bottom tier matching with light and weight heuristics.',
    },
    {
      title: 'AI Plant Doctor',
      description:
        'Inspect leaf discoloration, spotting, and drooping. Receive evidence-backed agronomic diagnoses, probable causes, immediate steps, and non-toxic organic remedies.',
      icon: Sparkles,
      href: '/app/ai-doctor',
      badge: 'Diagnostic Heuristics',
      highlight: 'Clear uncertainty disclaimers and non-toxic organic treatments.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#f5f2e8] border-b border-[#e5dfd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="forest" size="md">Core Platform Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c2417] tracking-tight">
            Designed for Real Balconies, Patios, and Windowsills
          </h2>
          <p className="text-base sm:text-lg text-[#3e5644] leading-relaxed">
            Every feature in GrowAI is built around the biological needs of plants and the spatial constraints of modern urban homes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-white p-8 rounded-2xl border border-[#ded5c5] shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#e7efe7] text-[#144229] group-hover:bg-[#144229] group-hover:text-white transition-colors">
                      <Icon size={24} className="stroke-[2.2]" />
                    </span>
                    <Badge variant="sage" size="sm">{feature.badge}</Badge>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#0c2417] mb-2.5">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#4b6351] leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="text-xs font-medium text-[#1e613b] bg-[#f4f8f4] py-2 px-3 rounded-lg border border-[#cfdfcf] mb-6">
                    {feature.highlight}
                  </div>
                </div>

                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#144229] hover:text-[#0c2417] group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore Feature</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
