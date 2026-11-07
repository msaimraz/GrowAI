import React from 'react';

export default function PlantDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse">
      {/* Top Banner / Breadcrumb Skeleton */}
      <div className="h-16 bg-[#fbf9f4]/95 border-b border-[#ded5c5] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-4 w-36 bg-[#E8E4DA] rounded-md" />
        <div className="h-9 w-28 bg-[#E8E4DA] rounded-xl" />
      </div>

      {/* Hero Botanical Profile Skeleton */}
      <div className="bg-[#174C35]/10 border-b border-[#ded5c5] py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-[#E8E4DA] shrink-0" />
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="h-8 w-60 bg-[#E8E4DA] rounded-xl mx-auto md:mx-0" />
            <div className="h-4 w-40 bg-[#EFEAE0] rounded-md mx-auto md:mx-0" />
            <div className="flex gap-2 justify-center md:justify-start pt-1">
              <div className="h-6 w-24 bg-[#E8E4DA] rounded-full" />
              <div className="h-6 w-20 bg-[#E8E4DA] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Nav Bar Skeleton */}
      <div className="h-12 bg-white border-b border-[#ded5c5] px-4 sm:px-8 flex items-center gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-28 bg-[#E8E4DA] rounded-xl shrink-0" />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 sm:p-8 space-y-4">
          <div className="h-6 w-48 bg-[#E8E4DA] rounded-lg" />
          <div className="h-4 w-full bg-[#EFEAE0] rounded-md" />
          <div className="h-4 w-3/4 bg-[#EFEAE0] rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#FBF9F4] rounded-2xl border border-[#E8E4DA] p-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

