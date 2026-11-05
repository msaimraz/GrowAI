import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PlanDetailClient } from './PlanDetailClient';
import { Loader2 } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Grow Plan Details — GrowAI',
    description: `Track execution, steps, and progress for grow plan ${id}.`,
  };
}

export default async function GrowPlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 p-8 text-stone-600 dark:text-stone-400 gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Loading grow plan details...</p>
        </div>
      }
    >
      <PlanDetailClient planId={id} />
    </Suspense>
  );
}
