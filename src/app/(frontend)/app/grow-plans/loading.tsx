import React from 'react';

export default function GrowPlansLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#F8F6EE]/95 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-48 bg-[#E3DFD2] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#EAF1E4] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E3DFD2] rounded-xl" />
          <div className="h-9 w-32 bg-[#E3DFD2] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-[#E3DFD2] rounded-xl shrink-0" />
            ))}
          </div>
          <div className="h-9 w-60 bg-white border border-[#E3DFD2] rounded-xl" />
        </div>

        {/* 3 Plan Cards Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 bg-white rounded-2xl border border-[#E3DFD2] p-5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-40 bg-[#E3DFD2] rounded-md" />
                  <div className="h-3.5 w-24 bg-[#EAF1E4] rounded-md" />
                </div>
                <div className="h-6 w-16 bg-[#E3DFD2] rounded-full" />
              </div>
              <div className="h-3 w-full bg-[#EAF1E4] rounded-md" />
              <div className="h-2 w-full bg-[#E3DFD2] rounded-full mt-4" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-20 bg-[#EAF1E4] rounded-md" />
                <div className="h-4 w-14 bg-[#E3DFD2] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

