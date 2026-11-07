import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-[#0e2a1b] text-[#fbf9f4] relative overflow-hidden">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-[11px] font-mono tracking-widest text-[#a7c8b6] uppercase font-bold block">
          BEGIN GROWING TODAY
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
          Ready to Grow Smarter?
        </h2>

        <p className="text-base sm:text-lg text-[#d0e2d7] max-w-lg mx-auto leading-relaxed">
          Start with one plant. Build your garden from there.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-white text-[#0e2a1b] hover:bg-[#eef5ee] active:scale-95 px-7 py-3.5 rounded-2xl shadow-xs transition-all duration-75 w-full sm:w-auto min-h-[48px] cursor-pointer select-none touch-manipulation"
          >
            <span>Launch GrowAI</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/app/plants"
            className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-transparent hover:bg-white/10 active:scale-95 text-white px-6 py-3.5 rounded-2xl border border-white/30 hover:border-white transition-all duration-75 w-full sm:w-auto min-h-[48px] cursor-pointer select-none touch-manipulation"
          >
            <span>Explore Plant Library</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
