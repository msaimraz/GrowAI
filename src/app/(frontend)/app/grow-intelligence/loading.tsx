import React from 'react';

export default function GrowIntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#fbf9f4]/95 border-b border-[#ded5c5] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-52 bg-[#E8E4DA] rounded-lg" />
          <div className="h-3.5 w-80 bg-[#EFEAE0] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E8E4DA] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Daily Grow Check Banner Skeleton */}
        <div className="h-44 bg-[#144229]/20 rounded-3xl border border-[#ded5c5] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-60 bg-[#E8E4DA] rounded-xl" />
            <div className="h-6 w-24 bg-[#E8E4DA] rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-white/30 rounded-2xl" />
            <div className="h-20 bg-white/30 rounded-2xl" />
          </div>
        </div>

        {/* Next Best Action Card Skeleton */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 space-y-4">
          <div className="h-5 w-48 bg-[#E8E4DA] rounded-md" />
          <div className="h-24 bg-[#FBF9F4] rounded-2xl border border-[#E8E4DA] p-4" />
        </div>

        {/* Grower Copilot Skeleton */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 space-y-4">
          <div className="h-5 w-40 bg-[#E8E4DA] rounded-md" />
          <div className="h-12 w-full bg-[#FBF9F4] rounded-2xl border border-[#E8E4DA]" />
        </div>
      </div>
    </div>
  );
}

