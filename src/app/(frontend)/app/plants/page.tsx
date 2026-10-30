import React from 'react';
import { Metadata } from 'next';
import { fetchPublishedPlants, fetchPublishedCategories } from '@/lib/payload';
import { PlantLibraryClient } from './PlantLibraryClient';
export const instant = false;

export const metadata: Metadata = {
  title: 'Plant Library & Botanical Index — GrowAI',
  description:
    'Browse 16 curated species with verified agronomic parameters, sunlight requirements, and vertical farming suitability.',
};

export default async function PlantLibraryPage() {
  const [plants, categories] = await Promise.all([
    fetchPublishedPlants(),
    fetchPublishedCategories(),
  ]);

  return (
    <PlantLibraryClient
      initialPlants={plants}
      initialCategories={categories}
    />
  );
}
