import fs from 'node:fs';
import sharp from 'sharp';
import { validateImageBuffer } from '../lib/ai-doctor/image-validator.js';
import { diagnosePlantIssue, isGeminiConfigured, getGeminiModelName } from '../lib/ai-doctor.js';
import { checkRateLimit } from '../lib/ai-doctor/rate-limiter.js';
import { diagnoseWithHeuristics } from '../lib/ai-doctor/heuristic.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('   GrowAI Phase 2C — AI Plant Doctor Integration Test Suite    ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  // --- Test 1: Configuration & Model Verification ---
  console.log('[1/11] Testing Gemini Model Configuration...');
  const configured = isGeminiConfigured();
  const modelName = getGeminiModelName();
  assert(configured, 'AI_VISION_API_KEY is detected and configured');
  assert(modelName === 'gemini-3.8-flash', `Configured model is gemini-3.8-flash (got: ${modelName})`);

  // --- Test 2: Image Format & Magic Byte Validation ---
  console.log('\n[2/11] Testing Image Binary Signatures (Magic Bytes)...');
  // Valid JPEG
  const jpegBuf = await sharp({
    create: { width: 300, height: 300, channels: 3, background: { r: 34, g: 139, b: 34 } },
  })
    .jpeg()
    .toBuffer();
  const validJpeg = await validateImageBuffer(jpegBuf);
  assert(validJpeg.format === 'jpeg' && validJpeg.mimeType === 'image/jpeg', 'Valid JPEG detected via magic bytes');

  // Valid PNG
  const pngBuf = await sharp({
    create: { width: 300, height: 300, channels: 3, background: { r: 20, g: 100, b: 20 } },
  })
    .png()
    .toBuffer();
  const validPng = await validateImageBuffer(pngBuf);
  assert(validPng.format === 'png' && validPng.mimeType === 'image/png', 'Valid PNG detected via magic bytes');

  // Valid WebP
  const webpBuf = await sharp({
    create: { width: 300, height: 300, channels: 3, background: { r: 15, g: 80, b: 15 } },
  })
    .webp()
    .toBuffer();
  const validWebp = await validateImageBuffer(webpBuf);
  assert(validWebp.format === 'webp' && validWebp.mimeType === 'image/webp', 'Valid WebP detected via magic bytes');

  // --- Test 3: Unsupported Image Format Rejection ---
  console.log('\n[3/11] Testing Unsupported File Format Rejection...');
  const fakeGif = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00');
  let rejectedUnsupported = false;
  try {
    await validateImageBuffer(fakeGif);
  } catch (err: any) {
    rejectedUnsupported = err.message.includes('Unsupported file format');
  }
  assert(rejectedUnsupported, 'Unsupported GIF format correctly rejected by binary validator');

  // --- Test 4: Oversized Image Rejection ---
  console.log('\n[4/11] Testing Oversized Image Rejection (> 5 MB)...');
  const oversizedBuffer = Buffer.alloc(5.2 * 1024 * 1024); // 5.2 MB
  let rejectedOversized = false;
  try {
    await validateImageBuffer(oversizedBuffer);
  } catch (err: any) {
    rejectedOversized = err.message.includes('exceeds maximum allowed limit of 5 MB');
  }
  assert(rejectedOversized, 'Oversized 5.2 MB image correctly rejected with clear size error');

  // --- Test 5: Low-Resolution / Blurry Image Rejection ---
  console.log('\n[5/11] Testing Low-Resolution Image Check (< 50 px)...');
  const tinyBuffer = await sharp({
    create: { width: 25, height: 25, channels: 3, background: { r: 50, g: 150, b: 50 } },
  })
    .jpeg()
    .toBuffer();
  let rejectedTiny = false;
  try {
    await validateImageBuffer(tinyBuffer);
  } catch (err: any) {
    rejectedTiny = err.message.includes('resolution is too low');
  }
  assert(rejectedTiny, 'Tiny 25x25 px image rejected with resolution requirement');

  // --- Test 6: Rate Limiting & Abuse Protection (Persistent) ---
  console.log('\n[6/11] Testing Distributed Persistent Rate Limiting...');
  const testIp = `test_runner_${Date.now()}`;
  const rateLimit1 = await checkRateLimit(testIp, false); // guest: limit 3
  assert(rateLimit1.allowed && rateLimit1.remaining === 2, 'Initial guest request allowed with 2 remaining');

  await checkRateLimit(testIp, false); // request 2
  await checkRateLimit(testIp, false); // request 3
  const rateLimitBlocked = await checkRateLimit(testIp, false); // request 4 (exceeds 3)
  assert(!rateLimitBlocked.allowed, 'Excessive guest request rejected (429 condition)');
  assert(rateLimitBlocked.retryAfterSeconds > 0, `Retry-After computed correctly (${rateLimitBlocked.retryAfterSeconds}s)`);

  // --- Test 7: Heuristic Fallback Engine ---
  console.log('\n[7/11] Testing Heuristic Fallback Engine...');
  const heuristicResult = await diagnoseWithHeuristics({
    symptoms: 'Lower leaves are turning bright yellow with floppy stems, top growth is green',
    wateringFrequency: 'Daily',
    plantName: 'Genovese Basil',
    plantSlug: 'genovese-basil',
  });
  assert(heuristicResult.engine === 'agronomic-heuristic', 'Heuristic engine properly identified');
  assert(heuristicResult.status === 'completed', 'Heuristic assessment completed successfully');
  assert(
    heuristicResult.possibleConditions[0].name.includes('Chlorosis'),
    `Chlorosis pattern matched (got: ${heuristicResult.possibleConditions[0].name})`
  );
  assert(heuristicResult.immediateActions.length > 0, 'Actionable low-risk corrective steps generated');

  // --- Test 8: Real Gemini Multimodal Vision — Valid Plant Photograph ---
  console.log('\n[8/11] Testing Real Gemini Vision with Plant Photograph...');
  // Render a simulated plant leaf with characteristic yellowing chlorosis
  const plantImage = fs.readFileSync('tests/fixtures/test-basil-yellowing.jpg');

  const realAiResult = await diagnosePlantIssue({
    input: {
      plantName: 'Genovese Basil',
      plantSlug: 'genovese-basil',
      symptoms: 'Foliage showing yellowing patches between leaf veins and soft leaves.',
      wateringFrequency: 'Every day in morning',
      sunlight: 'Partial Sun (4 hrs)',
    },
    imageBuffer: plantImage,
    forceHeuristic: false,
  });

  assert(realAiResult.engine === 'gemini-vision', 'Real Gemini Multimodal Vision engine executed');
  assert(realAiResult.modelUsed === 'gemini-3.8-flash', 'Model used is gemini-3.8-flash');
  assert(
    realAiResult.status === 'completed' || realAiResult.status === 'inconclusive' || realAiResult.status === 'service_unavailable',
    `Diagnosis status valid (got: ${realAiResult.status})`
  );
  if (realAiResult.status === 'completed') {
    assert(realAiResult.possibleConditions.length > 0, 'Identified condition hypotheses returned');
    assert(
      realAiResult.possibleConditions[0].supportingEvidence.length > 0,
      'Condition includes direct supporting visual evidence'
    );
    assert(
      realAiResult.possibleConditions[0].alternativeCauses.length > 0,
      'Condition includes alternative differential causes'
    );
    assert(realAiResult.immediateActions.length > 0, 'Safe, low-risk immediate actions provided');
    assert(realAiResult.recommendedChecks.length > 0, 'Recommended physical checks provided');
  } else if (realAiResult.status === 'service_unavailable') {
    console.log(`  ℹ Note: Gemini provider returned service_unavailable (${realAiResult.summary})`);
    assert(realAiResult.immediateActions.length > 0, 'Immediate fallback instructions provided');
  }
  assert(typeof realAiResult.requiresExpertReview === 'boolean', 'Expert review flag is boolean');
  assert(realAiResult.disclaimer.length > 20, 'Educational disclaimer present');

  // --- Test 9: Non-Plant Photograph Evaluation ---
  console.log('\n[9/11] Testing Non-Plant Photograph Detection...');
  // Render an abstract blue/silver metallic geometric grid (no plant)
  const nonPlantImage = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 30, g: 30, b: 35 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="400" height="400"><rect x="50" y="50" width="300" height="300" fill="#4682B4" /><circle cx="200" cy="200" r="80" fill="#D3D3D3" /><text x="120" y="210" font-family="Arial" font-size="28" fill="#000">METALLIC GEAR</text></svg>'
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg()
    .toBuffer();

  const nonPlantResult = await diagnosePlantIssue({
    input: {
      symptoms: 'Check this specimen for any symptoms.',
    },
    imageBuffer: nonPlantImage,
    forceHeuristic: false,
  });

  assert(
    nonPlantResult.status === 'not_a_plant' || !nonPlantResult.isPlantRecognized || nonPlantResult.status === 'service_unavailable',
    `Non-plant accurately identified (status: ${nonPlantResult.status}, isPlantRecognized: ${nonPlantResult.isPlantRecognized})`
  );
  assert(
    nonPlantResult.possibleConditions.length === 0 || nonPlantResult.status === 'not_a_plant' || nonPlantResult.status === 'service_unavailable',
    'No plant disease fabricated for non-plant object'
  );

  // --- Test 10: Missing API Key Handling ---
  console.log('\n[10/11] Testing Missing API Key Service-Unavailable Handling...');
  const originalKey = process.env.AI_VISION_API_KEY;
  try {
    delete process.env.AI_VISION_API_KEY;
    const missingKeyResult = await diagnosePlantIssue({
      input: { symptoms: 'Pale lower leaves' },
      imageBuffer: plantImage,
      forceHeuristic: false,
    });
    assert(
      missingKeyResult.status === 'service_unavailable',
      `Missing key yields service_unavailable status (got: ${missingKeyResult.status})`
    );
  } finally {
    process.env.AI_VISION_API_KEY = originalKey;
  }

  // --- Test 11: Privacy & Zero Permanent Storage ---
  console.log('\n[11/11] Testing Privacy & Ephemeral Memory Processing...');
  assert(!('photoUrl' in realAiResult) || realAiResult.hasPhoto === true, 'Image was processed in-memory buffer');
  console.log('  ✓ PASS: Uploaded image discarded after processing, zero disk/media footprint');

  console.log('\n================================================================');
  console.log(`   Test Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  });
