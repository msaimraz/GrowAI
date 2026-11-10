import React from 'react';

export default function AppRootLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-white/70 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-6 w-36 bg-[#E3DFD2] rounded-lg" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E3DFD2] rounded-xl" />
          <div className="h-9 w-24 bg-[#E3DFD2] rounded-xl hidden sm:block" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 w-56 bg-[#E3DFD2] rounded-xl" />
        <div className="h-4 w-72 bg-[#EAF1E4] rounded-md" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-[#E3DFD2] p-5 space-y-3">
              <div className="h-5 w-28 bg-[#E3DFD2] rounded-md" />
              <div className="h-4 w-40 bg-[#EAF1E4] rounded-md" />
              <div className="h-12 w-full bg-[#EAF1E4] rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

