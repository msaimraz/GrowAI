import React from 'react';

export default function PlanDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] animate-pulse pb-20">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#fbf9f4]/95 border-b border-[#ded5c5] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-4 w-32 bg-[#E8E4DA] rounded-md" />
        <div className="h-9 w-9 bg-[#E8E4DA] rounded-xl" />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-28 bg-[#E8E4DA] rounded-md" />

        {/* Plan Header Card Skeleton */}
        <div className="bg-white border border-[#ded5c5] rounded-2xl p-6 space-y-4">
          <div className="flex gap-2 items-center">
            <div className="h-5 w-20 bg-[#E8E4DA] rounded-md" />
            <div className="h-5 w-16 bg-[#E8E4DA] rounded-md" />
          </div>
          <div className="h-7 w-64 bg-[#E8E4DA] rounded-xl" />
          <div className="h-4 w-full max-w-xl bg-[#EFEAE0] rounded-md" />
          <div className="h-4 w-40 bg-[#EFEAE0] rounded-md pt-2" />
        </div>

        {/* Progress Card Skeleton */}
        <div className="bg-white border border-[#ded5c5] rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-[#E8E4DA] rounded-md" />
            <div className="h-5 w-12 bg-[#E8E4DA] rounded-md" />
          </div>
          <div className="h-3 w-full bg-[#E8E4DA] rounded-full" />
        </div>

        {/* Milestone Steps Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-36 bg-[#E8E4DA] rounded-md" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#ded5c5] rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8E4DA]" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-[#E8E4DA] rounded-md" />
                  <div className="h-3 w-32 bg-[#EFEAE0] rounded-md" />
                </div>
              </div>
              <div className="h-8 w-24 bg-[#E8E4DA] rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

