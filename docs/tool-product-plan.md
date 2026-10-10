# GeoResolve tools product plan

## G-Resolog: first useful output
Implemented: first-time visitors open a synthetic 12 m borehole with four lithology layers, three SPT tests, three samples and a water strike. Project/report names identify example data. Existing visitors see saved projects. Open example is available from Projects. Start my project creates an independent blank BH01; it does not copy observations, coordinates or identifiers. Project name is the only initial requirement; optional details are editable later. Existing PDF, XLSX, CSV, print and JSON backup workflows remain available. Saves are local to this browser, so JSON backups are important for transferring work.

Next quality work: validate interval overlaps/gaps and export completeness; reference-check technical conventions; improve depth ordering of test/sample lists; make optional report columns and settings discoverable; extend sample-to-output patterns to coordinate conversion and survey planners. Do not overwrite existing projects when introducing examples.

## Proposed new tool: G-Stereonet (working name)
Goal: field structural measurements to clear report-ready stereonets and rose diagrams in a browser, with a preloaded synthetic dataset and no signup barrier.

### First release
- Side-by-side editable measurements and live plots; sample joint sets, clearly labelled synthetic.
- Planes: dip direction/dip and explicitly selected right-hand-rule strike/dip. Lines: trend/plunge. Avoid guessing conventions from ambiguous columns.
- Lower-hemisphere equal-area (Schmidt) default; equal-angle (Wulff) option; planes as great circles or poles; lines as points. North at top, clockwise azimuths in degrees.
- Rose diagrams: explicit choice of strike, dip direction or line trend; axial 180-degree versus directional 360-degree mode; adjustable bin width, count or percentage; state bin boundaries and scaling. For axial data, mirrored petals must not double the reported sample count. Keep display radius proportional to count unless an explicitly labelled area-scaled option is implemented.
- CSV import with column mapping, paste from spreadsheets, editable rows and group colours. Validate dips/plunges 0–90 degrees, azimuths 0–360 (normalize 360 to 0), and missing/non-numeric values. Show rejected rows with reasons.
- Export SVG and PNG figures, measurement CSV and full settings/data JSON. Include title, legend, sample count, projection, hemisphere, orientation convention and rose settings in export. Offer combined figure layout.
- Start my dataset clears sample observations while preserving chosen plot settings. Keep sample and real data separate, save/reopen projects and provide downloadable backups.
- Responsive layout, keyboard-accessible controls and print-safe colours.

### Acceptance checks before release
Check horizontal and vertical planes, north/east lines, pole/plane orthogonality, lower-hemisphere placement and wraparound at 0/360 degrees. Compare fixed reference datasets against Allmendinger Stereonet and an independent mathematical implementation. Rose bins must account for every accepted row exactly once, including boundary values; axial 10/190-degree measurements must share an orientation. Test SVG/PNG outputs, import/export round trips, saved settings, mobile usability and sample-to-clean-project transition.

### Later phases
Density contours with a documented method and parameters; orientation statistics and confidence estimates; datasets/filtering by station; optional slope kinematics with explicit assumptions and specialist validation. Avoid suggesting kinematic or slope-stability conclusions from basic plots alone.

### Build order
1. Pure orientation/convention/projection maths with reference fixtures.
2. SVG plot renderer and synthetic example.
3. CSV mapping, editable data and validation.
4. Export, persistence and mobile review.
5. Add website navigation only when the tool meets acceptance checks.

Reference: https://www.rickallmendinger.net/stereonet
Independent implementation reference: https://apsg.readthedocs.io/en/master/apsg.plotting.html

Publication: local implementation for review; no deployment is included in this change.

## Purpose-based report layouts (October revision)
Reference reviewed: https://eslog.esdat.net/ . Geotechnical, groundwater, mining/exploration, environmental and trial-pit layouts select relevant columns and have synthetic examples. Purpose is separate from drilling/sampling type. Report-column preferences are saved per borehole. Reports use structured metadata and a dedicated well-construction column; PDF uses the same SVG renderer with repeated headers and absolute-depth page ranges. Water-well construction currently covers casing/screen intervals, not pumping tests or a full annular seal design. Mining logs cover lithology and core quality, not assay management.

## Lithology assets
Replaced the decorative hatches with 29 source-tracked vector choices: 24 mappings from USGS/FGDC Section 37 artwork and five labelled supplementary field symbols. Reference PDF, standalone SVGs, provenance and reproducible extraction script are retained. PDF clipping is preserved when extracting artwork. Actual pattern previews and keyboard-accessible symbol buttons replace flat colour swatches. New options include dolostone, conglomerate, breccia, chert, coal, slate, tuff, volcanic breccia and vein quartz. Symbol library: resources/lithology/catalog.html.

## G-Structural implementation
Implemented stereonet + rose plotting and Bieniawski 1989 RMR in `g-structural.html`, with labelled samples, CSV mapping, local workspace backups, SVG/PNG and assessment PDF exports. Details, technical conventions, rating provenance, validation and limits are in `docs/g-structural.md`. The proposed G-Stereonet working name is now G-Structural.
