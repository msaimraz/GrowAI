import React from 'react';

export default function GrowIntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#F8F6EE]/95 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-52 bg-[#E3DFD2] rounded-lg" />
          <div className="h-3.5 w-80 bg-[#EAF1E4] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E3DFD2] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Daily Grow Check Banner Skeleton */}
        <div className="h-44 bg-[#174C35]/20 rounded-3xl border border-[#E3DFD2] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-60 bg-[#E3DFD2] rounded-xl" />
            <div className="h-6 w-24 bg-[#E3DFD2] rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-white/30 rounded-2xl" />
            <div className="h-20 bg-white/30 rounded-2xl" />
          </div>
        </div>

        {/* Next Best Action Card Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 space-y-4">
          <div className="h-5 w-48 bg-[#E3DFD2] rounded-md" />
          <div className="h-24 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] p-4" />
        </div>

        {/* Grower Copilot Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 space-y-4">
          <div className="h-5 w-40 bg-[#E3DFD2] rounded-md" />
          <div className="h-12 w-full bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2]" />
        </div>
      </div>
    </div>
  );
}

