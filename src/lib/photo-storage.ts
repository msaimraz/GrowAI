/**
 * Private Photo Storage & Client-Side Compression Utility for GrowAI
 *
 * Architecture:
 * 1. Image preprocessing: Uses HTML5 Canvas to scale and convert uploads to WebP.
 * 2. Supabase Storage (Cloud Mode): Uploads to private 'plant-photos' bucket.
 *    Generates ephemeral signed URLs (never persisted in DB).
 * 3. IndexedDB (Demo Mode): Persists Blobs locally without touching localStorage,
 *    preventing the 5 MB localStorage limit from overflowing.
 */

import { PlantPhoto, GrowthStage } from '@/types/garden';
import { createClient } from '@/lib/supabase/client';
import type { DatabaseSchema } from './supabase';

const BUCKET_NAME = 'plant-photos';
const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB raw input limit

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates and converts an image File to an optimized WebP Blob using HTML5 Canvas.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<{ blob: Blob; width: number; height: number }> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP photo.`
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('Image exceeds 10 MB limit. Please select a smaller photo.');
  }

  // Load image into HTML Image element
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (targetWidth > maxWidth) {
        targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
        targetWidth = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original file if canvas context unavailable
        resolve({ blob: file, width: img.width, height: img.height });
        return;
      }

      // Draw and export
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ blob: file, width: targetWidth, height: targetHeight });
            return;
          }
          resolve({ blob, width: targetWidth, height: targetHeight });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file. The file may be corrupted.'));
    };

    img.src = objectUrl;
  });
}

// ==============================================================================
// INDEXED_DB ADAPTER (Demo / Local Mode Only)
// ==============================================================================

const IDB_NAME = 'growai_local_storage_db';
const IDB_STORE = 'plant_photos_blob_store';
const IDB_VERSION = 1;

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDemoPhoto(
  photo: PlantPhoto,
  blob: Blob
): Promise<PlantPhoto> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({
      id: photo.id,
      plantId: photo.userPlantId,
      blob,
      metadata: photo,
    });

    tx.oncomplete = () => {
      // Create local object URL for immediate display
      const objectUrl = URL.createObjectURL(blob);
      resolve({ ...photo, signedUrl: objectUrl });
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDemoPhotoBlob(photoId: string): Promise<Blob | null> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(photoId);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDemoPhoto(photoId: string): Promise<void> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(photoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDemoPhotosForPlant(plantId: string): Promise<void> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const req = store.getAll();

    req.onsuccess = () => {
      const items = req.result || [];
      for (const item of items) {
        if (item.plantId === plantId) {
          store.delete(item.id);
        }
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==============================================================================
// CLOUD SUPABASE STORAGE ADAPTER
// ==============================================================================

/**
 * Upload a compressed photo to Supabase Storage and record its metadata in public.plant_photos.
 */
export async function uploadPlantPhotoCloud(params: {
  plantId: string;
  file: File;
  caption?: string;
  growthStage?: GrowthStage;
  heightCm?: number;
}): Promise<{ photo?: PlantPhoto; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { error: 'Supabase client not initialized.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required to upload plant photos.' };
  }

  try {
    // 1. Compress Image
    const { blob } = await compressImageToWebP(params.file);

    // 2. Generate unique storage path: {user_id}/{plant_id}/{uuid}.webp
    const photoId = crypto.randomUUID();
    const storagePath = `${user.id}/${params.plantId}/${photoId}.webp`;

    // 3. Upload to private bucket
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, blob, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      return { error: `Storage upload failed: ${uploadError.message}` };
    }

    // 4. Insert metadata record in public.plant_photos
    const nowIso = new Date().toISOString();
    const { data: dbData, error: dbError } = await supabase
      .from('plant_photos')
      .insert({
        id: photoId,
        user_id: user.id,
        user_plant_id: params.plantId,
        storage_path: storagePath,
        caption: params.caption || null,
        growth_stage: params.growthStage || null,
        height_cm: params.heightCm ? Number(params.heightCm) : null,
        taken_at: nowIso,
      })
      .select()
      .single();

    if (dbError || !dbData) {
      // Cleanup orphaned storage object if DB insert fails
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      return { error: `Database recording failed: ${dbError?.message}` };
    }

    // 5. Generate ephemeral signed URL
    const { data: signedData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN);

    const resultPhoto: PlantPhoto = {
      id: dbData.id,
      userPlantId: dbData.user_plant_id,
      storagePath: dbData.storage_path,
      signedUrl: signedData?.signedUrl || undefined,
      caption: dbData.caption || undefined,
      growthStage: (dbData.growth_stage as GrowthStage) || undefined,
      heightCm: dbData.height_cm ? parseFloat(String(dbData.height_cm)) : undefined,
      takenAt: dbData.taken_at,
      createdAt: dbData.created_at,
    };

    return { photo: resultPhoto };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred during photo upload.' };
  }
}

/**
 * Fetch chronological photos for a specific plant and attach signed URLs.
 */
export async function fetchPlantPhotos(
  plantId: string,
  isCloud: boolean
): Promise<{ photos: PlantPhoto[]; error?: string }> {
  if (isCloud) {
    const supabase = createClient();
    if (!supabase) return { photos: [] };

    const { data, error } = await supabase
      .from('plant_photos')
      .select('*')
      .eq('user_plant_id', plantId)
      .order('taken_at', { ascending: false });

    if (error) {
      return { photos: [], error: error.message };
    }

    // Generate signed URLs in parallel for all retrieved photo paths
    const photosWithUrls = await Promise.all(
      (data || []).map(async (row) => {
        const { data: signedData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRES_IN);

        return {
          id: row.id,
          userPlantId: row.user_plant_id,
          storagePath: row.storage_path,
          signedUrl: signedData?.signedUrl || undefined,
          caption: row.caption || undefined,
          growthStage: (row.growth_stage as GrowthStage) || undefined,
          heightCm: row.height_cm ? parseFloat(String(row.height_cm)) : undefined,
          takenAt: row.taken_at,
          createdAt: row.created_at,
        };
      })
    );

    return { photos: photosWithUrls };
  }

  // Demo Mode: Fetch from IndexedDB
  try {
    const db = await openPhotoDb();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const matching = (req.result || [])
          .filter((item: any) => item.plantId === plantId)
          .map((item: any) => {
            const signedUrl = URL.createObjectURL(item.blob);
            return {
              ...item.metadata,
              signedUrl,
            } as PlantPhoto;
          })
          .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

        resolve({ photos: matching });
      };

      req.onerror = () => resolve({ photos: [] });
    });
  } catch {
    return { photos: [] };
  }
}

/**
 * Delete a photo from both storage and database metadata.
 */
export async function deletePlantPhoto(
  photo: PlantPhoto,
  isCloud: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isCloud) {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Supabase client unconfigured.' };

    // 1. Delete storage object
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([photo.storagePath]);

    if (storageError) {
      console.warn('Storage object removal warning (proceeding with DB delete):', storageError.message);
    }

    // 2. Delete database record
    const { error: dbError } = await supabase
      .from('plant_photos')
      .delete()
      .eq('id', photo.id);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true };
  }

  // Demo Mode: Delete from IndexedDB
  try {
    await deleteDemoPhoto(photo.id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
