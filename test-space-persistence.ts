/**
 * GrowAI Phase 7B.2 — Space Persistence & Storage Adapter Unit Tests
 *
 * Verifies all 16 test requirements:
 * 1. Saving a new space.
 * 2. Retrieving saved spaces.
 * 3. Updating an existing space.
 * 4. Deleting a space.
 * 5. Multiple independent space profiles.
 * 6. Active space selection.
 * 7. Deleting the active profile.
 * 8. Corrupted JSON recovery.
 * 9. Invalid dimensions.
 * 10. Invalid plant references.
 * 11. Duplicate placement IDs.
 * 12. Version compatibility.
 * 13. Storage unavailable behavior.
 * 14. Preservation of unrelated localStorage data.
 * 15. Repeated save operations without duplicate records.
 * 16. Preservation of existing garden and photo storage behavior.
 */

import {
  SPACE_STORAGE_KEYS,
  validateSpaceConfigProfile,
  getSavedSpaceConfigs,
  getSavedSpaceConfigById,
  saveSpaceConfig,
  deleteSpaceConfig,
  getActiveSpaceConfigId,
  setActiveSpaceConfigId,
  createPreparedSupabaseSpaceAdapter,
  setStorageItem,
  getStorageItem,
  resetMemoryStorage,
} from './src/lib/space-storage';
import {
  getSavedUserPlants,
  getSavedCareTasks,
} from './src/lib/storage';
import { SpaceConfigProfile, CURRENT_SPACE_SCHEMA_VERSION } from './src/types/space-optimizer';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
    if (details) console.error(`         Details: ${details}`);
    throw new Error(`Assertion failed in: ${testName} - ${details || ''}`);
  }
}

console.log('================================================================');
console.log('GrowAI Phase 7B.2 — Space Persistence Unit Test Suite');
console.log('================================================================\n');

// Clean slate for test isolation
resetMemoryStorage();

// Helper to create a valid base space configuration
function makeValidSpace(override?: Partial<SpaceConfigProfile>): SpaceConfigProfile {
  return {
    schemaVersion: CURRENT_SPACE_SCHEMA_VERSION,
    id: 'space-balcony-1',
    name: 'Balcony 3-Tier Stand',
    spaceType: 'balcony_rack',
    environment: 'outdoor_sheltered',
    orientation: 'south',
    dimensions: { width: 90, depth: 35, height: 160, unit: 'cm' },
    sunlightHours: 6.0,
    tiers: [
      {
        tierIndex: 0,
        position: 'top',
        tierName: 'Top Tier',
        shelfDimensions: { width: 90, depth: 35, verticalClearance: 60, unit: 'cm' },
        confirmedShelfLoadRatingKg: 25.0,
      },
      {
        tierIndex: 1,
        position: 'middle',
        tierName: 'Middle Tier',
        shelfDimensions: { width: 90, depth: 35, verticalClearance: 45, unit: 'cm' },
      },
    ],
    placements: [
      {
        id: 'slot-1',
        tierIndex: 0,
        slotIndex: 0,
        plantSlug: 'genovese-basil',
        container: { shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' },
      },
      {
        id: 'slot-2',
        tierIndex: 1,
        slotIndex: 0,
        plantSlug: 'butterhead-lettuce',
        container: { shape: 'circular', topDiameter: 18, height: 18, unit: 'cm' },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...override,
  };
}

// -----------------------------------------------------------------------------
// Test 1: Saving a New Space
// -----------------------------------------------------------------------------
console.log('Test 1: Saving a New Space');
{
  const newSpace = makeValidSpace();
  const res = saveSpaceConfig(newSpace);
  assert(res.space !== undefined, 'Space saved successfully without error');
  assert(res.error === undefined, 'No errors returned on save');
  assert(res.space?.id === 'space-balcony-1', 'Preserves provided space ID');
  assert(res.space?.schemaVersion === 1, 'Sets schemaVersion to 1');
  assert(Boolean(res.space?.createdAt), 'Populates createdAt timestamp');
  assert(Boolean(res.space?.updatedAt), 'Populates updatedAt timestamp');
}

// -----------------------------------------------------------------------------
// Test 2: Retrieving Saved Spaces
// -----------------------------------------------------------------------------
console.log('\nTest 2: Retrieving Saved Spaces');
{
  const list = getSavedSpaceConfigs();
  assert(list.length === 1, 'Retrieves 1 saved space from storage');
  assert(list[0].id === 'space-balcony-1', 'Profile ID matches');
  assert(list[0].placements.length === 2, 'Preserves all placement slots');

  const single = getSavedSpaceConfigById('space-balcony-1');
  assert(single !== null && single.name === 'Balcony 3-Tier Stand', 'getSavedSpaceConfigById finds exact profile');

  const nonExistent = getSavedSpaceConfigById('non-existent-id');
  assert(nonExistent === null, 'Returns null for non-existent space ID');
}

// -----------------------------------------------------------------------------
// Test 3: Updating an Existing Space
// -----------------------------------------------------------------------------
console.log('\nTest 3: Updating an Existing Space');
{
  const original = getSavedSpaceConfigById('space-balcony-1')!;
  const originalCreatedAt = original.createdAt;

  // Modify name and add third placement
  const updated = saveSpaceConfig({
    ...original,
    name: 'Balcony 3-Tier Stand (Renovated)',
    placements: [
      ...original.placements,
      {
        id: 'slot-3',
        tierIndex: 0,
        slotIndex: 1,
        plantSlug: 'cherry-tomato',
        container: { shape: 'circular', topDiameter: 25, height: 25, unit: 'cm' },
      },
    ],
  });

  assert(updated.space !== undefined, 'Updated space saved successfully');
  assert(updated.space?.name === 'Balcony 3-Tier Stand (Renovated)', 'Name updated');
  assert(updated.space?.placements.length === 3, 'Placements updated to 3');
  assert(updated.space?.createdAt === originalCreatedAt, 'Original createdAt timestamp is preserved');

  const list = getSavedSpaceConfigs();
  assert(list.length === 1, 'Total space count remains 1 (no duplicate record created on update)');
}

// -----------------------------------------------------------------------------
// Test 4: Deleting a Space
// -----------------------------------------------------------------------------
console.log('\nTest 4: Deleting a Space');
{
  // Save temporary space
  const tempSpace = makeValidSpace({ id: 'temp-space-to-delete', name: 'Temporary Shelf' });
  saveSpaceConfig(tempSpace);
  assert(getSavedSpaceConfigs().length === 2, 'Temporary space added (count = 2)');

  const delRes = deleteSpaceConfig('temp-space-to-delete');
  assert(delRes.success === true, 'deleteSpaceConfig returns success: true');
  assert(getSavedSpaceConfigs().length === 1, 'Count returned to 1 after deletion');
  assert(getSavedSpaceConfigById('temp-space-to-delete') === null, 'Deleted space no longer found by ID');

  const delNotFound = deleteSpaceConfig('unknown-id');
  assert(delNotFound.success === false && Boolean(delNotFound.error), 'Reports error when deleting non-existent ID');
}

// -----------------------------------------------------------------------------
// Test 5: Multiple Independent Space Profiles
// -----------------------------------------------------------------------------
console.log('\nTest 5: Multiple Independent Space Profiles');
{
  const windowsill = makeValidSpace({
    id: 'space-windowsill',
    name: 'Kitchen Windowsill',
    spaceType: 'windowsill',
    dimensions: { width: 60, depth: 20, height: 50, unit: 'cm' },
    tiers: [
      {
        tierIndex: 0,
        position: 'custom',
        shelfDimensions: { width: 60, depth: 20, unit: 'cm' },
      },
    ],
    placements: [
      {
        id: 'win-slot-1',
        tierIndex: 0,
        slotIndex: 0,
        plantSlug: 'spearmint',
        container: { shape: 'circular', topDiameter: 15, height: 15, unit: 'cm' },
      },
    ],
  });

  const tent = makeValidSpace({
    id: 'space-tent',
    name: 'Indoor Microgreen Tent',
    spaceType: 'indoor_grow_tent',
    environment: 'indoor',
    dimensions: { width: 120, depth: 60, height: 180, unit: 'cm' },
    tiers: [
      {
        tierIndex: 0,
        position: 'top',
        shelfDimensions: { width: 120, depth: 60, unit: 'cm' },
      },
    ],
    placements: [
      {
        id: 'tent-slot-1',
        tierIndex: 0,
        slotIndex: 0,
        plantSlug: 'broccoli-microgreens',
        container: { shape: 'trough', width: 25, length: 50, height: 6, unit: 'cm' },
      },
    ],
  });

  saveSpaceConfig(windowsill);
  saveSpaceConfig(tent);

  const list = getSavedSpaceConfigs();
  assert(list.length === 3, 'Maintains 3 distinct space profiles');
  const ids = list.map((s) => s.id);
  assert(ids.includes('space-balcony-1') && ids.includes('space-windowsill') && ids.includes('space-tent'), 'All 3 profiles accessible');
}

// -----------------------------------------------------------------------------
// Test 6: Active Space Selection
// -----------------------------------------------------------------------------
console.log('\nTest 6: Active Space Selection');
{
  setActiveSpaceConfigId('space-windowsill');
  assert(getActiveSpaceConfigId() === 'space-windowsill', 'Active space ID set to space-windowsill');

  setActiveSpaceConfigId('space-tent');
  assert(getActiveSpaceConfigId() === 'space-tent', 'Active space ID switched to space-tent');
}

// -----------------------------------------------------------------------------
// Test 7: Deleting the Active Profile
// -----------------------------------------------------------------------------
console.log('\nTest 7: Deleting the Active Profile');
{
  // Currently active is 'space-tent'
  assert(getActiveSpaceConfigId() === 'space-tent', 'Pre-condition: space-tent is active');

  deleteSpaceConfig('space-tent');
  const remaining = getSavedSpaceConfigs();
  assert(remaining.length === 2, '2 spaces remain after deleting space-tent');

  // Deleting the active profile should automatically switch to another available space
  const newActiveId = getActiveSpaceConfigId();
  assert(newActiveId !== 'space-tent' && newActiveId !== null, 'Active ID safely switched away from deleted space');
  assert(remaining.some((s) => s.id === newActiveId), 'New active ID points to an existing remaining space');

  // Clean up remaining spaces to test empty behavior
  deleteSpaceConfig('space-windowsill');
  deleteSpaceConfig('space-balcony-1');
  assert(getSavedSpaceConfigs().length === 0, 'All spaces deleted');
  assert(getActiveSpaceConfigId() === null, 'Active ID is null when 0 spaces exist');
}

// -----------------------------------------------------------------------------
// Test 8: Corrupted JSON Recovery
// -----------------------------------------------------------------------------
console.log('\nTest 8: Corrupted JSON Recovery');
{
  // Inject syntax error in saved spaces key
  setStorageItem(SPACE_STORAGE_KEYS.SAVED_SPACES, '{"corrupted_data": [[[');

  const recovered = getSavedSpaceConfigs();
  assert(Array.isArray(recovered) && recovered.length === 0, 'Gracefully handles corrupted JSON by returning empty array');

  // Subsequent save should safely overwrite corrupted data
  const fresh = makeValidSpace({ id: 'recovered-space-1' });
  saveSpaceConfig(fresh);
  assert(getSavedSpaceConfigs().length === 1, 'Safely recovers and saves new data after corruption');
  deleteSpaceConfig('recovered-space-1');
}

// -----------------------------------------------------------------------------
// Test 9: Invalid Dimensions
// -----------------------------------------------------------------------------
console.log('\nTest 9: Invalid Dimensions Validation');
{
  const negativeWidth = makeValidSpace({
    dimensions: { width: -90, depth: 35, height: 160, unit: 'cm' },
  });
  const res1 = saveSpaceConfig(negativeWidth);
  assert(res1.space === undefined && Boolean(res1.error), 'Rejects space with negative width');
  assert(Boolean(res1.error?.includes('Width must be a positive number')), 'Error explains negative width');

  const zeroHeight = makeValidSpace({
    dimensions: { width: 90, depth: 35, height: 0, unit: 'cm' },
  });
  const res2 = saveSpaceConfig(zeroHeight);
  assert(res2.space === undefined && Boolean(res2.error), 'Rejects space with zero height');
}

// -----------------------------------------------------------------------------
// Test 10: Invalid Plant References
// -----------------------------------------------------------------------------
console.log('\nTest 10: Invalid Plant References Validation');
{
  const invalidPlant = makeValidSpace({
    placements: [
      {
        id: 'slot-fake',
        tierIndex: 0,
        slotIndex: 0,
        plantSlug: 'fictional-space-tree', // Not in catalog!
        container: { shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' },
      },
    ],
  });

  const res = saveSpaceConfig(invalidPlant);
  assert(res.space === undefined && Boolean(res.error), 'Rejects placement with unknown botanical species');
  assert(Boolean(res.error?.includes('fictional-space-tree')), 'Error cites the unknown species name');
}

// -----------------------------------------------------------------------------
// Test 11: Duplicate Placement IDs
// -----------------------------------------------------------------------------
console.log('\nTest 11: Duplicate Placement IDs Validation');
{
  const duplicateSlots = makeValidSpace({
    placements: [
      {
        id: 'duplicate-slot-id',
        tierIndex: 0,
        slotIndex: 0,
        plantSlug: 'genovese-basil',
        container: { shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' },
      },
      {
        id: 'duplicate-slot-id', // Duplicate!
        tierIndex: 0,
        slotIndex: 1,
        plantSlug: 'butterhead-lettuce',
        container: { shape: 'circular', topDiameter: 18, height: 18, unit: 'cm' },
      },
    ],
  });

  const res = saveSpaceConfig(duplicateSlots);
  assert(res.space === undefined && Boolean(res.error), 'Rejects profile containing duplicate placement IDs');
  assert(Boolean(res.error?.includes('Duplicate placement slot ID found')), 'Error explains duplicate slot ID');
}

// -----------------------------------------------------------------------------
// Test 12: Version Compatibility
// -----------------------------------------------------------------------------
console.log('\nTest 12: Version Compatibility');
{
  const futureVersion = makeValidSpace({ schemaVersion: 999 });
  const valFuture = validateSpaceConfigProfile(futureVersion);
  assert(!valFuture.isValid, 'Rejects future schemaVersion 999');
  if (!valFuture.isValid) {
    assert(valFuture.errors.some((e: string) => e.includes('Unsupported schemaVersion (999)')), 'Reports unsupported version');
  }

  const currentVersion = makeValidSpace({ schemaVersion: CURRENT_SPACE_SCHEMA_VERSION });
  const valCurrent = validateSpaceConfigProfile(currentVersion);
  assert(valCurrent.isValid, 'Accepts CURRENT_SPACE_SCHEMA_VERSION (1)');
}

// -----------------------------------------------------------------------------
// Test 13: Storage Unavailable Behavior
// -----------------------------------------------------------------------------
console.log('\nTest 13: Storage Unavailable Behavior');
{
  // Test in-memory storage fallback works seamlessly even if browser storage is unconfigured
  const space = makeValidSpace({ id: 'mem-space-1' });
  const res = saveSpaceConfig(space);
  assert(res.space !== undefined, 'Operates via in-memory storage fallback without crashing');
  assert(getSavedSpaceConfigs().length === 1, 'Retrieves from memory fallback');
  deleteSpaceConfig('mem-space-1');
}

// -----------------------------------------------------------------------------
// Test 14: Preservation of Unrelated localStorage Data
// -----------------------------------------------------------------------------
console.log('\nTest 14: Preservation of Unrelated localStorage Data');
{
  // Inject unrelated keys mimicking existing GrowAI features
  setStorageItem('growai_demo_user_plants', JSON.stringify([{ id: 'unrelated-user-plant-1' }]));
  setStorageItem('growai_demo_care_tasks', JSON.stringify([{ id: 'unrelated-task-1' }]));
  setStorageItem('user_theme_setting', 'dark');

  // Perform multiple space operations
  const space = makeValidSpace({ id: 'unrelated-test-space' });
  saveSpaceConfig(space);
  setActiveSpaceConfigId('unrelated-test-space');
  deleteSpaceConfig('unrelated-test-space');

  // Verify unrelated keys were NOT overwritten or touched
  const userPlantsRaw = getStorageItem('growai_demo_user_plants');
  assert(Boolean(userPlantsRaw?.includes('unrelated-user-plant-1')), 'growai_demo_user_plants key is strictly preserved');

  const tasksRaw = getStorageItem('growai_demo_care_tasks');
  assert(Boolean(tasksRaw?.includes('unrelated-task-1')), 'growai_demo_care_tasks key is strictly preserved');

  const themeRaw = getStorageItem('user_theme_setting');
  assert(themeRaw === 'dark', 'Unrelated custom preference key is strictly preserved');
}

// -----------------------------------------------------------------------------
// Test 15: Repeated Save Operations Without Duplicate Records
// -----------------------------------------------------------------------------
console.log('\nTest 15: Repeated Save Operations Without Duplicate Records');
{
  const space = makeValidSpace({ id: 'idempotent-space' });

  // Save 10 times in a row
  for (let i = 0; i < 10; i++) {
    saveSpaceConfig({ ...space, name: `Idempotent Space Run ${i}` });
  }

  const list = getSavedSpaceConfigs();
  assert(list.length === 1, 'Only 1 record exists after 10 consecutive saves with the same ID');
  assert(list[0].name === 'Idempotent Space Run 9', 'Record has the latest updated name');
  deleteSpaceConfig('idempotent-space');
}

// -----------------------------------------------------------------------------
// Test 16: Preservation of Existing Garden & Photo Storage Behavior
// -----------------------------------------------------------------------------
async function runAsyncTests() {
  console.log('\nTest 16: Preservation of Existing Garden & Photo Storage Behavior');
  {
    // Verify existing getSavedUserPlants() still executes cleanly and returns default demo plants
    const gardenPlants = getSavedUserPlants();
    assert(Array.isArray(gardenPlants) && gardenPlants.length > 0, 'getSavedUserPlants() operates cleanly');

    // Verify existing getSavedCareTasks() executes cleanly
    const careTasks = getSavedCareTasks();
    assert(Array.isArray(careTasks) && careTasks.length > 0, 'getSavedCareTasks() operates cleanly');

    // Verify prepared Supabase adapter safely informs user about future migration requirement
    const preparedAdapter = createPreparedSupabaseSpaceAdapter();
    assert(preparedAdapter.isCloud === true, 'Prepared adapter flags isCloud: true');

    // Asynchronous check for prepared adapter error notification
    const res = await preparedAdapter.getSpaces();
    assert(
      Boolean(res.error?.includes('public.space_configurations table requires database migration')),
      'Prepared cloud adapter clearly states migration is required before cloud queries run'
    );
  }

  console.log('\n================================================================');
  console.log(`ALL 16 PERSISTENCE TESTS PASSED! (${passedTests} / ${totalTests} assertions verified)`);
  console.log('================================================================\n');
}

runAsyncTests().catch((err) => {
  console.error('Fatal error in async test execution:', err);
  process.exit(1);
});

