# GeoResolve Africa - Professional Geoscience Consulting Website

**Tagline:** Data Driven, Research Based

## 🌍 Overview

GeoResolve is a premier geoscience consulting firm providing expert geophysical, geotechnical, and hydrogeology services across Uganda, Rwanda, Burundi, and East Africa. This is the official company website showcasing our services, projects, and expertise.

## 🎯 Key Features

- **Modern, Responsive Design** - Optimized for all devices and screen sizes
- **SEO Optimized** - Structured data, meta tags, sitemap, and robots.txt
- **Performance Optimized** - Fast loading times with lazy loading and caching
- **Content Management** - Integration with Contentful CMS for dynamic content
- **Interactive Elements** - Animated client carousel, project showcases, and smooth scrolling
- **Comprehensive Services** - Detailed pages for Methods, Applications, Projects, and Resources

## 📁 Project Structure

```
NEW GEORESOLVE _ OK COMPT/
├── index.html              # Homepage
├── methods.html            # Geoscience methods and services
├── applications.html       # Industry applications
├── projects.html           # Project portfolio
├── resources.html          # Tools and resources
├── news.html              # News and updates
├── contact.html           # Contact information
├── main.js                # Main JavaScript functionality
├── contentful.js          # Contentful CMS integration
├── projects-data.js       # Project data (fallback)
├── footer-styles.css      # Footer and client section styles
├── robots.txt             # Search engine crawling rules
├── sitemap.xml            # Site structure for search engines
├── netlify.toml           # Netlify deployment configuration
├── .gitignore             # Git ignore rules
├── DEPLOYMENT-CHECKLIST.md # Complete deployment guide
├── schema-org.json        # Structured data for SEO
└── resources/             # Images, logos, and assets
    ├── logo/
    ├── favicon/
    ├── Clients/
    ├── Methods/
    ├── Applications/
    └── projects/
```

## 🚀 Quick Start

### Local Development

1. **Clone or download the repository**
   ```bash
   cd "NEW GEORESOLVE _ OK COMPT"
   ```

2. **Open in browser**
   Simply open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   ```

3. **View the site**
   Navigate to `http://localhost:8000`

### Environment Setup (Optional for Contentful)

Create a `.env` file in the root directory:
```env
VITE_CONTENTFUL_SPACE_ID=your_space_id_here
VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
VITE_CONTENTFUL_ENVIRONMENT=master
```

## 📦 Deployment

### Deploy to Netlify (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/georesolve-website.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Log into [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: `.`

3. **Configure Environment Variables**
   In Netlify dashboard > Site settings > Environment variables:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ACCESS_TOKEN`
   - `CONTENTFUL_ENVIRONMENT`

4. **Custom Domain**
   - Add domain: `georesolve.africa`
   - Configure DNS
   - Enable HTTPS (automatic)

### Deploy to GitHub Pages

```bash
git checkout -b gh-pages
git push origin gh-pages
```

Enable GitHub Pages in repository settings, select `gh-pages` branch.

## 🎨 Customization

### Update Content

**Static Content:**
- Edit HTML files directly for static content
- Update images in `resources/` folder
- Modify styles in `<style>` tags or external CSS

**Dynamic Content (via Contentful):**
1. Log into Contentful
2. Create/update content in your space
3. Changes reflect automatically on the website

### Styling

Colors and theme are defined in CSS variables:
```css
:root {
    --primary-color: #345363;
    --secondary-color: #9EDB9E;
    --accent-color: #4DA34D;
    --text-dark: #1a1a1a;
    --text-light: #ffffff;
}
```

### Logo and Branding

- Logo: `resources/logo/georesolve-logo.svg.svg`
- Favicon: `resources/favicon/favicon-32x32.png.png`
- Update in all HTML files if changing

## 🔧 Features Breakdown

### 1. Horizontal Scrolling Client Logos
- Continuous auto-scrolling animation
- Pauses on hover
- Smooth infinite loop effect
- Located in footer section

### 2. SEO Optimization
- **Meta Tags**: Title, description, Open Graph, Twitter Cards
- **Structured Data**: Schema.org JSON-LD markup
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Crawler directives
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: All images have descriptive alt attributes

### 3. Performance Optimization
- **Lazy Loading**: Images load as needed
- **Caching**: Browser caching via headers
- **Optimized Assets**: Compressed images
- **Minification Ready**: CSS/JS ready for minification
- **CDN**: Automatic via Netlify

### 4. Contentful CMS Integration
Manages dynamic content for:
- **Projects**: Portfolio items
- **News Articles**: Updates and announcements  
- **Resources**: Tools and downloads
- **Team Members**: Staff profiles (optional)

## 📊 Statistics

Current site metrics:
- **50+ Projects Delivered**
- **7+ Years Experience**
- **4 Countries Served** (Uganda, Rwanda, Burundi, DRC)
- **30+ Active Clients**
- **14 Featured Client Logos**

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Laptop: 992px - 1199px
- Tablet: 768px - 991px
- Mobile: < 768px

## 🔒 Security

- HTTPS enforced (via Netlify)
- Security headers configured
- XSS protection enabled
- No sensitive data in repository
- Environment variables for API keys

## 📈 Analytics

Integrate Google Analytics by adding tracking code to all HTML files:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🤝 Contributing

For internal team members:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit for review
5. Merge to main

## 📞 Support & Contact

**GeoResolve Africa**
- **Email**: info@georesolveafrica.com
- **Phone**: +256 771 999 614 / +256 772 876 300
- **Address**: HMK Building, Gayaza Road, Kasangati, Uganda
- **Website**: https://georesolve.africa

## 📝 License

© 2025 GeoResolve Africa. All rights reserved.

## 🎯 Next Steps

1. ✅ Review DEPLOYMENT-CHECKLIST.md
2. ✅ Set up Contentful space and content models
3. ✅ Push to GitHub repository
4. ✅ Deploy to Netlify
5. ✅ Configure custom domain
6. ✅ Add SSL certificate (automatic via Netlify)
7. ✅ Submit sitemap to Google Search Console
8. ✅ Set up Google Analytics
9. ✅ Test all functionality
10. ✅ Launch! 🚀

---

**Built with ❤️ for GeoResolve Africa**  
*Leading Geoscience Innovation in East Africa*
