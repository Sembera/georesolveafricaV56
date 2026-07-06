const fs = require('fs');
const path = require('path');

const DIST = 'dist';
const SRC = '.';

// Directories / files to exclude from copy
const EXCLUDES = new Set([
  'dist', 'node_modules', '.git', '.claude', 'partials',
  'build.js', 'package-lock.json', 'quick-footer-inject.html',
  'vite.config.js', '.env.template', '.gitignore',
  'IMPROVEMENT-PLAN.md', 'WEBSITE-IMPROVEMENT-PLAN.md',
  'Updates', 'docs', 'README.md'
]);

const DIST_PRIVATE_PATHS = new Set([
  'IMPROVEMENT-PLAN.md',
  'WEBSITE-IMPROVEMENT-PLAN.md',
  'Updates',
  'docs',
  'README.md'
]);

const TEXT_EXTENSIONS = new Set([
  '.html', '.js', '.css', '.json', '.txt', '.xml', '.toml', '.md', '.svg', '.webmanifest'
]);

// HTML files that should NOT appear in sitemap
const SITEMAP_EXCLUDES = new Set([]);

// Pages that should NOT get footer injection (already hardcoded)
const PAGES_WITH_HARDCODED_FOOTER = new Set([
  'projects.html'
]);

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
  }
};

// Featured project IDs for index.html carousel
const FEATURED_PROJECT_IDS = [1, 4, 6, 14, 11];

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

function main() {
  log('Starting build...');

  // 1. Clean and recreate dist/
  cleanDist();

  // 2. Copy all source files to dist/
  copyDir(SRC, DIST);

  // 3. Read partials
  const headerHTML = fs.readFileSync('partials/header.html', 'utf8').trim();
  const footerHTML = fs.readFileSync('partials/footer.html', 'utf8').trim();

  // 4. Read projects data
  const projects = JSON.parse(fs.readFileSync('projects.json', 'utf8'));

  // 5. Process each HTML file in dist/
  const htmlFiles = findFiles(DIST, '.html');
  for (const filePath of htmlFiles) {
    processHTML(filePath, headerHTML, footerHTML, projects);
  }

  // 6. Generate sitemap.xml
  generateSitemap();

  // 7. Copy llms.txt to dist/ (already done by copyDir, but ensure it exists)
  if (fs.existsSync('llms.txt')) {
    fs.copyFileSync('llms.txt', path.join(DIST, 'llms.txt'));
  }

  // 8. Fail the build if private files or corrupt text would be published.
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

function processHTML(filePath, headerHTML, footerHTML, projects) {
  let html = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  // --- Inject header ---
  html = html.replace(
    /<!--\s*Header injected by js\/header-component\.js\s*-->/,
    headerHTML
  );

  // --- Inject footer ---
  if (!PAGES_WITH_HARDCODED_FOOTER.has(fileName)) {
    // Pattern A: "Footer & Clients" combined marker (most pages)
    html = html.replace(
      /<!--\s*Footer\s*&?\s*Clients injected by footer-component\.js\s*-->/,
      footerHTML
    );

    // Pattern B: Separate "Clients Section" + "Footer" markers (index.html)
    html = html.replace(
      /<!--\s*Clients Section injected by footer-component\.js\s*-->\s*<!--\s*Footer injected by footer-component\.js\s*-->/,
      footerHTML
    );
  }

  // --- Render projects grid (projects.html) ---
  if (fileName === 'projects.html') {
    html = renderProjectsGrid(html, projects);
  }

  // --- Render featured projects carousel (index.html) ---
  if (fileName === 'index.html') {
    html = renderFeaturedCarousel(html, projects);
  }

  // --- Inject JSON-LD (tool pages) ---
  if (TOOL_PAGES[fileName]) {
    html = injectJSONLD(html, fileName);
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

  for (const filePath of htmlFiles) {
    const fileName = path.basename(filePath);
    if (SITEMAP_EXCLUDES.has(fileName)) continue;
    const relativePath = path.relative(DIST, filePath).replace(/\\/g, '/');
    const stats = fs.statSync(filePath);
    const lastmod = stats.mtime.toISOString().split('T')[0];

    let priority = '0.8';
    if (fileName === 'index.html') {
      priority = '1.0';
    } else if (
      fileName === 'methods.html' ||
      fileName === 'g-resolog.html' ||
      fileName === 'g-resconvt.html' ||
      fileName === 'g-geopylanner.html'
    ) {
      priority = '0.9';
    }

    urls.push({ loc: relativePath, lastmod, priority });
  }

  // Sort: index first, then alphabetical
  urls.sort((a, b) => {
    if (a.loc === 'index.html') return -1;
    if (b.loc === 'index.html') return 1;
    return a.loc.localeCompare(b.loc);
  });

  const xmlEntries = urls.map(u =>
    `  <url>
    <loc>https://georesolveafrica.com/${u.loc === 'index.html' ? '' : u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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