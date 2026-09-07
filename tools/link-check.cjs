'use strict';
/*
 * link-check.cjs
 * Verifies the built site (dist/) references no missing images and reports
 * per-page image payload.
 *   - Checks every <img src>, every CSS url(), and every preload image href
 *     that points to a local file resolves to an existing file.
 *   - Reports per page: TOTAL referenced image bytes and EAGER (initial-load)
 *     image bytes (images that are not loading="lazy" + CSS background images,
 *     which the browser fetches on first paint).
 *
 * url() is only scanned inside <style> blocks, style="" attributes and linked
 * stylesheets — never inside <script> — so JS calls like URL.createObjectURL
 * are not mistaken for image references.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const SKIP = /^(https?:|data:|mailto:|tel:|#)/i;
function stripQuotes(s) { return s.replace(/^['"]|['"]$/g, ''); }

function resolveLocal(baseDir, url) {
  url = url.trim();
  if (!url || SKIP.test(url)) return null;
  if (url.startsWith('/')) return path.normalize(path.join(DIST, url));
  return path.normalize(path.join(baseDir, url));
}

// Extract local url() references from CSS text.
function cssUrlRefs(text, baseDir) {
  const refs = [];
  const re = /url\(\s*(['"]?)([^)'"]*?)\1\s*\)/gi;
  let m;
  while ((m = re.exec(text))) {
    const r = resolveLocal(baseDir, stripQuotes(m[2]));
    if (r) refs.push(r);
  }
  return refs;
}

// Returns { refs:[absPath], eager:[absPath] } for an HTML or CSS file.
function collectRefs(file) {
  const abs = file;
  const baseDir = path.dirname(abs);
  const text = fs.readFileSync(abs, 'utf8');
  const refs = [];
  const eager = [];

  if (file.endsWith('.css')) {
    const r = cssUrlRefs(text, baseDir); // CSS backgrounds load on first paint
    r.forEach(x => { refs.push(x); eager.push(x); });
    return { refs, eager };
  }

  // CSS backgrounds via <style> blocks or style="" attributes.
  let re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(text))) {
    cssUrlRefs(m[1], baseDir).forEach(x => { refs.push(x); eager.push(x); });
  }
  re = /\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi;
  while ((m = re.exec(text))) {
    cssUrlRefs(m[2], baseDir).forEach(x => { refs.push(x); eager.push(x); });
  }

  // <img src> — eager unless loading="lazy".
  re = /<img\b([\s\S]*?)\/?>/gi;
  while ((m = re.exec(text))) {
    const tag = m[1];
    const srcM = tag.match(/\bsrc\s*=\s*(["'])([^"']*?)\1/i);
    if (!srcM) continue;
    const r = resolveLocal(baseDir, srcM[2]);
    if (!r) continue;
    refs.push(r);
    if (!/\bloading\s*=\s*["']lazy["']/i.test(tag)) eager.push(r);
  }

  // preload image hrefs are fetched immediately.
  re = /<link\b([\s\S]*?)\/?>/gi;
  while ((m = re.exec(text))) {
    const tag = m[0];
    if (/rel\s*=\s*["']preload["']/i.test(tag) && /as\s*=\s*["']image["']/i.test(tag)) {
      const hrefM = tag.match(/\bhref\s*=\s*(["'])([^"']*?)\1/i);
      if (hrefM) {
        const r = resolveLocal(baseDir, hrefM[2]);
        if (r) { refs.push(r); eager.push(r); }
      }
    }
  }

  // linked stylesheets -> their url() references (eager backgrounds).
  re = /<link\b([\s\S]*?)\/?>/gi;
  while ((m = re.exec(text))) {
    const tag = m[0];
    if (/rel\s*=\s*["']stylesheet["']/i.test(tag)) {
      const hrefM = tag.match(/\bhref\s*=\s*(["'])([^"']*?)\1/i);
      if (hrefM) {
        const cssPath = resolveLocal(baseDir, hrefM[2]);
        if (cssPath && cssPath.endsWith('.css') && fs.existsSync(cssPath)) {
          cssUrlRefs(fs.readFileSync(cssPath, 'utf8'), path.dirname(cssPath))
            .forEach(x => { refs.push(x); eager.push(x); });
        }
      }
    }
  }

  return { refs, eager };
}

// --- 1. Missing-link check across all dist HTML + CSS ---
const allFiles = walk(DIST).filter(f => f.endsWith('.html') || f.endsWith('.css'));
const missing = [];
for (const f of allFiles) {
  const { refs } = collectRefs(f);
  for (const r of refs) {
    if (!fs.existsSync(r)) {
      missing.push({ page: path.relative(DIST, f), ref: path.relative(DIST, r) });
    }
  }
}

// --- 2. Per-page image payload ---
function sumBytes(arr) {
  const seen = new Set();
  let bytes = 0;
  const files = [];
  for (const r of arr) {
    if (seen.has(r)) continue;
    seen.add(r);
    if (fs.existsSync(r)) {
      const b = fs.statSync(r).size;
      bytes += b;
      files.push({ name: path.relative(DIST, r), bytes: b });
    }
  }
  return { bytes, files };
}

// "Before" weight: for each referenced .webp, use its original jpeg/jpg/png
// sibling size (originals still exist in resources/); fall back to webp size.
function sumBefore(arr) {
  const seen = new Set();
  let bytes = 0;
  for (const r of arr) {
    if (seen.has(r)) continue;
    seen.add(r);
    if (!fs.existsSync(r)) continue;
    if (r.toLowerCase().endsWith('.webp')) {
      const dir = path.dirname(r);
      const base = path.basename(r, '.webp');
      let orig = null;
      for (const ext of ['.jpeg', '.jpg', '.png']) {
        const cand = path.join(dir, base + ext);
        if (fs.existsSync(cand)) { orig = cand; break; }
      }
      bytes += orig ? fs.statSync(orig).size : fs.statSync(r).size;
    } else {
      bytes += fs.statSync(r).size;
    }
  }
  return bytes;
}

const pages = [
  'index.html',
  'projects.html',
  'ert-electrical-resistivity-tomography-uganda.html'
];

console.log('=== LINK CHECK (dist/) ===');
if (missing.length === 0) {
  console.log('PASS: no missing image references across', allFiles.length, 'HTML/CSS file(s).');
} else {
  console.log(`FAIL: ${missing.length} missing reference(s):`);
  for (const x of missing) console.log(`  ${x.page} -> ${x.ref}`);
}

console.log('\n=== PER-PAGE IMAGE PAYLOAD (before = original jpeg/jpg/png) ===');
let idxBytes = 0;
for (const p of pages) {
  const abs = path.join(DIST, p);
  const { refs, eager } = collectRefs(abs);
  const total = sumBytes(refs);
  const init = sumBytes(eager);
  if (p === 'index.html') idxBytes = init.bytes;
  const totBefore = sumBefore(refs);
  const eagerBefore = sumBefore(eager);
  console.log(`\n${p}`);
  console.log(`  TOTAL : after ${(total.bytes / 1048576).toFixed(3)} MB (was ${(totBefore / 1048576).toFixed(3)} MB), ${total.files.length} image(s)`);
  console.log(`  EAGER: after ${(init.bytes / 1048576).toFixed(3)} MB (was ${(eagerBefore / 1048576).toFixed(3)} MB), ${init.files.length} image(s)`);
  init.files.sort((a, b) => b.bytes - a.bytes).forEach(f =>
    console.log(`      ${(f.bytes / 1024).toFixed(1).padStart(8)} KB  ${f.name}`));
}

console.log('\n=== GUARD ===');
console.log(idxBytes < 1048576
  ? `PASS: index EAGER image payload ${(idxBytes / 1048576).toFixed(3)} MB < 1 MB`
  : `FAIL: index EAGER image payload ${(idxBytes / 1048576).toFixed(3)} MB >= 1 MB`);

process.exit(missing.length === 0 ? 0 : 1);
