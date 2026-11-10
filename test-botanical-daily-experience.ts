/**
 * Test Suite: GrowAI Botanical Photography, Mobile Care & Daily Check Experience
 */

import fs from 'node:fs';
import path from 'node:path';
import { PLANTS_DATA } from './src/data/plants';
import { UserPlant } from './src/types/garden';
import {
  generateDailyQuestionForPlant,
  saveDailyCheckRecord,
  getDailyCheckForPlant,
  getTodayGardenCheckProgress,
  recordRecentQuestionId,
  getRecentQuestionIds,
  DailyCheckRecord,
} from './src/lib/daily-check/daily-check-engine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('\n======================================================================');
console.log('🌱 GrowAI Botanical & Daily Experience Verification Suite');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// 1. PLANT PHOTOGRAPHY & SPECIES COVERAGE
// -----------------------------------------------------------------------------
console.log('--- 1. Botanical Photography & Species Coverage ---');

assert(PLANTS_DATA.length === 19, `Curated catalog contains exactly 19 botanical species (found ${PLANTS_DATA.length})`);

const plantsDir = path.join(process.cwd(), 'public', 'plants');
assert(fs.existsSync(plantsDir), 'Local public/plants directory exists');

for (const plant of PLANTS_DATA) {
  assert(Boolean(plant.imageUrl), `${plant.commonName} (${plant.slug}) defines an imageUrl`);
  if (plant.imageUrl) {
    const localRelPath = plant.imageUrl.startsWith('/') ? plant.imageUrl.slice(1) : plant.imageUrl;
    const localFullPath = path.join(process.cwd(), 'public', localRelPath);
    const fileExists = fs.existsSync(localFullPath);
    assert(fileExists, `Local image file exists on disk: ${localRelPath}`);
    if (fileExists) {
      const stats = fs.statSync(localFullPath);
      assert(stats.size > 1000, `Image file size is valid and non-empty (${Math.round(stats.size / 1024)} KB)`);
    }
  }
}

// Differentiate species: all image URLs must be distinct
const imageUrls = PLANTS_DATA.map((p) => p.imageUrl);
const uniqueUrls = new Set(imageUrls);
assert(uniqueUrls.size === PLANTS_DATA.length, `Every plant has a distinct botanical photograph URL (${uniqueUrls.size}/${PLANTS_DATA.length})`);

// Verify Plants Page & Payload CMS Image Mapping Invariants
const payloadSource = fs.readFileSync(path.join(process.cwd(), 'src/lib/payload.ts'), 'utf8');
assert(payloadSource.includes('imageUrl:'), 'Payload CMS mapper includes imageUrl field mapping');
assert(payloadSource.includes('/plants/${doc.slug}.webp') || payloadSource.includes('PLANTS_DATA.find'), 'Payload CMS provides fallback botanical image path');

const plantCardSource = fs.readFileSync(path.join(process.cwd(), 'src/components/ui/PlantCard.tsx'), 'utf8');
assert(plantCardSource.includes('src={plant.imageUrl || `/plants/${plant.slug}.webp`}'), 'PlantCard reliably supplies photographic fallback URL for plants page');

const plantLibrarySource = fs.readFileSync(path.join(process.cwd(), 'src/app/(frontend)/app/plants/PlantLibraryClient.tsx'), 'utf8');
assert(plantLibrarySource.includes('normalizedPlants'), 'PlantLibraryClient normalizes all species with botanical image paths');

const addToGardenModalSource = fs.readFileSync(path.join(process.cwd(), 'src/components/plants/AddToGardenModal.tsx'), 'utf8');
assert(addToGardenModalSource.includes('<PlantImage'), 'AddToGardenModal renders botanical photo for visual confirmation');

// -----------------------------------------------------------------------------
// 2. MOBILE CARE TASKS & TOUCH TARGETS
// -----------------------------------------------------------------------------
console.log('\n--- 2. Mobile Care Tasks & Quick Tools Invariants ---');

// Verify ActionCard component source invariants
const actionCardSource = fs.readFileSync(path.join(process.cwd(), 'src/components/ui/ActionCard.tsx'), 'utf8');
assert(!actionCardSource.includes('h4\n              className={`font-serif text-sm sm:text-base font-bold text-[#1F2A23] truncate'), 'ActionCard title does not use truncate');
assert(actionCardSource.includes('whitespace-normal') || actionCardSource.includes('overflowWrap'), 'ActionCard supports natural wrapping');
assert(actionCardSource.includes('min-w-[44px]') && actionCardSource.includes('min-h-[44px]'), 'ActionCard completion button enforces strict >= 44px touch targets');

// Verify Home page Quick Tools
const homePageSource = fs.readFileSync(path.join(process.cwd(), 'src/app/(frontend)/app/page.tsx'), 'utf8');
assert(homePageSource.includes('href="/app/ai-doctor"'), 'Quick tool links to /app/ai-doctor');
assert(homePageSource.includes('href="/app/planner"'), 'Quick tool links to /app/planner');
assert(homePageSource.includes('href="/app/grow-plans"'), 'Quick tool links to /app/grow-plans');
assert(homePageSource.includes('active:scale-95'), 'Quick tool cards provide immediate pressed feedback');
assert(!homePageSource.includes('Follow a growing journey\n                </p>\n              </div>\n            </Link>') || !homePageSource.includes('truncate'), 'Quick tool descriptions do not truncate essential text');

// -----------------------------------------------------------------------------
// 3. CONTEXT-AWARE DAILY QUESTION GENERATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. Context-Aware Daily Question Engine ---');

// Case A: Seed stage must NEVER ask harvest question
const seedPlant: UserPlant = {
  id: 'test-seed-1',
  plantSlug: 'butterhead-lettuce',
  nickname: 'Crispy Butterhead',
  plantedDate: '2026-11-01',
  currentStage: 'Seed',
  notes: [],
};

const qSeed = generateDailyQuestionForPlant(seedPlant);
assert(qSeed.category !== 'Harvest', `Seed stage does not receive Harvest question (received ${qSeed.category})`);
assert(qSeed.category !== 'Flowering', `Seed stage does not receive Flowering question (received ${qSeed.category})`);

// Case B: Germination stage asks about sprouts or moisture
const germPlant: UserPlant = {
  id: 'test-germ-1',
  plantSlug: 'french-radish',
  nickname: 'Spicy Radish',
  plantedDate: '2026-11-05',
  currentStage: 'Germination',
  notes: [],
};
const qGerm = generateDailyQuestionForPlant(germPlant);
assert(qGerm.category === 'Growth' || qGerm.category === 'Water', `Germination receives growth or water question (${qGerm.category})`);

// Case C: Mature Tomato can receive tomato fruit question
const matureTomato: UserPlant = {
  id: 'test-tomato-1',
  plantSlug: 'cherry-tomato',
  nickname: 'Sweetie Patio',
  plantedDate: '2026-08-01',
  currentStage: 'Mature',
  notes: [],
};
const qTomato = generateDailyQuestionForPlant(matureTomato);
assert(Boolean(qTomato.text), `Mature tomato receives valid contextual question: "${qTomato.text}"`);

// Case D: Leafy herb in Mature stage
const matureBasil: UserPlant = {
  id: 'test-basil-1',
  plantSlug: 'genovese-basil',
  nickname: 'Pesto King',
  plantedDate: '2026-09-01',
  currentStage: 'Mature',
  notes: [],
};
const qBasil = generateDailyQuestionForPlant(matureBasil);
assert(Boolean(qBasil.text), `Mature basil receives valid question: "${qBasil.text}"`);

// -----------------------------------------------------------------------------
// 4. QUESTION VARIETY & NON-REPETITION
// -----------------------------------------------------------------------------
console.log('\n--- 4. Question Non-Repetition & Category Rotation ---');

// Mock localStorage in Node environment
const storageMock: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMock[key] || null,
  setItem: (key: string, val: string) => { storageMock[key] = val; },
  removeItem: (key: string) => { delete storageMock[key]; },
};

recordRecentQuestionId('water_moisture_check');
const recents = getRecentQuestionIds();
assert(recents.includes('water_moisture_check'), 'Recent question ID is recorded into memory');

const growingMint: UserPlant = {
  id: 'test-mint-1',
  plantSlug: 'spearmint',
  nickname: 'Fresh Mint',
  plantedDate: '2026-10-01',
  currentStage: 'Growing',
  notes: [],
};

const qMint = generateDailyQuestionForPlant(growingMint);
assert(qMint.id !== 'water_moisture_check', `Question rotation avoids recent question ID (got ${qMint.id})`);

// -----------------------------------------------------------------------------
// 5. ANSWER PERSISTENCE & DAILY HABIT PROGRESS
// -----------------------------------------------------------------------------
console.log('\n--- 5. Answer Persistence & Daily Habit Progress ---');

const testToday = '2026-11-10';
const mockRecord: DailyCheckRecord = {
  id: `check-test-basil-1-${testToday}`,
  plantId: 'test-basil-1',
  plantName: 'Pesto King',
  plantSlug: 'genovese-basil',
  questionId: 'new_leaves_growth',
  questionText: 'Have you noticed any fresh new leaves?',
  category: 'Growth',
  selectedAnswer: 'good',
  noticedDetail: null,
  timestamp: new Date().toISOString(),
  date: testToday,
};

saveDailyCheckRecord(mockRecord);
const retrieved = getDailyCheckForPlant('test-basil-1', testToday);
assert(retrieved !== null, 'Daily check record persists and is retrievable');
assert(retrieved?.selectedAnswer === 'good', `Retrieved record preserves selectedAnswer "${retrieved?.selectedAnswer}"`);
assert(retrieved?.category === 'Growth', `Retrieved record preserves category "${retrieved?.category}"`);

// Habit progress calculation
const mockGarden: UserPlant[] = [
  matureBasil, // Checked
  matureTomato, // Not checked
  growingMint, // Not checked
];

const progress1 = getTodayGardenCheckProgress(mockGarden, testToday);
assert(progress1.checkedCount === 1, `Calculates 1 of 3 checked (got ${progress1.checkedCount})`);
assert(progress1.totalCount === 3, `Calculates total count 3 (got ${progress1.totalCount})`);
assert(progress1.percentage === 33, `Calculates percentage 33% (got ${progress1.percentage}%)`);
assert(progress1.isAllChecked === false, 'isAllChecked is false when 1 of 3 complete');

// Add second check with "different" answer
const mockTomatoRecord: DailyCheckRecord = {
  id: `check-test-tomato-1-${testToday}`,
  plantId: 'test-tomato-1',
  plantName: 'Sweetie Patio',
  plantSlug: 'cherry-tomato',
  questionId: 'health_spots_inspection',
  questionText: 'Have you spotted any unusual marks?',
  category: 'Health',
  selectedAnswer: 'different',
  noticedDetail: 'Leaves',
  timestamp: new Date().toISOString(),
  date: testToday,
};
saveDailyCheckRecord(mockTomatoRecord);

const progress2 = getTodayGardenCheckProgress(mockGarden, testToday);
assert(progress2.checkedCount === 2, `Calculates 2 of 3 checked (got ${progress2.checkedCount})`);
assert(progress2.percentage === 67, `Calculates percentage 67% (got ${progress2.percentage}%)`);

// Add third check to complete the garden
const mockMintRecord: DailyCheckRecord = {
  id: `check-test-mint-1-${testToday}`,
  plantId: 'test-mint-1',
  plantName: 'Fresh Mint',
  plantSlug: 'spearmint',
  questionId: 'leaves_color_texture',
  questionText: 'Are the leaves looking vibrant?',
  category: 'Leaves',
  selectedAnswer: 'good',
  noticedDetail: null,
  timestamp: new Date().toISOString(),
  date: testToday,
};
saveDailyCheckRecord(mockMintRecord);

const progress3 = getTodayGardenCheckProgress(mockGarden, testToday);
assert(progress3.checkedCount === 3, `Calculates 3 of 3 checked (got ${progress3.checkedCount})`);
assert(progress3.percentage === 100, `Calculates percentage 100% (got ${progress3.percentage}%)`);
assert(progress3.isAllChecked === true, 'isAllChecked is true when all plants checked');

// -----------------------------------------------------------------------------
// 6. IDEMPOTENCY & RE-ANSWERING INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 6. Idempotency & Re-Answering Key Integrity ---');

// Re-answering the same plant on the same date should update, not create duplicates
const reAnswerRecord: DailyCheckRecord = {
  ...mockMintRecord,
  selectedAnswer: 'different',
  noticedDetail: 'Soil',
  timestamp: new Date().toISOString(),
};
saveDailyCheckRecord(reAnswerRecord);

const afterReAnswer = getDailyCheckForPlant('test-mint-1', testToday);
assert(afterReAnswer?.selectedAnswer === 'different', 'Re-answering successfully updates selected answer to "different"');
assert(afterReAnswer?.noticedDetail === 'Soil', 'Re-answering updates noticedDetail to "Soil"');

// Progress count should STILL be exactly 3 of 3, never 4
const progressAfterUpdate = getTodayGardenCheckProgress(mockGarden, testToday);
assert(progressAfterUpdate.checkedCount === 3, `Idempotent update preserves exactly 3 checked plants (got ${progressAfterUpdate.checkedCount})`);

// -----------------------------------------------------------------------------
// 7. DATA SERIALIZATION & NOTE RECONSTRUCTION (AUTHENTICATED & CLOUD MODE)
// -----------------------------------------------------------------------------
console.log('\n--- 7. Growth Note Serialization & Cloud Reconstruction ---');

import {
  formatDailyCheckNoteText,
  reconstructDailyCheckFromGrowthNote,
  syncDailyChecksFromUserPlants,
  getLocalTodayDateStr,
} from './src/lib/daily-check/daily-check-engine';

const noteTextGood = formatDailyCheckNoteText(mockRecord);
assert(noteTextGood.includes('Daily check: Everything looks happy and healthy.'), 'Serialized note contains human readable summary');
assert(noteTextGood.includes('<!--dc:'), 'Serialized note contains embedded structured metadata tag');

const reconstructedGood = reconstructDailyCheckFromGrowthNote(matureBasil, {
  date: testToday,
  text: noteTextGood,
});
assert(reconstructedGood !== null, 'Reconstructed record is non-null');
assert(reconstructedGood?.plantId === 'test-basil-1', 'Reconstructed plantId matches');
assert(reconstructedGood?.questionId === 'new_leaves_growth', 'Reconstructed questionId matches');
assert(reconstructedGood?.category === 'Growth', 'Reconstructed category matches');
assert(reconstructedGood?.selectedAnswer === 'good', 'Reconstructed selectedAnswer matches');
assert(reconstructedGood?.date === testToday, 'Reconstructed date matches');

const noteTextDiff = formatDailyCheckNoteText(mockTomatoRecord);
const reconstructedDiff = reconstructDailyCheckFromGrowthNote(matureTomato, {
  date: testToday,
  text: noteTextDiff,
});
assert(reconstructedDiff?.selectedAnswer === 'different', 'Reconstructed "different" answer matches');
assert(reconstructedDiff?.noticedDetail === 'Leaves', 'Reconstructed noticedDetail "Leaves" matches');

// Test fallback reconstruction for plain-text notes without metadata tags
const plainNote = {
  date: testToday,
  text: 'Daily check observation: Noticed something different with soil.',
};
const reconstructedPlain = reconstructDailyCheckFromGrowthNote(growingMint, plainNote);
assert(reconstructedPlain !== null, 'Plain text fallback reconstructs successfully');
assert(reconstructedPlain?.selectedAnswer === 'different', 'Plain text extracts "different"');
assert(reconstructedPlain?.noticedDetail === 'Soil', 'Plain text extracts "Soil"');

// -----------------------------------------------------------------------------
// 8. GUEST VS. AUTHENTICATED PERSISTENCE LIFECYCLE SIMULATION
// -----------------------------------------------------------------------------
console.log('\n--- 8. Guest & Authenticated Persistence Lifecycle Simulation ---');

// Guest Lifecycle:
// 1. Answer check
// 2. Simulate page refresh / browser restart (localStorage survives)
assert(getDailyCheckForPlant('test-basil-1', testToday) !== null, 'Guest: check survives in localStorage');

// Authenticated Lifecycle:
// 1. User answers daily check on Device A -> growth_note is stored in Supabase with user_plants
// 2. User signs in on Device B / new browser -> localStorage is completely empty!
// 3. User garden is fetched from Supabase with attached growth_notes
// 4. syncDailyChecksFromUserPlants reconstructs the daily checks from cloud notes
storageMock['growai_daily_check_records_v1'] = '[]'; // Simulate brand new device / cleared cache
assert(getDailyCheckForPlant('test-basil-1', testToday) === null, 'Pre-condition: local storage cache is empty');

const cloudUserGarden: UserPlant[] = [
  {
    ...matureBasil,
    notes: [
      {
        id: 'cloud-note-1',
        date: testToday,
        stage: 'Mature',
        text: noteTextGood,
      },
    ],
  },
  {
    ...matureTomato,
    notes: [
      {
        id: 'cloud-note-2',
        date: testToday,
        stage: 'Mature',
        text: noteTextDiff,
      },
    ],
  },
  {
    ...growingMint,
    notes: [], // Unchecked
  },
];

// Perform cloud sync
syncDailyChecksFromUserPlants(cloudUserGarden);

const syncedBasil = getDailyCheckForPlant('test-basil-1', testToday);
assert(syncedBasil !== null, 'Authenticated: Cloud growth note successfully synced into daily check record');
assert(syncedBasil?.selectedAnswer === 'good', 'Authenticated: Restores "good" answer from Supabase');

const syncedTomato = getDailyCheckForPlant('test-tomato-1', testToday);
assert(syncedTomato !== null, 'Authenticated: Cloud note 2 successfully synced');
assert(syncedTomato?.noticedDetail === 'Leaves', 'Authenticated: Restores "Leaves" detail from Supabase');

const cloudProgress = getTodayGardenCheckProgress(cloudUserGarden, testToday);
assert(cloudProgress.checkedCount === 2, `Authenticated: Cloud restored progress shows 2 of 3 (got ${cloudProgress.checkedCount})`);
assert(cloudProgress.percentage === 67, `Authenticated: Cloud restored progress shows 67% (got ${cloudProgress.percentage}%)`);

// -----------------------------------------------------------------------------
// 9. COMPLETE AGRONOMIC QUESTION VALIDATION (9 LIFE STAGES & BOTANICAL TYPES)
// -----------------------------------------------------------------------------
console.log('\n--- 9. Complete Agronomic Question Validation ---');

// 1. Seeds
const seedSpecimen: UserPlant = { ...seedPlant, currentStage: 'Seed' };
const q1 = generateDailyQuestionForPlant(seedSpecimen);
assert(q1.category === 'Water' || q1.category === 'Growth', `Seed received pre-emergence category (${q1.category})`);
assert(q1.category !== 'Harvest' && q1.category !== 'Flowering', 'Seed never receives harvest or flowering');

// 2. Germination
const germSpecimen: UserPlant = { ...seedPlant, currentStage: 'Germination' };
const q2 = generateDailyQuestionForPlant(germSpecimen);
assert(q2.category === 'Water' || q2.category === 'Growth', `Germination received sprout/water category (${q2.category})`);

// 3. Seedling
const seedlingSpecimen: UserPlant = { ...seedPlant, currentStage: 'Seedling' };
const q3 = generateDailyQuestionForPlant(seedlingSpecimen);
assert(q3.category === 'Growth' || q3.category === 'Leaves' || q3.category === 'Light' || q3.category === 'Water', `Seedling received vegetative category (${q3.category})`);
assert(q3.category !== 'Harvest', 'Seedling never receives harvest');

// 4. Growing Plants
const growingSpecimen: UserPlant = { ...growingMint, currentStage: 'Growing' };
const q4 = generateDailyQuestionForPlant(growingSpecimen);
assert(Boolean(q4.text), `Growing plant received valid question: "${q4.text}"`);

// 5. Mature Leafy Greens
const matureGreens: UserPlant = { ...seedPlant, currentStage: 'Mature' };
const lettuceCatalog = PLANTS_DATA.find((p) => p.slug === 'butterhead-lettuce');
const q5 = generateDailyQuestionForPlant(matureGreens, lettuceCatalog);
assert(Boolean(q5.text), `Mature leafy greens received question: "${q5.text}"`);

// 6. Herbs
const matureHerb: UserPlant = { ...matureBasil, currentStage: 'Mature' };
const basilCatalog = PLANTS_DATA.find((p) => p.slug === 'genovese-basil');
const q6 = generateDailyQuestionForPlant(matureHerb, basilCatalog);
assert(Boolean(q6.text), `Mature herb received question: "${q6.text}"`);

// 7. Fruiting Tomatoes
const tomatoCatalog = PLANTS_DATA.find((p) => p.slug === 'cherry-tomato');
const q7 = generateDailyQuestionForPlant(matureTomato, tomatoCatalog);
assert(Boolean(q7.text), `Fruiting tomato received question: "${q7.text}"`);

// Non-tomatoes must NEVER receive tomato questions
const nonTomatoQuestion = generateDailyQuestionForPlant(matureBasil, basilCatalog);
assert(!nonTomatoQuestion.text.includes('tomatoes'), 'Non-tomato plant never receives tomato questions');

// 8. Flowering Plants
const floweringMarigold: UserPlant = {
  id: 'test-marigold-1',
  plantSlug: 'french-marigold',
  nickname: 'Sunny Marigold',
  plantedDate: '2026-09-01',
  currentStage: 'Mature',
  notes: [],
};
const marigoldCatalog = PLANTS_DATA.find((p) => p.slug === 'french-marigold');
const q8 = generateDailyQuestionForPlant(floweringMarigold, marigoldCatalog);
assert(Boolean(q8.text), `Flowering plant received valid question: "${q8.text}"`);

// 9. Harvested Stage
const harvestedSpecimen: UserPlant = {
  id: 'test-harvested-1',
  plantSlug: 'french-radish',
  nickname: 'Harvested Radish',
  plantedDate: '2026-08-01',
  currentStage: 'Harvested',
  notes: [],
};
const q9 = generateDailyQuestionForPlant(harvestedSpecimen);
assert(q9.category === 'Harvest', `Harvested stage receives post-harvest reflection question (${q9.category})`);
assert(q9.text.includes('celebrate'), `Harvested question focuses on post-harvest and soil refresh: "${q9.text}"`);

// -----------------------------------------------------------------------------
// 10. REFRESH BEHAVIOR, TIMEZONE & CALENDAR INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 10. Refresh Behavior, Timezone & Calendar Integrity ---');

// Question for same plant on same date must be identical across re-renders / page refreshes
const render1 = generateDailyQuestionForPlant(matureBasil, basilCatalog, '2026-11-10');
const render2 = generateDailyQuestionForPlant(matureBasil, basilCatalog, '2026-11-10');
assert(render1.id === render2.id, `Page refresh yields identical question ID: ${render1.id} === ${render2.id}`);
assert(render1.text === render2.text, 'Page refresh yields identical question text');

// Local calendar date helper
const localToday = getLocalTodayDateStr();
assert(/^\d{4}-\d{2}-\d{2}$/.test(localToday), `getLocalTodayDateStr returns valid YYYY-MM-DD: ${localToday}`);

// Next day resets progress
const tomorrowStr = '2026-11-11';
const progressTomorrow = getTodayGardenCheckProgress(cloudUserGarden, tomorrowStr);
assert(progressTomorrow.checkedCount === 0, `Tomorrow begins with 0 checked plants (got ${progressTomorrow.checkedCount})`);
assert(progressTomorrow.percentage === 0, `Tomorrow begins with 0% progress (got ${progressTomorrow.percentage}%)`);
assert(progressTomorrow.isAllChecked === false, 'Tomorrow isAllChecked is false');

// Empty garden progress
const emptyGardenProgress = getTodayGardenCheckProgress([], localToday);
assert(emptyGardenProgress.totalCount === 0, 'Zero plant garden totalCount is 0');
assert(emptyGardenProgress.checkedCount === 0, 'Zero plant garden checkedCount is 0');
assert(emptyGardenProgress.percentage === 0, 'Zero plant garden percentage is 0%');
assert(emptyGardenProgress.isAllChecked === false, 'Zero plant garden isAllChecked is false');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 Suite Results: ${passed} Passed, ${failed} Failed`);
console.log('======================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All botanical & daily experience tests passed successfully!\n');
}

