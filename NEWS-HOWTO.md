# Publishing a news article

1. Copy `news/_template.md` to a new file, e.g. `news/my-article.md`.
2. Fill the frontmatter (title, date, category, excerpt, image, tags, author).
3. Set `draft: true` to keep it unpublished; delete the line or set `draft: false` to publish.
4. Write the article body in Markdown below the `---`. Start headings at `##`.
5. Run `npm run build` before previewing or committing. The build renders Markdown into static pages under `dist/news/`.
6. Preview the built site with `npm run preview` or by checking the `dist/` output. Do not rely only on `npm run dev`; source preview shows placeholders before the build runs.
7. Published articles appear at `/news/my-article.html`, on `dist/news.html`, and in `dist/sitemap.xml`.
