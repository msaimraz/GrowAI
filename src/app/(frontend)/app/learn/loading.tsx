import React from 'react';

export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#fbf9f4]/95 border-b border-[#ded5c5] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-52 bg-[#E8E4DA] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#EFEAE0] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E8E4DA] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Discovery Hero Skeleton */}
        <div className="p-8 rounded-3xl bg-[#144229]/15 border border-[#ded5c5] space-y-3">
          <div className="h-7 w-64 bg-[#E8E4DA] rounded-xl" />
          <div className="h-4 w-full max-w-xl bg-[#EFEAE0] rounded-md" />
        </div>

        {/* 3 Categories Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#ded5c5] p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E8E4DA]" />
              <div className="h-5 w-36 bg-[#E8E4DA] rounded-md" />
              <div className="h-3.5 w-full bg-[#EFEAE0] rounded-md" />
              <div className="h-3.5 w-3/4 bg-[#EFEAE0] rounded-md" />
              <div className="h-9 w-28 bg-[#E8E4DA] rounded-xl pt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

