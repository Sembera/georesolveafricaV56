const fs = require('fs');
const path = require('path');
const marked = require('marked');
const sharp = require('sharp');

const DIST = 'dist';
const SRC = '.';

// WP12: News & Resources hubs archived. The Markdown pipeline (news/*.md) and
// the news build functions below stay in the repo dormant; flip this to true to
// resume publishing from news/*.md (no other code change required).
const NEWS_PUBLISH = false;

// --- WebP dimension cache (adds width/height + upgrades imgs in dist) ---
const WEBP_SET = new Set();   // relative-to-root posix paths of every .webp
const WEBP_DIMS = new Map();  // relative path -> { width, height }

function stripUp(src) {
  let s = src;
  while (s.startsWith('../')) s = s.slice(3);
  return s.replace(/\\/g, '/');
}

// Upgrade a single image reference to its .webp sibling when one exists.
// The hero is forced to the dedicated 1200px variant.
function toWebpSrc(src) {
  if (!src) return src;
  const hero = src.match(/^(.*\/)?(hero-geoscience)(?:\.jpeg|\.jpg|\.png|\.webp)?$/i);
  if (hero) return (hero[1] || '') + 'hero-geoscience-1200.webp';
  if (!/\.(jpeg|jpg|png)$/i.test(src)) return src;
  const webp = src.replace(/\.(jpeg|jpg|png)$/i, '.webp');
  return WEBP_SET.has(stripUp(webp)) ? webp : src;
}

function dimsForSrc(src) {
  return WEBP_DIMS.get(stripUp(src)) || null;
}

async function preloadWebp() {
  async function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else if (e.name.toLowerCase().endsWith('.webp')) {
        const rel = path.relative(SRC, p).replace(/\\/g, '/');
        WEBP_SET.add(rel);
        try {
          const m = await sharp(p).metadata();
          WEBP_DIMS.set(rel, { width: m.width, height: m.height });
        } catch (err) {
          WEBP_DIMS.set(rel, null);
        }
      }
    }
  }
  await walk(path.join(SRC, 'resources'));
}

// Add width/height + decoding="async" to an <img> and normalise loading:
// the FIRST visible image of a page is eager, everything below the fold lazy.
function finalizeImg(tag, isFirst) {
  tag = tag.replace(/(src\s*=\s*)(["'])(.*?)\2/gi,
    (mm, pre, q, val) => pre + q + toWebpSrc(val) + q);

  const sm = tag.match(/src\s*=\s*["']([^"']*)["']/i);
  const src = sm ? sm[1] : '';
  if (src) {
    const d = dimsForSrc(toWebpSrc(src));
    if (d) {
      if (!/\bwidth\s*=/.test(tag)) {
        tag = tag.replace(/<img\b/i, `<img width="${d.width}" height="${d.height}"`);
      }
      if (!/\bdecoding\s*=/.test(tag)) {
        tag = tag.replace(/<img\b/i, `<img decoding="async"`);
      }
    }
  }

  if (isFirst) {
    tag = tag.replace(/\s+loading\s*=\s*["']lazy["']/i, '');
  } else if (!/\bloading\s*=/.test(tag)) {
    tag = tag.replace(/<img\b/i, `<img loading="lazy"`);
  }
  return tag;
}

// Post-process every built HTML file so all <img> tags are dimensioned and
// correctly lazy-loaded. Covers statically authored imgs and those rendered
// from data (project grid, featured carousel, news cards/articles).
function ensureImgAttributes() {
  const htmlFiles = findFiles(DIST, '.html');
  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, 'utf8');
    let idx = 0;
    const out = html.replace(/<img\b[^>]*>/gi, (tag) => {
      const first = idx === 0;
      idx++;
      return finalizeImg(tag, first);
    });
    if (out !== html) fs.writeFileSync(filePath, out, 'utf8');
  }
  log(`ensureImgAttributes: processed ${htmlFiles.length} HTML file(s)`);
}

// Directories / files to exclude from copy
const EXCLUDES = new Set([
  'dist', 'node_modules', '.git', '.claude', '.agents', '.codex', '.trae', 'partials',
  'build.js', 'package-lock.json', 'quick-footer-inject.html', 'tools',
  'vite.config.js', '.env.template', '.gitignore',
  'IMPROVEMENT-PLAN.md', 'WEBSITE-IMPROVEMENT-PLAN.md',
  'Updates', 'docs', 'README.md',
  'news.html', 'resources.html', 'news'   // WP12: archive News & Resources hubs (sources retained, not published)
]);

const DIST_PRIVATE_PATHS = new Set([
  'IMPROVEMENT-PLAN.md',
  'WEBSITE-IMPROVEMENT-PLAN.md',
  'Updates',
  'docs',
  'README.md',
  '.agents',
  '.codex',
  '.trae'
]);

const TEXT_EXTENSIONS = new Set([
  '.html', '.js', '.css', '.json', '.txt', '.xml', '.toml', '.md', '.svg', '.webmanifest'
]);

// HTML files that should NOT appear in sitemap
const SITEMAP_EXCLUDES = new Set([]);

// Pages that should NOT get footer injection (already hardcoded)
const PAGES_WITH_HARDCODED_FOOTER = new Set([]);

// Tool pages that get JSON-LD injection
const TOOL_PAGES = {
  'g-resolog.html': {
    name: 'G-Resolog',
    description: 'Professional borehole core logging tool for geotechnical and soil investigation with pattern-based lithology classification, SPT testing, and PDF/Excel export.'
  },
  'g-resconvt.html': {
    name: 'G-Resconvt',
    description: 'Professional coordinate conversion tool for East Africa supporting 45+ CRS systems across 8 countries with batch CSV processing.'
  },
  'g-geopylanner.html': {
    name: 'G-Geopylanner',
    description: 'Unified geophysics survey planning tool for MASW, Seismic Refraction, ERT, GPR, magnetic, and gravity survey design with CSV export.'
  },
  'g-flightplanner.html': {
    name: 'G-FlightPlanner',
    description: 'Drone mapping planner for photogrammetry missions with GSD, overlap, flight-line, and KML/Litchi CSV export tools.'
  }
};

// English <-> French translation pairs (dist-relative paths). Used for the
// hreflang alternate links, the language switcher, and sitemap xhtml:link.
const TRANSLATION_MAP = {
  'index.html': 'fr/index.html',
  'fr/index.html': 'index.html',
  'methods.html': 'fr/methods.html',
  'fr/methods.html': 'methods.html',
  'applications.html': 'fr/applications.html',
  'fr/applications.html': 'applications.html',
  'contact.html': 'fr/contact.html',
  'fr/contact.html': 'contact.html',
  'geophysical-surveys-burundi.html': 'fr/geophysique-burundi.html',
  'fr/geophysique-burundi.html': 'geophysical-surveys-burundi.html',
  'geophysical-surveys-drc.html': 'fr/geophysique-rdc-est.html',
  'fr/geophysique-rdc-est.html': 'geophysical-surveys-drc.html',
  'geophysical-surveys-rwanda.html': 'fr/geophysique-rwanda.html',
  'fr/geophysique-rwanda.html': 'geophysical-surveys-rwanda.html'
};

// Featured project IDs for index.html carousel
const FEATURED_PROJECT_IDS = [1, 4, 6, 14, 11];

// Breadcrumb trail definitions for every page.
// Each entry is a list of { name, url } segments (excluding the final current
// page, which is appended automatically from the file being processed).
const BREADCRUMBS = {
  'index.html': [],
  'methods.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'applications.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'projects.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'contact.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'quality-hse.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'g-resolog.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'g-resconvt.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'g-geopylanner.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'g-flightplanner.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }],
  'drone-magnetic-survey-uganda.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }, { name: 'Methods', url: 'https://georesolveafrica.com/methods.html' }],
  'ground-magnetic-survey-uganda.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }, { name: 'Methods', url: 'https://georesolveafrica.com/methods.html' }],
  'insar-sar-services-uganda.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }, { name: 'Methods', url: 'https://georesolveafrica.com/methods.html' }],
  'seismic-refraction-uganda.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }, { name: 'Methods', url: 'https://georesolveafrica.com/methods.html' }],
  'ert-electrical-resistivity-tomography-uganda.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }, { name: 'Methods', url: 'https://georesolveafrica.com/methods.html' }],
  'downhole-seismic-survey-uganda.html': [{ name: 'Home', url: 'https://georesolveafrica.com/' }, { name: 'Methods', url: 'https://georesolveafrica.com/methods.html' }]
};

// Page title labels for the final (current) breadcrumb segment.
const BREADCRUMB_CURRENT_LABEL = {
  'index.html': 'Home',
  'methods.html': 'Methods',
  'applications.html': 'Applications',
  'projects.html': 'Projects',
  'contact.html': 'Contact',
  'quality-hse.html': 'QHSE',
  'g-resolog.html': 'G-Resolog',
  'g-resconvt.html': 'G-Resconvt',
  'g-geopylanner.html': 'G-Geopylanner',
  'g-flightplanner.html': 'G-FlightPlanner',
  'drone-magnetic-survey-uganda.html': 'Drone Magnetic Survey Uganda',
  'ground-magnetic-survey-uganda.html': 'Ground Magnetic Survey Uganda',
  'insar-sar-services-uganda.html': 'SAR & InSAR Services Uganda',
  'seismic-refraction-uganda.html': 'Seismic Refraction Survey Uganda',
  'ert-electrical-resistivity-tomography-uganda.html': 'ERT Survey Uganda',
  'downhole-seismic-survey-uganda.html': 'Downhole & Crosshole Seismic Survey Uganda'
};

// French breadcrumb trails (dist-relative paths, e.g. 'fr/index.html').
const BREADCRUMBS_FR = {
  'fr/index.html': [],
  'fr/methods.html': [{ name: 'Accueil', url: 'https://georesolveafrica.com/fr/' }],
  'fr/applications.html': [{ name: 'Accueil', url: 'https://georesolveafrica.com/fr/' }],
  'fr/contact.html': [{ name: 'Accueil', url: 'https://georesolveafrica.com/fr/' }],
  'fr/geophysique-burundi.html': [{ name: 'Accueil', url: 'https://georesolveafrica.com/fr/' }],
  'fr/geophysique-rdc-est.html': [{ name: 'Accueil', url: 'https://georesolveafrica.com/fr/' }],
  'fr/geophysique-rwanda.html': [{ name: 'Accueil', url: 'https://georesolveafrica.com/fr/' }]
};

const BREADCRUMB_CURRENT_LABEL_FR = {
  'fr/index.html': 'Accueil',
  'fr/methods.html': 'Méthodes',
  'fr/applications.html': 'Applications',
  'fr/contact.html': 'Contact',
  'fr/geophysique-burundi.html': 'Géophysique au Burundi',
  'fr/geophysique-rdc-est.html': 'Géophysique à l’est de la RDC',
  'fr/geophysique-rwanda.html': 'Géophysique au Rwanda'
};

/**
 * Build a BreadcrumbList JSON-LD object for a given dist-relative HTML path.
 */
function buildBreadcrumbList(distRel) {
  const isFr = distRel.startsWith('fr/');
  const trail = (isFr ? BREADCRUMBS_FR : BREADCRUMBS)[distRel] || [{ name: 'Home', url: 'https://georesolveafrica.com/' }];
  const currentLabel = (isFr ? BREADCRUMB_CURRENT_LABEL_FR : BREADCRUMB_CURRENT_LABEL)[distRel] || distRel;
  const currentUrl = distRel === 'index.html'
    ? 'https://georesolveafrica.com/'
    : (distRel === 'fr/index.html'
        ? 'https://georesolveafrica.com/fr/'
        : `https://georesolveafrica.com/${distRel}`);

  const itemListElement = [
    ...trail.map((seg, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: seg.name,
      item: seg.url
    })),
    {
      '@type': 'ListItem',
      position: trail.length + 1,
      name: currentLabel,
      item: currentUrl
    }
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };
}

/**
 * Inject a BreadcrumbList JSON-LD script tag before </head>.
 */
function injectBreadcrumbJSONLD(html, distRel) {
  const bc = buildBreadcrumbList(distRel);
  const scriptTag = `\n    <script type="application/ld+json">\n    ${JSON.stringify(bc, null, 2)}\n    </script>`;
  return html.replace('</head>', `${scriptTag}\n</head>`);
}

// ---------------------------------------------------------------------------
// i18n HELPERS (language switcher + hreflang)
// ---------------------------------------------------------------------------

// Domain-relative URL for a dist-relative path (handles home pages).
function pageUrl(rel) {
  if (rel === 'index.html') return '/';
  if (rel === 'fr/index.html') return '/fr/';
  return '/' + rel;
}

// Absolute URL for a dist-relative path (handles home pages).
function absUrl(rel) {
  if (rel === 'index.html') return 'https://georesolveafrica.com/';
  if (rel === 'fr/index.html') return 'https://georesolveafrica.com/fr/';
  return 'https://georesolveafrica.com/' + rel;
}

// Replace the <!-- LANG_SWITCH --> marker (present in both header partials)
// with an EN | FR toggle that links to the translated counterpart, or to the
// language home page when no direct translation exists.
function injectLangSwitch(html, distRel) {
  const isFr = distRel.startsWith('fr/');
  const counterpart = TRANSLATION_MAP[distRel] || null;
  const enHref = isFr ? (counterpart ? pageUrl(counterpart) : '/') : pageUrl(distRel);
  const frHref = isFr ? pageUrl(distRel) : (counterpart ? pageUrl(counterpart) : '/fr/');
  const enActive = isFr ? '' : ' lang-active';
  const frActive = isFr ? ' lang-active' : '';
  const switcher =
    `<div class="lang-switch">` +
    `<a href="${enHref}" hreflang="en" class="lang-link${enActive}">EN</a>` +
    `<span class="lang-sep">|</span>` +
    `<a href="${frHref}" hreflang="fr" class="lang-link${frActive}">FR</a>` +
    `</div>`;
  return html.replace(/<!--\s*LANG_SWITCH\s*-->/, switcher);
}

// Inject <link rel="alternate" hreflang> tags for every page.
// Pages with a translation get en + fr + x-default(=en). Pages without a
// translation self-reference en + x-default.
function injectHreflang(html, distRel) {
  const isFr = distRel.startsWith('fr/');
  const selfUrl = absUrl(distRel);
  const counterpart = TRANSLATION_MAP[distRel] || null;
  let block;
  if (counterpart) {
    const enUrl = isFr ? absUrl(counterpart) : selfUrl;
    const frUrl = isFr ? selfUrl : absUrl(counterpart);
    block =
      `<link rel="alternate" hreflang="en" href="${enUrl}">\n    ` +
      `<link rel="alternate" hreflang="fr" href="${frUrl}">\n    ` +
      `<link rel="alternate" hreflang="x-default" href="${enUrl}">\n    `;
  } else {
    block =
      `<link rel="alternate" hreflang="en" href="${selfUrl}">\n    ` +
      `<link rel="alternate" hreflang="x-default" href="${selfUrl}">\n    `;
  }
  return html.replace('</head>', `${block}</head>`);
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  log('Starting build...');
  await preloadWebp();

  // 1. Clean and recreate dist/
  cleanDist();

  // 2. Copy all source files to dist/
  copyDir(SRC, DIST);

  // 2b. WP12: guarantee archived News & Resources hubs never ship, even if a
  // prior dist wasn't fully cleared. Sources stay in the repo (dormant).
  // Also clears any stale qhse.html (renamed to quality-hse.html) and the
  // legacy .stale-news-quarantine/ holding old article pages.
  for (const p of ['news.html', 'resources.html', 'news', 'NEWS-HOWTO.md', 'qhse.html', '.stale-news-quarantine']) {
    const dp = path.join(DIST, p);
    if (fs.existsSync(dp)) fs.rmSync(dp, { recursive: true, force: true });
  }

  // 3. Read partials (English + French)
  const headerHTML = fs.readFileSync('partials/header.html', 'utf8').trim();
  const footerHTML = fs.readFileSync('partials/footer.html', 'utf8').trim();
  const headerFrHTML = fs.readFileSync('partials/header-fr.html', 'utf8').trim();
  const footerFrHTML = fs.readFileSync('partials/footer-fr.html', 'utf8').trim();

  // 4. Read projects data
  const projects = JSON.parse(fs.readFileSync('projects.json', 'utf8'));

  // 5+6. Build news article pages + index (archived by default — WP12)
  let newsArticles = [];
  if (NEWS_PUBLISH) {
    newsArticles = buildNewsArticles(headerHTML, footerHTML);
    buildNewsIndex(newsArticles);
  }

  // 7. Process each HTML file in dist/
  const htmlFiles = findFiles(DIST, '.html');
  for (const filePath of htmlFiles) {
    processHTML(filePath, headerHTML, footerHTML, headerFrHTML, footerFrHTML, projects);
  }
  ensureImgAttributes();

  // 8. Generate sitemap.xml
  generateSitemap();

  // 9. Copy llms.txt to dist/ (already done by copyDir, but ensure it exists)
  if (fs.existsSync('llms.txt')) {
    fs.copyFileSync('llms.txt', path.join(DIST, 'llms.txt'));
  }

  // 10. Fail the build if private files or corrupt text would be published.
  assertDistSafe();

  log('Build complete! Output in dist/');
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function log(msg) {
  console.log(`[build] ${msg}`);
}

function cleanDist() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (EXCLUDES.has(entry.name)) continue;

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findFiles(dir, ext) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function findAllFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function assertDistSafe() {
  const files = findAllFiles(DIST);
  for (const filePath of files) {
    const relativePath = path.relative(DIST, filePath).replace(/\\/g, '/');
    const parts = relativePath.split('/');

    for (const privatePath of DIST_PRIVATE_PATHS) {
      if (parts.includes(privatePath) || relativePath === privatePath) {
        throw new Error(`Private file would be published: ${relativePath}`);
      }
    }

    if (TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
      const bytes = fs.readFileSync(filePath);
      if (bytes.includes(0)) {
        throw new Error(`Null byte found in dist text file: ${relativePath}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// HTML PROCESSING
// ---------------------------------------------------------------------------

function processHTML(filePath, headerHTML, footerHTML, headerFrHTML, footerFrHTML, projects) {
  let html = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(DIST, filePath).replace(/\\/g, '/');
  const isFr = relativePath.startsWith('fr/');

  // WP12-C: Decap CMS admin pages are served as-is (do not inject header/footer,
  // hreflang, or breadcrumb JSON-LD into the CMS UI).
  if (relativePath.startsWith('admin/')) return;

  const header = isFr ? headerFrHTML : headerHTML;
  const footer = isFr ? footerFrHTML : footerHTML;

  // --- Inject header ---
  html = html.replace(
    /<!--\s*Header injected by js\/header-component\.js\s*-->/,
    header
  );

  // --- Inject footer ---
  if (!PAGES_WITH_HARDCODED_FOOTER.has(fileName)) {
    // Pattern A: "Footer & Clients" combined marker (most pages)
    html = html.replace(
      /<!--\s*Footer\s*&?\s*Clients injected by footer-component\.js\s*-->/,
      footer
    );

    // Pattern B: Separate "Clients Section" + "Footer" markers (index.html)
    html = html.replace(
      /<!--\s*Clients Section injected by footer-component\.js\s*-->\s*<!--\s*Footer injected by footer-component\.js\s*-->/,
      footer
    );
  }

  // --- Language switcher (replaces <!-- LANG_SWITCH --> in the header partial) ---
  html = injectLangSwitch(html, relativePath);

  // --- Render projects grid (projects.html, English only) ---
  if (!isFr && fileName === 'projects.html') {
    html = renderProjectsGrid(html, projects);
  }

  // --- Render featured projects carousel (index.html, English only) ---
  if (!isFr && fileName === 'index.html') {
    html = renderFeaturedCarousel(html, projects);
  }

  // --- Inject JSON-LD (tool pages) ---
  if (TOOL_PAGES[fileName]) {
    html = injectJSONLD(html, fileName);
  }

  // --- Render method comparison table (methods.html, English only) ---
  if (!isFr && fileName === 'methods.html') {
    html = renderMethodComparison(html);
  }

  // --- Inject hreflang alternate links (every page) ---
  html = injectHreflang(html, relativePath);

  // --- Inject BreadcrumbList JSON-LD (every page except news articles,
  //   which already get a richer breadcrumb in renderArticlePage) ---
  if (!relativePath.startsWith('news/')) {
    html = injectBreadcrumbJSONLD(html, relativePath);
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

// ---------------------------------------------------------------------------
// PROJECT CARD RENDERING
// ---------------------------------------------------------------------------

function renderProjectCard(project) {
  const escapedTitle = project.title.replace(/"/g, '&quot;');
  const escapedCountry = project.country;
  const escapedDescription = project.description.replace(/"/g, '&quot;');
  const escapedImage = project.image;
  const clientShort = project.client.split(' - ')[0].substring(0, 30);
  const clientDisplay = clientShort + (project.client.length > 30 ? '...' : '');

  return `
                        <div class="project-card animate-on-scroll" data-sector="${project.sector}" data-status="${project.status}" data-country="${project.country}" data-project-id="${project.id}">
                            <div class="project-image">
                                <img src="${escapedImage}" alt="${escapedTitle}" loading="lazy">
                                <div class="project-status status-${project.status}">${project.status}</div>
                                <div class="project-overlay">
                                    <span class="project-location">${escapedCountry}</span>
                                </div>
                            </div>
                            <div class="project-content">
                                <h3 class="project-title">${project.title}</h3>
                                <div class="project-sector">${project.sector} • ${project.year}</div>
                                <p class="project-description">${escapedDescription}</p>
                                <div class="project-meta">
                                    <span><strong>Client:</strong> ${clientDisplay}</span>
                                    <span><strong>Duration:</strong> ${project.duration}</span>
                                </div>
                                <div class="project-stats">
                                    <div class="stat-item">
                                        <span class="stat-number">${project.country}</span>
                                        <div class="stat-label">Country</div>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number">${project.year}</span>
                                        <div class="stat-label">Year</div>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number" style="font-size: 0.9rem; text-transform: capitalize;">${project.status}</span>
                                        <div class="stat-label">Status</div>
                                    </div>
                                </div>
                                <button class="project-view" onclick="openProjectModal(${project.id})">View Details</button>
                            </div>
                        </div>`;
}

function renderProjectsGrid(html, projects) {
  const cardsHTML = projects.map(renderProjectCard).join('\n');
  return html.replace(
    /(<div class="projects-grid" id="projects-grid">)\s*(<!-- Project cards will be dynamically generated -->)?\s*(<\/div>)/s,
    `$1\n${cardsHTML}\n            $3`
  );
}

function renderFeaturedCarousel(html, projects) {
  const featured = FEATURED_PROJECT_IDS
    .map(id => projects.find(p => p.id === id))
    .filter(Boolean);

  const slidesHTML = featured.map(project => `
                        <li class="splide__slide">
                            <div class="project-slide">
                                <div class="project-image">
                                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                                    <div class="project-overlay">
                                        <span class="project-location">${project.country}</span>
                                    </div>
                                </div>
                                <div class="project-info">
                                    <h3 class="project-title">${project.title}</h3>
                                    <p class="project-description">${project.description}</p>
                                    <div class="project-meta">
                                        <span>${project.year}</span>
                                        <span>${project.sector.charAt(0).toUpperCase() + project.sector.slice(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </li>`).join('\n');

  // Replace the content inside the splide__list <ul>
  return html.replace(
    /(<ul class="splide__list">)[\s\S]*?(<\/ul>\s*\n\s*<\/div>\s*\n\s*<\/div>)/,
    `$1\n${slidesHTML}\n                    $2`
  );
}

// ---------------------------------------------------------------------------
// METHOD COMPARISON TABLE
// ---------------------------------------------------------------------------

function renderMethodComparison(html) {
  const dataPath = path.join(SRC, 'methods-data.json');
  if (!fs.existsSync(dataPath)) {
    log('WARNING: methods-data.json not found; skipping method table render');
    return html;
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Render table rows (static HTML for crawlers)
  const rows = data.methods.map(m => {
    return `                        <tr class="method-row" data-method-id="${m.id}">
                            <td class="method-name">${escapeHTML(m.name)}</td>
                            <td>${formatDepthRange(m.depthRange_m)}</td>
                            <td>${dotRating(m.resolution)}</td>
                            <td>${dotRating(m.relCost, true)}</td>
                            <td>${m.speed_km_per_day} km/day</td>
                            <td>${m.bestFor.map(escapeHTML).join(', ')}</td>
                            <td>${m.deliverables.map(d => `<span style="display:inline-block;background:var(--background-light);border-radius:6px;padding:2px 6px;margin:1px;font-size:0.78rem">${escapeHTML(d)}</span>`).join('')}</td>
                            <td style="font-size:0.85rem;color:#555">${m.limitations.map(escapeHTML).join(' ')}</td>
                        </tr>`;
  }).join('\n');

  html = html.replace(
    /(<tbody id="comparison-tbody">)\s*<!-- Rows rendered by build\.js from methods-data\.json -->\s*(<\/tbody>)/,
    `$1\n${rows}\n                    $2`
  );

  // 2. Render show/hide checkboxes
  const checkboxes = data.methods.map(m => {
    return `                <div class="method-selector">
                    <input type="checkbox" id="cb-${m.id}" value="${m.id}" class="method-checkbox" checked>
                    <label for="cb-${m.id}">${escapeHTML(m.name)}</label>
                </div>`;
  }).join('\n');
  const toggleBtn = `                <button class="toggle-all-btn" type="button">Deselect All</button>`;

  html = html.replace(
    /(<div class="comparison-controls animate-on-scroll" id="comparison-controls">)\s*<!-- Method show\/hide checkboxes populated by build\.js -->\s*(<\/div>)/,
    `$1\n${checkboxes}\n${toggleBtn}\n            $2`
  );

  // 3. Embed method data for the wizard (replace any existing content in the
  //    #methods-data block so methods-data.json remains the single source of truth)
  const dataEmbed = `<script type="application/json" id="methods-data">\n${JSON.stringify(data)}\n    </script>`;
  html = html.replace(
    /<script type="application\/json" id="methods-data">[\s\S]*?<\/script>/,
    dataEmbed
  );

  log('Rendered method comparison table + wizard data');
  return html;
}

function formatDepthRange(range) {
  if (!Array.isArray(range) || range.length < 2) return '—';
  const [min, max] = range;
  if (min < 1) return `${min}-${max} m`;
  return `${min}-${max} m`;
}

function dotRating(value, inverse) {
  // value 1-5. If inverse (cost), lower = better → we still show 1-5 dots but
  // the meaning is "relative cost" (more dots = more expensive).
  const v = Math.max(1, Math.min(5, value));
  let dots = '';
  for (let i = 0; i < 5; i++) {
    dots += `<span class="dot${i < v ? '' : ' empty'}"></span>`;
  }
  return `<span class="dot-rating">${dots}</span>`;
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// NEWS SYSTEM
// ---------------------------------------------------------------------------

const NEWS_SRC_DIR = path.join(SRC, 'news');
const NEWS_DIST_DIR = path.join(DIST, 'news');
const NEWS_CATEGORIES = [
  { id: 'project-update', label: 'Project updates' },
  { id: 'technical-insight', label: 'Technical insights' },
  { id: 'company', label: 'Company' }
];

/**
 * Parse a Markdown file with YAML-like frontmatter into { meta, body, slug }.
 * Skips files with draft: true. Skips _template.md.
 */
function parseNewsArticle(filePath) {
  const fileName = path.basename(filePath, '.md');
  if (fileName === '_template') return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    log(`WARNING: ${fileName}.md has no frontmatter; skipping`);
    return null;
  }

  const meta = parseFrontmatter(fmMatch[1]);
  const body = fmMatch[2];

  if (meta.draft === true || meta.draft === 'true') {
    return { slug: fileName, draft: true, meta, body };
  }

  return { slug: fileName, draft: false, meta, body };
}

/**
 * Minimal frontmatter parser. Handles:
 *   key: value
 *   key: "quoted value"
 *   key: 2026-01-15
 *   key: ["a", "b"]
 *   key: true | false
 */
function parseFrontmatter(text) {
  const meta = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val === '') continue;

    // Boolean
    if (val === 'true' || val === 'false') {
      meta[key] = val === 'true';
      continue;
    }
    // JSON array
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        meta[key] = JSON.parse(val);
      } catch (e) {
        meta[key] = val;
      }
      continue;
    }
    // Quoted string
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      meta[key] = val.slice(1, -1);
      continue;
    }
    // Bare value (date, string, number)
    meta[key] = val;
  }
  return meta;
}

/**
 * Format an ISO date (YYYY-MM-DD) into a human-readable "Month Year" string.
 */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Read all .md files in news/, parse them, and render each non-draft article
 * to dist/news/{slug}.html. Returns the list of published articles (with meta
 * + slug) for the index. Drafts are excluded entirely.
 */
function buildNewsArticles(headerHTML, footerHTML) {
  if (!fs.existsSync(NEWS_SRC_DIR)) {
    log('No news/ folder; skipping article build');
    return [];
  }

  fs.mkdirSync(NEWS_DIST_DIR, { recursive: true });

  const mdFiles = findFiles(NEWS_SRC_DIR, '.md');
  const published = [];

  for (const mdPath of mdFiles) {
    const article = parseNewsArticle(mdPath);
    if (!article) continue;
    if (article.draft) {
      log(`NEWS: skipping draft "${article.slug}"`);
      continue;
    }

    const html = renderArticlePage(article, headerHTML, footerHTML);
    const outPath = path.join(NEWS_DIST_DIR, `${article.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    log(`NEWS: built article ${article.slug}.html`);
    published.push(article);
  }

  // Clean up: remove the .md files and reading-list.json from dist/news/ so
  // only the rendered HTML pages are published.
  const distNewsFiles = findAllFiles(NEWS_DIST_DIR);
  for (const f of distNewsFiles) {
    if (f.endsWith('.md') || f.endsWith('reading-list.json')) {
      fs.unlinkSync(f);
    }
  }

  // Sort published by date descending
  published.sort((a, b) => {
    const da = new Date(a.meta.date || '1970-01-01').getTime();
    const db = new Date(b.meta.date || '1970-01-01').getTime();
    return db - da;
  });

  return published;
}

/**
 * Render a full article HTML page from a parsed article.
 */
function renderArticlePage(article, headerHTML, footerHTML) {
  const { meta, body, slug } = article;
  const title = escapeHTML(meta.title || slug);
  const excerpt = escapeHTML(meta.excerpt || '');
  const image = meta.image || 'resources/hero-geoscience.jpeg';
  const dateStr = formatDate(meta.date);
  const category = meta.category || 'company';
  const categoryLabel = categoryLabelFor(category);
  const author = escapeHTML(meta.author || 'Georesolve Africa');
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const tagsHtml = tags.map(t => `<span class="article-tag">${escapeHTML(t)}</span>`).join('');
  const bodyHtml = marked.parse(body || '');

  const url = `https://georesolveafrica.com/news/${slug}.html`;
  const imageAbs = `https://georesolveafrica.com/${image.replace(/^\/+/, '')}`;

  // Article JSON-LD
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title || slug,
    description: meta.excerpt || '',
    image: imageAbs,
    datePublished: meta.date ? new Date(meta.date).toISOString() : undefined,
    dateModified: meta.date ? new Date(meta.date).toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: meta.author || 'Georesolve Africa'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Georesolve Africa',
      logo: {
        '@type': 'ImageObject',
        url: 'https://georesolveafrica.com/resources/logo/Georesolve%20Logo.PNG'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };

  // BreadcrumbList JSON-LD (Home > News & Insights > Article)
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://georesolveafrica.com/' },
      { '@type': 'ListItem', position: 2, name: 'News & Insights', item: 'https://georesolveafrica.com/' },
      { '@type': 'ListItem', position: 3, name: meta.title || slug, item: url }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Georesolve Africa</title>
    <meta name="description" content="${excerpt}">
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${excerpt}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageAbs}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/png" href="../resources/favicon/Icon-Flavicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/navbar.css">
    <link rel="stylesheet" href="../footer-styles.css">
    <script type="application/ld+json">
${JSON.stringify(articleLd, null, 4)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(breadcrumbLd, null, 4)}
    </script>
    <style>
        :root {
            --primary-color: #345363;
            --secondary-color: #9EDB9E;
            --accent-color: #4DA34D;
            --text-dark: #1a1a1a;
            --text-light: #ffffff;
            --background-light: #f8f9fa;
            --border-color: #e9ecef;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.7;
            color: var(--text-dark);
            background-color: var(--background-light);
            padding-top: 80px;
        }
        a { color: var(--accent-color); }
        .article-hero {
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        .article-hero img {
            width: 100%;
            height: 380px;
            object-fit: cover;
            border-radius: 20px;
            box-shadow: 0 8px 30px rgba(52,83,99,0.15);
        }
        .article-header {
            max-width: 800px;
            margin: 2rem auto 1rem;
            padding: 0 2rem;
        }
        .article-category-badge {
            display: inline-block;
            background: var(--accent-color);
            color: white;
            padding: 0.35rem 0.9rem;
            border-radius: 15px;
            font-size: 0.78rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }
        .article-title {
            font-family: 'Playfair Display', serif;
            font-size: 2.4rem;
            color: var(--primary-color);
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        .article-meta {
            display: flex;
            gap: 1.5rem;
            color: #888;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
        }
        .article-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .article-tag {
            background: var(--background-light);
            color: #666;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.72rem;
            font-weight: 500;
            border: 1px solid var(--border-color);
        }
        .article-body {
            max-width: 800px;
            margin: 0 auto 4rem;
            padding: 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(52,83,99,0.08);
        }
        .article-body h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.6rem;
            color: var(--primary-color);
            margin: 2rem 0 1rem;
        }
        .article-body h3 {
            font-size: 1.2rem;
            color: var(--primary-color);
            margin: 1.5rem 0 0.75rem;
        }
        .article-body p { margin-bottom: 1.25rem; color: #333; }
        .article-body ul, .article-body ol { margin: 0 0 1.25rem 1.5rem; }
        .article-body li { margin-bottom: 0.5rem; }
        .article-body strong { color: var(--primary-color); }
        .article-body code {
            font-family: 'JetBrains Mono', monospace;
            background: var(--background-light);
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.88em;
        }
        .article-body a { color: var(--accent-color); }
        .article-body em { color: #666; }
        .article-body hr {
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 2rem 0;
        }
        .article-back {
            display: inline-block;
            margin: 0 2rem 1rem;
            max-width: 800px;
        }
        .article-back a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
        }
        @media (max-width: 768px) {
            .article-title { font-size: 1.8rem; }
            .article-hero img { height: 220px; }
            .article-body { padding: 1.5rem; }
        }
    </style>
</head>
<body>
    ${rewritePathsForSubdir(headerHTML)}

    <div class="article-back">
        <a href="../index.html">&larr; Back to Home</a>
    </div>

    <div class="article-header">
        <span class="article-category-badge">${escapeHTML(categoryLabel)}</span>
        <h1 class="article-title">${title}</h1>
        <div class="article-meta">
            <span>${escapeHTML(dateStr)}</span>
            <span>${author}</span>
        </div>
        <div class="article-tags">${tagsHtml}</div>
    </div>

    <div class="article-hero">
        <img src="../${image.replace(/^\/+/, '')}" alt="${title}">
    </div>

    <article class="article-body">
${bodyHtml}
    </article>

    ${rewritePathsForSubdir(footerHTML)}

    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" defer></script>
    <script src="../js/header-component.js" defer></script>
    <script src="../footer-component.js" defer></script>
</body>
</html>`;
}

/**
 * Rewrite relative href/src URLs to prepend ../ for pages in a subdirectory
 * (e.g. news/). Leaves absolute, protocol-relative, hash, and mailto: URLs
 * untouched. Also leaves the navbar.css/footer-styles.css already handled
 * via the <link> tags in the page head.
 */
function rewritePathsForSubdir(html) {
  return html.replace(/(href|src)=("|')([^"']*)("|')/g, (match, attr, q, val, qEnd) => {
    if (/^(https?:|\/\/|#|mailto:|tel:|data:)/i.test(val)) return match;
    if (val.startsWith('/')) return match; // root-relative — fine on Netlify
    if (val.startsWith('../')) return match;
    // Special-case the resource/logo path used by the navbar brand image
    return `${attr}=${q}../${val}${qEnd}`;
  });
}

function categoryLabelFor(id) {
  const found = NEWS_CATEGORIES.find(c => c.id === id);
  return found ? found.label : id;
}

/**
 * Rebuild dist/news.html: fill the NEWS_INDEX_PLACEHOLDER with article cards
 * grouped by category, and READING_LIST_PLACEHOLDER with curated links.
 */
function buildNewsIndex(articles) {
  const newsHtmlPath = path.join(DIST, 'news.html');
  if (!fs.existsSync(newsHtmlPath)) {
    log('WARNING: dist/news.html not found; skipping news index');
    return;
  }

  let html = fs.readFileSync(newsHtmlPath, 'utf8');

  // 1. Article index grouped by category
  const groupsHtml = NEWS_CATEGORIES.map(cat => {
    const catArticles = articles.filter(a => (a.meta.category || 'company') === cat.id);
    if (catArticles.length === 0) return '';
    const cards = catArticles.map(a => renderArticleCard(a)).join('\n');
    return `                    <div class="news-group">
                        <h3 class="news-group-title">${escapeHTML(cat.label)}</h3>
                        <div class="news-grid">
${cards}
                        </div>
                    </div>`;
  }).filter(Boolean).join('\n');

  html = html.replace(
    /<!-- NEWS_INDEX_PLACEHOLDER -->[\s\S]*?<!-- \/NEWS_INDEX_PLACEHOLDER -->|<!-- NEWS_INDEX_PLACEHOLDER -->/,
    groupsHtml || '<p class="wizard-no-result">No articles published yet. Check back soon.</p>'
  );

  // 2. Reading list sidebar
  const readingListPath = path.join(NEWS_SRC_DIR, 'reading-list.json');
  let readingListHtml = '';
  if (fs.existsSync(readingListPath)) {
    const links = JSON.parse(fs.readFileSync(readingListPath, 'utf8'));
    readingListHtml = links.map(l => `                            <li>
                                <a href="${escapeHTML(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(l.title)}</a>
                                <span class="reading-list-source">${escapeHTML(l.source || '')}</span>
                            </li>`).join('\n');
  }
  html = html.replace(
    /<!-- READING_LIST_PLACEHOLDER -->/,
    readingListHtml || '<li>No curated links yet.</li>'
  );

  fs.writeFileSync(newsHtmlPath, html, 'utf8');
  log(`Built news index with ${articles.length} article(s)`);
}

/**
 * Render a single article card for the news index.
 */
function renderArticleCard(article) {
  const { meta, slug } = article;
  const title = escapeHTML(meta.title || slug);
  const excerpt = escapeHTML(meta.excerpt || '');
  const image = meta.image || 'resources/hero-geoscience.jpeg';
  const dateStr = escapeHTML(formatDate(meta.date));
  const tags = Array.isArray(meta.tags) ? meta.tags.slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('') : '';

  return `                            <article class="article-card animate-on-scroll">
                                <a href="news/${slug}.html" style="text-decoration:none;color:inherit">
                                    <div class="article-image">
                                        <img src="${escapeHTML(image)}" alt="${title}" loading="lazy">
                                    </div>
                                    <div class="article-content">
                                        <h3 class="article-title">${title}</h3>
                                        <div class="article-meta">
                                            <span>${dateStr}</span>
                                        </div>
                                        <p class="article-excerpt">${excerpt}</p>
                                        ${tags ? `<div class="article-tags">${tags}</div>` : ''}
                                        <span class="read-more">Read more &rarr;</span>
                                    </div>
                                </a>
                            </article>`;
}

// ---------------------------------------------------------------------------
// JSON-LD INJECTION
// ---------------------------------------------------------------------------

function injectJSONLD(html, fileName) {
  const info = TOOL_PAGES[fileName];
  const url = `https://georesolveafrica.com/${fileName}`;
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: info.name,
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: 'Georesolve Africa'
    },
    url: url,
    description: info.description
  };

  const scriptTag = `\n    <script type="application/ld+json">\n    ${JSON.stringify(ldJson, null, 2)}\n    </script>`;

  // Inject before </head>
  return html.replace('</head>', `${scriptTag}\n</head>`);
}

// ---------------------------------------------------------------------------
// SITEMAP GENERATION
// ---------------------------------------------------------------------------

function generateSitemap() {
  const htmlFiles = findFiles(DIST, '.html');
  const urls = [];

  // WP12-A: only emit /news/ URLs when article pages were actually generated
  // by the (dormant) news pipeline; otherwise the archived hub stays out of
  // the sitemap entirely.
  const newsUrlsAllowed = fs.existsSync(NEWS_DIST_DIR) && findFiles(NEWS_DIST_DIR, '.html').length > 0;

  for (const filePath of htmlFiles) {
    const fileName = path.basename(filePath);
    if (SITEMAP_EXCLUDES.has(fileName)) continue;
    const relativePath = path.relative(DIST, filePath).replace(/\\/g, '/');
    // WP12-A: skip any stray /news/ article URLs unless the pipeline built them.
    if (relativePath.startsWith('news/') && !newsUrlsAllowed) continue;
    if (relativePath.startsWith('admin/')) continue; // WP12-C: never list CMS admin
    const stats = fs.statSync(filePath);
    const lastmod = stats.mtime.toISOString().split('T')[0];

    let priority = '0.8';
    let changefreq = 'monthly';
    if (relativePath === 'index.html') {
      priority = '1.0';
      changefreq = 'weekly';
    } else if (relativePath === 'fr/index.html') {
      priority = '0.9';
      changefreq = 'weekly';
    } else if (
      fileName === 'methods.html' ||
      fileName === 'applications.html' ||
      fileName === 'g-resolog.html' ||
      fileName === 'g-resconvt.html' ||
      fileName === 'g-geopylanner.html' ||
      fileName === 'g-flightplanner.html'
    ) {
      priority = '0.9';
      changefreq = 'monthly';
    } else if (fileName === 'projects.html') {
      changefreq = 'weekly';
    } else if (fileName === 'quality-hse.html') {
      priority = '0.6';
      changefreq = 'monthly';
    } else if (relativePath.startsWith('news/')) {
      priority = '0.6';
      changefreq = 'monthly';
    } else if (relativePath.startsWith('fr/')) {
      priority = '0.7';
      changefreq = 'monthly';
    }

    urls.push({ rel: relativePath, lastmod, priority, changefreq });
  }

  // Sort: index first, then alphabetical
  urls.sort((a, b) => {
    if (a.rel === 'index.html') return -1;
    if (b.rel === 'index.html') return 1;
    return a.rel.localeCompare(b.rel);
  });

  const xmlEntries = urls.map(u => {
    const loc = absUrl(u.rel);
    let xhtml = '';
    if (TRANSLATION_MAP[u.rel]) {
      const enLoc = absUrl(u.rel.startsWith('fr/') ? TRANSLATION_MAP[u.rel] : u.rel);
      const frLoc = absUrl(u.rel.startsWith('fr/') ? u.rel : TRANSLATION_MAP[u.rel]);
      xhtml =
        `\n    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>` +
        `\n    <xhtml:link rel="alternate" hreflang="fr" href="${frLoc}"/>` +
        `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${enLoc}"/>`;
    }
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${xhtml}
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>
`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
  log(`Generated sitemap.xml with ${urls.length} URLs`);
}

// ---------------------------------------------------------------------------
// RUN
// ---------------------------------------------------------------------------

main();