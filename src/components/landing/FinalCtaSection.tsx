import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="py-24 lg:py-36 bg-[#163A2A] text-[#F6F1E8] relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Subtle Category */}
        <span className="text-[11px] font-mono tracking-widest text-[#879B78] uppercase block">
          BEGIN CULTIVATION
        </span>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#F6F1E8] tracking-tight leading-[1.12]">
          Your Garden Changes.
          <br />
          <span className="italic font-normal text-[#F6F1E8]/90">
            GrowAI Changes With It.
          </span>
        </h2>

        {/* Terracotta Accent Line */}
        <div className="w-12 h-[2px] bg-[#C86B4A] mx-auto my-6" />

        <p className="text-base sm:text-lg text-[#F6F1E8]/75 max-w-lg mx-auto leading-relaxed font-normal">
          Plan with spatial intent. Track reality over time. Adapt with context-grounded intelligence.
        </p>

        {/* Two Simple Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-[#C86B4A] hover:bg-[#b85c39] text-white px-7 py-3 rounded-[4px] transition-colors w-full sm:w-auto min-h-[44px]"
          >
            <span>Launch GrowAI</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/app/plants"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-transparent hover:bg-white/5 text-[#F6F1E8] px-6 py-3 rounded-[4px] border border-[#F6F1E8]/30 hover:border-[#F6F1E8] transition-colors w-full sm:w-auto min-h-[44px]"
          >
            <span>Browse 16 Botanical Profiles</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
