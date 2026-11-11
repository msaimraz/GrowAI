import { NextRequest, NextResponse } from 'next/server';
import { executeCopilotQuery } from '@/lib/grower-copilot';
import { checkRateLimit } from '@/lib/ai-doctor/rate-limiter';
import { createClient } from '@/lib/supabase/server';
import { extractClientIp } from '@/app/api/ai-doctor/route';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user via Supabase server-side session
    let userId: string | null = null;
    let isAuthenticated = false;

    try {
      const supabase = await createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.id) {
          userId = user.id;
          isAuthenticated = true;
        }
      }
    } catch (authErr) {
      console.warn('Supabase auth check non-fatal warning in copilot endpoint:', authErr);
    }

    // Rate limiting identifier
    const clientIp = extractClientIp(req);
    const rateLimitIdentifier = isAuthenticated && userId ? `copilot_${userId}` : `copilot_${clientIp}`;

    // 2. Enforce Rate Limiting
    const rateLimit = await checkRateLimit(rateLimitIdentifier, isAuthenticated);

    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(rateLimit.limit),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
    };

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: isAuthenticated
            ? 'Copilot request quota reached. Please pause a moment before asking another question.'
            : 'Guest copilot limit reached. Sign in to unlock full member access.',
          retryAfter: rateLimit.retryAfterSeconds,
          isGuestLimit: !isAuthenticated,
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    // 3. Parse Request Payload
    const body = await req.json();
    const {
      query,
      activePlantId,
      activePlantNickname,
      activePlantSlug,
      botanicalPlant,
      plants = [],
      conditions = [],
      feedings = [],
      propagations = [],
      cycles = [],
      harvests = [],
      diagnoses = [],
      reminders = [],
      spaceMetrics = null,
      forceDeterministic = false,
    } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Inquiry query text is required.' },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // 4. Execute Copilot Query Pipeline
    const response = await executeCopilotQuery({
      query: query.trim(),
      userId: userId || 'guest-session',
      activePlantId: activePlantId || null,
      activePlantNickname: activePlantNickname || null,
      activePlantSlug: activePlantSlug || null,
      botanicalPlant: botanicalPlant || null,
      plants,
      conditions,
      feedings,
      propagations,
      cycles,
      harvests,
      diagnoses,
      reminders,
      spaceMetrics,
      forceDeterministic,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: rateLimitHeaders,
    });
  } catch (err: any) {
    console.error('Error in Grower Copilot API endpoint:', err);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while processing your garden inquiry.',
        details: err.message,
      },
      { status: 500 }
    );
  }
}

