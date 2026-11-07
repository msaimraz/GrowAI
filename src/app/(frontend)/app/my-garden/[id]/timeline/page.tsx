import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PlantTimelineClient } from './PlantTimelineClient';
import PlantTimelineLoading from './loading';

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
    <Suspense fallback={<PlantTimelineLoading />}>
      <PlantTimelineClient plantId={id} />
    </Suspense>
  );
}
