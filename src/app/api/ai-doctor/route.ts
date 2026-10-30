import { NextRequest, NextResponse } from 'next/server';
import { diagnosePlantIssue } from '@/lib/ai-doctor';
import { DiagnosisInput, DiagnosisResponse } from '@/types/diagnosis';
import { checkRateLimit } from '@/lib/ai-doctor/rate-limiter';
import { createClient } from '@/lib/supabase/server';

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
      console.warn('Supabase auth session check non-fatal warning:', authErr);
    }

    // Determine client identifier for rate limiting (authoritative proxy header priority)
    const clientIp = extractClientIp(req);
    const rateLimitIdentifier = isAuthenticated && userId ? userId : clientIp;

    // 2. Enforce Distributed Rate Limiting (Cross-Instance Persistent)
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
            ? 'Hourly AI analysis quota reached (15 diagnoses/hr). Please try again later.'
            : 'Guest AI analysis limit reached (3 diagnoses/hr). Sign in to unlock standard user limits.',
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

    // 3. Parse Request (multipart/form-data or application/json)
    const contentType = req.headers.get('content-type') || '';
    let input: DiagnosisInput;
    let imageBuffer: Buffer | null = null;
    let forceHeuristic = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('photo') as File | null;
      const symptoms = (formData.get('symptoms') as string) || '';
      const plantSlug = (formData.get('plantSlug') as string) || undefined;
      const plantName = (formData.get('plantName') as string) || undefined;
      const wateringFrequency = (formData.get('wateringFrequency') as string) || undefined;
      const sunlight = (formData.get('sunlight') as string) || undefined;
      const temperature = (formData.get('temperature') as string) || undefined;
      const soilInfo = (formData.get('soilInfo') as string) || undefined;
      const environment = (formData.get('environment') as string) || undefined;
      const mode = (formData.get('mode') as string) || 'ai';

      forceHeuristic = mode === 'heuristic';

      input = {
        plantSlug,
        plantName,
        symptoms: symptoms.trim(),
        wateringFrequency,
        sunlight,
        temperature,
        soilInfo,
        environment,
      };

      if (file && file.size > 0) {
        // Enforce 5 MB maximum size limit
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Uploaded photograph exceeds the 5 MB size limit. Please upload a smaller image.' },
            { status: 400, headers: rateLimitHeaders }
          );
        }
        const arrayBuffer = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      // JSON payload handling
      const body = await req.json();
      input = {
        plantSlug: body.plantSlug,
        plantName: body.plantName,
        symptoms: (body.symptoms || '').trim(),
        wateringFrequency: body.wateringFrequency,
        sunlight: body.sunlight,
        temperature: body.temperature,
        soilInfo: body.soilInfo,
        environment: body.environment,
      };
      forceHeuristic = body.isHeuristicFallback === true || body.mode === 'heuristic';

      if (body.photoBase64) {
        const base64Data = body.photoBase64.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      }
    }

    // 4. Validate Symptoms
    if (!input.symptoms || input.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Please describe the symptoms or visible issues observed on your plant.' },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // 5. Execute Diagnosis (Gemini Multimodal Vision with graceful Heuristic fallback)
    const result: DiagnosisResponse = await diagnosePlantIssue({
      input,
      imageBuffer,
      forceHeuristic,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: rateLimitHeaders,
    });
  } catch (error: any) {
    console.error('AI Doctor route error:', error.message || error);

    const errorMessage = error.message || 'An unexpected error occurred during plant diagnosis.';

    // Discriminate between client validation errors and upstream issues
    if (
      errorMessage.includes('Unsupported file format') ||
      errorMessage.includes('Image size') ||
      errorMessage.includes('resolution is too low') ||
      errorMessage.includes('Corrupted or unreadable')
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (errorMessage.includes('timed out')) {
      return NextResponse.json(
        {
          error:
            'AI Vision analysis timed out. The model took too long to process. Please try again or switch to Heuristic Mode.',
        },
        { status: 504 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      return NextResponse.json(
        {
          error:
            'AI Vision model quota is temporarily saturated. Please try again in 1 minute or switch to Heuristic Mode.',
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('AI_VISION_API_KEY is not configured')) {
      return NextResponse.json(
        {
          error:
            'AI Vision API is not configured on this server. Please switch to Heuristic Mode for rule-based analysis.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'An internal error occurred during plant diagnosis. Please try again or use Heuristic Mode.',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract trusted client IP from reverse proxy headers.
 * Authoritative precedence:
 * 1. x-vercel-forwarded-for (authoritative when deployed on Vercel Edge/Serverless)
 * 2. cf-connecting-ip (authoritative when deployed behind Cloudflare)
 * 3. x-real-ip (authoritative on standard Nginx / AWS ALB setups)
 * 4. x-forwarded-for (fallback, takes leftmost entry)
 * 5. req.ip (Next.js server connection IP)
 */
export function extractClientIp(req: NextRequest | { headers: Headers }): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for')?.trim();
  if (vercelIp) return sanitizeIp(vercelIp);

  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return sanitizeIp(cfIp);

  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return sanitizeIp(realIp);

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return sanitizeIp(firstIp);
  }

  const directIp = (req as any).ip;
  if (directIp) return sanitizeIp(String(directIp));

  return 'anonymous_guest';
}

const IPV4_OR_IPV6_REGEX = /^(?:(?:\d{1,3}\.){3}\d{1,3}|[a-fA-F0-9:]+)$/;

function sanitizeIp(ip: string): string {
  const clean = ip.split('%')[0].split(';')[0].split(' ')[0].trim();
  if (IPV4_OR_IPV6_REGEX.test(clean)) {
    return clean.slice(0, 45);
  }
  return 'anonymous_guest';
}
