/**
 * GrowAI Automated WCAG 2.1 Color Contrast Audit Suite
 *
 * Mathematically evaluates relative luminance and contrast ratios
 * for all active design tokens, semantic surfaces, text roles,
 * status badges, interactive states, and component combinations.
 */

import fs from 'node:fs';
import path from 'node:path';

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map((c) => c + c).join('')
    : cleanHex;
  const num = parseInt(fullHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function sRGBtoLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface ContrastTestCase {
  category: string;
  name: string;
  fg: string;
  bg: string;
  requiredRatio: number;
  isExempt?: boolean;
  notes?: string;
}

const TEST_CASES: ContrastTestCase[] = [
  // 1. Primary Typography
  { category: 'Primary Typography', name: 'Primary text on warm app canvas', fg: '#203027', bg: '#F8F6EE', requiredRatio: 4.5 },
  { category: 'Primary Typography', name: 'Primary text on white card surface', fg: '#203027', bg: '#FFFFFF', requiredRatio: 4.5 },
  { category: 'Primary Typography', name: 'Primary text on soft botanical surface', fg: '#203027', bg: '#EAF1E4', requiredRatio: 4.5 },

  // 2. Secondary / Muted Typography (#5F6D63)
  { category: 'Secondary Typography', name: 'Secondary text on warm app canvas', fg: '#5F6D63', bg: '#F8F6EE', requiredRatio: 4.5 },
  { category: 'Secondary Typography', name: 'Secondary text on white card surface', fg: '#5F6D63', bg: '#FFFFFF', requiredRatio: 4.5 },
  { category: 'Secondary Typography', name: 'Secondary text on soft botanical surface', fg: '#5F6D63', bg: '#EAF1E4', requiredRatio: 4.5 },
  { category: 'Secondary Typography', name: 'Secondary text on sunshine surface', fg: '#5F6D63', bg: '#FFF3D7', requiredRatio: 4.5 },
  { category: 'Secondary Typography', name: 'Secondary text on water surface', fg: '#5F6D63', bg: '#E7F2F9', requiredRatio: 4.5 },
  { category: 'Secondary Typography', name: 'Secondary text on coral surface', fg: '#5F6D63', bg: '#FBE9E2', requiredRatio: 4.5 },
  { category: 'Secondary Typography', name: 'Secondary text on lavender surface', fg: '#5F6D63', bg: '#F0ECF7', requiredRatio: 4.5 },

  // 3. Actions & Buttons
  { category: 'Actions & Buttons', name: 'White text on primary forest green button', fg: '#FFFFFF', bg: '#174C35', requiredRatio: 4.5 },
  { category: 'Actions & Buttons', name: 'White text on forest green button hover', fg: '#FFFFFF', bg: '#123E2A', requiredRatio: 4.5 },
  { category: 'Actions & Buttons', name: 'High-contrast light sage on dark banner (#EAF1E4 on #174C35)', fg: '#EAF1E4', bg: '#174C35', requiredRatio: 4.5 },
  { category: 'Actions & Buttons', name: 'High-contrast light sage on dark banner (#EAF1E4 on #203027)', fg: '#EAF1E4', bg: '#203027', requiredRatio: 4.5 },

  // 4. Semantic Text Roles
  { category: 'Semantic Text', name: 'Sunshine text on sunshine surface', fg: '#8A6400', bg: '#FFF3D7', requiredRatio: 4.5 },
  { category: 'Semantic Text', name: 'Water text on water surface', fg: '#1B5D88', bg: '#E7F2F9', requiredRatio: 4.5 },
  { category: 'Semantic Text', name: 'Coral text on coral surface', fg: '#963A23', bg: '#FBE9E2', requiredRatio: 4.5 },
  { category: 'Semantic Text', name: 'Lavender text on lavender surface', fg: '#594186', bg: '#F0ECF7', requiredRatio: 4.5 },
  { category: 'Semantic Text', name: 'Forest green text on soft leaf surface', fg: '#174C35', bg: '#EAF1E4', requiredRatio: 4.5 },

  // 5. Growth Stage Badges
  { category: 'Growth Stage Badges', name: 'Seed stage badge', fg: '#8A6400', bg: '#FFF3D7', requiredRatio: 4.5 },
  { category: 'Growth Stage Badges', name: 'Germination stage badge', fg: '#174C35', bg: '#EAF1E4', requiredRatio: 4.5 },
  { category: 'Growth Stage Badges', name: 'Seedling stage badge', fg: '#174C35', bg: '#EAF1E4', requiredRatio: 4.5 },
  { category: 'Growth Stage Badges', name: 'Growing stage badge', fg: '#FFFFFF', bg: '#174C35', requiredRatio: 4.5 },
  { category: 'Growth Stage Badges', name: 'Flowering stage badge', fg: '#963A23', bg: '#FBE9E2', requiredRatio: 4.5 },
  { category: 'Growth Stage Badges', name: 'Harvested stage badge', fg: '#963A23', bg: '#FBE9E2', requiredRatio: 4.5 },

  // 6. Care Badges
  { category: 'Care Badges', name: 'Sunlight care badge', fg: '#8A6400', bg: '#FFF3D7', requiredRatio: 4.5 },
  { category: 'Care Badges', name: 'Water care badge', fg: '#1B5D88', bg: '#E7F2F9', requiredRatio: 4.5 },
  { category: 'Care Badges', name: 'Difficulty care badge', fg: '#174C35', bg: '#EAF1E4', requiredRatio: 4.5 },
  { category: 'Care Badges', name: 'Temperature care badge', fg: '#963A23', bg: '#FBE9E2', requiredRatio: 4.5 },
  { category: 'Care Badges', name: 'Container care badge', fg: '#594186', bg: '#F0ECF7', requiredRatio: 4.5 },

  // 7. Navigation & Interactive States
  { category: 'Navigation & Focus', name: 'Active nav text on warm canvas', fg: '#174C35', bg: '#F8F6EE', requiredRatio: 4.5 },
  { category: 'Navigation & Focus', name: 'Active tab text on forest green', fg: '#FFFFFF', bg: '#174C35', requiredRatio: 4.5 },
  { category: 'Navigation & Focus', name: 'Active bottom nav icon pill on soft surface', fg: '#174C35', bg: '#EAF1E4', requiredRatio: 3.0 },
  { category: 'Navigation & Focus', name: 'Keyboard focus ring against white card', fg: '#174C35', bg: '#FFFFFF', requiredRatio: 3.0 },
  { category: 'Navigation & Focus', name: 'Keyboard focus ring against warm canvas', fg: '#174C35', bg: '#F8F6EE', requiredRatio: 3.0 },

  // 8. Inactive & Disabled Controls (Audited with WCAG SC 1.4.3 Exemption)
  { category: 'Inactive Controls (Exempt)', name: 'Disabled button text on white', fg: '#8A968D', bg: '#FFFFFF', requiredRatio: 0, isExempt: true, notes: 'WCAG SC 1.4.3 Incidental/Inactive exemption' },
  { category: 'Inactive Controls (Exempt)', name: 'Disabled button text on warm canvas', fg: '#8A968D', bg: '#F8F6EE', requiredRatio: 0, isExempt: true, notes: 'WCAG SC 1.4.3 Incidental/Inactive exemption' },
];

console.log('\n======================================================================');
console.log('🌿 GrowAI WCAG 2.1 Relative Luminance & Contrast Audit Suite');
console.log('======================================================================\n');

let passed = 0;
let failed = 0;
let exempt = 0;

for (const tc of TEST_CASES) {
  const ratio = getContrastRatio(tc.fg, tc.bg);
  const roundedRatio = Math.round(ratio * 1000) / 1000;

  if (tc.isExempt) {
    exempt++;
    console.log(`  ℹ️  [EXEMPT] [${tc.category}] ${tc.name}: ${roundedRatio.toFixed(3)}:1 (${tc.fg} on ${tc.bg}) — ${tc.notes}`);
    continue;
  }

  const isPassing = ratio >= tc.requiredRatio;
  if (isPassing) {
    passed++;
    console.log(`  ✅ [PASS] [${tc.category}] ${tc.name}: ${roundedRatio.toFixed(3)}:1 (Target: >= ${tc.requiredRatio}:1)`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] [${tc.category}] ${tc.name}: ${roundedRatio.toFixed(3)}:1 (Target: >= ${tc.requiredRatio}:1, ${tc.fg} on ${tc.bg})`);
  }
}

// Check CSS tokens in globals.css
const globalsPath = path.join(process.cwd(), 'src', 'app', '(frontend)', 'globals.css');
const globalsContent = fs.readFileSync(globalsPath, 'utf8');

const hasMutedToken = globalsContent.toLowerCase().includes('--growai-muted: #5f6d63;');
if (hasMutedToken) {
  passed++;
  console.log('  ✅ [PASS] [CSS Variables] --growai-muted updated to #5f6d63 in globals.css');
} else {
  failed++;
  console.error('  ❌ [FAIL] [CSS Variables] --growai-muted is not #5f6d63 in globals.css');
}

const noOldSecondaryToken = !globalsContent.toLowerCase().includes('--growai-muted: #68766c;');
if (noOldSecondaryToken) {
  passed++;
  console.log('  ✅ [PASS] [CSS Variables] Legacy --growai-muted #68766c completely removed');
} else {
  failed++;
  console.error('  ❌ [FAIL] [CSS Variables] Legacy --growai-muted #68766c still present');
}

console.log('\n======================================================================');
console.log(`SUMMARY: ${passed} Passed | ${failed} Failed | ${exempt} Exempt`);
console.log('======================================================================\n');

if (failed > 0) {
  console.error(`❌ Audit failed with ${failed} contrast violation(s).`);
  process.exit(1);
} else {
  console.log('🎉 All audited text and interface color combinations pass WCAG 2.1 AA/AAA standards!');
  process.exit(0);
}
