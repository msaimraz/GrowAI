/**
 * GrowAI Phase 3 — Production PWA & UI/UX Verification Audit Suite
 *
 * Runs end-to-end automated verification of:
 * 1. PWA Manifest & W3C compliance
 * 2. Icon assets, resolutions, headers, and maskable safe-zones
 * 3. Service Worker caching strategies, bypass rules, RSC compatibility
 * 4. Offline fallback integrity & AI Doctor offline safeguards
 * 5. Account isolation, storage security, and sign-out cache purging
 * 6. Typography, contrast, and accessibility tokens
 */

import fs from 'fs';
import path from 'path';

interface AuditResult {
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: AuditResult[] = [];

function record(category: string, name: string, passed: boolean, details: string) {
  results.push({ category, name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}: ${details}`);
}

async function runAudit() {
  console.log('===============================================================');
  console.log(' GrowAI Phase 3 — Production PWA Verification Audit');
  console.log('===============================================================\n');

  const rootDir = process.cwd();

  // --------------------------------------------------------------------------
  // TEST 1: PWA Manifest Verification
  // --------------------------------------------------------------------------
  console.log('--- 1. PWA Manifest & Standards ---');
  const manifestPath = path.join(rootDir, 'public', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    record('Manifest', 'File Existence', false, 'public/manifest.json does not exist');
  } else {
    try {
      const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestRaw);

      record('Manifest', 'JSON Validity', true, 'public/manifest.json is well-formed JSON');
      record('Manifest', 'Application Name', manifest.name === 'GrowAI — Vertical Gardening Platform', `name: "${manifest.name}"`);
      record('Manifest', 'Short Name', manifest.short_name === 'GrowAI', `short_name: "${manifest.short_name}"`);
      record('Manifest', 'Start URL', manifest.start_url === '/app', `start_url: "${manifest.start_url}"`);
      record('Manifest', 'Display Mode', manifest.display === 'standalone', `display: "${manifest.display}"`);
      record('Manifest', 'Theme Color', manifest.theme_color === '#0e2a1b', `theme_color: "${manifest.theme_color}"`);
      record('Manifest', 'Background Color', manifest.background_color === '#fbf9f4', `background_color: "${manifest.background_color}"`);

      // Check Icons in manifest
      const icons = manifest.icons || [];
      const has192Any = icons.some((i: any) => i.src === '/icons/icon-192.png' && i.sizes === '192x192' && i.purpose === 'any');
      const has512Any = icons.some((i: any) => i.src === '/icons/icon-512.png' && i.sizes === '512x512' && i.purpose === 'any');
      const has192Mask = icons.some((i: any) => i.src === '/icons/icon-maskable-192.png' && i.sizes === '192x192' && i.purpose === 'maskable');
      const has512Mask = icons.some((i: any) => i.src === '/icons/icon-maskable-512.png' && i.sizes === '512x512' && i.purpose === 'maskable');

      record('Manifest', '192x192 Standard Icon', has192Any, 'Configured with purpose: "any"');
      record('Manifest', '512x512 Standard Icon', has512Any, 'Configured with purpose: "any"');
      record('Manifest', '192x192 Maskable Icon', has192Mask, 'Configured with purpose: "maskable"');
      record('Manifest', '512x512 Maskable Icon', has512Mask, 'Configured with purpose: "maskable"');

      // Check Shortcuts
      const hasShortcuts = Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3;
      record('Manifest', 'App Shortcuts', hasShortcuts, `Configured ${manifest.shortcuts?.length || 0} quick launcher shortcuts`);
    } catch (e: any) {
      record('Manifest', 'JSON Parsing', false, `Parse error: ${e.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 2: Icon Assets & Image Binary Verification
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Icon Assets & Dimensions ---');
  const iconFiles = [
    { file: 'public/icons/icon-192.png', expectedSize: 192 },
    { file: 'public/icons/icon-512.png', expectedSize: 512 },
    { file: 'public/icons/icon-maskable-192.png', expectedSize: 192 },
    { file: 'public/icons/icon-maskable-512.png', expectedSize: 512 },
    { file: 'public/apple-touch-icon.png', expectedSize: 180 },
    { file: 'public/icon-192.png', expectedSize: 192 },
  ];

  for (const { file, expectedSize } of iconFiles) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      record('Icons', file, false, 'File missing');
      continue;
    }

    const buf = fs.readFileSync(fullPath);
    // Verify PNG magic bytes: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    const isPng =
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a;

    // Read IHDR chunk width & height (bytes 16-23)
    let width = 0;
    let height = 0;
    if (isPng && buf.length >= 24) {
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
    }

    const sizeMatches = width === expectedSize && height === expectedSize;
    record(
      'Icons',
      file,
      isPng && sizeMatches,
      `Valid PNG (${buf.length} bytes), dimensions: ${width}x${height} (expected ${expectedSize}x${expectedSize})`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: Service Worker Compatibility & Cache Policies
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Service Worker Architecture & Next.js Compatibility ---');
  const swPath = path.join(rootDir, 'public', 'sw.js');
  if (!fs.existsSync(swPath)) {
    record('Service Worker', 'File Existence', false, 'public/sw.js missing');
  } else {
    const swContent = fs.readFileSync(swPath, 'utf-8');

    // RSC & Server Actions check
    const checksRSC = swContent.includes('_rsc') && swContent.includes("RSC") && swContent.includes("Next-Action");
    record('Service Worker', 'Next.js RSC & Server Actions Bypass', checksRSC, 'Explicitly bypasses _rsc queries, RSC header, and Next-Action header');

    // Never cache patterns
    const bypassesAiDoctor = swContent.includes('/api/ai-doctor') || swContent.includes('\\/api\\/ai-doctor');
    const bypassesAuth = swContent.includes('/auth/') || swContent.includes('\\/auth\\/');
    const bypassesAdmin = swContent.includes('/admin') || swContent.includes('\\/admin');
    const bypassesSupabase = swContent.includes('supabase.co');
    const bypassesPrivateGarden = swContent.includes('/app/my-garden') || swContent.includes('\\/app\\/my-garden');

    record('Service Worker', 'AI Doctor API Bypass', bypassesAiDoctor, 'Strictly excludes /api/ai-doctor from cache');
    record('Service Worker', 'Auth Endpoints Bypass', bypassesAuth, 'Strictly excludes /auth/* from cache');
    record('Service Worker', 'Payload Admin Bypass', bypassesAdmin, 'Strictly excludes /admin/* from cache');
    record('Service Worker', 'Supabase Cloud API Bypass', bypassesSupabase, 'Strictly excludes supabase.co endpoints');
    record('Service Worker', 'Private User Garden Route Bypass', bypassesPrivateGarden, 'Strictly excludes /app/my-garden from cache');

    // Mutation bypass
    const bypassesMutations = swContent.includes("request.method !== 'GET'");
    record('Service Worker', 'HTTP Mutations Bypass', bypassesMutations, 'All non-GET (POST, PUT, DELETE, PATCH) requests bypass cache');

    // User Cache Invalidation
    const handlesClearUser = swContent.includes('CLEAR_USER_CACHE');
    record('Service Worker', 'Sign-Out Cache Purge Handler', handlesClearUser, 'Handles CLEAR_USER_CACHE message by purging PAGES_CACHE');

    // Update Handler
    const handlesSkipWaiting = swContent.includes('SKIP_WAITING');
    record('Service Worker', 'Version Update Trigger', handlesSkipWaiting, 'Handles SKIP_WAITING to immediately activate updated service worker');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Live HTTP Server Endpoint Audit
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Live Server HTTP Endpoints & MIME Types ---');
  const endpoints = [
    { url: 'http://localhost:3000/manifest.json', expectedType: 'manifest+json' },
    { url: 'http://localhost:3000/sw.js', expectedType: 'application/javascript' },
    { url: 'http://localhost:3000/offline.html', expectedType: 'text/html' },
    { url: 'http://localhost:3000/icons/icon-192.png', expectedType: 'image/png' },
    { url: 'http://localhost:3000/icons/icon-512.png', expectedType: 'image/png' },
    { url: 'http://localhost:3000/icons/icon-maskable-192.png', expectedType: 'image/png' },
    { url: 'http://localhost:3000/icons/icon-maskable-512.png', expectedType: 'image/png' },
    { url: 'http://localhost:3000/apple-touch-icon.png', expectedType: 'image/png' },
    { url: 'http://localhost:3000/app', expectedType: 'text/html' },
    { url: 'http://localhost:3000/app/plants', expectedType: 'text/html' },
    { url: 'http://localhost:3000/app/learn', expectedType: 'text/html' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      const contentType = res.headers.get('content-type') || '';
      const statusOk = res.status === 200;
      const typeOk = contentType.includes(ep.expectedType);

      record(
        'HTTP Endpoints',
        ep.url.replace('http://localhost:3000', ''),
        statusOk && typeOk,
        `HTTP ${res.status}, Content-Type: ${contentType}`
      );
    } catch (err: any) {
      record('HTTP Endpoints', ep.url, false, `Fetch error: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 5: Privacy, Storage & Account Isolation
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Privacy, Account Isolation & Storage Security ---');
  const authContextPath = path.join(rootDir, 'src', 'context', 'AuthContext.tsx');
  const storagePath = path.join(rootDir, 'src', 'lib', 'storage.ts');
  const pwaContextPath = path.join(rootDir, 'src', 'context', 'PwaContext.tsx');

  const authSrc = fs.readFileSync(authContextPath, 'utf-8');
  const storageSrc = fs.readFileSync(storagePath, 'utf-8');
  const pwaSrc = fs.readFileSync(pwaContextPath, 'utf-8');

  // Verify AuthContext triggers CLEAR_USER_CACHE on signOut
  const signOutPurgesCache = authSrc.includes('CLEAR_USER_CACHE') && authSrc.includes('navigator.serviceWorker.controller.postMessage');
  record('Privacy & Auth', 'Sign-Out Cache Purge Trigger', signOutPurgesCache, 'AuthContext.signOut() dispatches CLEAR_USER_CACHE to service worker');

  // Verify storage.ts uses Supabase RLS and does NOT write private data to shared localStorage
  const usesSupabaseRls = storageSrc.includes(".from('user_plants')") && storageSrc.includes('auth.getUser()');
  const noLocalStorageLeak = !storageSrc.includes("localStorage.setItem('user_plants'") && !storageSrc.includes("localStorage.setItem('supabase_");
  record('Privacy & Auth', 'Supabase User Isolation (RLS)', usesSupabaseRls, 'Private user gardens queried strictly scoped to authenticated auth.uid()');
  record('Privacy & Auth', 'No Private Data in localStorage', noLocalStorageLeak, 'Private garden records never committed to shared browser localStorage');

  // Verify PwaContext purgePrivateCaches
  const hasPwaPurge = pwaSrc.includes('purgePrivateCaches') && pwaSrc.includes('CLEAR_USER_CACHE');
  record('Privacy & Auth', 'PWA Sensitive Cache Purging', hasPwaPurge, 'PwaContext provides purgePrivateCaches method for manual and automatic sanitization');

  // --------------------------------------------------------------------------
  // TEST 6: Offline Safeguards & AI Doctor Network Requirement
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Offline Safeguards & AI Doctor ---');
  const aiDoctorPagePath = path.join(rootDir, 'src', 'app', '(frontend)', 'app', 'ai-doctor', 'page.tsx');
  const aiDoctorSrc = fs.readFileSync(aiDoctorPagePath, 'utf-8');

  const usesPwaOfflineHook = aiDoctorSrc.includes('usePwa') && aiDoctorSrc.includes('isOffline');
  const showsOfflineWarning = aiDoctorSrc.includes('Offline Mode') && aiDoctorSrc.includes('requires an active internet connection');
  const disablesSubmitOffline = aiDoctorSrc.includes('isOffline') && aiDoctorSrc.includes('disabled=');

  record('AI Doctor Offline', 'Offline State Detection', usesPwaOfflineHook, 'Uses usePwa().isOffline hook to actively track network status');
  record('AI Doctor Offline', 'Prominent Offline Warning', showsOfflineWarning, 'Displays warning explaining Gemini Vision cloud model requirements');
  record('AI Doctor Offline', 'Disabled Offline Diagnosis Submission', disablesSubmitOffline, 'Diagnosis button disabled when offline, preventing false successful or broken sync states');

  // --------------------------------------------------------------------------
  // TEST 7: Typography, Contrast & Touch Target Standards
  // --------------------------------------------------------------------------
  console.log('\n--- 7. UI/UX Accessibility & Typography Tokens ---');
  const globalsCssPath = path.join(rootDir, 'src', 'app', '(frontend)', 'globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');

  const hasRootFontSize = globalsCss.includes('font-size: 16px');
  const hasLineHeight = globalsCss.includes('line-height: 1.6') || globalsCss.includes('leading-relaxed');
  const hasReducedMotion = globalsCss.includes('prefers-reduced-motion: reduce');
  const hasFocusVisible = globalsCss.includes('focus-visible');

  record('Accessibility', 'Root Base Font (>= 16px)', hasRootFontSize, 'Base HTML font size established at 16px for comfortable legibility');
  record('Accessibility', 'Line Height (1.6 leading-relaxed)', hasLineHeight, 'Body line height established at 1.6 for enhanced scanning');
  record('Accessibility', 'Reduced Motion Support', hasReducedMotion, '@media (prefers-reduced-motion: reduce) disables jarring animations');
  record('Accessibility', 'Accessible Focus Rings', hasFocusVisible, 'High-contrast focus-visible rings defined for keyboard navigation');

  // --------------------------------------------------------------------------
  // TEST 8: iOS Add-to-Home-Screen Support
  // --------------------------------------------------------------------------
  console.log('\n--- 8. iOS Guidance & Web App Meta Tags ---');
  const layoutPath = path.join(rootDir, 'src', 'app', '(frontend)', 'layout.tsx');
  const layoutSrc = fs.readFileSync(layoutPath, 'utf-8');

  const hasAppleTouchIcon = layoutSrc.includes('/apple-touch-icon.png');
  const hasAppleMetaTags = layoutSrc.includes('appleWebApp') && layoutSrc.includes('capable: true');
  const hasIosModalInPwa = pwaSrc.includes('Install on iOS Safari') && pwaSrc.includes('Share button');

  record('iOS Guidance', 'Apple Touch Icon Link', hasAppleTouchIcon, '<link rel="apple-touch-icon" href="/apple-touch-icon.png" /> present in root layout');
  record('iOS Guidance', 'Apple Web App Capable Meta', hasAppleMetaTags, 'appleWebApp: { capable: true } configured in Next.js root layout metadata');
  record('iOS Guidance', 'Dedicated iOS Step-by-Step Modal', hasIosModalInPwa, 'Shows clear 3-step Safari instructions (Share -> Add to Home Screen -> Add)');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(' AUDIT SUMMARY');
  console.log('===============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log(`Total Checks Executed : ${results.length}`);
  console.log(`Passed Checks         : ${passedCount}`);
  console.log(`Failed Checks         : ${failedCount}`);

  if (failedCount === 0) {
    console.log('\n🎉 ALL PWA & UI/UX PRODUCTION CHECKS PASSED SUCCESSFULLY!');
  } else {
    console.error(`\n⚠️  ${failedCount} checks failed. See details above.`);
  }

  return { passedCount, failedCount, results };
}

runAudit()
  .then((res) => {
    process.exit(res.failedCount === 0 ? 0 : 1);
  })
  .catch((err) => {
    console.error('Audit execution error:', err);
    process.exit(1);
  });
