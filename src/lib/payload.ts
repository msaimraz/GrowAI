/**
 * Payload CMS Integration Boundary for GrowAI
 *
 * Payload CMS is planned for subsequent phases to manage:
 * 1. Curated plant botanical database & species profiles
 * 2. Educational gardening articles & 3R sustainability guides
 * 3. Seasonal gardening editorial calendars
 *
 * Supabase and Payload CMS are intentionally decoupled:
 * - Payload CMS manages curated public knowledge and botanical content.
 * - Supabase manages private user profiles, personal garden logs, and device tasks.
 * - Neither system conflicts with or directly manages the other's database tables.
 */

import { Plant } from '@/types/plant';
import { PLANTS_DATA, getPlantBySlug as getLocalPlantBySlug } from '@/data/plants';

export interface PayloadConfig {
  cmsUrl?: string;
  apiToken?: string;
  isConfigured: boolean;
}

export function getPayloadConfig(): PayloadConfig {
  const cmsUrl = process.env.PAYLOAD_CMS_URL || process.env.NEXT_PUBLIC_PAYLOAD_CMS_URL;
  const apiToken = process.env.PAYLOAD_API_TOKEN;

  const isConfigured = Boolean(
    cmsUrl &&
    cmsUrl.startsWith('http') &&
    !cmsUrl.includes('placeholder')
  );

  return {
    cmsUrl,
    apiToken,
    isConfigured,
  };
}

/**
 * Clean data fetcher with seamless local fallback.
 * Currently serves the typed high-integrity PLANTS_DATA dataset.
 * When PAYLOAD_CMS_URL is connected in phase 2, it queries the Payload REST/GraphQL API.
 */
export async function fetchPublishedPlants(): Promise<Plant[]> {
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();

  if (isConfigured && cmsUrl) {
    try {
      const res = await fetch(`${cmsUrl}/api/plants?depth=2&limit=100`, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.docs && Array.isArray(data.docs)) {
          return data.docs as Plant[];
        }
      }
    } catch (err) {
      console.warn('Payload CMS connection failed, falling back to local dataset', err);
    }
  }

  return PLANTS_DATA;
}

export async function fetchPlantBySlug(slug: string): Promise<Plant | undefined> {
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();

  if (isConfigured && cmsUrl) {
    try {
      const res = await fetch(`${cmsUrl}/api/plants?where[slug][equals]=${encodeURIComponent(slug)}`, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          return data.docs[0] as Plant;
        }
      }
    } catch (err) {
      console.warn(`Payload CMS fetch for slug "${slug}" failed, falling back to local dataset`, err);
    }
  }

  return getLocalPlantBySlug(slug);
}
