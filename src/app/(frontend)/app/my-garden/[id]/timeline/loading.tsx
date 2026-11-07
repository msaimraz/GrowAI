import React from 'react';

export default function PlantTimelineLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse pb-20">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#fbf9f4]/95 border-b border-[#ded5c5] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E8E4DA] rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-5 w-44 bg-[#E8E4DA] rounded-lg" />
            <div className="h-3 w-56 bg-[#EFEAE0] rounded-md hidden sm:block" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-[#E8E4DA] rounded-xl" />
          <div className="h-9 w-32 bg-[#E8E4DA] rounded-xl" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Specimen Header Card Skeleton */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-5 sm:p-7 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe0]">
            <div className="space-y-2">
              <div className="h-7 w-56 bg-[#E8E4DA] rounded-xl" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-[#EFEAE0] rounded-full" />
                <div className="h-5 w-32 bg-[#EFEAE0] rounded-full" />
              </div>
            </div>
            <div className="h-9 w-36 bg-[#E8E4DA] rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#FBF9F4] rounded-2xl border border-[#E8E4DA] p-3 space-y-1.5">
                <div className="h-3 w-16 bg-[#E8E4DA] rounded-md" />
                <div className="h-4 w-20 bg-[#EFEAE0] rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-[#E8E4DA] rounded-xl shrink-0" />
          ))}
        </div>

        {/* Timeline Stream Skeleton */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E4DA]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative space-y-2">
              {/* Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-[#E8E4DA] border-2 border-[#FBF9F4]" />
              
              <div className="bg-white rounded-2xl border border-[#ded5c5] p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-[#E8E4DA] rounded-full" />
                    <div className="h-5 w-28 bg-[#EFEAE0] rounded-lg" />
                  </div>
                  <div className="h-4 w-20 bg-[#EFEAE0] rounded-md" />
                </div>
                <div className="h-4 w-full bg-[#EFEAE0] rounded-md" />
                <div className="h-4 w-2/3 bg-[#EFEAE0] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

