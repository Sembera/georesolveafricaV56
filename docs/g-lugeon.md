# G-Lugeon

Browser-based staged Lugeon calculator. Source: g-lugeon.html and js/lugeon/. Build with node build.js. Run node js/lugeon/math.test.js.

Uses LU = Q / L / effective MPa. Freshwater head correction uses 1000 kg/m³ and 9.80665 m/s². Gauge elevation is above collar; midpoint and groundwater depths below collar. For a midpoint above groundwater, ambient water pressure is zero. Inclined holes require midpoint true vertical depth. Already-effective inputs apply no head or loss correction. Input loss is still required internally but ignored in that mode.

All stage means are arithmetic, not duration weighted. Highest effective pressure ties are averaged. Manual selection supports interpreted dilation. Reporting rules are chosen by the user, never inferred. Invalid stages remain visible; CSV preserves their input and reason. Invalid stages break chart lines. No universal LU-to-conductivity conversion or automated grouting recommendation. Local browser storage plus versioned JSON backups. PDF includes results and a cycle plot.

The sample is a synthetic training cycle. Numeric verification uses the public Datgel worked example: 12.2–18.2m, gauge height 1m, water depth 3m, gauge pressure 170kPa and Q 7.4 L/min gives 0.2092266MPa and 5.8947 LU.

References:
- https://www.datinstruments.com/en/lugeon-test-online-calculator/
- https://docs.datgel.com/advanced-in-situ-tool/latest/user-guide/lugeon-water-test
- https://www.datgel.com/get-latest-documentation-anonymous/112

Future: raw repeated-reading import, measured pipe-loss curves and geometry-specific conductivity analysis.
