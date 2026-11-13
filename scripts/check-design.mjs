#!/usr/bin/env node
/**
 * Design-regression guard for redesign v2 (docs/DESIGN.md, docs/PLAN.md § Quality gates).
 * Dependency-free. Not a linter: it greps src/ for the banned "AI-look" patterns.
 *
 *   npm run check:design            report every file; fail only on FINISHED files
 *   npm run check:design -- --all   fail on any violation (use once Phase G lands)
 *
 * Silence a deliberate exception by putting `design-allow` in a comment on that line
 * (e.g. a status dot: `rounded-full` + `{/* design-allow: status dot *\/}`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');

// Files restyled to v2. A phase adds its files here when it finishes; violations in
// these fail the check. Paths are relative to the repo root, with forward slashes.
const FINISHED = [
  'src/styles/fonts.css', // Phase A
  // Phase B
  'src/components/ui/Button.jsx',
  'src/components/ui/TextLink.jsx',
  'src/components/ui/Input.jsx',
  'src/components/ui/Tag.jsx',
  'src/components/ui/Card.jsx',
  'src/components/ui/Rule.jsx',
  'src/components/ui/index.js',
  'src/components/ui/ui.css',
  'src/components/Footer.jsx',
  'src/components/Footer.css',
  'src/components/CommandPalette.jsx',
  'src/components/CommandPalette.css',
  'src/components/auth/GoogleAuthDialog.jsx',
  'src/components/auth/GoogleSignInButton.jsx',
  'src/pages/_Kit.jsx',
  // P2 — System
  'src/lib/motion.js',
  'src/lib/framerFeatures.js',
  'src/data/siteStatus.js',
  'src/hooks/useMagnetic.js',
  'src/components/Reveal.jsx',
  'src/components/chrome/Dock.jsx',
  'src/components/chrome/Dock.css',
  'src/components/chrome/TopChrome.jsx',
  'src/components/chrome/TopChrome.css',
  'src/components/chrome/Cursor.jsx',
  'src/components/chrome/Cursor.css',
  'src/components/chrome/RouteWipe.jsx',
  'src/components/chrome/RouteWipe.css',
  'src/App.jsx',
  // P3 — Home + colophon footer
  'src/pages/Home.jsx',
  'src/pages/Home.css',
  'src/components/Arch.jsx',
  'src/components/home/HeroName.jsx',
  'src/main.jsx',
  'src/boot.jsx',
  // P4 — Projects index + case studies
  'src/styles/page.css',
  'src/lib/projects.js',
  'src/lib/viewTransition.js',
  'src/pages/Projects.jsx',
  'src/pages/Projects.css',
  'src/pages/ProjectDetail.jsx',
  'src/pages/ProjectDetail.css',
  'src/components/ui/HoverPreview.jsx',
  'src/components/ui/HoverPreview.css',
  'src/lib/arch.js',
  'src/lib/routeChunks.js',
  // P5 — remaining pages
  'src/lib/pageHeads.js',
  'src/lib/validate.js',
  'src/components/page/PageHead.jsx',
  'src/components/page/PageSection.jsx',
  'src/data/skillsData.js',
  'src/pages/About.jsx',
  'src/pages/About.css',
  'src/pages/Skills.jsx',
  'src/pages/Skills.css',
  'src/pages/Journey.jsx',
  'src/pages/Journey.css',
  'src/pages/Services.jsx',
  'src/pages/ServiceDetail.jsx',
  'src/pages/Services.css',
  'src/pages/Blog.jsx',
  'src/pages/Blog.css',
  'src/pages/BlogPost.jsx',
  'src/pages/BlogPost.css',
  'src/components/blog/ReadingProgress.jsx',
  'src/components/blog/ArticleTOC.jsx',
  'src/components/blog/ArticleShare.jsx',
  'src/components/blog/StructuredArticleContent.jsx',
  'src/components/blog/EditorialImage.jsx',
  'src/components/blog/ArticleContent.jsx',
  'src/components/support/SupportButton.jsx',
  'src/pages/Contact.jsx',
  'src/pages/Contact.css',
  'src/pages/NotFound.jsx',
];

const RULES = [
  { id: 'gradient', re: /\bbg-gradient-|\b(?:linear|radial|conic)-gradient\(/ },
  { id: 'gradient-text', re: /\bbg-clip-text\b|background-clip:\s*text/ },
  { id: 'glass', re: /\bbackdrop-blur|backdrop-filter:/ },
  { id: 'arbitrary-shadow', re: /\bshadow-\[|\bdrop-shadow-\[/ },
  { id: 'pill', re: /\brounded-full\b|border-radius:\s*(?:9999px|50%|999px)/ },
  // Tailwind `font-display` class (Syne alias), not the CSS `font-display:` descriptor.
  { id: 'legacy-display-font', re: /\bfont-display\b(?!\s*:)|font-family:[^;]*\bSyne\b/ },
  { id: 'slash-label', re: />\s*\/\/\s*[A-Za-z]|['"`]\/\/\s+[A-Za-z]/ },
];

// @keyframes may only animate transform and opacity.
const KEYFRAME_OK = new Set([
  'transform', 'translate', 'scale', 'rotate', 'opacity', 'offset', 'animation-timing-function',
]);

const EXT = /\.(jsx?|tsx?|css)$/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (EXT.test(entry.name)) out.push(p);
  }
  return out;
}

function keyframeViolations(text) {
  const hits = [];
  const kf = /@keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = kf.exec(text))) {
    // Find the matching closing brace of the @keyframes block.
    let depth = 1;
    let i = kf.lastIndex;
    while (i < text.length && depth > 0) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      i++;
    }
    // A `design-allow` comment on the @keyframes line silences the whole block.
    const NL = String.fromCharCode(10);
    const headerLine = text.slice(text.lastIndexOf(NL, m.index) + 1, text.indexOf(NL, m.index));
    if (headerLine.includes('design-allow')) {
      kf.lastIndex = i;
      continue;
    }
    const body = text.slice(kf.lastIndex, i - 1);
    const props = new Set([...body.matchAll(/([a-z-]+)\s*:/g)].map((x) => x[1]));
    const bad = [...props].filter((p) => !KEYFRAME_OK.has(p));
    if (bad.length) {
      const line = text.slice(0, m.index).split('\n').length;
      hits.push({ id: 'keyframes-non-transform', line, detail: `${m[1]}: ${bad.join(', ')}` });
    }
    kf.lastIndex = i;
  }
  return hits;
}

function check(file) {
  const text = readFileSync(file, 'utf8');
  const hits = [];
  text.split('\n').forEach((line, i) => {
    if (line.includes('design-allow')) return;
    for (const r of RULES) if (r.re.test(line)) hits.push({ id: r.id, line: i + 1 });
  });
  if (file.endsWith('.css')) hits.push(...keyframeViolations(text));
  return hits;
}

const strictAll = process.argv.includes('--all');
const rel = (p) => relative(ROOT, p).split(sep).join('/');
let failing = 0;
let total = 0;

for (const file of walk(SRC)) {
  const hits = check(file);
  if (!hits.length) continue;
  const r = rel(file);
  const enforced = strictAll || FINISHED.includes(r);
  total += hits.length;
  const counts = {};
  for (const h of hits) counts[h.id] = (counts[h.id] || 0) + 1;
  const summary = Object.entries(counts).map(([k, v]) => `${k}×${v}`).join(' ');
  console.log(`${enforced ? 'FAIL' : 'todo'}  ${r}  ${summary}`);
  if (enforced) {
    failing += hits.length;
    for (const h of hits) console.log(`      ${r}:${h.line}  ${h.id}${h.detail ? ` (${h.detail})` : ''}`);
  }
}

console.log(`\ncheck:design — ${total - failing} hit(s) in unfinished files (todo); ${failing} in finished files.`);
process.exit(failing ? 1 : 0);
