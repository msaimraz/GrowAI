import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PLANTS_DATA, getPlantBySlug } from '@/data/plants';
import { fetchPlantBySlug } from '@/lib/payload';
import { PlantDetailClient } from './PlantDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLANTS_DATA.map((plant) => ({
    slug: plant.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);

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
