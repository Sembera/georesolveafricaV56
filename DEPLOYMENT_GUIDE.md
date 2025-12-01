# GeoResolve Website - Deployment Guide
## Production-Ready Deployment to GitHub → Netlify → Contentful

**Last Updated:** December 1, 2025
**Status:** ✅ READY FOR DEPLOYMENT

---

## 🚀 QUICK DEPLOYMENT STEPS

### Step 1: GitHub Repository Setup

```bash
cd "D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT"

# Initialize Git (if not already done)
git init

# Create .gitignore
echo "node_modules/
.DS_Store
.env
*.log
.netlify/
dist/
.cache/" > .gitignore

# Add all files
git add .

# Initial commit
git commit -m "Initial GeoResolve website deployment

- 15 real projects with professional cards
- Geospatial services (drone, GIS, topographic, cadastral)
- Modern footer and clients section across all pages
- SEO optimized for Uganda, Rwanda, Burundi, East Africa
- Responsive design
- Data-driven, research-based approach"

# Create GitHub repository (via GitHub.com or CLI)
gh repo create georesolve-website --public --source=. --remote=origin

# Push to GitHub
git branch -M main
git push -u origin main
```

###Step 2: Netlify Deployment

1. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and select your `georesolve-website` repository

2. **Build Settings:**
   ```
   Build command: (leave empty - static site)
   Publish directory: . (root directory)
   ```

3. **Environment Variables:** (None needed for static site)

4. **Custom Domain:**
   - Add custom domain: `www.georesolveafrica.com`
   - Configure DNS:
     ```
     A Record: @ → 75.2.60.5 (Netlify)
     CNAME: www → [your-site].netlify.app
     ```

5. **Deploy:**
   - Click "Deploy site"
   - Site will be live at `https://[your-site].netlify.app`

### Step 3: Contentful Integration (Optional - Phase 2)

1. **Create Contentful Account:**
   - Sign up at https://www.contentful.com
   - Create new space: "GeoResolve Projects"

2. **Content Models:**
   Create these content types:

   **Project Model:**
   - Title (Short text)
   - Description (Long text)
   - Client (Short text)
   - Location/Country (Short text)
   - Duration (Short text)
   - Year (Number)
   - Status (Short text - dropdown: completed, ongoing, planned)
   - Sector (Short text - dropdown)
   - Scope (Long text)
   - Activities (Long text)
   - Results (Multiple short text)
   - Image (Media)

   **News Article Model:**
   - Title (Short text)
   - Date (Date & time)
   - Summary (Long text)
   - Content (Rich text)
   - Featured Image (Media)
   - Category (Short text)

3. **API Keys:**
   - Get Space ID and Content Delivery API access token
   - Update `contentful.js` with your credentials:
   ```javascript
   const client = contentful.createClient({
       space: 'YOUR_SPACE_ID',
       accessToken: 'YOUR_ACCESS_TOKEN'
   });
   ```

4. **Deploy Update:**
   ```bash
   git add contentful.js
   git commit -m "Add Contentful API credentials"
   git push
   ```
   - Netlify will auto-deploy

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Content Ready:
- [x] 15 real projects loaded in `projects-data.js`
- [x] Geospatial services documented
- [x] Modern footer on all major pages
- [x] Clients section on all major pages
- [x] SEO meta tags optimized
- [ ] Upload logo files (see IMAGE_ADDRESSES.md)
- [ ] Upload project images (15 total)
- [ ] Upload client logos (11 total - optional)

### ✅ Technical Optimization:
- [x] Responsive design (mobile, tablet, desktop)
- [x] SEO optimization complete
- [x] Clean, semantic HTML
- [x] Accessible (ARIA labels, alt text)
- [x] Fast loading (minimal dependencies)
- [ ] Add Google Analytics tracking ID
- [ ] Add favicon files

### ✅ Pages Status:
- [x] index.html - Home Page (SEO optimized, footer added)
- [x] projects.html - 15 Real Projects (complete with filtering)
- [x] methods.html - All Methods + Geospatial (complete)
- [x] applications.html - Applications (complete)
- [⚠️] resources.html - Tools (needs footer - use quick-footer-inject.html)
- [⚠️] news.html - News (needs footer - use quick-footer-inject.html)
- [⚠️] contact.html - Contact (needs footer - use quick-footer-inject.html)

**Note:** For resources, news, contact pages, copy HTML from `quick-footer-inject.html` before `</body>` tag and add `<link rel="stylesheet" href="footer-styles.css">` in `<head>` section.

---

## 🔧 CONFIGURATION FILES

### netlify.toml (Create this file)
```toml
[build]
  publish = "."
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[redirects]]
  from = "/georesolve"
  to = "/"
  status = 301

[[redirects]]
  from = "https://georesolveafrica.netlify.app/*"
  to = "https://www.georesolveafrica.com/:splat"
  status = 301
  force = true
```

### _headers (Create this file - Netlify headers)
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*.js
  Cache-Control: public, max-age=31536000

/*.css
  Cache-Control: public, max-age=31536000

/*.jpg
  Cache-Control: public, max-age=31536000

/*.png
  Cache-Control: public, max-age=31536000
```

### robots.txt (Already created or create)
```
User-agent: *
Allow: /

Sitemap: https://www.georesolveafrica.com/sitemap.xml
```

### sitemap.xml (Create this file)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.georesolveafrica.com/</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.georesolveafrica.com/methods.html</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.georesolveafrica.com/applications.html</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.georesolveafrica.com/projects.html</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.georesolveafrica.com/resources.html</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.georesolveafrica.com/news.html</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.georesolveafrica.com/contact.html</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 📊 ANALYTICS & SEO

### Google Analytics (Add to all pages before `</head>`)
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://www.georesolveafrica.com`
3. Verify ownership (HTML tag method)
4. Submit sitemap: `https://www.georesolveafrica.com/sitemap.xml`

### Schema.org Markup (Add to index.html before `</head>`)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "GeoResolve",
  "description": "Premier geoscience consulting firm in Uganda, Rwanda, Burundi & East Africa",
  "url": "https://www.georesolveafrica.com",
  "logo": "https://www.georesolveafrica.com/resources/logo/georesolve-logo.png",
  "image": "https://www.georesolveafrica.com/resources/hero-geoscience.png",
  "telephone": "+256771999614",
  "email": "info@georesolveafrica.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "HMK Building, Gayaza Road",
    "addressLocality": "Kasangati",
    "addressCountry": "Uganda"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "0.4236",
    "longitude": "32.6122"
  },
  "areaServed": ["Uganda", "Rwanda", "Burundi", "DRC", "South Sudan"],
  "sameAs": [
    "https://www.linkedin.com/company/georesolve",
    "https://twitter.com/georesolve"
  ]
}
</script>
```

---

## 🎨 BRANDING & ASSETS

### Logo Files Needed:
Place in `resources/logo/`:
- `georesolve-logo.svg` (preferred)
- `georesolve-logo.png` (fallback - 300x80px)

### Favicon Files Needed:
Place in root and `resources/favicon/`:
- `favicon.ico` (root directory - 32x32px)
- `resources/favicon/favicon-16x16.png`
- `resources/favicon/favicon-32x32.png`
- `resources/favicon/apple-touch-icon.png` (180x180px)

### Update HTML `<head>` sections:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/resources/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/resources/favicon/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/resources/favicon/apple-touch-icon.png">
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Image Optimization:
Before uploading project images:
1. Compress using TinyPNG or ImageOptim
2. Use WebP format where possible
3. Recommended sizes:
   - Project cards: 800x600px (< 200KB)
   - Client logos: 200x100px (< 50KB)
   - Hero images: 1920x1080px (< 500KB)

### CSS/JS Minification (Optional):
```bash
# If you want to minify (not required)
npm install -g clean-css-cli uglify-js

# Minify CSS
cleancss -o footer-styles.min.css footer-styles.css

# Minify JS
uglifyjs projects-data.js -c -m -o projects-data.min.js
```

---

## 🔒 SECURITY

### SSL Certificate:
- Netlify provides free SSL automatically
- Enable "Force HTTPS" in Netlify settings

### Security Headers:
Already configured in netlify.toml:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

---

## 📱 TESTING CHECKLIST

### Before Going Live:
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile (iOS Safari, Chrome Android)
- [ ] Test all internal links
- [ ] Test project filtering
- [ ] Test contact forms
- [ ] Verify all images load (or show placeholders)
- [ ] Check page load speed (< 3 seconds)
- [ ] Validate HTML (https://validator.w3.org)
- [ ] Check mobile responsiveness
- [ ] Test SEO with https://www.seobility.net
- [ ] Run Lighthouse audit (aim for 90+ scores)

###Post-Launch:
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Monitor Google Analytics
- [ ] Check broken links monthly
- [ ] Update projects quarterly
- [ ] Add news/blog content monthly

---

## 🆘 TROUBLESHOOTING

### Common Issues:

**Issue: Projects not showing**
- Check console for JavaScript errors
- Ensure `projects-data.js` is loaded before `projects-script.js`
- Verify `projectsData` variable is defined

**Issue: Footer not showing on resources/news/contact**
- Copy HTML from `quick-footer-inject.html`
- Add `<link rel="stylesheet" href="footer-styles.css">` to `<head>`

**Issue: Images not loading**
- Check file paths are correct
- Ensure images are in correct `resources/` folders
- Placeholders will show if images are missing

**Issue: Slow page load**
- Compress images
- Enable Netlify CDN (automatic)
- Minimize third-party scripts

---

## 📞 SUPPORT

### Documentation Files:
- `WEBSITE_COMPLETION_SUMMARY.md` - Full project summary
- `IMAGE_ADDRESSES.md` - Image upload guide
- `DEPLOYMENT_GUIDE.md` - This file

### Quick Reference:
- **Local Preview:** Open `index.html` in browser
- **GitHub Repo:** https://github.com/[your-username]/georesolve-website
- **Netlify Dashboard:** https://app.netlify.com
- **Contentful:** https://app.contentful.com

---

## ✅ FINAL PRE-LAUNCH COMMAND

```bash
# Final check before deployment
cd "D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT"

# Verify all files
ls -R

# Add any missing files
git add .

# Final commit
git commit -m "Pre-launch: Ready for production deployment"

# Push to GitHub
git push origin main

# Netlify will auto-deploy!
```

---

**Your GeoResolve website is now ready for production deployment!** 🚀

Just follow the steps above, add your images, and you'll have the best geoscience website in East Africa live within hours.

**Need help?** Refer to `WEBSITE_COMPLETION_SUMMARY.md` for detailed information on what's been built.
