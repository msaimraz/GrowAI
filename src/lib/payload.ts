/**
 * Payload CMS Server-Side Content Access Layer for GrowAI
 *
 * Responsibilities:
 * 1. Fetch published plant records, categories, and educational articles.
 * 2. Connect directly via Payload Local API when PAYLOAD_DATABASE_URI is set,
 *    or via REST API when PAYLOAD_CMS_URL is set.
 * 3. Validate and map CMS documents to strictly-typed domain models.
 * 4. Gracefully fall back to verified local datasets (PLANTS_DATA, PLANT_CATEGORIES, ARTICLES_DATA)
 *    when CMS database credentials are unset or the CMS service is unreachable.
 * 5. Strictly enforce that draft content is never exposed to public visitors.
 * 6. Never allow a CMS outage or configuration gap to crash GrowAI or break the public catalog.
 */

import { Plant, CategoryMetadata, PlantCategory } from '@/types/plant';
import { EditorialArticle } from '@/types/article';
import { PLANTS_DATA, getPlantBySlug as getLocalPlantBySlug } from '@/data/plants';
import { PLANT_CATEGORIES } from '@/data/categories';
import { ARTICLES_DATA, getArticleBySlug as getLocalArticleBySlug } from '@/data/articles';

let cachedPayload: any = null;

/**
 * Obtain a cached or new Payload Local API instance for server-side queries.
 */
export async function getPayloadClient() {
  const dbUri = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;
  if (!dbUri || dbUri.includes('placeholder')) {
    return null;
  }

  if (cachedPayload) return cachedPayload;

  try {
    const { getPayload } = await import('payload');
    const configPromise = (await import('@payload-config')).default;
    cachedPayload = await getPayload({ config: configPromise });
    return cachedPayload;
  } catch (err) {
    console.warn('Failed to initialize Payload Local API client, falling back:', err);
    return null;
  }
}

export interface PayloadConfig {
  cmsUrl?: string;
  apiToken?: string;
  isConfigured: boolean;
}

export function getPayloadConfig(): PayloadConfig {
  // Read CMS endpoint from environment
  const cmsUrl =
    process.env.PAYLOAD_CMS_URL ||
    process.env.NEXT_PUBLIC_PAYLOAD_CMS_URL;

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
 * Validates and safely maps a raw Payload CMS plant document into the strict GrowAI Plant interface.
 * Returns null if the document lacks critical botanical identification fields.
 */
function mapPayloadDocToPlant(doc: Record<string, any>): Plant | null {
  if (!doc || typeof doc !== 'object') return null;
  if (!doc.slug || !doc.commonName || !doc.scientificName) return null;

  try {
    return {
      id: String(doc.id || doc.slug),
      slug: String(doc.slug),
      commonName: String(doc.commonName),
      scientificName: String(doc.scientificName),
      category: (doc.categorySlug || 'herbs-greens') as PlantCategory,
      summary: String(doc.summary || ''),
      environments: Array.isArray(doc.environments) && doc.environments.length > 0
        ? doc.environments
        : ['balcony', 'vertical-rack'],
      temperatureRange: {
        min: Number(doc.temperatureRange?.min ?? 15),
        max: Number(doc.temperatureRange?.max ?? 28),
        unit: 'C',
        idealRange: doc.temperatureRange?.idealRange || `${doc.temperatureRange?.min ?? 15}°C–${doc.temperatureRange?.max ?? 28}°C`,
      },
      sunlight: doc.sunlight || 'partial-sun',
      sunlightHours: String(doc.sunlightHours || '4–6 hours daily'),
      watering: {
        frequency: String(doc.watering?.frequency || 'When topsoil is dry'),
        guidance: String(doc.watering?.guidance || 'Keep moderately moist, avoid waterlogging.'),
        moistureLevel: doc.watering?.moistureLevel || 'moderate',
      },
      soil: {
        type: String(doc.soil?.type || 'Well-draining potting soil'),
        drainage: String(doc.soil?.drainage || 'High drainage with perlite'),
        recommendedMix: doc.soil?.recommendedMix || undefined,
      },
      potting: {
        minDepthCm: Number(doc.potting?.minDepthCm ?? 15),
        spacingCm: Number(doc.potting?.spacingCm ?? 15),
        recommendedPotSize: String(doc.potting?.recommendedPotSize || '3–5 Liters'),
      },
      humidity: doc.humidity
        ? {
            min: Number(doc.humidity.min ?? 40),
            max: Number(doc.humidity.max ?? 70),
            note: doc.humidity.note || undefined,
          }
        : undefined,
      ph: doc.ph
        ? {
            min: Number(doc.ph.min ?? 6.0),
            max: Number(doc.ph.max ?? 7.0),
            note: doc.ph.note || undefined,
          }
        : undefined,
      timelines: {
        germinationDays: {
          min: Number(doc.timelines?.germinationMin ?? 5),
          max: Number(doc.timelines?.germinationMax ?? 10),
        },
        seedlingDays: {
          min: Number(doc.timelines?.seedlingMin ?? 10),
          max: Number(doc.timelines?.seedlingMax ?? 20),
        },
        harvestDays: doc.timelines?.harvestMin
          ? {
              min: Number(doc.timelines.harvestMin),
              max: Number(doc.timelines.harvestMax ?? doc.timelines.harvestMin),
            }
          : undefined,
        floweringDays: doc.timelines?.floweringMin
          ? {
              min: Number(doc.timelines.floweringMin),
              max: Number(doc.timelines.floweringMax ?? doc.timelines.floweringMin),
            }
          : undefined,
        maturityDays: {
          min: Number(doc.timelines?.maturityMin ?? 45),
          max: Number(doc.timelines?.maturityMax ?? 60),
        },
        timelineNotes: doc.timelines?.timelineNotes || undefined,
      },
      verticalSuitability: {
        isSuitable: Boolean(doc.verticalSuitability?.isSuitable ?? true),
        rating: doc.verticalSuitability?.rating || 'ideal',
        recommendedTier: doc.verticalSuitability?.recommendedTier || 'middle',
        notes: String(doc.verticalSuitability?.notes || 'Suitable for vertical placement.'),
      },
      difficulty: {
        level: doc.difficulty?.level || 'beginner',
        score: Number(doc.difficulty?.score ?? 2),
        methodologyNotes: String(doc.difficulty?.methodologyNotes || 'Standard container demands.'),
      },
      commonProblems: Array.isArray(doc.commonProblems)
        ? doc.commonProblems.map((p: any) => ({
            issue: String(p.issue || ''),
            symptoms: String(p.symptoms || ''),
            prevention: String(p.prevention || ''),
            organicRemedy: String(p.organicRemedy || ''),
          }))
        : [],
      practicalUses: Array.isArray(doc.practicalUses)
        ? doc.practicalUses.map((u: any) => (typeof u === 'string' ? u : String(u.item || '')))
        : [],
      safetyNotes: doc.safetyNotes || undefined,
      sourceUrls: Array.isArray(doc.sourceUrls)
        ? doc.sourceUrls.map((s: any) => (typeof s === 'string' ? s : String(s.url || '')))
        : [],
      dataReviewStatus: doc.dataReviewStatus || 'verified',
      featured: Boolean(doc.featured),
      badge: doc.badge || undefined,
    };
  } catch (err) {
    console.warn(`Error mapping CMS plant document "${doc.slug}":`, err);
    return null;
  }
}

/**
 * Fetch all published plants from Payload CMS with fallback to PLANTS_DATA.
 * Checks Payload Local API first, then HTTP API, then local PLANTS_DATA.
 */
export async function fetchPublishedPlants(): Promise<Plant[]> {
  // 1. Try Payload Local API (fastest, embedded database access)
  const payload = await getPayloadClient();
  if (payload) {
    try {
      const res = await payload.find({
        collection: 'plants',
        where: {
          _status: { equals: 'published' },
        },
        limit: 100,
        depth: 2,
      });

      if (res && Array.isArray(res.docs) && res.docs.length > 0) {
        const mappedPlants = res.docs
          .map(mapPayloadDocToPlant)
          .filter((p: Plant | null): p is Plant => p !== null);

        if (mappedPlants.length > 0) {
          return mappedPlants;
        }
      }
    } catch (err) {
      console.warn('Payload Local API fetchPublishedPlants failed, falling back:', err);
    }
  }

  // 2. Try Payload REST API if configured
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();
  if (isConfigured && cmsUrl) {
    try {
      const url = `${cmsUrl}/plants?where[_status][equals]=published&depth=2&limit=100`;
      const res = await fetch(url, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          const mappedPlants = data.docs
            .map(mapPayloadDocToPlant)
            .filter((p: Plant | null): p is Plant => p !== null);

          if (mappedPlants.length > 0) {
            return mappedPlants;
          }
        }
      }
    } catch (err) {
      console.warn('Payload CMS HTTP fetchPublishedPlants failed:', err);
    }
  }

  // 3. Fallback to local verified dataset
  return PLANTS_DATA;
}

/**
 * Fetch a single plant by slug from Payload CMS with fallback to PLANTS_DATA.
 */
export async function fetchPlantBySlug(slug: string): Promise<Plant | undefined> {
  // 1. Try Payload Local API
  const payload = await getPayloadClient();
  if (payload) {
    try {
      const res = await payload.find({
        collection: 'plants',
        where: {
          slug: { equals: slug },
          _status: { equals: 'published' },
        },
        limit: 1,
        depth: 2,
      });

      if (res && Array.isArray(res.docs) && res.docs.length > 0) {
        const plant = mapPayloadDocToPlant(res.docs[0]);
        if (plant) return plant;
      }
    } catch (err) {
      console.warn(`Payload Local API fetchPlantBySlug(${slug}) failed:`, err);
    }
  }

  // 2. Try Payload REST API
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();
  if (isConfigured && cmsUrl) {
    try {
      const url = `${cmsUrl}/plants?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=2&limit=1`;
      const res = await fetch(url, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          const plant = mapPayloadDocToPlant(data.docs[0]);
          if (plant) return plant;
        }
      }
    } catch (err) {
      console.warn(`Payload CMS fetchPlantBySlug(${slug}) error, falling back:`, err);
    }
  }

  return getLocalPlantBySlug(slug);
}

/**
 * Fetch plant categories from Payload CMS with fallback to PLANT_CATEGORIES.
 */
export async function fetchPublishedCategories(): Promise<CategoryMetadata[]> {
  // 1. Try Payload Local API
  const payload = await getPayloadClient();
  if (payload) {
    try {
      const res = await payload.find({
        collection: 'categories',
        sort: 'order',
        limit: 50,
      });

      if (res && Array.isArray(res.docs) && res.docs.length > 0) {
        return res.docs.map((doc: any) => ({
          id: doc.slug as PlantCategory,
          label: doc.name || doc.label,
          description: doc.description || '',
          iconName: doc.iconName || 'Sprout',
        }));
      }
    } catch (err) {
      console.warn('Payload Local API fetchPublishedCategories failed:', err);
    }
  }

  // 2. Try Payload REST API
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();
  if (isConfigured && cmsUrl) {
    try {
      const url = `${cmsUrl}/categories?sort=order&limit=50`;
      const res = await fetch(url, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs.map((doc: any) => ({
            id: doc.slug as PlantCategory,
            label: doc.name || doc.label,
            description: doc.description || '',
            iconName: doc.iconName || 'Sprout',
          }));
        }
      }
    } catch (err) {
      console.warn('Payload CMS fetchPublishedCategories error, falling back:', err);
    }
  }

  return PLANT_CATEGORIES;
}

/**
 * Fetch published educational articles from Payload CMS with fallback to ARTICLES_DATA.
 */
export async function fetchPublishedArticles(category?: string): Promise<EditorialArticle[]> {
  // 1. Try Payload Local API
  const payload = await getPayloadClient();
  if (payload) {
    try {
      const query: Record<string, any> = {
        _status: { equals: 'published' },
      };
      if (category && category !== 'all') {
        query.category = { equals: category };
      }

      const res = await payload.find({
        collection: 'articles',
        where: query,
        sort: '-publishedAt',
        limit: 50,
      });

      if (res && Array.isArray(res.docs) && res.docs.length > 0) {
        return res.docs.map((doc: any) => ({
          id: String(doc.id || doc.slug),
          slug: String(doc.slug),
          title: String(doc.title),
          summary: String(doc.summary),
          category: doc.category,
          coverImageUrl: doc.coverImageUrl || doc.coverImage?.url,
          content: typeof doc.content === 'string' ? doc.content : undefined,
          publishedAt: doc.publishedAt,
          seo: doc.seo,
        }));
      }
    } catch (err) {
      console.warn('Payload Local API fetchPublishedArticles failed:', err);
    }
  }

  // 2. Try Payload REST API
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();
  if (isConfigured && cmsUrl) {
    try {
      let url = `${cmsUrl}/articles?where[_status][equals]=published&sort=-publishedAt&limit=50`;
      if (category && category !== 'all') {
        url += `&where[category][equals]=${encodeURIComponent(category)}`;
      }

      const res = await fetch(url, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs.map((doc: any) => ({
            id: String(doc.id || doc.slug),
            slug: String(doc.slug),
            title: String(doc.title),
            summary: String(doc.summary),
            category: doc.category,
            coverImageUrl: doc.coverImageUrl || doc.coverImage?.url,
            content: typeof doc.content === 'string' ? doc.content : undefined,
            publishedAt: doc.publishedAt,
            seo: doc.seo,
          }));
        }
      }
    } catch (err) {
      console.warn('Payload CMS fetchPublishedArticles error, falling back:', err);
    }
  }

  if (category && category !== 'all') {
    return ARTICLES_DATA.filter((a) => a.category === category);
  }

  return ARTICLES_DATA;
}

/**
 * Fetch an educational article by slug from Payload CMS with fallback to ARTICLES_DATA.
 */
export async function fetchArticleBySlug(slug: string): Promise<EditorialArticle | undefined> {
  // 1. Try Payload Local API
  const payload = await getPayloadClient();
  if (payload) {
    try {
      const res = await payload.find({
        collection: 'articles',
        where: {
          slug: { equals: slug },
          _status: { equals: 'published' },
        },
        limit: 1,
      });

      if (res && Array.isArray(res.docs) && res.docs.length > 0) {
        const doc = res.docs[0];
        return {
          id: String(doc.id || doc.slug),
          slug: String(doc.slug),
          title: String(doc.title),
          summary: String(doc.summary),
          category: doc.category,
          coverImageUrl: doc.coverImageUrl || doc.coverImage?.url,
          content: typeof doc.content === 'string' ? doc.content : undefined,
          publishedAt: doc.publishedAt,
          seo: doc.seo,
        };
      }
    } catch (err) {
      console.warn(`Payload Local API fetchArticleBySlug(${slug}) failed:`, err);
    }
  }

  // 2. Try Payload REST API
  const { isConfigured, cmsUrl, apiToken } = getPayloadConfig();
  if (isConfigured && cmsUrl) {
    try {
      const url = `${cmsUrl}/articles?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&limit=1`;
      const res = await fetch(url, {
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          const doc = data.docs[0];
          return {
            id: String(doc.id || doc.slug),
            slug: String(doc.slug),
            title: String(doc.title),
            summary: String(doc.summary),
            category: doc.category,
            coverImageUrl: doc.coverImageUrl || doc.coverImage?.url,
            content: typeof doc.content === 'string' ? doc.content : undefined,
            publishedAt: doc.publishedAt,
            seo: doc.seo,
          };
        }
      }
    } catch (err) {
      console.warn(`Payload CMS fetchArticleBySlug(${slug}) error, falling back:`, err);
    }
  }

  return getLocalArticleBySlug(slug);
}
