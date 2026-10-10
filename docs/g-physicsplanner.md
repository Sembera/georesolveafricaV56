# G-PhysicsPlanner

Public name replaces G-Geopylanner; existing URLs remain valid. Tool order: G-Log, G-Structural, G-Lugeon, G-PhysicsPlanner, G-FlightPlanner, G-Resconvt.

Seismic settings: 2–192 geophones, spacing, roll overlap, interior shot count, 0/1/2 end shots, off-end shots per side, first offset and additional offset interval. Interior positions are evenly spaced. A start-only end shot does not suppress either off-end side. Offset points outside the drawn line extrapolate its endpoint direction and retain signed chainage in exports. Verify access; no terrain correction. Partial final spreads use their actual receiver span for source positions.

Per-spread SVG illustrates each shot. SRT uses a flat horizontal two-layer analytic head-wave model with editable V1, V2 and thickness, critical angle asin(V1/V2). Head-wave geometry exists only beyond 2h tan(ic); travel time = x/V2 + 2h cos(ic)/V1. Head waves that precede direct arrivals are highlighted. This is a planning illustration, not tomography or an inversion. MASW shows conceptual surface-wave propagation, not body rays. ERT shows electrode layout and conceptual A–B current flow, not an acquisition sequence or sensitivity model.

Endpoint entry uses WGS84 degrees. Existing pasted coordinates support projected CRS. Live map drawing includes the current cursor segment and completed line lengths remain available in statistics.

Verification: node js/geopylanner/spread.test.js; browser checks of endpoint line, SRT shots, MASW sources, ERT rendering and SVG exports.

Technical references:
https://www.geometrics.com/wp-content/uploads/2018/10/SeismicRefractionSurveying_r4a.pdf
https://masw.com/RollAlongACQ.html
