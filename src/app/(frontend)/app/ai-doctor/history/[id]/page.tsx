import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { DiagnosisDetailClient } from './DiagnosisDetailClient';
import { Loader2 } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Diagnosis Snapshot — GrowAI AI Doctor`,
    description: `Historical botanical diagnosis record ${id} with differential candidates and treatment tracking.`,
  };
}

export default async function DiagnosisDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F6EE] p-8 text-[#5F6D63] gap-3">
          <Loader2 size={32} className="animate-spin text-[#174C35]" />
          <p className="text-sm font-medium">Loading diagnosis details...</p>
        </div>
      }
    >
      <DiagnosisDetailClient diagnosisId={id} />
    </Suspense>
  );
}
