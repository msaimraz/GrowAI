import React from 'react';

export default function PlantHealthLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6EE] animate-pulse pb-20">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#F8F6EE]/95 border-b border-[#E3DFD2] px-4 sm:px-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-48 bg-[#E3DFD2] rounded-lg" />
          <div className="h-3 w-64 bg-[#EAF1E4] rounded-md hidden sm:block" />
        </div>
        <div className="h-9 w-28 bg-[#E3DFD2] rounded-xl" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-36 bg-[#E3DFD2] rounded-md" />

        {/* Specimen Health Banner Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E3DFD2] p-5 sm:p-7 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DFD2]">
            <div className="space-y-2">
              <div className="h-7 w-52 bg-[#E3DFD2] rounded-xl" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-[#EAF1E4] rounded-full" />
                <div className="h-5 w-24 bg-[#EAF1E4] rounded-full" />
              </div>
            </div>
            <div className="h-9 w-32 bg-[#E3DFD2] rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] p-3 space-y-1.5">
                <div className="h-3 w-16 bg-[#E3DFD2] rounded-md" />
                <div className="h-4 w-20 bg-[#EAF1E4] rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Health Assessments Timeline Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-44 bg-[#E3DFD2] rounded-md" />
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E3DFD2] p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 w-40 bg-[#E3DFD2] rounded-md" />
                <div className="h-4 w-24 bg-[#EAF1E4] rounded-md" />
              </div>
              <div className="h-4 w-full bg-[#EAF1E4] rounded-md" />
              <div className="h-8 w-28 bg-[#EAF1E4] rounded-xl mt-2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

