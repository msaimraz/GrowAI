import { NextResponse } from 'next/server';
import { createClient as createServerAuthClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';


const BUCKET_NAME = 'plant-photos';

/**
 * Paginates through all items under a storage folder prefix.
 */
async function listAllObjectsInFolder(
  storageClient: any,
  bucket: string,
  prefix: string
): Promise<Array<{ name: string; id?: string | null }>> {
  const allItems: Array<{ name: string; id?: string | null }> = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await storageClient.storage
      .from(bucket)
      .list(prefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      throw new Error(`Storage listing failed under '${prefix}': ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allItems.push(...data);

    if (data.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return allItems;
}

/**
 * Trusted Server-Side Cleanup Endpoint for Orphaned Plant Photos.
 *
 * Security & Reliability Requirements:
 * 1. Authentication is mandatory (derived strictly from session cookies).
 * 2. User ID is extracted from auth.getUser(), never trusted from request body.
 * 3. Requires SUPABASE_SERVICE_ROLE_KEY to reliably list/delete orphaned plant folders.
 *    If missing, returns an explicit 503 error; never falls back to authenticated client.
 * 4. Strictly restricted to caller's root folder: {user.id}/...
 * 5. Uses pagination to traverse arbitrary numbers of folders and files.
 * 6. Idempotent and concurrency-safe.
 */
export async function POST() {
  try {
    // 1. Mandatory Session Authentication
    const authSupabase = await createServerAuthClient();
    if (!authSupabase) {
      return NextResponse.json(
        { error: 'Supabase server environment unconfigured.' },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Server-Only Service-Role Client Requirement
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        {
          error:
            'Server storage maintenance is unavailable. SUPABASE_SERVICE_ROLE_KEY is required for reliable orphan recovery.',
        },
        { status: 503 }
      );
    }

    const adminStorageClient = createAdminClient(supabaseUrl, serviceRoleKey);

    // 3. Query existing active plants for this authenticated user
    const { data: activePlants, error: plantsError } = await authSupabase
      .from('user_plants')
      .select('id')
      .eq('user_id', user.id);

    if (plantsError) {
      return NextResponse.json(
        { error: `Failed to query active user plants: ${plantsError.message}` },
        { status: 500 }
      );
    }

    const activePlantIds = new Set((activePlants || []).map((p) => p.id));

    // 4. List subfolders under this user's storage root with pagination: {user.id}/...
    const userFolders = await listAllObjectsInFolder(
      adminStorageClient,
      BUCKET_NAME,
      user.id
    );

    const orphanPaths: string[] = [];

    // 5. Identify folders corresponding to deleted plants and paginate through their files
    for (const folder of userFolders) {
      const plantFolderId = folder.name;

      // Ignore placeholder/root artifacts if any
      if (!plantFolderId || plantFolderId.startsWith('.')) continue;

      if (!activePlantIds.has(plantFolderId)) {
        // Plant record no longer exists — paginate and collect all photo files
        const files = await listAllObjectsInFolder(
          adminStorageClient,
          BUCKET_NAME,
          `${user.id}/${plantFolderId}`
        );

        for (const file of files) {
          if (file.name && !file.name.startsWith('.')) {
            orphanPaths.push(`${user.id}/${plantFolderId}/${file.name}`);
          }
        }
      }
    }

    // 6. Purge identified orphaned photo objects
    let cleanedCount = 0;
    if (orphanPaths.length > 0) {
      const { data: removedData, error: removeError } = await adminStorageClient.storage
        .from(BUCKET_NAME)
        .remove(orphanPaths);

      if (removeError) {
        return NextResponse.json(
          {
            error: `Failed to remove orphaned storage files: ${removeError.message}`,
            identifiedOrphans: orphanPaths,
            cleanedCount: 0,
          },
          { status: 500 }
        );
      }

      cleanedCount = removedData ? removedData.length : orphanPaths.length;
    }

    return NextResponse.json({
      success: true,
      cleanedCount,
      cleanedPaths: orphanPaths,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during orphan cleanup.' },
      { status: 500 }
    );
  }
}
