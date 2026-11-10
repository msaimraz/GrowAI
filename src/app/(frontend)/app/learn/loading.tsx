import React from 'react';

export default function LearnLoading() {
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Discovery Hero Skeleton */}
        <div className="p-8 rounded-3xl bg-[#174C35]/15 border border-[#E3DFD2] space-y-3">
          <div className="h-7 w-64 bg-[#E3DFD2] rounded-xl" />
          <div className="h-4 w-full max-w-xl bg-[#EAF1E4] rounded-md" />
        </div>

        {/* 3 Categories Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#E3DFD2] p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E3DFD2]" />
              <div className="h-5 w-36 bg-[#E3DFD2] rounded-md" />
              <div className="h-3.5 w-full bg-[#EAF1E4] rounded-md" />
              <div className="h-3.5 w-3/4 bg-[#EAF1E4] rounded-md" />
              <div className="h-9 w-28 bg-[#E3DFD2] rounded-xl pt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

