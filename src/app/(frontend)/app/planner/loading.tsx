import React from 'react';

export default function PlannerLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#F8F6EE]/95 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-52 bg-[#E3DFD2] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#EAF1E4] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E3DFD2] rounded-xl" />
          <div className="h-9 w-28 bg-[#E3DFD2] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric Summary Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-[#E3DFD2] p-4 space-y-2">
              <div className="h-3.5 w-20 bg-[#E3DFD2] rounded-md" />
              <div className="h-5 w-14 bg-[#EAF1E4] rounded-md" />
            </div>
          ))}
        </div>

        {/* 3-Tier Rack Planner Visualizer Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#E3DFD2]">
            <div className="h-5 w-44 bg-[#E3DFD2] rounded-md" />
            <div className="h-8 w-28 bg-[#E3DFD2] rounded-xl" />
          </div>

          <div className="space-y-4">
            {['Top Tier', 'Middle Tier', 'Bottom Tier'].map((tier, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F8F6EE] border border-[#E3DFD2] space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-28 bg-[#E3DFD2] rounded-md" />
                  <div className="h-4 w-20 bg-[#EAF1E4] rounded-md" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((slot) => (
                    <div key={slot} className="h-20 rounded-xl bg-white border border-[#E3DFD2]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

