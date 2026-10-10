# G-Structural

Source page: `g-structural.html`. Build: `node build.js`. Preview the built `dist/g-structural.html` through the existing local server. This is a local implementation; it has not been pushed or deployed.

## First useful output

New visitors see a labelled synthetic dataset (12 planes, three lineations) and a separate RMR example. Start my dataset clears observations while retaining plot settings. Start my assessment clears all required RMR observations. Each example remains explicitly labelled until the user starts or imports their own data. The two workspaces are independent.

## Implemented

- Lower-hemisphere Schmidt equal-area and Wulff equal-angle projections; planes as great circles/poles and lines as points.
- Explicit dip-direction/dip or right-hand-rule strike/dip; trend/plunge for lines. Angles in degrees clockwise from north, range 0–360 (360 wraps to 0), dip/plunge 0–90.
- Rose strike, dip direction or line trend; axial 180-degree mirrored or directional 360-degree bins; widths 5/10/15/20/30/45/60/90 degrees. Count or percent axes; radius proportional to frequency. Mirroring never doubles N. Plane and line populations are handled separately.
- Editable measurements with group colours, live validation and row removal. CSV/tab paste and file import with explicit column mapping, default convention, append/replace and rejected-row reasons. Invalid rows remain editable but are excluded from figures and measurement CSV. Limit 5,000 rows / 4 MB input files.
- Combined vector SVG and 3× PNG figures, valid-measurement CSV, complete JSON workspace backup/reopen. Automatic local browser storage; no server upload. Current workspace only; no cloud account.
- Bieniawski 1989 discrete RMR ratings: UCS, RQD, spacing, observed groundwater, five joint-condition subratings or an overall condition category. Tunnel/mine, foundation and slope orientation adjustments. Basic, penalty, raw and classification totals retained separately. Missing inputs produce no class. Negative raw totals are floored only for classification.
- PDF assessment with observations, scoring trace, notes, source/version, sample label and date. PDF library bundled at `js/vendor/jspdf-2.5.1.umd.min.js` with its MIT notice intact. Copyable assessment text; data in workspace backups.
- Homepage card, Free Tools dropdown and footer links in both production partials and source components; build SEO metadata, breadcrumbs and sitemap.

## RMR reference verification

User-supplied interface references: https://rockmassratingcalculator.com/ and https://rockmassratingcalculator.online/.
Primary rating references: FHWA-NHI-09-010, Table 6-3 (printed pp. 6-10–6-11), https://www.fhwa.dot.gov/bridge/tunnel/pubs/nhi09010/tunnel_manual.pdf ; FHWA-NHI-16-072, Table 9-6 (p. 9-35), https://www.fhwa.dot.gov/engineering/geotech/pubs/nhi16072.pdf . Both tables were visually inspected.

Orientation arrays (very favourable → very unfavourable): tunnels 0/−2/−5/−10/−12; foundations 0/−2/−7/−15/−25; slopes 0/−5/−25/−50/−60. Do not copy the first reference site's prose stating a maximum slope penalty of −25.

RQD exact thresholds 25/50/75/90 enter the higher band. Shared range endpoints for other categories are resolved explicitly in the control labels; no interpolation. Filled discontinuities may require the overall description instead of independently summing surface roughness. No assumed point-load/Schmidt-to-UCS conversion. The slope option is not SMR, kinematic assessment or slope stability. Do not derive orientation favourability from the plots without excavation geometry. No automatic support specification or c/phi design parameter claims.

## Validation

Run `node js/structural/math.test.js`. Checks cover cardinal directions, both projection radii, horizontal/vertical planes, plane/pole orthogonality, right-hand-rule conversion, 0/360 wrap, invalid angles, all rose bin widths with exact counting, axial equivalence, CSV quotes/newlines/tabs, RQD and class boundaries, missing/invalid RMR fields, extreme scores and negative raw totals.

Independent source fixture: FHWA p.6-10 gives 12 + 17 + 15 + 25 + 4 − 5 = 68 (Class II). The calculator reproduces it via overall condition 25. The detailed synthetic example sums to 66, with condition 23.

Projection validation is analytical; a side-by-side export comparison against external Stereonet software has not been performed. Density contours, orientation statistics, kinematics, SMR, RMR14, multi-station assessments and excavation-support design are outside this first release.

Browser QA: verified actual SVG, PNG, CSV, JSON workspace and branded PDF downloads; mapped CSV with an invalid 91-degree dip retained/excluded, then corrected live; workspace JSON reopened and persisted after reload; blank RMR has no class; in-page replacement dialog; responsive 390 px stacked plots and RMR controls. The legacy native confirmation from an earlier build interrupted a test; replacement controls now use an HTML dialog and subsequent checks passed.
