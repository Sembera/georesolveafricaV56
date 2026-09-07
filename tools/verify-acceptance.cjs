'use strict';
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(DIST).filter(f => f.endsWith('.html'));

let total = 0, noW = 0, noH = 0, noDec = 0, noLoad = 0, empty = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const re = /<img\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(t))) {
    const tag = m[1];
    if (/\bsrc\s*=\s*""/.test(tag)) { empty++; continue; }
    total++;
    if (!/\bwidth=/.test(tag)) noW++;
    if (!/\bheight=/.test(tag)) noH++;
    if (!/\bdecoding=/.test(tag)) noDec++;
    if (!/\bloading=/.test(tag)) noLoad++;
  }
}
console.log('imgs (excluding empty-src):', total);
console.log('  missing width :', noW);
console.log('  missing height:', noH);
console.log('  missing decoding:', noDec);
console.log('  missing loading:', noLoad, '(first-visible img per page is intentionally eager)');
console.log('  empty-src (modal placeholders):', empty);

const art = path.join(DIST, 'news', 'arua-dam-mapping-seismic.html');
const at = fs.readFileSync(art, 'utf8');
const og = (at.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
const hero = (at.match(/<div class="article-hero">\s*<img[^>]*src="([^"]*)"/) || [])[1];
console.log('\nnews article og:image :', og);
console.log('news article hero img :', hero, og && /\.jpeg$/.test(og) && hero && /\.webp$/.test(hero) ? '(OK: og JPEG, hero WebP)' : '(CHECK)');

const idx = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
console.log('\nindex hero preload  :', /rel="preload" as="image" href="resources\/hero-geoscience-1200.webp"/.test(idx) ? 'OK' : 'MISSING');
console.log('index og:image JPEG  :', /property="og:image" content="https:\/\/georesolveafrica.com\/resources\/hero-geoscience.jpeg"/.test(idx) ? 'OK' : 'CHANGED');
console.log('index hero CSS webp  :', /url\(['"]?\.\.\/resources\/hero-geoscience-1200.webp['"]?\)/.test(fs.readFileSync(path.join(DIST, 'css', 'style.css'), 'utf8')) ? 'OK' : 'CHECK');
