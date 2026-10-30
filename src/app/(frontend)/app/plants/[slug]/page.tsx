import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPlantBySlug } from '@/lib/payload';
import { PlantDetailClient } from './PlantDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}
export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = await fetchPlantBySlug(slug);

  if (!plant) {
    return {
      title: 'Plant Not Found — GrowAI',
    };
  }

  return {
    title: `${plant.commonName} (${plant.scientificName}) — GrowAI Plant Profile`,
    description: plant.summary,
  };
}

export default async function PlantDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const plant = await fetchPlantBySlug(slug);

  if (!plant) {
    notFound();
  }

  return <PlantDetailClient plant={plant} />;
}
