import pg from 'pg';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

// In-memory fallback cache when PostgreSQL is temporarily unavailable
const inMemoryCache = new Map<string, { count: number; resetAt: number }>();

// Lazy-initialized PostgreSQL pool for rate limiting persistence
let pgPool: pg.Pool | null = null;

function getPgPool(): pg.Pool | null {
  const dbUri = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI;
  if (!dbUri || dbUri.includes('placeholder')) {
    return null;
  }
  if (!pgPool) {
    pgPool = new pg.Pool({
      connectionString: dbUri,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
    });
  }
  return pgPool;
}

/**
 * Check and increment rate limit for a specific user ID or client IP address.
 * Persists count and window reset timestamps in PostgreSQL (payload_kv)
 * so limits are reliably enforced across multiple serverless execution contexts.
 */
export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): Promise<RateLimitResult> {
  const windowMs = 60 * 60 * 1000; // 1 hour sliding window
  
  // Configurable limits from environment
  const limitAuth = parseInt(process.env.AI_RATE_LIMIT_AUTH_PER_HOUR || '15', 10);
  const limitGuest = parseInt(process.env.AI_RATE_LIMIT_GUEST_PER_HOUR || '3', 10);
  const limit = isAuthenticated ? limitAuth : limitGuest;

  const storageKey = `ratelimit:ai_doctor:${isAuthenticated ? 'user' : 'guest'}:${identifier}`;
  const now = Date.now();

  const pool = getPgPool();

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Query existing rate limit record
        const selectRes = await client.query(
          'SELECT data FROM payload_kv WHERE key = $1 FOR UPDATE',
          [storageKey]
        );

        let count = 1;
        let resetAt = now + windowMs;

        if (selectRes.rows.length > 0) {
          const storedData = selectRes.rows[0].data as { count: number; resetAt: number };
          if (storedData && storedData.resetAt > now) {
            // Window is still active
            count = (storedData.count || 0) + 1;
            resetAt = storedData.resetAt;

            if (count > limit) {
              await client.query('ROLLBACK');
              const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
              return {
                allowed: false,
                limit,
                remaining: 0,
                resetAt,
                retryAfterSeconds,
              };
            }

            // Update incremented count
            await client.query(
              'UPDATE payload_kv SET data = $1 WHERE key = $2',
              [JSON.stringify({ count, resetAt }), storageKey]
            );
          } else {
            // Window expired, reset counter
            await client.query(
              'UPDATE payload_kv SET data = $1 WHERE key = $2',
              [JSON.stringify({ count: 1, resetAt }), storageKey]
            );
          }
        } else {
          // First request, insert row
          await client.query(
            'INSERT INTO payload_kv (key, data) VALUES ($1, $2)',
            [storageKey, JSON.stringify({ count: 1, resetAt })]
          );
        }

        await client.query('COMMIT');

        const remaining = Math.max(0, limit - count);
        return {
          allowed: true,
          limit,
          remaining,
          resetAt,
          retryAfterSeconds: 0,
        };
      } catch (dbErr) {
        await client.query('ROLLBACK').catch(() => {});
        throw dbErr;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('PostgreSQL rate limiter error, using in-memory fallback:', err);
    }
  }

  // Resilient In-Memory Fallback
  const cached = inMemoryCache.get(storageKey);
  if (cached && cached.resetAt > now) {
    if (cached.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((cached.resetAt - now) / 1000));
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: cached.resetAt,
        retryAfterSeconds,
      };
    }
    cached.count += 1;
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - cached.count),
      resetAt: cached.resetAt,
      retryAfterSeconds: 0,
    };
  }

  const resetAt = now + windowMs;
  inMemoryCache.set(storageKey, { count: 1, resetAt });
  return {
    allowed: true,
    limit,
    remaining: limit - 1,
    resetAt,
    retryAfterSeconds: 0,
  };
}
