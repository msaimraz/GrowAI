import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PlantHealthDetailClient } from './PlantHealthDetailClient';
import PlantHealthLoading from './loading';

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
    <Suspense fallback={<PlantHealthLoading />}>
      <PlantHealthDetailClient plantId={id} />
    </Suspense>
  );
}
