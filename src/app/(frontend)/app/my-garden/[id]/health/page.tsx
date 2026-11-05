import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PlantHealthDetailClient } from './PlantHealthDetailClient';
import { Loader2 } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Plant Health & Monitoring Timeline — GrowAI',
    description: `Track phytopathology assessments, treatment interventions, and follow-up outcomes for specimen ${id}.`,
  };
}

export default async function PlantHealthPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf9f4] p-8 text-[#526a57] gap-3">
          <Loader2 size={32} className="animate-spin text-[#144229]" />
          <p className="text-sm font-medium">Loading plant health timeline...</p>
        </div>
      }
    >
      <PlantHealthDetailClient plantId={id} />
    </Suspense>
  );
}

