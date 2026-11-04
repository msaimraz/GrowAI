/**
 * GrowAI Phase 7B.2 — Space Profile Persistence & Storage Adapter
 *
 * Implements:
 * 1. Safe local/demo persistence for vertical space configurations using localStorage.
 * 2. Strict validation of dimensions, tiers, plant slugs against PLANTS_DATA, and placement IDs.
 * 3. Graceful handling of corrupted data, schema versioning, and unavailable storage.
 * 4. Prepared interface for future Supabase cloud synchronization without executing un-migrated queries.
 * 5. Complete isolation from existing garden and photo storage code.
 */

import {
  SpaceConfigProfile,
  SavedPlacementSlot,
  SpaceConfigValidationResult,
  SpaceStorageAdapter,
  CURRENT_SPACE_SCHEMA_VERSION,
} from '@/types/space-optimizer';
import { validateSpaceDimensions } from './space-optimizer';
import { PLANTS_DATA } from '@/data/plants';

export const SPACE_STORAGE_KEYS = {
  SAVED_SPACES: 'growai_saved_spaces',
  ACTIVE_SPACE_ID: 'growai_active_space_id',
} as const;

// In-memory fallback for SSR, test environments, or when localStorage is restricted/disabled
let memoryStorage: Record<string, string> = {};

export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    const testKey = '__growai_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Low-level storage accessor with fallback to in-memory store.
 * Guarantees zero unhandled exceptions when storage is disabled/unavailable.
 */
export function getStorageItem(key: string): string | null {
  if (isLocalStorageAvailable()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage[key] || null;
    }
  }
  return memoryStorage[key] || null;
}

export function setStorageItem(key: string, value: string): boolean {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn(`[GrowAI Storage] Failed to write to localStorage for key '${key}':`, err);
      memoryStorage[key] = value;
      return false;
    }
  }
  memoryStorage[key] = value;
  return true;
}

export function removeStorageItem(key: string): void {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete memoryStorage[key];
    }
  }
  delete memoryStorage[key];
}

/**
 * Resets in-memory storage (used primarily for test isolation).
 */
export function resetMemoryStorage(): void {
  memoryStorage = {};
}

// ==============================================================================
// 1. DATA INTEGRITY & VALIDATION
// ==============================================================================

/**
 * Validates a space configuration profile against schema rules and the botanical catalog.
 *
 * Rules:
 * - Schema version must match supported versions.
 * - Required dimensions must be valid positive numbers.
 * - Must have at least 1 tier with valid positive shelf dimensions.
 * - Every placement slot must reference a valid plant in PLANTS_DATA.
 * - Every placement slot must reference a valid tierIndex.
 * - Placement slot IDs must be unique within the profile.
 * - Container dimensions must be valid positive numbers.
 */
export function validateSpaceConfigProfile(data: unknown): SpaceConfigValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Space configuration must be an object.'] };
  }

  const p = data as Partial<SpaceConfigProfile>;

  // 1. Schema version
  if (typeof p.schemaVersion !== 'number' || p.schemaVersion <= 0) {
    errors.push('Missing or invalid schemaVersion.');
  } else if (p.schemaVersion > CURRENT_SPACE_SCHEMA_VERSION) {
    errors.push(
      `Unsupported schemaVersion (${p.schemaVersion}). Maximum supported version is ${CURRENT_SPACE_SCHEMA_VERSION}.`
    );
  }

  // 2. ID & Name
  if (!p.id || typeof p.id !== 'string' || p.id.trim() === '') {
    errors.push('Space configuration must have a non-empty string ID.');
  }
  if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
    errors.push('Space configuration must have a non-empty name.');
  }

  // 3. Space Type & Environment
  const validSpaceTypes = [
    'balcony_rack',
    'windowsill',
    'indoor_grow_tent',
    'vertical_hydroponics',
    'patio_bakers_rack',
    'custom',
  ];
  if (!p.spaceType || !validSpaceTypes.includes(p.spaceType)) {
    errors.push(`Invalid spaceType (${p.spaceType}). Allowed: ${validSpaceTypes.join(', ')}.`);
  }

  const validEnvironments = ['indoor', 'outdoor_sheltered', 'outdoor_exposed'];
  if (!p.environment || !validEnvironments.includes(p.environment)) {
    errors.push(`Invalid environment (${p.environment}). Allowed: ${validEnvironments.join(', ')}.`);
  }

  // 4. Dimensions validation
  if (!p.dimensions) {
    errors.push('Missing space dimensions.');
  } else {
    const dimVal = validateSpaceDimensions(p.dimensions);
    if (!dimVal.isValid) {
      errors.push(...dimVal.errors);
    }
  }

  // 5. Sunlight Hours
  if (typeof p.sunlightHours !== 'number' || isNaN(p.sunlightHours) || p.sunlightHours < 0 || p.sunlightHours > 24) {
    errors.push(`Sunlight hours must be a number between 0 and 24 (received: ${p.sunlightHours}).`);
  }

  // 6. Tiers
  if (!Array.isArray(p.tiers) || p.tiers.length === 0) {
    errors.push('Space configuration must define at least one tier.');
  } else {
    p.tiers.forEach((tier, idx) => {
      if (typeof tier.tierIndex !== 'number' || tier.tierIndex < 0) {
        errors.push(`Tier at index ${idx} must have a non-negative tierIndex.`);
      }
      if (!tier.shelfDimensions) {
        errors.push(`Tier at index ${idx} is missing shelfDimensions.`);
      } else {
        if (typeof tier.shelfDimensions.width !== 'number' || tier.shelfDimensions.width <= 0) {
          errors.push(`Tier at index ${idx} shelf width must be greater than zero.`);
        }
        if (typeof tier.shelfDimensions.depth !== 'number' || tier.shelfDimensions.depth <= 0) {
          errors.push(`Tier at index ${idx} shelf depth must be greater than zero.`);
        }
      }
    });
  }

  // 7. Placements & Botanical Catalog References
  const validTierIndices = new Set((p.tiers || []).map((t) => t.tierIndex));
  const seenPlacementIds = new Set<string>();

  if (p.placements && Array.isArray(p.placements)) {
    p.placements.forEach((slot, sIdx) => {
      // Unique placement ID check
      if (!slot.id || typeof slot.id !== 'string') {
        errors.push(`Placement slot at index ${sIdx} is missing a string ID.`);
      } else if (seenPlacementIds.has(slot.id)) {
        errors.push(`Duplicate placement slot ID found: '${slot.id}'.`);
      } else {
        seenPlacementIds.add(slot.id);
      }

      // Valid tierIndex reference
      if (typeof slot.tierIndex !== 'number' || !validTierIndices.has(slot.tierIndex)) {
        errors.push(
          `Placement slot '${slot.id || sIdx}' references non-existent tierIndex (${slot.tierIndex}).`
        );
      }

      // Valid botanical species reference against PLANTS_DATA
      if (!slot.plantSlug || typeof slot.plantSlug !== 'string') {
        errors.push(`Placement slot '${slot.id || sIdx}' is missing plantSlug.`);
      } else {
        const catalogPlant = PLANTS_DATA.find((plant) => plant.slug === slot.plantSlug);
        if (!catalogPlant) {
          errors.push(
            `Placement slot '${slot.id}' references unknown botanical species '${slot.plantSlug}'. Must reference an existing catalog species.`
          );
        }
      }

      // Container geometry check
      if (!slot.container || typeof slot.container !== 'object') {
        errors.push(`Placement slot '${slot.id || sIdx}' is missing container geometry.`);
      } else {
        if (slot.container.shape === 'circular') {
          if (typeof slot.container.topDiameter !== 'number' || slot.container.topDiameter <= 0) {
            errors.push(`Placement slot '${slot.id}' circular container must have topDiameter > 0.`);
          }
          if (typeof slot.container.height !== 'number' || slot.container.height <= 0) {
            errors.push(`Placement slot '${slot.id}' circular container must have height > 0.`);
          }
        } else if (slot.container.shape === 'rectangular' || slot.container.shape === 'trough') {
          if (typeof slot.container.width !== 'number' || slot.container.width <= 0) {
            errors.push(`Placement slot '${slot.id}' rectangular container must have width > 0.`);
          }
          if (typeof slot.container.length !== 'number' || slot.container.length <= 0) {
            errors.push(`Placement slot '${slot.id}' rectangular container must have length > 0.`);
          }
          if (typeof slot.container.height !== 'number' || slot.container.height <= 0) {
            errors.push(`Placement slot '${slot.id}' rectangular container must have height > 0.`);
          }
        }
      }
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    profile: p as SpaceConfigProfile,
  };
}

// ==============================================================================
// 2. LOCAL SPACE PERSISTENCE API
// ==============================================================================

/**
 * Retrieves all saved space configuration profiles.
 * Gracefully ignores corrupted items and logs warnings without crashing.
 */
export function getSavedSpaceConfigs(): SpaceConfigProfile[] {
  const raw = getStorageItem(SPACE_STORAGE_KEYS.SAVED_SPACES);
  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('[GrowAI Storage] Corrupted JSON in saved space configurations. Initializing empty list.', err);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn('[GrowAI Storage] Saved spaces root is not an array. Resetting.');
    return [];
  }

  const validProfiles: SpaceConfigProfile[] = [];
  for (const item of parsed) {
    const val = validateSpaceConfigProfile(item);
    if (val.isValid) {
      validProfiles.push(val.profile);
    } else {
      console.warn(
        `[GrowAI Storage] Skipping invalid space profile '${(item as any)?.id || 'unknown'}':`,
        val.errors
      );
    }
  }

  return validProfiles;
}

/**
 * Retrieves a single saved space configuration by ID.
 */
export function getSavedSpaceConfigById(id: string): SpaceConfigProfile | null {
  if (!id) return null;
  const configs = getSavedSpaceConfigs();
  return configs.find((c) => c.id === id) || null;
}

/**
 * Saves or updates a space configuration profile.
 *
 * Requirements:
 * - Generates a stable UUID if ID is not provided.
 * - Preserves existing createdAt if updating.
 * - Updates updatedAt to current ISO timestamp.
 * - Sets schemaVersion to CURRENT_SPACE_SCHEMA_VERSION.
 * - Validates profile before saving; rejects invalid data with clear error.
 * - If no active space is set, sets the newly saved profile as active.
 */
export function saveSpaceConfig(
  configInput: Omit<SpaceConfigProfile, 'createdAt' | 'updatedAt' | 'schemaVersion'> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    schemaVersion?: number;
  }
): { space?: SpaceConfigProfile; error?: string } {
  try {
    const existingList = getSavedSpaceConfigs();
    const existingIndex = configInput.id
      ? existingList.findIndex((s) => s.id === configInput.id)
      : -1;

    const nowIso = new Date().toISOString();
    const id = configInput.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const createdAt = existingIndex >= 0 ? existingList[existingIndex].createdAt : (configInput.createdAt || nowIso);

    const fullProfile: SpaceConfigProfile = {
      ...configInput,
      id,
      schemaVersion: CURRENT_SPACE_SCHEMA_VERSION,
      createdAt,
      updatedAt: nowIso,
    };

    // Validate before persisting
    const val = validateSpaceConfigProfile(fullProfile);
    if (!val.isValid) {
      return { error: `Validation failed: ${val.errors.join('; ')}` };
    }

    if (existingIndex >= 0) {
      existingList[existingIndex] = val.profile;
    } else {
      existingList.push(val.profile);
    }

    setStorageItem(SPACE_STORAGE_KEYS.SAVED_SPACES, JSON.stringify(existingList));

    // If no active space is set, make this one active
    const currentActiveId = getActiveSpaceConfigId();
    if (!currentActiveId) {
      setActiveSpaceConfigId(val.profile.id);
    }

    return { space: val.profile };
  } catch (err: any) {
    return { error: err.message || 'Failed to save space configuration.' };
  }
}

/**
 * Deletes a space configuration by ID.
 *
 * Ensures that if the deleted profile was the active profile, the active ID
 * is cleared or safely reassigned to the next remaining profile.
 */
export function deleteSpaceConfig(id: string): { success: boolean; error?: string } {
  if (!id) return { success: false, error: 'Space ID is required.' };

  try {
    const currentActiveId = getStorageItem(SPACE_STORAGE_KEYS.ACTIVE_SPACE_ID);
    const existingList = getSavedSpaceConfigs();
    const filtered = existingList.filter((s) => s.id !== id);

    if (filtered.length === existingList.length) {
      return { success: false, error: `Space with ID '${id}' not found.` };
    }

    setStorageItem(SPACE_STORAGE_KEYS.SAVED_SPACES, JSON.stringify(filtered));

    // Handle active space cleanup
    if (currentActiveId === id) {
      const nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      setActiveSpaceConfigId(nextActiveId);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete space configuration.' };
  }
}

/**
 * Retrieves the currently active space ID.
 * Validates that the active ID exists in saved spaces. If not, returns null.
 */
export function getActiveSpaceConfigId(): string | null {
  const activeId = getStorageItem(SPACE_STORAGE_KEYS.ACTIVE_SPACE_ID);
  if (!activeId) return null;

  const spaces = getSavedSpaceConfigs();
  const exists = spaces.some((s) => s.id === activeId);
  if (!exists) {
    // Stale or deleted active ID
    removeStorageItem(SPACE_STORAGE_KEYS.ACTIVE_SPACE_ID);
    return null;
  }

  return activeId;
}

/**
 * Sets the active space configuration ID.
 */
export function setActiveSpaceConfigId(id: string | null): void {
  if (!id) {
    removeStorageItem(SPACE_STORAGE_KEYS.ACTIVE_SPACE_ID);
    return;
  }
  setStorageItem(SPACE_STORAGE_KEYS.ACTIVE_SPACE_ID, id);
}

// ==============================================================================
// 3. PREPARED ADAPTERS & FACTORY
// ==============================================================================

/**
 * Factory for default in-memory / local storage adapter.
 */
export function createLocalSpaceStorageAdapter(): SpaceStorageAdapter {
  return {
    isCloud: false,
    async getSpaces() {
      return { spaces: getSavedSpaceConfigs() };
    },
    async getSpaceById(id: string) {
      return { space: getSavedSpaceConfigById(id) };
    },
    async saveSpace(space) {
      return saveSpaceConfig(space);
    },
    async deleteSpace(id: string) {
      return deleteSpaceConfig(id);
    },
    async getActiveSpaceId() {
      return getActiveSpaceConfigId();
    },
    async setActiveSpaceId(id: string | null) {
      setActiveSpaceConfigId(id);
    },
  };
}

/**
 * Prepared Supabase cloud storage adapter interface.
 *
 * CRITICAL BOUNDARY:
 * Does NOT issue queries against a non-existent database table.
 * Reports clearly that database migration is required before cloud persistence is enabled.
 */
export function createPreparedSupabaseSpaceAdapter(supabaseClient?: unknown): SpaceStorageAdapter {
  return {
    isCloud: true,
    async getSpaces() {
      return {
        spaces: getSavedSpaceConfigs(), // Fallback to local
        error: 'Cloud persistence unavailable: public.space_configurations table requires database migration in Phase 7B.3.',
      };
    },
    async getSpaceById(id: string) {
      return {
        space: getSavedSpaceConfigById(id),
        error: 'Cloud persistence unavailable: public.space_configurations table requires database migration in Phase 7B.3.',
      };
    },
    async saveSpace(space) {
      const localResult = saveSpaceConfig(space);
      return {
        ...localResult,
        error: 'Saved locally. Cloud persistence requires database migration in Phase 7B.3.',
      };
    },
    async deleteSpace(id: string) {
      return deleteSpaceConfig(id);
    },
    async getActiveSpaceId() {
      return getActiveSpaceConfigId();
    },
    async setActiveSpaceId(id: string | null) {
      setActiveSpaceConfigId(id);
    },
  };
}
