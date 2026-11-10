import React from 'react';

export default function PlanDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse pb-20">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#F8F6EE]/95 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-4 w-32 bg-[#E3DFD2] rounded-md" />
        <div className="h-9 w-9 bg-[#E3DFD2] rounded-xl" />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-28 bg-[#E3DFD2] rounded-md" />

        {/* Plan Header Card Skeleton */}
        <div className="bg-white border border-[#E3DFD2] rounded-2xl p-6 space-y-4">
          <div className="flex gap-2 items-center">
            <div className="h-5 w-20 bg-[#E3DFD2] rounded-md" />
            <div className="h-5 w-16 bg-[#E3DFD2] rounded-md" />
          </div>
          <div className="h-7 w-64 bg-[#E3DFD2] rounded-xl" />
          <div className="h-4 w-full max-w-xl bg-[#EAF1E4] rounded-md" />
          <div className="h-4 w-40 bg-[#EAF1E4] rounded-md pt-2" />
        </div>

        {/* Progress Card Skeleton */}
        <div className="bg-white border border-[#E3DFD2] rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-[#E3DFD2] rounded-md" />
            <div className="h-5 w-12 bg-[#E3DFD2] rounded-md" />
          </div>
          <div className="h-3 w-full bg-[#E3DFD2] rounded-full" />
        </div>

        {/* Milestone Steps Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-36 bg-[#E3DFD2] rounded-md" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E3DFD2] rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E3DFD2]" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-[#E3DFD2] rounded-md" />
                  <div className="h-3 w-32 bg-[#EAF1E4] rounded-md" />
                </div>
              </div>
              <div className="h-8 w-24 bg-[#E3DFD2] rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

