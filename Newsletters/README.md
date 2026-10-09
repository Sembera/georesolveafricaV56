# Building GeoUnlocked editions

## Start here

GeoUnlocked is a web-first field newsletter. The approved visual reference is the published [August 2026 edition](https://georesolveafrica.com/geounlocked-august-2026.html). The September web edition in the website root is the practical starting template.

Do not use the August PDF layout as the web template. Do not treat the early September PDF or simple HTML draft as the desired design. A PDF is optional and should only be created on request.

## Files and folders

Paths below are relative to the website root.

| Purpose | Location |
| --- | --- |
| Published August reference source | geounlocked-august-2026.html |
| September web implementation | geounlocked-september-2026.html |
| Shared newsletter styles | css/geounlocked.css and css/geounlocked-v2.css |
| September-specific styles | css/geounlocked-september.css |
| September-specific interaction | js/geounlocked-september.js |
| Shared navigation and footer | js/header-component.js and footer-component.js |
| Public September assets | resources/newsletters/september-2026/ |
| September originals, notes and working scripts | Newsletters/September/ |
| Current September cover | resources/newsletters/september-2026/seismic-cover-rusizi.webp |

For a new edition, use geounlocked-<month>-<year>.html, css/geounlocked-<month>.css, js/geounlocked-<month>.js and resources/newsletters/<month>-<year>/. Use a year suffix in CSS and script names if the month name already exists. Put originals, source notes and private working files in Newsletters/<Month>-<Year>/.

The build excludes the Newsletters folder. Public pages must live in the website root and public assets under resources. Links from the public page must not depend on files in Newsletters or on temporary/generated-image locations.

## Edition inputs

Collect or infer these from the conversation and source files before writing:

- Month, year and issue number; verify the previous issue rather than guessing.
- Completed projects for that month, geographic setting and central technical theme.
- User-confirmed details suitable for public use: names, dates, methods and outcomes.
- Original field photographs, including wide terrain views for cover reference.
- Reports or field records for fact checking; distinguish reviewed findings from preliminary results.
- Publication scope: local draft or authorized deployment.

Ask concise questions only where the answer materially changes the edition. If detailed results are not cleared for public use, tell the general field story and explain the methods without publishing coordinates, client drawings or detailed numerical results.

## Layout to retain

1. Site navigation, then a full-width conceptual cover with a real HTML headline.
2. Large editorial opening: split heading and introduction, followed by an edition summary.
3. Light field-story section: large documentary photograph, campaign/method card, pull quote, short narrative and photo gallery.
4. Dark technical section: large heading, accessible conceptual illustration or animation, clear method explanation and practical interpretation points.
5. Terrain/geology section: actual site photograph with explanatory text.
6. Five-step field workflow.
7. Contact call to action, shared client section and footer.

Adapt section count to the month's content. One project is enough: develop its field story and technical lesson without inventing additional campaigns.

Use the shared cream, forest, teal and lime palette, Playfair Display headings and Inter body text. Retain generous spacing and alternating light/dark sections. Keep new CSS scoped to the edition so earlier pages are unaffected.

## Cover workflow

Use the imagegen skill for a cinematic bitmap cover. Read its instructions before generating or editing.

- Provide real site terrain photographs as references.
- Keep a wide composition, approximately 2:1, and a dark uncluttered left area for readable HTML text.
- Match the actual landforms, vegetation, soil colours and relief.
- For Rusizi, the supplied references show steep rounded cultivated hills, an incised river valley, banana groves, scattered trees and red-brown weathered soil. Avoid invented flat-topped mesas, desert escarpments and large lakes.
- An intentional foreground geological cutaway can communicate the technique, but is conceptual rather than a measured site model.
- Generate without text or logos; typeset the headline in HTML.
- Label conceptual artwork as illustration, not project data.
- Preserve the previous image, save variants with descriptive filenames, and copy selected generated assets into resources before referencing them.
- Record the tool mode, final prompt, reference inputs and saved asset path in the edition review notes.

Keep originals unchanged. Export web photos with corrected EXIF orientation, sensible compression and dimensions, preserving the full frame and aspect ratio. Avoid enlarging low-resolution source images or implying recovered detail.

## Content checks

Use a concise field-led editorial voice. Explain what each technique measures, why the combination helps, what decisions it informs and what it cannot resolve. Do not present velocity alone as proof of lithology, sound rock, bearing capacity or permeability.

Distinguish regional geological setting from the units documented at the site. Verify niche geological and method claims using primary research or authoritative technical sources, and include readable further-reading links. Keep preliminary status and uncertainty where they matter.

Keep source reports and internal notes in the working folder. Do not copy them into public assets unless the user has requested their publication.

## Build and review

1. Copy the latest appropriate web edition and replace all month, year, issue, project and metadata content.
2. Retain shared CSS and components. Create edition-specific CSS, script and asset filenames.
3. Verify all images, links, headings, alternative text and metadata. Remove stale project references and unused interactions.
4. Run npm run build from the website root using the available Node runtime. The output is dist/.
5. Preview the source locally for editing, then check the built page as well. Use an available development server or a loopback-only static server.
6. Inspect desktop and mobile layouts (at least around 390px and a desktop width): no horizontal overflow, readable cover text, correct image proportions and unclipped captions.
7. Test every control, replay action and anchor. Honour prefers-reduced-motion and provide keyboard focus states.
8. Verify all below-fold images after scrolling; an unloaded lazy image before scrolling is not automatically a failure.
9. Save a screenshot and a short review note with checks, source provenance and any unresolved limitation.
10. Deliver the preview link and state publication status.

For local drafts, retain noindex/nofollow. Inspect build.js sitemap behaviour: it uses explicit exclusions, so do not assume a noindex meta tag automatically removes a page from the generated sitemap. Keep unapproved drafts out of release/deployment scope.

When publication is authorized, follow docs/DEPLOYMENT.md, update appropriate site links and metadata, and verify the live URL. Do not infer deployment authorization merely from a request to create an edition.

## Working scripts

September's rebuild_web.py records the initial rebuild, but it is not a reusable generator: it contains edition-specific copy and writes CSS/JavaScript as well as HTML. Running it can overwrite later manual fixes. Prefer copying the current final page and its scoped assets, or update the generator deliberately before running it.

The build_september.py script produces the early PDF and simple web draft. Do not run it for future web editions; it would recreate the superseded design.

## Suggested request for the next edition

“Create GeoUnlocked for [month/year], consistent with the published August web edition and the current September implementation. This month's projects are [projects]. The focus is [theme]. Source reports and photographs are in [folder]. Build the web edition and local preview; [publish only if explicitly requested / deploy when ready]. Read Newsletters/AGENTS.md and Newsletters/README.md first.”


## Website discovery

The homepage section index.html#newsletters displays September and August. The shared footer links to this section; newsletter pages link back to it and to the other edition. For future issues, feature the newest edition first and retain links to older issues. No top-level newsletter navigation tab is currently used.
