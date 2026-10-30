import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { GrowthTrackerDemo } from '@/components/landing/GrowthTrackerDemo';
import { FeaturedPlantsSection } from '@/components/landing/FeaturedPlantsSection';
import { SustainabilitySection } from '@/components/landing/SustainabilitySection';
import { ArrowRight, Sprout, Sparkles, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4]">
      {/* Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero />
        <Features />
        <GrowthTrackerDemo />
        <FeaturedPlantsSection />
        <SustainabilitySection />

        {/* Bottom CTA Banner */}
        <section className="py-20 bg-[#0e2a1b] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-botanical-pattern opacity-10 pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#1a472d] text-[#64b584] border border-[#2a6844]">
              <Sprout size={13} />
              Cultivate Smarter at Home
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Ready to Build Your Home Vertical Garden?
            </h2>

            <p className="text-base sm:text-lg text-[#bed4c5] max-w-2xl mx-auto leading-relaxed">
              Explore 16 curated plant profiles, plan your space-efficient tiers, and begin logging your plant growth today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold bg-[#257a4d] hover:bg-[#1e613b] text-white px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
              >
                <span>Launch Grower Dashboard</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/app/planner"
                className="inline-flex items-center justify-center gap-2 text-base font-medium bg-[#143a25] hover:bg-[#1a472d] text-[#e3ece5] px-7 py-3.5 rounded-xl border border-[#265e3c] transition-colors w-full sm:w-auto"
              >
                <Layers size={18} />
                <span>Configure Vertical Rack</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
