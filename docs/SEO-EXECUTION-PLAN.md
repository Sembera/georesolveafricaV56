# SEO Execution Plan — Georesolve Africa Website

## Context
Verified Google ranking audit (July 2026) confirmed the site ranks at the bottom of page 1 (or not at all) for key service keywords that Georesolve actually offers. Root cause: a "broad umbrella" site architecture (one `methods.html` with 5 tabs, each service as a single bullet) instead of a "silo" structure with dedicated landing pages per service.

## Goals
1. Own page 1 for "drone magnetic survey Uganda" (Georesolve is the first Ugandan company with an airborne mag sensor — currently does NOT rank).
2. Rank for "SAR/InSAR services Uganda" (currently zero mentions of InSAR on site).
3. Push existing page-1-bottom rankings (seismic refraction, ERT, magnetic exploration, downhole, crosshole) toward the top.
4. Fix technical SEO hygiene issues found in the site audit.

---

## Phase 1 — Technical SEO Quick Wins (do first, ~1 hour)

### 1.1 Fix sitemap.xml
- **File**: `sitemap.xml`
- **Action**: Add missing URLs for all service pages (existing + new ones created in Phase 2), all 4 tool pages, and all 9 news articles.
- **Also**: Update `lastmod` dates to actual modification dates; standardize domain to ONE form (pick `https://georesolveafrica.com/` without `www` and 301 the `www` version at the Netlify/registrar level).

### 1.2 Fix domain inconsistency
- **Files**: `index.html`, `schema-org.json`, `sitemap.xml`, `robots.txt`
- **Action**: Standardize every canonical/og:url to `https://georesolveafrica.com/` (no `www`). Configure Netlify to 301-redirect `www` → non-`www`.

### 1.3 Add missing `og:image` tags
- **Files**: `methods.html`, `projects.html`, `news.html`
- **Action**: Add `<meta property="og:image" content="https://georesolveafrica.com/resources/hero-geoscience.jpeg">` (or a page-specific image) to each.

### 1.4 Fix filename hygiene
- **Files**: rename double-extension files and update all references:
  - `resources/logo/georesolve-logo.svg.svg` → `resources/logo/georesolve-logo.svg`
  - `resources/favicon/favicon-32x32.png.png` → `resources/favicon/favicon-32x32.png`
  - `resources/Clients/fichtner.png.png` → `resources/Clients/fichtner.png`
  - `resources/Clients/gmatlab.png.png` → `resources/Clients/gmatlab.png`
- **Update references in**: `index.html`, `schema-org.json`, `footer-component.js`, anywhere else grep finds them.

### 1.5 Add BreadcrumbList + Service schema
- **Files**: each HTML page
- **Action**: Add `BreadcrumbList` JSON-LD to every page. Add `Service` schema to each new service landing page (Phase 2).

---

## Phase 2 — Service-Specific Landing Pages (the core SEO fix)

Build one dedicated HTML page per service. Each page follows the same template (see Section 3 below).

### Priority Order (by opportunity : effort)

| # | Filename | Target Keyword | Why First |
|---|---|---|---|
| 1 | `drone-magnetic-survey-uganda.html` | drone magnetic survey Uganda | Biggest competitive gap; Georesolve owns the equipment (AeroSmartMag + DJI M300); no Ugandan competitor ranks; currently NOT ranked at all |
| 2 | `ground-magnetic-survey-uganda.html` | magnetic exploration survey Uganda | Currently bottom of page 1; dedicated page will push to top; uses GSM 19 Overhauser |
| 3 | `insar-sar-services-uganda.html` | SAR InSAR services Uganda | Zero mentions of InSAR on site; untapped commercial keyword; Bududa/ESA content exists for case studies |
| 4 | `seismic-refraction-uganda.html` | seismic refraction survey Uganda | Bottom of page 1; Arua dam case study already written; easy to leverage |
| 5 | `ert-electrical-resistivity-tomography-uganda.html` | ERT electrical resistivity tomography Uganda | Listed but not highest; needs dedicated page |
| 6 | `downhole-seismic-survey-uganda.html` | downhole seismic survey Uganda | Bottom of page 1; Kampala Feeds Mill project case study exists |
| 7 | `crosshole-seismic-survey-uganda.html` | crosshole seismic survey Uganda | Zero mentions on site; needs to be written from scratch |
| 8 | `masw-survey-uganda.html` | MASW survey Uganda | Mentioned as a bullet; no dedicated page |
| 9 | `ground-penetrating-radar-uganda.html` | GPR ground penetrating radar Uganda | Mentioned as a bullet; no dedicated page |

### Equipment/Service Details Already Confirmed
- **Drone magnetics**: AeroSmartMag Overhauser drone magnetometer (console with built-in multi-band GNSS, portable OVH sensor with horizontal/vertical clamp, external helical GNSS antenna, ASM suspension rope) mounted on DJI M300 RTK.
- **Ground magnetics**: GSM 19 Overhauser magnetometer.

---

## Phase 3 — Landing Page Template (use for every page in Phase 2)

Each service landing page MUST contain the following sections, in this order:

### 3.1 `<head>` block
- `<title>`: `{Service Name} Uganda | Georesolve Africa` (e.g. "Drone Magnetic Survey Uganda | Georesolve Africa")
- `<meta name="description">`: 150–160 chars, keyword-rich, unique per page
- `<meta name="keywords">`: 5–10 relevant long-tail keywords
- Open Graph tags (title, description, type, url, image)
- Twitter Card tags
- `<link rel="canonical" href="https://georesolveafrica.com/{filename}">`
- Favicon link
- Fonts (Playfair Display, Inter, JetBrains Mono — same as site)
- CSS: `css/navbar.css`, `css/style.css`, `footer-styles.css`

### 3.2 Body sections (in order)
1. **Hero / page header** — H1 with target keyword, one-line value prop, CTA buttons ("Request a Quote" → contact.html, "View Related Projects" → projects.html)
2. **Overview section** — 2–3 paragraphs explaining what the method is, in plain English. Target the keyword naturally 3–5 times.
3. **How it works** — H2 + numbered steps or workflow diagram. Explain the physics/methodology at a level a civil engineer would understand.
4. **Equipment** — H2 + spec list. For drone mag: AeroSmartMag + DJI M300 RTK details. For ground mag: GSM 19 Overhauser. Include sensor type, GNSS, resolution, sample rate.
5. **Applications** — H2 + grid of use cases (mineral exploration, geological mapping, structural interpretation, UXO detection, archaeological, etc.)
6. **Deliverables** — H2 + list (magnetic anomaly maps, residual field grids, 2D/3D inversions, interpreted structural map, GIS-ready XYZ/GeoTIFF, technical report)
7. **Case study** — H2 + 1 real project (pull from `projects-data.js` / `projects.json`). Include location, year, scope, outcome. Link to the full project page.
8. **FAQ** — H2 + 4–6 Q&As in plain HTML (mirrors the FAQPage JSON-LD schema below). Each answer 40–80 words.
9. **Related services** — H2 + 3–4 internal links to sibling service pages
10. **CTA section** — final call to action to contact.html

### 3.3 Structured data (JSON-LD) — include THREE blocks per page
1. **Service** schema: `@type: Service`, name, provider, areaServed, description
2. **FAQPage** schema: 4–6 Q&As matching the visible FAQ section
3. **BreadcrumbList** schema: Home → Methods → {Service Name}

### 3.4 Scripts
- `<script src="js/header-component.js" defer></script>` (injects nav)
- `<script src="footer-component.js" defer></script>` (injects footer + clients)
- `<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" defer></script>` (for scroll animations, optional)

### 3.5 Internal linking (critical)
Every new service page must:
- Be linked FROM `methods.html` (replace the relevant bullet point with a link to the dedicated page)
- Be linked FROM `index.html` service cards (replace bullet lists with links)
- Be linked FROM related project pages in `projects-data.js` (add a "Method used" link)
- Be linked FROM related news articles (add inline links)
- Link TO sibling service pages (the "Related services" section)
- Be added to `sitemap.xml`
- Be added to `llms.txt` under a new "Service Pages" section

---

## Phase 4 — Content Enhancement for Existing Rankings

### 4.1 News articles → dedicated pages
Currently news articles live as markdown in `/news/` and are rendered via `news.html` + `build.js`. For SEO, each news article should ideally have a crawlable HTML URL. Options:
- **Option A (preferred)**: Generate static HTML per article (build.js already does this — verify output).
- **Option B**: Keep the current SPA approach but ensure the article content is in the DOM (not loaded via fetch after page load).

### 4.2 Link projects to service pages
In `projects-data.js`, each project has an `activities` field. Add a `methods` field with links to the relevant service landing pages. Render these as "Methods used on this project" links on the projects page.

### 4.3 Add SAR/InSAR to methods.html
Currently SAR is only mentioned in the DRC Ituri project. Add SAR/InSAR as a sub-section under the Geospatial tab on methods.html, with a link to the dedicated `insar-sar-services-uganda.html` page.

---

## Phase 5 — llms.txt Update
Add a new "Service Pages" section to `llms.txt` listing all new landing page URLs with one-line descriptions. This helps LLM crawlers (GPTBot, ClaudeBot, etc.) discover and correctly categorize the services.

---

## Phase 6 — Verify & Submit
1. Run a broken-link check across the whole site after all pages are built.
2. Validate all JSON-LD schema blocks with Google's Rich Results Test.
3. Submit updated `sitemap.xml` in Google Search Console.
4. Re-run the 7 Google searches from the audit in 2–4 weeks to confirm ranking improvements.

---

## New Session — Where to Start

When starting a new session to build these revisions, begin with:

1. **Read this plan file**: `docs/SEO-EXECUTION-PLAN.md`
2. **Start with Phase 1.1** (fix sitemap.xml) and Phase 1.4 (filename hygiene) — quick wins that unblock everything else.
3. **Then build Phase 2 page #1**: `drone-magnetic-survey-uganda.html` — this is the highest-impact page. Use the AeroSmartMag + DJI M300 equipment details. Follow the Phase 3 template exactly.
4. **After each page is built**: update `methods.html` bullet → link, update `index.html` service card → link, add to `sitemap.xml`, add to `llms.txt`.

### Equipment Specs to Reference
- **Drone magnetics**: AeroSmartMag Overhauser drone magnetometer (console with built-in multi-band GNSS, portable OVH sensor with horizontal/vertical orientation clamps on carbon frame, external helical multi-band GNSS antenna with SMA connector, ASM suspension rope, USB/USB-C cable, transportation case) mounted on DJI M300 RTK.
- **Ground magnetics**: GSM 19 Overhauser magnetometer (walking mag with built-in GPS).
