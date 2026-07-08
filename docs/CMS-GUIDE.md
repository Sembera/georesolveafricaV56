# CMS Guide — Editing Content (Decap CMS)

The content editor lives at `https://georesolveafrica.com/admin` (or your deploy preview URL + `/admin`). It commits straight to the GitHub repo, so edits go live after the next build.

1. **Open** `/admin` in your browser.
2. **Log in** with **GitHub** — click "Login with GitHub" and authorise the site. You need push access to the `Sembera/georesolveafricaV56` repo.
3. **Pick a collection** in the left sidebar: Projects, News & Insights, or Testimonials.
4. **Edit** an existing entry, or click **New** (News/Testimonials) to add one.
5. **Projects / Testimonials** edit `projects.json` / `testimonials.json` (a single file — save the whole list when done).
6. **News**: set **Draft** to off to publish an article; creating a non-draft file revives the News section automatically.
7. **Images** upload to `resources/uploads` — keep them web-optimised and under ~1 MB.
8. **Save** (top right). This commits to the configured branch (`revamp-2026` now, `main` at go-live).
9. **Publish = the build.** Netlify rebuilds automatically on save; allow a minute, then refresh the live site.
10. **If login fails**, confirm the repo branch in `admin/config.yml` matches the deployed branch and that you have repo write access.
