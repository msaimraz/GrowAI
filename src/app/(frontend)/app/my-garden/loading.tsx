import React from 'react';

export default function MyGardenLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#fbf9f4]/95 border-b border-[#ded5c5] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-48 bg-[#E8E4DA] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#EFEAE0] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E8E4DA] rounded-xl" />
          <div className="h-9 w-28 bg-[#E8E4DA] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 max-w-full">
          {/* Left Column: Plant Selection Rail / Sidebar Skeleton */}
          <div className="col-span-1 lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="h-5 w-32 bg-[#E8E4DA] rounded-md" />
              <div className="h-8 w-24 bg-[#E8E4DA] rounded-xl" />
            </div>

            {/* Plant cards skeleton list */}
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-white border border-[#E8E4DA] flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E8E4DA] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-[#E8E4DA] rounded-md" />
                    <div className="h-3 w-40 bg-[#EFEAE0] rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Care tasks card skeleton */}
            <div className="bg-white p-5 rounded-2xl border border-[#ded5c5] space-y-3">
              <div className="h-4 w-28 bg-[#E8E4DA] rounded-md" />
              <div className="space-y-2 pt-2">
                <div className="h-10 bg-[#F4F8F4] rounded-xl" />
                <div className="h-10 bg-[#F4F8F4] rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column: Active Plant Detail & Journal Skeleton */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0ebe0]">
                <div className="space-y-2">
                  <div className="h-7 w-48 bg-[#E8E4DA] rounded-xl" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-[#EFEAE0] rounded-full" />
                    <div className="h-5 w-24 bg-[#EFEAE0] rounded-full" />
                  </div>
                </div>
                <div className="h-9 w-28 bg-[#E8E4DA] rounded-xl" />
              </div>

              {/* Quick metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-[#FBF9F4] rounded-2xl border border-[#E8E4DA] p-3 space-y-1.5">
                    <div className="h-3 w-16 bg-[#E8E4DA] rounded-md" />
                    <div className="h-4 w-20 bg-[#EFEAE0] rounded-md" />
                  </div>
                ))}
              </div>

              {/* Journal tabs skeleton */}
              <div className="flex gap-2 pt-2 border-b border-[#f0ebe0] pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-20 bg-[#E8E4DA] rounded-xl" />
                ))}
              </div>

              {/* Feed items skeleton */}
              <div className="space-y-3 pt-2">
                <div className="h-20 bg-[#F4F8F4] rounded-2xl" />
                <div className="h-20 bg-[#F4F8F4] rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

