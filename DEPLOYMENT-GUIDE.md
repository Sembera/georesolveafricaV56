# GeoResolve Website Deployment Guide

Complete step-by-step guide to deploy your GeoResolve website from GitHub to Netlify and connect your custom domain.

## Table of Contents
1. [Deploy to GitHub](#1-deploy-to-github)
2. [Deploy to Netlify](#2-deploy-to-netlify)
3. [Connect Contentful CMS](#3-connect-contentful-cms)
4. [Connect Custom Domain](#4-connect-custom-domain)
5. [Post-Deployment Checklist](#5-post-deployment-checklist)

---

## 1. Deploy to GitHub

### Step 1.1: Initialize Git Repository (if not already done)

Open your terminal/command prompt in the project directory and run:

```bash
git init
```

### Step 1.2: Add All Files to Git

```bash
git add .
```

### Step 1.3: Create Initial Commit

```bash
git commit -m "Initial commit: GeoResolve website ready for deployment"
```

### Step 1.4: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `georesolve-website` (or your preferred name)
   - **Description**: "GeoResolve Africa - Geoscience Consulting Website"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 1.5: Link Local Repository to GitHub

GitHub will show you commands. Copy and run them:

```bash
git remote add origin https://github.com/YOUR-USERNAME/georesolve-website.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 1.6: Verify Upload

- Refresh your GitHub repository page
- You should see all your files uploaded
- Check that key files are present: `index.html`, `footer-styles.css`, `contentful.js`, etc.

---

## 2. Deploy to Netlify

### Step 2.1: Create Netlify Account

1. Go to [Netlify](https://www.netlify.com)
2. Click **"Sign up"** (or **"Log in"** if you have an account)
3. Choose **"Sign up with GitHub"** for easiest integration
4. Authorize Netlify to access your GitHub account

### Step 2.2: Import Your Project

1. From your Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify to access your repositories (if prompted)
4. Search for and select your `georesolve-website` repository

### Step 2.3: Configure Build Settings

On the configuration page, use these settings:

- **Branch to deploy**: `main`
- **Build command**: (leave empty - static site, no build needed)
- **Publish directory**: `.` (dot means root directory)
- **Functions directory**: (leave empty)

Click **"Deploy site"**

### Step 2.4: Wait for Deployment

- Netlify will start deploying your site
- This usually takes 1-3 minutes
- You'll see a random URL like `random-name-123456.netlify.app`
- Once deployed, the status will show **"Published"** with a green checkmark

### Step 2.5: Test Your Site

1. Click on the generated URL to visit your site
2. Check all pages work correctly:
   - Home, Methods, Applications, Projects, Resources, News, Contact
3. Verify the clients section shows the horizontal scrolling animation
4. Check that the footer displays correctly on all pages
5. Verify images load properly

### Step 2.6: Change Site Name (Optional)

1. Go to **Site settings** → **General** → **Site details**
2. Click **"Change site name"**
3. Choose a memorable name like `georesolve-africa`
4. Your URL will become `georesolve-africa.netlify.app`

---

## 3. Connect Contentful CMS

### Step 3.1: Create Contentful Account

1. Go to [Contentful](https://www.contentful.com)
2. Sign up for a free account
3. Create a new space called **"GeoResolve Africa"**

### Step 3.2: Create Content Models

Create these content types in Contentful:

#### A. Project Content Type
- **Content type name**: Project
- **API identifier**: project
- **Fields**:
  - Title (Short text)
  - Description (Long text)
  - Category (Short text)
  - Location (Short text)
  - Year (Short text)
  - Status (Short text)
  - Duration (Short text)
  - Value (Short text)
  - Client (Short text)
  - Scope (Long text)
  - Results (Long text, list)
  - Image (Media)
  - Coordinates (Object with lat/lon)

#### B. News Article Content Type
- **Content type name**: News Article
- **API identifier**: newsArticle
- **Fields**:
  - Title (Short text)
  - Excerpt (Long text)
  - Content (Long text)
  - Category (Short text)
  - Publish Date (Date & time)
  - Read Time (Short text)
  - Image (Media)
  - Tags (Short text, list)
  - Author (Reference to Author content type)

#### C. Resource Content Type
- **Content type name**: Resource
- **API identifier**: resource
- **Fields**:
  - Title (Short text)
  - Description (Long text)
  - Type (Short text)
  - Category (Short text)
  - Tags (Short text, list)
  - File (Media)
  - Image (Media)

#### D. Team Member Content Type
- **Content type name**: Team Member
- **API identifier**: teamMember
- **Fields**:
  - Name (Short text)
  - Title (Short text)
  - Bio (Long text)
  - Email (Short text)
  - Phone (Short text)
  - Image (Media)
  - Specialties (Short text, list)
  - Experience (Short text)

### Step 3.3: Get Contentful API Keys

1. In Contentful, go to **Settings** → **API keys**
2. Click **"Add API key"** → **"Content Delivery API"**
3. Name it: "GeoResolve Website"
4. Save these values (you'll need them):
   - **Space ID**: e.g., `abc123xyz`
   - **Content Delivery API - access token**: e.g., `your-access-token-here`
   - **Environment**: `master` (default)

### Step 3.4: Add Environment Variables to Netlify

1. Go to your Netlify site dashboard
2. Click **Site settings** → **Environment variables**
3. Click **"Add a variable"** → **"Add a single variable"**
4. Add these three variables:

   **Variable 1:**
   - Key: `CONTENTFUL_SPACE_ID`
   - Value: Your Space ID from Contentful
   - Scopes: Check all scopes

   **Variable 2:**
   - Key: `CONTENTFUL_ACCESS_TOKEN`
   - Value: Your Content Delivery API token from Contentful
   - Scopes: Check all scopes

   **Variable 3:**
   - Key: `CONTENTFUL_ENVIRONMENT`
   - Value: `master`
   - Scopes: Check all scopes

5. Click **"Save"** for each variable

### Step 3.5: Redeploy Site

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete
4. Your site will now fetch content from Contentful

### Step 3.6: Test Contentful Integration

1. Add a test project in Contentful
2. Publish it
3. Wait a few minutes for caching
4. Visit your site's Projects page
5. The new project should appear

---

## 4. Connect Custom Domain

Assuming your domain is **georesolve.africa** or similar:

### Step 4.1: Add Domain to Netlify

1. In Netlify, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `georesolve.africa`
4. Click **"Verify"**
5. If you own the domain, click **"Add domain"**

### Step 4.2: Add WWW Subdomain (Optional but Recommended)

1. Click **"Add domain alias"**
2. Enter: `www.georesolve.africa`
3. Click **"Add domain"**

### Step 4.3: Configure DNS Records

Netlify will show you DNS configuration instructions. You have two options:

#### Option A: Use Netlify DNS (Recommended - Easier)

1. In Netlify, click **"Set up Netlify DNS"**
2. Follow the prompts to add your domain
3. Netlify will give you 4 nameserver addresses like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
4. Go to your domain registrar (where you bought the domain)
5. Find the DNS or Nameserver settings
6. Replace existing nameservers with the 4 Netlify nameservers
7. Save changes
8. **Note**: DNS propagation takes 24-48 hours but usually works in 1-2 hours

#### Option B: Use External DNS (Your Current DNS Provider)

If you want to keep your current DNS provider:

1. Go to your DNS provider's dashboard
2. Add these DNS records:

   **For root domain (georesolve.africa):**
   - Type: `A`
   - Name: `@` (or leave empty)
   - Value: `75.2.60.5` (Netlify's load balancer IP)
   - TTL: `3600` or `Auto`

   **For www subdomain (www.georesolve.africa):**
   - Type: `CNAME`
   - Name: `www`
   - Value: `your-site-name.netlify.app` (your Netlify URL)
   - TTL: `3600` or `Auto`

3. Save the DNS records
4. Wait 30 minutes to 24 hours for DNS propagation

### Step 4.4: Enable HTTPS

1. Once DNS is configured and propagated, go back to Netlify
2. In **Domain management**, scroll to **HTTPS**
3. Netlify will automatically provision an SSL certificate
4. This usually takes 1-5 minutes
5. Once done, your site will be accessible via `https://georesolve.africa`
6. Netlify automatically redirects HTTP to HTTPS

### Step 4.5: Force HTTPS Redirect

1. Verify that **"Force HTTPS"** is enabled in **Domain management** → **HTTPS**
2. This ensures all visitors use the secure HTTPS connection

### Step 4.6: Set Primary Domain

1. In **Domain management**, you'll see your domains listed
2. Click the dropdown menu next to your main domain
3. Select **"Set as primary domain"**
4. Choose `georesolve.africa` or `www.georesolve.africa` as primary
5. All other URLs will redirect to your primary domain

---

## 5. Post-Deployment Checklist

### ✅ Functionality Tests

- [ ] All pages load correctly (Home, Methods, Applications, Projects, Resources, News, Contact)
- [ ] Logo displays properly on all pages
- [ ] Tagline "Data Driven, Research Based" appears below logo
- [ ] Navigation menu works on all pages
- [ ] Hero image is properly darkened (faces obscured)
- [ ] Clients section displays with horizontal scrolling animation
- [ ] Footer displays correctly on all pages with proper spacing
- [ ] All images load properly (no broken images)
- [ ] Projects carousel works on homepage
- [ ] Statistics counter animates on homepage
- [ ] All internal links work
- [ ] Contact form submits correctly (if applicable)

### ✅ Mobile Responsiveness

- [ ] Test on mobile phone (iOS/Android)
- [ ] Test on tablet
- [ ] Check that mobile menu works
- [ ] Verify images scale properly
- [ ] Check text is readable on small screens

### ✅ Performance

- [ ] Run [Google PageSpeed Insights](https://pagespeed.web.dev/)
  - Target: 90+ score for Performance
- [ ] Check loading speed (should be under 3 seconds)
- [ ] Verify images are optimized

### ✅ SEO Verification

- [ ] Submit sitemap to Google Search Console
  - URL: `https://georesolve.africa/sitemap.xml`
- [ ] Verify robots.txt is accessible
  - URL: `https://georesolve.africa/robots.txt`
- [ ] Check meta descriptions on all pages
- [ ] Verify Open Graph tags for social sharing
- [ ] Test social media previews (LinkedIn, Twitter, Facebook)

### ✅ Analytics Setup (Optional but Recommended)

1. **Google Analytics**:
   - Create Google Analytics account
   - Add tracking code to all HTML files before `</head>`
   - Verify tracking works

2. **Netlify Analytics** (Built-in):
   - Go to Netlify dashboard → **Analytics**
   - Enable Netlify Analytics ($9/month)
   - Get server-side analytics without cookies

### ✅ Security Headers

Verify these headers are set (check in `netlify.toml`):

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### ✅ Backup and Version Control

- [ ] Ensure all code is committed to GitHub
- [ ] Create a backup of Contentful data (Export as JSON)
- [ ] Document any custom configurations
- [ ] Save Netlify environment variables securely

---

## 6. Ongoing Maintenance

### Updating Content via Contentful

1. Log into Contentful
2. Add/Edit content in your space
3. Click **"Publish"**
4. Changes appear on your site within 5 minutes (cached)
5. To force immediate update: trigger a new deploy in Netlify

### Updating Code via GitHub

1. Make changes to your local files
2. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Netlify automatically detects the push and redeploys
4. New version live in 1-3 minutes

### Monitoring Site Health

- **Netlify Status**: Check [Netlify Status](https://www.netlifystatus.com/)
- **Uptime Monitoring**: Use services like:
  - [UptimeRobot](https://uptimerobot.com/) (Free)
  - [Pingdom](https://www.pingdom.com/)
- **Set up email alerts** for downtime

---

## Troubleshooting

### Issue: Domain Not Working After 24 Hours

**Solution**:
1. Check DNS propagation: [WhatsMyDNS.net](https://www.whatsmydns.net/)
2. Verify nameservers are correct at your registrar
3. Try flushing your local DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemd-resolve --flush-caches`

### Issue: SSL Certificate Not Working

**Solution**:
1. Ensure DNS is fully propagated
2. In Netlify, go to **Domain management** → **HTTPS**
3. Click **"Renew certificate"**
4. Wait 5-10 minutes

### Issue: Clients Section Not Animating

**Solution**:
1. Check that `footer-styles.css` is linked in the page's `<head>`
2. Verify `main.js` is loaded before `</body>`
3. Check browser console for JavaScript errors (F12)

### Issue: Contentful Content Not Showing

**Solution**:
1. Verify environment variables are set correctly in Netlify
2. Check that content is **Published** (not just saved as draft)
3. Trigger a new deploy in Netlify
4. Check browser console for API errors (F12)
5. Verify Space ID and Access Token are correct

### Issue: Images Not Loading

**Solution**:
1. Check image paths are correct (case-sensitive)
2. Verify images exist in the `resources` folder
3. Check file extensions match exactly
4. Clear Netlify cache and redeploy

---

## Support Resources

- **Netlify Documentation**: https://docs.netlify.com/
- **Contentful Documentation**: https://www.contentful.com/developers/docs/
- **GitHub Help**: https://docs.github.com/
- **DNS Checker**: https://dnschecker.org/

---

## Summary of Important URLs

After deployment, save these URLs:

- **GitHub Repository**: `https://github.com/YOUR-USERNAME/georesolve-website`
- **Netlify Dashboard**: `https://app.netlify.com/sites/YOUR-SITE-NAME`
- **Contentful Space**: `https://app.contentful.com/spaces/YOUR-SPACE-ID`
- **Live Website**: `https://georesolve.africa`
- **Netlify URL**: `https://your-site-name.netlify.app`

---

## Congratulations! 🎉

Your GeoResolve website is now live and professionally deployed. The site is:

✅ Version controlled with GitHub
✅ Deployed on Netlify with auto-deployments
✅ Connected to Contentful CMS for easy content management
✅ Accessible via your custom domain with HTTPS
✅ Optimized for performance and SEO
✅ Mobile responsive

For questions or issues, refer to the troubleshooting section above or contact support for the respective platforms.
