import React from 'react';

export default function PlantsLoading() {
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
        {/* Search Bar & Filter Chips Skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full max-w-xl bg-white border border-[#ded5c5] rounded-2xl" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 w-24 bg-[#E8E4DA] rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        {/* 6 Plant Cards Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden space-y-4"
            >
              <div className="aspect-4/3 w-full bg-[#EFEAE0]" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-36 bg-[#E8E4DA] rounded-md" />
                <div className="h-3.5 w-24 bg-[#EFEAE0] rounded-md" />
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-20 bg-[#F4F8F4] rounded-lg" />
                  <div className="h-6 w-20 bg-[#F4F8F4] rounded-lg" />
                </div>
                <div className="pt-3 border-t border-[#F3F6EC] flex justify-between items-center">
                  <div className="h-3 w-16 bg-[#EFEAE0] rounded-md" />
                  <div className="h-4 w-12 bg-[#E8E4DA] rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

