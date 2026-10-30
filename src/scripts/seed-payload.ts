/**
 * Idempotent Payload CMS Content Seed Script
 *
 * Transfers the 16 curated botanical plants, 6 core categories, and educational
 * articles into Payload CMS.
 *
 * Safe to execute multiple times:
 * - Checks each record by unique slug prior to creation.
 * - Never overwrites or duplicates existing records.
 * - Does not touch or modify Supabase user garden tables.
 *
 * Run with:
 *   npx tsx src/scripts/seed-payload.ts
 */

import { getPayload } from 'payload';
import configPromise from '../payload.config';
import { PLANTS_DATA } from '../data/plants';
import { PLANT_CATEGORIES } from '../data/categories';
import { ARTICLES_DATA } from '../data/articles';

if (!process.env.PAYLOAD_DATABASE_URI && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // Ignore error if file is already loaded
  }
}

async function seed() {
  console.log('🌱 Starting GrowAI Payload CMS Seed...');

  const databaseUri = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;
  if (!databaseUri || databaseUri.includes('placeholder')) {
    console.warn(
      '⚠️  PAYLOAD_DATABASE_URI is not configured in .env.local.\n' +
      '   Please set PAYLOAD_DATABASE_URI to a valid PostgreSQL connection string\n' +
      '   before running this seed script against a live database.'
    );
    return;
  }

  const payload = await getPayload({ config: configPromise });

  // 1. Seed Categories
  console.log('\n📂 Seeding Categories...');
  const categoryIdMap: Record<string, string | number> = {};

  for (let i = 0; i < PLANT_CATEGORIES.length; i++) {
    const cat = PLANT_CATEGORIES[i];
    const existing = await payload.find({
      collection: 'categories',
      where: {
        slug: { equals: cat.id },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`  ✓ Category already exists: "${cat.label}" (${cat.id})`);
      categoryIdMap[cat.id] = existing.docs[0].id;
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: {
          name: cat.label,
          slug: cat.id,
          description: cat.description,
          iconName: cat.iconName,
          order: i,
        },
      });
      console.log(`  + Created category: "${cat.label}" (${cat.id})`);
      categoryIdMap[cat.id] = created.id;
    }
  }

  // 2. Seed Plants
  console.log('\n🌿 Seeding 16 Curated Botanical Plant Profiles...');
  let plantsCreated = 0;
  let plantsSkipped = 0;

  for (const plant of PLANTS_DATA) {
    const existing = await payload.find({
      collection: 'plants',
      where: {
        slug: { equals: plant.slug },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`  ✓ Plant already exists: "${plant.commonName}" (${plant.slug})`);
      plantsSkipped++;
      continue;
    }

    const categoryId = categoryIdMap[plant.category];

    // Map strict plant fields into Payload collection structure
    await payload.create({
      collection: 'plants',
      data: {
        commonName: plant.commonName,
        scientificName: plant.scientificName,
        slug: plant.slug,
        category: categoryId ? Number(categoryId) : undefined,
        categorySlug: plant.category,
        summary: plant.summary,
        badge: plant.badge,
        featured: plant.featured ?? false,
        environments: plant.environments,
        temperatureRange: {
          min: plant.temperatureRange.min,
          max: plant.temperatureRange.max,
          unit: 'C',
          idealRange: plant.temperatureRange.idealRange,
        },
        sunlight: plant.sunlight,
        sunlightHours: plant.sunlightHours,
        watering: {
          frequency: plant.watering.frequency,
          guidance: plant.watering.guidance,
          moistureLevel: plant.watering.moistureLevel,
        },
        soil: {
          type: plant.soil.type,
          drainage: plant.soil.drainage,
          recommendedMix: plant.soil.recommendedMix,
        },
        potting: {
          minDepthCm: plant.potting.minDepthCm,
          spacingCm: plant.potting.spacingCm,
          recommendedPotSize: plant.potting.recommendedPotSize,
        },
        humidity: plant.humidity,
        ph: plant.ph,
        timelines: {
          germinationMin: plant.timelines.germinationDays.min,
          germinationMax: plant.timelines.germinationDays.max,
          seedlingMin: plant.timelines.seedlingDays.min,
          seedlingMax: plant.timelines.seedlingDays.max,
          harvestMin: plant.timelines.harvestDays?.min,
          harvestMax: plant.timelines.harvestDays?.max,
          floweringMin: plant.timelines.floweringDays?.min,
          floweringMax: plant.timelines.floweringDays?.max,
          maturityMin: plant.timelines.maturityDays.min,
          maturityMax: plant.timelines.maturityDays.max,
          timelineNotes: plant.timelines.timelineNotes,
        },
        verticalSuitability: {
          isSuitable: plant.verticalSuitability.isSuitable,
          rating: plant.verticalSuitability.rating,
          recommendedTier: plant.verticalSuitability.recommendedTier,
          notes: plant.verticalSuitability.notes,
        },
        difficulty: {
          level: plant.difficulty.level,
          score: plant.difficulty.score,
          methodologyNotes: plant.difficulty.methodologyNotes,
        },
        commonProblems: plant.commonProblems.map((p) => ({
          issue: p.issue,
          symptoms: p.symptoms,
          prevention: p.prevention,
          organicRemedy: p.organicRemedy,
        })),
        practicalUses: plant.practicalUses.map((item) => ({ item })),
        safetyNotes: plant.safetyNotes,
        sourceUrls: plant.sourceUrls.map((url) => ({ url })),
        dataReviewStatus: plant.dataReviewStatus,
        _status: plant.dataReviewStatus === 'community-draft' ? 'draft' : 'published',
      },
    });

    console.log(`  + Created plant: "${plant.commonName}" (${plant.slug})`);
    plantsCreated++;
  }

  // 3. Seed Educational Articles
  console.log('\n📚 Seeding Educational Articles...');
  let articlesCreated = 0;
  let articlesSkipped = 0;

  for (const article of ARTICLES_DATA) {
    const existing = await payload.find({
      collection: 'articles',
      where: {
        slug: { equals: article.slug },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`  ✓ Article already exists: "${article.title}" (${article.slug})`);
      articlesSkipped++;
      continue;
    }

    await payload.create({
      collection: 'articles',
      data: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        category: article.category,
        publishedAt: article.publishedAt,
        seo: article.seo,
        _status: 'published',
      },
    });

    console.log(`  + Created article: "${article.title}" (${article.slug})`);
    articlesCreated++;
  }

  console.log('\n🎉 Seed Summary:');
  console.log(`  - Categories: ${PLANT_CATEGORIES.length} verified`);
  console.log(`  - Plants: ${plantsCreated} created, ${plantsSkipped} skipped`);
  console.log(`  - Articles: ${articlesCreated} created, ${articlesSkipped} skipped`);
  console.log('Done!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed script error:', err);
    process.exit(1);
  });
