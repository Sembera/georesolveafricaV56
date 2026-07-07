# GeoResolve Website - Deployment Guide

Complete step-by-step guide to deploy the GeoResolve website from GitHub to Netlify and connect your custom domain.

**Last Updated:** December 1, 2025

---

## Table of Contents
1. [Deploy to GitHub](#1-deploy-to-github)
2. [Deploy to Netlify](#2-deploy-to-netlify)
3. [Connect Contentful CMS](#3-connect-contentful-cms)
4. [Connect Custom Domain](#4-connect-custom-domain)
5. [Post-Deployment Checklist](#5-post-deployment-checklist)
6. [Ongoing Maintenance](#6-ongoing-maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 1. Deploy to GitHub

### Step 1.1: Initialize Git Repository

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
   - **Repository name**: `georesolve-website`
   - **Description**: "GeoResolve Africa - Geoscience Consulting Website"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 1.5: Link Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/georesolve-website.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 1.6: Verify Upload

- Refresh your GitHub repository page
- You should see all files uploaded
- Check that key files are present: `index.html`, `footer-styles.css`, etc.

---

## 2. Deploy to Netlify

### Step 2.1: Create Netlify Account

1. Go to [Netlify](https://www.netlify.com)
2. Click **"Sign up"** (or **"Log in"** if you have an account)
3. Choose **"Sign up with GitHub"** for easiest integration
4. Authorize Netlify to access your GitHub account

### Step 2.2: Import Your Project

1. From your Netlify dashboard, click **"Add new site"** -> **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Search for and select your `georesolve-website` repository

### Step 2.3: Configure Build Settings

- **Branch to deploy**: `main`
- **Build command**: (leave empty - static site)
- **Publish directory**: `.` (root directory)

Click **"Deploy site"**

### Step 2.4: Wait for Deployment

- Netlify will start deploying your site
- You'll see a random URL like `random-name-123456.netlify.app`
- Once deployed, the status will show **"Published"** with a green checkmark

### Step 2.5: Test Your Site

1. Click on the generated URL to visit your site
2. Check all pages work correctly: Home, Methods, Applications, Projects, Resources, News, Contact
3. Verify the clients section shows correctly
4. Check that the footer displays correctly on all pages
5. Verify images load properly

### Step 2.6: Change Site Name (Optional)

1. Go to **Site settings** -> **General** -> **Site details**
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

Create these content types:

#### Project Content Type
- **API identifier**: `project`
- **Fields**: Title, Description, Client, Location, Duration, Year, Status, Sector, Scope, Activities, Results, Image (Media)

#### News Article Content Type
- **API identifier**: `newsArticle`
- **Fields**: Title, Date, Summary, Content (Rich text), Featured Image (Media), Category

#### Resource Content Type
- **API identifier**: `resource`
- **Fields**: Title, Description, Type, Category, Tags, File (Media), Image (Media)

### Step 3.3: Get Contentful API Keys

1. In Contentful, go to **Settings** -> **API keys**
2. Add a Content Delivery API key
3. Save these values:
   - **Space ID**
   - **Content Delivery API - access token**
   - **Environment**: `master` (default)

### Step 3.4: Add Environment Variables to Netlify

1. Go to your Netlify site dashboard -> **Site settings** -> **Environment variables**
2. Add these variables:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ACCESS_TOKEN`
   - `CONTENTFUL_ENVIRONMENT` = `master`

3. Trigger a new deploy to apply changes

---

## 4. Connect Custom Domain

### Step 4.1: Add Domain to Netlify

1. In Netlify, go to **Site settings** -> **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `georesolveafrica.com`
4. Click **"Verify"** -> **"Add domain"**

### Step 4.2: Configure DNS Records

#### Option A: Use Netlify DNS (Recommended)

1. In Netlify, click **"Set up Netlify DNS"**
2. Netlify will give you 4 nameserver addresses
3. Go to your domain registrar and replace existing nameservers with the Netlify nameservers
4. DNS propagation takes 24-48 hours but usually works in 1-2 hours

#### Option B: Use External DNS

Add these DNS records at your DNS provider:

**For root domain (georesolveafrica.com):**
- Type: `A`
- Name: `@`
- Value: `75.2.60.5` (Netlify's load balancer IP)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `your-site-name.netlify.app`

### Step 4.3: Enable HTTPS

1. Once DNS is configured, go back to Netlify -> **Domain management** -> **HTTPS**
2. Netlify will automatically provision an SSL certificate
3. Enable **"Force HTTPS"**

### Step 4.4: Set Primary Domain

1. In **Domain management**, set `georesolveafrica.com` as primary domain
2. All other URLs will redirect to your primary domain

---

## 5. Pre-Deployment Checklist

### Content Ready
- [ ] All pages complete (index, methods, applications, projects, resources, news, contact)
- [ ] Project images uploaded
- [ ] Client logos uploaded
- [ ] Logo files in `resources/logo/`
- [ ] Favicon files in `resources/favicon/`

### Technical Optimization
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] SEO meta tags on all pages
- [ ] Clean, semantic HTML
- [ ] Accessible (ARIA labels, alt text)
- [ ] Google Analytics tracking ID added (optional)

### Post-Deployment
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile (iOS Safari, Chrome Android)
- [ ] Test all internal links
- [ ] Verify all images load
- [ ] Check page load speed (< 3 seconds)
- [ ] Validate HTML (https://validator.w3.org)
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Submit to Google Search Console
- [ ] Submit sitemap: `https://georesolveafrica.com/sitemap.xml`

---

## 6. Ongoing Maintenance

### Updating Content via Contentful

1. Log into Contentful
2. Add/Edit content in your space
3. Click **"Publish"**
4. Changes appear on your site within 5 minutes (cached)

### Updating Code via GitHub

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Netlify automatically detects the push and redeploys.

### Monitoring Site Health

- **Netlify Status**: https://www.netlifystatus.com
- **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com/) (Free) or [Pingdom](https://www.pingdom.com)
- Set up email alerts for downtime

---

## 7. Troubleshooting

### Domain Not Working
1. Check DNS propagation: [WhatsMyDNS.net](https://www.whatsmydns.net)
2. Verify nameservers are correct at your registrar
3. Flush your local DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`

### SSL Certificate Not Working
1. Ensure DNS is fully propagated
2. In Netlify, go to **Domain management** -> **HTTPS** -> **"Renew certificate"**

### Projects Not Showing
- Check console for JavaScript errors
- Ensure `projects-data.js` is loaded before `projects-script.js`

### Images Not Loading
- Check image paths are correct (case-sensitive)
- Verify images exist in the correct `resources/` folders
- Compress images with TinyPNG before uploading

### Slow Page Load
- Compress images (aim for < 200KB per project image)
- Use WebP format where possible
- Enable Netlify CDN (automatic)

---

## Important URLs

After deployment:
- **GitHub Repository**: `https://github.com/YOUR-USERNAME/georesolve-website`
- **Netlify Dashboard**: `https://app.netlify.com/sites/YOUR-SITE-NAME`
- **Live Website**: `https://georesolveafrica.com`
- **Netlify URL**: `https://your-site-name.netlify.app`

---

## Support Resources

- **Netlify Documentation**: https://docs.netlify.com
- **Contentful Documentation**: https://www.contentful.com/developers/docs
- **GitHub Help**: https://docs.github.com
- **DNS Checker**: https://dnschecker.org