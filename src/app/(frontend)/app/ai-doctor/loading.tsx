import React from 'react';

export default function AiDoctorLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#F8F6EE]/95 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-48 bg-[#E3DFD2] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#EAF1E4] rounded-md hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E3DFD2] rounded-xl" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Skeleton */}
        <div className="p-6 rounded-3xl bg-[#174C35]/15 border border-[#E3DFD2] space-y-2">
          <div className="h-6 w-56 bg-[#E3DFD2] rounded-xl" />
          <div className="h-4 w-full max-w-lg bg-[#EAF1E4] rounded-md" />
        </div>

        {/* Upload & Form Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-6 space-y-6">
          <div className="h-44 w-full rounded-2xl bg-[#F8F6EE] border-2 border-dashed border-[#E3DFD2] flex items-center justify-center">
            <div className="h-10 w-40 bg-[#E3DFD2] rounded-xl" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-32 bg-[#E3DFD2] rounded-md" />
            <div className="h-10 w-full bg-[#F8F6EE] rounded-xl border border-[#E3DFD2]" />
          </div>

          <div className="h-12 w-full bg-[#E3DFD2] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

