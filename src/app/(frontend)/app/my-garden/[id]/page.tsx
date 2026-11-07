import { redirect } from 'next/navigation';

export const instant = false;

export default async function GardenPlantRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/app/my-garden?plant=${encodeURIComponent(id)}`);
}

