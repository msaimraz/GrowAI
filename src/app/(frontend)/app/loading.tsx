import React from 'react';

export default function AppRootLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-white/70 border-b border-[#E8E4DA] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-6 w-36 bg-[#E8E4DA] rounded-lg" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E8E4DA] rounded-xl" />
          <div className="h-9 w-24 bg-[#E8E4DA] rounded-xl hidden sm:block" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 w-56 bg-[#E8E4DA] rounded-xl" />
        <div className="h-4 w-72 bg-[#EFEAE0] rounded-md" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-[#E8E4DA] p-5 space-y-3">
              <div className="h-5 w-28 bg-[#E8E4DA] rounded-md" />
              <div className="h-4 w-40 bg-[#EFEAE0] rounded-md" />
              <div className="h-12 w-full bg-[#F4F8F4] rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

