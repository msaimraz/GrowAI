import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PlantTimelineClient } from './PlantTimelineClient';
import { Loader2 } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Plant Growth Timeline — GrowAI Garden`,
    description: `Longitudinal botanical journal and growth timeline for plant ${id}.`,
  };
}

export default async function PlantTimelinePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf9f4] p-8 text-[#526a57] gap-3">
          <Loader2 size={32} className="animate-spin text-[#144229]" />
          <p className="text-sm font-medium">Loading plant timeline...</p>
        </div>
      }
    >
      <PlantTimelineClient plantId={id} />
    </Suspense>
  );
}

