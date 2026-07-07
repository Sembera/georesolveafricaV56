// geometry.js — CRS, UTM projection, polygon/line metric math, clipping, MBR.
// Strict ES module. No placeholders. All metric work in auto-detected UTM.

const CRS_DEFS = {
  'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs +type=crs',
  'EPSG:4209': '+proj=longlat +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +no_defs +type=crs',
  'EPSG:4210': '+proj=longlat +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +no_defs +type=crs',
  'EPSG:21095': '+proj=utm +zone=35 +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:21035': '+proj=utm +zone=35 +south +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:21096': '+proj=utm +zone=36 +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:21036': '+proj=utm +zone=36 +south +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:21097': '+proj=utm +zone=37 +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:21037': '+proj=utm +zone=37 +south +a=6378249.145 +rf=293.465 +towgs84=-160,-6,-302,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:4196': '+proj=longlat +ellps=clrk80 +towgs84=-103.746,-9.614,-255.95,0,0,0,0 +no_defs +type=crs',
  'EPSG:3347': '+proj=utm +zone=34 +south +ellps=clrk80 +towgs84=-103.746,-9.614,-255.95,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:3348': '+proj=utm +zone=35 +south +ellps=clrk80 +towgs84=-103.746,-9.614,-255.95,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:10792': '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:10793': '+proj=utm +zone=36 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:10794': '+proj=utm +zone=36 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:10795': '+proj=utm +zone=35 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  'EPSG:4759': '+proj=longlat +datum=WGS84 +no_defs +type=crs'
};

// WGS84 / UTM zones 1..60 N+S
for (let zone = 1; zone <= 60; zone += 1) {
  const z2 = String(zone).padStart(2, '0');
  CRS_DEFS[`EPSG:326${z2}`] = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs +type=crs`;
  CRS_DEFS[`EPSG:327${z2}`] = `+proj=utm +zone=${zone} +south +datum=WGS84 +units=m +no_defs +type=crs`;
}

export const CRS_LABELS = {
  'EPSG:4326': 'WGS84 Geographic (lat/lon)',
  'EPSG:4209': 'Arc 1960 Geographic',
  'EPSG:21096': 'Arc 1960 / UTM 36N',
  'EPSG:21036': 'Arc 1960 / UTM 36S',
  'EPSG:21095': 'Arc 1960 / UTM 35N',
  'EPSG:21035': 'Arc 1960 / UTM 35S',
  'EPSG:21097': 'Arc 1960 / UTM 37N',
  'EPSG:21037': 'Arc 1960 / UTM 37S',
  'EPSG:10793': 'UGRF / UTM 36N',
  'EPSG:10792': 'UGRF / UTM 35N',
  'EPSG:4759': 'Rwanda 2000 / WGS84 Geographic'
};

export function registerProjections() {
  const p4 = window.proj4;
  if (!p4) throw new Error('proj4 not loaded');
  for (const [code, def] of Object.entries(CRS_DEFS)) {
    if (!p4.defs(code)) p4.defs(code, def);
  }
}

export function isGeographic(crs) {
  const def = CRS_DEFS[crs] || '';
  return def.includes('+proj=longlat') || crs === 'EPSG:4326';
}

export function utmZoneFromLon(lon) {
  return Math.max(1, Math.min(60, Math.floor((lon + 180) / 6) + 1));
}

// Auto-detect WGS84 UTM code from a lat/lon.
export function wgs84UtmCode(lat, lon) {
  const zone = utmZoneFromLon(lon);
  const z2 = String(zone).padStart(2, '0');
  return lat >= 0 ? `EPSG:326${z2}` : `EPSG:327${z2}`;
}

export function utmZoneLabel(crs) {
  const m = /EPSG:32([67])(\d{2})/.exec(crs);
  if (!m) return crs;
  const hem = m[1] === '6' ? 'N' : 'S';
  return `UTM zone ${Number(m[2])}${hem}`;
}

// Project [lon, lat] (or {lng,lat}) to [easting, northing] in given CRS.
export function projectLonLat(lonLat, crs) {
  const p4 = window.proj4;
  const lon = Array.isArray(lonLat) ? lonLat[0] : lonLat.lng ?? lonLat.lon ?? lonLat.x;
  const lat = Array.isArray(lonLat) ? lonLat[1] : lonLat.lat ?? lonLat.y;
  if (crs === 'EPSG:4326') return [lon, lat];
  return p4('EPSG:4326', crs, [lon, lat]);
}

// Inverse project [easting, northing] to [lon, lat].
export function inverseToLonLat(enu, crs) {
  const p4 = window.proj4;
  if (crs === 'EPSG:4326') return [enu[0], enu[1]];
  return p4(crs, 'EPSG:4326', [enu[0], enu[1]]);
}

// Project an array of [lat, lon] Leaflet latlngs to UTM [e,n] using centroid zone.
// Leaflet latlngs are [lat, lon].
export function latlngsToUtm(latlngs, crs) {
  return latlngs.map((ll) => {
    const lat = Array.isArray(ll) ? ll[0] : ll.lat;
    const lon = Array.isArray(ll) ? ll[1] : ll.lng ?? ll.lon;
    return window.proj4('EPSG:4326', crs, [lon, lat]);
  });
}

export function utmToLatlngs(enuArr, crs) {
  return enuArr.map((enu) => {
    const [lon, lat] = inverseToLonLat(enu, crs);
    return [lat, lon];
  });
}

// Detect UTM CRS from a polygon centroid.
export function detectUtmCrs(latlngRing) {
  if (!latlngRing || latlngRing.length === 0) return null;
  let lat = 0;
  let lon = 0;
  const n = latlngRing.length;
  for (const ll of latlngRing) {
    lat += Array.isArray(ll) ? ll[0] : ll.lat;
    lon += Array.isArray(ll) ? ll[1] : (ll.lng ?? ll.lon);
  }
  lat /= n;
  lon /= n;
  return wgs84UtmCode(lat, lon);
}

// Shoelace area (m²) for a UTM ring. Ring assumed closed (no duplicate last point).
export function polygonAreaUtm(ring) {
  let area = 0;
  const n = ring.length;
  if (n < 3) return 0;
  for (let i = 0; i < n; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

export function polygonPerimeterUtm(ring) {
  let p = 0;
  const n = ring.length;
  if (n < 2) return 0;
  for (let i = 0; i < n; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    p += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return p;
}

export function boundingBoxUtm(ring) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// Distance between two UTM points.
export function dist(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

// Azimuth (degrees, 0=N, clockwise) from a to b.
export function azimuth(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let az = Math.atan2(dx, dy) * 180 / Math.PI;
  if (az < 0) az += 360;
  return az;
}

// Project a point from a UTM origin at distance/azimuth (metres, degrees from N).
export function projectAtAzimuth(origin, distance, azDeg) {
  const rad = azDeg * Math.PI / 180;
  return [origin[0] + distance * Math.sin(rad), origin[1] + distance * Math.cos(rad)];
}

// Length of a polyline (array of UTM points).
export function lineLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) len += dist(pts[i - 1], pts[i]);
  return len;
}

// Interpolate a point at a given chainage (metres from start) along a UTM polyline.
// Returns { point:[x,y], segmentIndex, segmentChainage0 }.
export function pointAtChainage(pts, chainage) {
  let acc = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const segLen = dist(pts[i - 1], pts[i]);
    if (acc + segLen >= chainage - 1e-9) {
      const t = segLen > 0 ? (chainage - acc) / segLen : 0;
      const ct = Math.max(0, Math.min(1, t));
      const p = [
        pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * ct,
        pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * ct
      ];
      return { point: p, segmentIndex: i, segmentChainage0: acc };
    }
    acc += segLen;
  }
  // Past end: clamp to last point.
  return { point: pts[pts.length - 1].slice(), segmentIndex: pts.length - 1, segmentChainage0: acc };
}

// Unit direction vector of a polyline at chainage (for cross-line offsets).
export function lineDirectionAt(pts, chainage) {
  const { segmentIndex } = pointAtChainage(pts, chainage);
  const a = pts[segmentIndex - 1] || pts[0];
  const b = pts[segmentIndex] || pts[pts.length - 1];
  const d = dist(a, b) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
}

// Point-in-polygon (ray casting) for UTM ring.
export function pointInPolygon(p, ring) {
  const n = ring.length;
  let inside = false;
  let j = n - 1;
  for (let i = 0; i < n; i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = (yi > p[1]) !== (yj > p[1]) &&
      (p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
    j = i;
  }
  return inside;
}

// Segment intersection parameter. Returns t on seg1 where seg1 crosses seg2, or null.
function segIntersection(p1, p2, p3, p4) {
  const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1], x4 = p4[0], y4 = p4[1];
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-12) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  if (t >= -1e-9 && t <= 1 + 1e-9 && u >= -1e-9 && u <= 1 + 1e-9) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)], t;
  }
  return null;
}

// Compute the t parameter of an intersection point along p1->p2.
function segIntersectionT(p1, p2, p3, p4) {
  const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1], x4 = p4[0], y4 = p4[1];
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-12) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  if (t >= -1e-9 && t <= 1 + 1e-9 && u >= -1e-9 && u <= 1 + 1e-9) return t;
  return null;
}

// Clip a segment to a polygon ring (may be non-convex). Returns array of [p1,p2] segments inside.
export function clipSegmentToPolygon(p1, p2, ring) {
  const segLen = dist(p1, p2);
  if (segLen < 1e-9) return pointInPolygon(p1, ring) ? [[p1.slice(), p2.slice()]] : [];

  // Collect all intersection parameters along p1->p2.
  const cuts = [0, 1];
  const n = ring.length;
  for (let i = 0; i < n; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    const t = segIntersectionT(p1, p2, a, b);
    if (t !== null) cuts.push(t);
  }

  const sorted = Array.from(new Set(cuts.map((t) => Math.max(0, Math.min(1, t))))).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const ta = sorted[i];
    const tb = sorted[i + 1];
    const tm = (ta + tb) / 2;
    const mid = [p1[0] + (p2[0] - p1[0]) * tm, p1[1] + (p2[1] - p1[1]) * tm];
    if (pointInPolygon(mid, ring)) {
      const pa = [p1[0] + (p2[0] - p1[0]) * ta, p1[1] + (p2[1] - p1[1]) * ta];
      const pb = [p1[0] + (p2[0] - p1[0]) * tb, p1[1] + (p2[1] - p1[1]) * tb];
      if (dist(pa, pb) > 1e-6) out.push([pa, pb]);
    }
  }
  return out;
}

// Minimum bounding rectangle (rotated calipers approximation via convex hull).
// Returns { corners:[[x,y]x4], angle:degrees (azimuth of longest side), length, width }.
export function minimumBoundingRectangle(ring) {
  const hull = convexHull(ring);
  if (hull.length < 2) {
    const bb = boundingBoxUtm(ring.length ? ring : [[0, 0]]);
    return {
      corners: [[bb.minX, bb.minY], [bb.maxX, bb.minY], [bb.maxX, bb.maxY], [bb.minX, bb.maxY]],
      angle: 0,
      length: bb.width,
      width: bb.height
    };
  }

  let best = null;
  const n = hull.length;
  for (let i = 0; i < n; i += 1) {
    const a = hull[i];
    const b = hull[(i + 1) % n];
    const edgeAz = azimuth(a, b);
    // Rotate so this edge is "north-south" aligned; compute axis-aligned bbox in rotated frame.
    const rad = edgeAz * Math.PI / 180;
    const cosA = Math.cos(-rad);
    const sinA = Math.sin(-rad);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of hull) {
      const rx = x * cosA - y * sinA;
      const ry = x * sinA + y * cosA;
      if (rx < minX) minX = rx;
      if (ry < minY) minY = ry;
      if (rx > maxX) maxX = rx;
      if (ry > maxY) maxY = ry;
    }
    const w = maxX - minX;
    const h = maxY - minY;
    const area = w * h;
    if (!best || area < best.area) {
      // Corners in rotated frame, then rotate back.
      const rotCorners = [
        [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
      ];
      const cosB = Math.cos(rad);
      const sinB = Math.sin(rad);
      const corners = rotCorners.map(([rx, ry]) => [rx * cosB - ry * sinB, rx * sinB + ry * cosB]);
      // Longest side azimuth: between corner[0] and corner[1] (the w-direction) and [1]->[2] (h-direction).
      const sideA = dist(corners[0], corners[1]);
      const sideB = dist(corners[1], corners[2]);
      let length, width, angle;
      if (sideA >= sideB) {
        length = sideA;
        width = sideB;
        angle = azimuth(corners[0], corners[1]);
      } else {
        length = sideB;
        width = sideA;
        angle = azimuth(corners[1], corners[2]);
      }
      best = { corners, angle, length, width, area };
    }
  }
  return best;
}

// Andrew's monotone convex hull. Returns hull in CCW order.
export function convexHull(points) {
  const pts = points.slice().sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  if (pts.length <= 2) return pts.slice();
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i -= 1) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Inset a polygon ring inward by a given distance (metres) using a simple vertex offset.
// Robust for mildly irregular polygons; collapses near-zero-width features.
export function insetPolygon(ring, distance) {
  if (!ring || ring.length < 3 || distance <= 0) return ring ? ring.slice() : [];
  const n = ring.length;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const prev = ring[(i - 1 + n) % n];
    const curr = ring[i];
    const next = ring[(i + 1) % n];
    // Bisector direction (inward).
    const a1 = azimuth(prev, curr);
    const a2 = azimuth(curr, next);
    let bis = (a1 + a2) / 2;
    // Inward is to the right of the edge direction for CCW, left for CW. Use polygon centroid test.
    const cand = projectAtAzimuth(curr, distance, bis);
    // Determine sign by testing against local inward normal of edge curr->next.
    const edgeAz = a2;
    const rightNormal = (edgeAz + 90) % 360;
    const testP = projectAtAzimuth(curr, distance, rightNormal);
    const centroid = ringCentroid(ring);
    const towardCentroid = azimuth(curr, centroid);
    const sign = angularDiff(rightNormal, towardCentroid) <= 90 ? 1 : -1;
    const moveAz = sign > 0 ? rightNormal : (edgeAz + 270) % 360;
    out.push(projectAtAzimuth(curr, distance, moveAz));
    // suppress unused
    void cand;
    void bis;
  }
  return out;
}

function ringCentroid(ring) {
  let cx = 0;
  let cy = 0;
  for (const [x, y] of ring) { cx += x; cy += y; }
  return [cx / ring.length, cy / ring.length];
}

export function angularDiff(a, b) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

// Format a number with fixed decimals, trailing zeros trimmed option.
export function fmt(n, d = 2) {
  if (!Number.isFinite(n)) return '';
  return Number(n).toFixed(d);
}

// Parse a pasted coordinate block. Returns { mode, coords, crs }.
// Recognises:
//   - "lat, lon" per line (WGS84)
//   - "E, N" per line when a projected CRS is selected
//   - "lat lon" / "E N" whitespace separated
export function parseCoordinateBlock(text, crs) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const coords = [];
  for (const raw of lines) {
    const line = raw.replace(/^\s*\d+[.)]\s*/, '').trim();
    const parts = line.split(/[,\s\t;]+/).filter(Boolean);
    if (parts.length < 2) continue;
    const a = parseFloat(parts[0]);
    const b = parseFloat(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    coords.push([a, b]);
  }
  return { coords, crs };
}

// Convert parsed coords (with their CRS and ordering) to Leaflet [lat, lon] array.
// For geographic CRS: coords are [lat, lon] OR [lon, lat] — auto-detect by magnitude.
// For projected CRS: coords are [easting, northing].
export function coordsToLatlngs(parsed) {
  const { coords, crs } = parsed;
  if (coords.length === 0) return [];
  if (isGeographic(crs)) {
    return coords.map(([a, b]) => {
      // Heuristic: |a| <= 90 means a is lat.
      if (Math.abs(a) <= 90 && Math.abs(b) > 90) return [a, b];
      if (Math.abs(b) <= 90 && Math.abs(a) > 90) return [b, a];
      return [a, b];
    });
  }
  // Projected: invert to lon/lat.
  return coords.map(([e, n]) => {
    const [lon, lat] = inverseToLonLat([e, n], crs);
    return [lat, lon];
  });
}

// Convert latlngs back to projected [e,n] given a target UTM CRS (for display tables).
export function latlngsToEn(latlngs, crs) {
  return latlngsToUtm(latlngs, crs);
}
