import React from 'react';

export default function AiDoctorLoading() {
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Skeleton */}
        <div className="p-6 rounded-3xl bg-[#144229]/15 border border-[#ded5c5] space-y-2">
          <div className="h-6 w-56 bg-[#E8E4DA] rounded-xl" />
          <div className="h-4 w-full max-w-lg bg-[#EFEAE0] rounded-md" />
        </div>

        {/* Upload & Form Skeleton */}
        <div className="bg-white rounded-3xl border border-[#ded5c5] p-6 space-y-6">
          <div className="h-44 w-full rounded-2xl bg-[#FBF9F4] border-2 border-dashed border-[#E8E4DA] flex items-center justify-center">
            <div className="h-10 w-40 bg-[#E8E4DA] rounded-xl" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-32 bg-[#E8E4DA] rounded-md" />
            <div className="h-10 w-full bg-[#FBF9F4] rounded-xl border border-[#E8E4DA]" />
          </div>

          <div className="h-12 w-full bg-[#E8E4DA] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

