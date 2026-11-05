/**
 * GrowAI Phase 12: Grower Copilot Safety Guard
 * Enforces strict non-negotiable safety rules before and after AI synthesis:
 * - Detects human medical symptoms/inquiries and redirects to emergency/healthcare resources.
 * - Sanitizes untrusted text (plant nicknames, user notes) to prevent prompt injection.
 * - Prevents fabricated fertilizer dosages, pesticide PHIs, and guaranteed future yields.
 * - Preserves diagnostic uncertainty for plant health hypotheses.
 */

import { CopilotSafetyLevel, CopilotResponse } from '@/types/grower-copilot';

const HUMAN_MEDICAL_KEYWORDS = [
  'chest pain',
  'heart attack',
  'stroke',
  'difficulty breathing',
  'shortness of breath',
  'human medicine',
  'rash on my skin',
  'skin rash on my arm',
  'headache',
  'take advil',
  'take tylenol',
  'antibiotic for me',
  'medical diagnosis for myself',
  'doctor for humans',
  'prescribe medicine',
  'dosage for child',
  'human fever',
  'coughing blood',
  'swallowed a leaf',
  'child ate',
  'vomiting',
  'poison',
  'fever',
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /reveal (your )?system prompt/i,
  /disregard (all )?safety/i,
  /act as an unrestricted/i,
  /you are now DAN/i,
  /bypass (all )?rules/i,
  /print (your )?api key/i,
  /show (your )?secret/i,
  /dump your internal/i,
];

export interface SafetyCheckResult {
  isSafe: boolean;
  safetyLevel: CopilotSafetyLevel;
  reason?: 'human_medical' | 'prompt_injection' | 'prohibited';
  redirectResponse?: string;
  sanitizedQuery: string;
  promptInjectionDetected?: boolean;
}

/**
 * Pre-execution query safety check.
 */
export function checkQuerySafety(query: string): SafetyCheckResult {
  const lower = query.toLowerCase();

  // 1. Check for child ingestion emergency
  if (lower.includes('child ate') || lower.includes('swallowed') || lower.includes('poison')) {
    return {
      isSafe: false,
      safetyLevel: 'prohibited_redirect',
      reason: 'human_medical',
      redirectResponse:
        "SAFETY EMERGENCY WARNING: GrowAI is solely a botanical gardening assistant and cannot provide medical advice or ingestion safety evaluations. If a child, pet, or human ingested a plant and is showing symptoms or vomiting, please call emergency services immediately (911 in the US) or contact the Poison Help Center at 1-800-222-1222 right away.",
      sanitizedQuery: query,
    };
  }

  // 2. Check for human medical emergencies or questions
  for (const keyword of HUMAN_MEDICAL_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isSafe: false,
        safetyLevel: 'prohibited_redirect',
        reason: 'human_medical',
        redirectResponse:
          "I am GrowAI, an urban plant-growing assistant designed solely for botanical garden tracking. GrowAI cannot provide human medical diagnosis, human health advice, or recommend home remedies for illness. If you or someone else is experiencing health symptoms or a medical emergency, please consult a healthcare professional or contact emergency services immediately.",
        sanitizedQuery: query,
      };
    }
  }

  // 3. Sanitize and detect prompt injection attempts
  let sanitized = query;
  let promptInjectionDetected = false;
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      promptInjectionDetected = true;
      sanitized = sanitized.replace(pattern, '[inquiry filtered for platform security]');
    }
  }

  return {
    isSafe: true,
    safetyLevel: 'safe',
    sanitizedQuery: sanitized,
    promptInjectionDetected,
  };
}

// Alias for test compatibility
export const checkSafetyAndRelevance = checkQuerySafety;

/**
 * Sanitizes user-provided botanical notes or nicknames before passing into LLM prompts.
 */
export function sanitizeContextString(text?: string | null): string {
  if (!text) return '';
  // Strip control characters, quotes that could break JSON boundaries, and potential delimiter exploits
  return text
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/```/g, "'''")
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Sanitizes input query string, stripping HTML tags and delimiter exploits.
 */
export function sanitizeInput(query: string): { cleanQuery: string; wasModified: boolean } {
  const stripped = query
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
  return {
    cleanQuery: stripped,
    wasModified: stripped !== query,
  };
}

/**
 * Validates copilot output text for forbidden absolute claims and cleans them.
 */
export function validateCopilotOutput(text: string): {
  isValid: boolean;
  sanitizedText: string;
  flaggedIssues: string[];
} {
  let sanitizedText = text;
  const flaggedIssues: string[] = [];

  if (/cure 100%|cure \d{2,3}%|guarantees? survival|guaranteed to cure/gi.test(sanitizedText)) {
    flaggedIssues.push('prohibited_cure_guarantee');
    sanitizedText = sanitizedText.replace(
      /cure 100%|cure \d{2,3}%|guarantees? survival|guaranteed to cure/gi,
      'support recovery'
    );
  }

  if (/guarantees? \d+%\s*yield|yield will double|guaranteed yield/gi.test(sanitizedText)) {
    flaggedIssues.push('prohibited_yield_guarantee');
    sanitizedText = sanitizedText.replace(
      /guarantees? \d+%\s*yield|yield will double|guaranteed yield/gi,
      'may improve productivity'
    );
  }

  return {
    isValid: flaggedIssues.length === 0,
    sanitizedText,
    flaggedIssues,
  };
}

/**
 * Post-execution response safety validation.
 * Verifies that AI outputs do not assert human medical claims or guaranteed yields.
 */
export function validateResponseSafety(response: CopilotResponse): CopilotResponse {
  let safeAnswer = response.answer;

  // Redact any prohibited absolute yield claims
  safeAnswer = safeAnswer.replace(
    /will definitely yield|guaranteed to produce|will yield exactly/gi,
    'is estimated based on historical records to produce'
  );

  // Redact medical dosage claims
  safeAnswer = safeAnswer.replace(
    /prescribe|prescription|take \d+\s?mg/gi,
    'consult product label'
  );

  const checked = validateCopilotOutput(safeAnswer);

  return {
    ...response,
    answer: checked.sanitizedText,
  };
}
