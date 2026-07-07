// planner.js — drone photogrammetry lawnmower flight plan engine.
// Generates parallel survey lines clipped to a buffered polygon, serpentine
// connection, photo trigger points, optional crosshatch (double grid).
// All metric math in auto-detected UTM (reuses geopylanner/geometry.js).
// Strict ES module.

import {
  boundingBoxUtm, minimumBoundingRectangle, clipSegmentToPolygon,
  projectAtAzimuth, dist, azimuth, utmToLatlngs, utmZoneLabel,
  polygonAreaUtm, pointInPolygon, fmt
} from '../geopylanner/geometry.js';
import { groundFootprint } from './cameras.js';

// Buffer a polygon outward (planning-grade) by scaling each vertex radially
// from the centroid. For convex / mildly irregular boundaries this gives a
// serviceable outer boundary so flights cover the edge of the AOI.
function bufferOutward(ring, distance) {
  if (!ring || ring.length < 3 || !Number.isFinite(distance) || distance <= 0) return ring ? ring.slice() : [];
  let cx = 0; let cy = 0;
  for (const [x, y] of ring) { cx += x; cy += y; }
  cx /= ring.length; cy /= ring.length;
  const out = [];
  for (const [x, y] of ring) {
    const dx = x - cx; const dy = y - cy;
    const r = Math.hypot(dx, dy);
    if (r < 1e-6) { out.push([x, y]); continue; }
    const scale = 1 + distance / r;
    out.push([cx + dx * scale, cy + dy * scale]);
  }
  return out;
}

// Generate a single grid of parallel clipped lines through a polygon.
// Returns { lines: [{ utm:[[a,b],[c,d]], latlngs, startIndex }], legs: [{utm:pts,latlngs}] }
// where "lines" are the clipped segments and "legs" are the serpentine walk
// (line segments connected at the ends by turn moves).
function buildGrid(params, ring, state) {
  const {
    lineSpacing, photoInterval, lineAzimuth, flightSpeed, startForward = true
  } = params;

  const bbox = boundingBoxUtm(ring);
  const pad = Math.max(bbox.width, bbox.height) + lineSpacing * 2 + 10;
  const lineRad = lineAzimuth * Math.PI / 180;
  const lineDir = [Math.sin(lineRad), Math.cos(lineRad)];
  const perpDir = [-lineDir[1], lineDir[0]];
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  const center = [cx, cy];

  const lineCount = Math.ceil((2 * pad) / lineSpacing) + 1;
  const gridLines = [];
  let lineIndex = 0;

  for (let i = -Math.floor(lineCount / 2); i <= Math.ceil(lineCount / 2); i += 1) {
    const offset = i * lineSpacing;
    const a = [center[0] + offset * perpDir[0] - pad * lineDir[0], center[1] + offset * perpDir[1] - pad * lineDir[1]];
    const b = [center[0] + offset * perpDir[0] + pad * lineDir[0], center[1] + offset * perpDir[1] + pad * lineDir[1]];
    const segs = clipSegmentToPolygon(a, b, ring);
    const kept = segs.filter((s) => dist(s[0], s[1]) >= Math.max(photoInterval * 0.5, 1));
    if (kept.length === 0) continue;
    lineIndex += 1;
    // For multi-segment lines keep each as its own sub-line with same index.
    kept.forEach((seg, sIdx) => {
      const latlngs = utmToLatlngs([seg[0], seg[1]], state.crs);
      gridLines.push({
        id: `L${lineIndex}${kept.length > 1 ? `_${sIdx + 1}` : ''}`,
        name: `L${lineIndex}`,
        utm: [seg[0], seg[1]],
        latlngs,
        lineIndex
      });
    });
  }
  return gridLines;
}

// Place photo trigger points along a clipped line segment at the photo
// interval distance (front overlap). Points are pushed onto `acc`.
function placePhotoPoints(segUtm, lineDir, photoInterval, lineId, state, startIndex, reverse) {
  if (photoInterval <= 0) return [];
  const [a, b] = segUtm;
  const segLen = dist(a, b);
  // Step along the segment from a -> b (or b -> a if reverse).
  const pts = [];
  // Start a little in from the end so the first photo has full footprint coverage.
  let ch = 0;
  let idx = startIndex;
  const dir = reverse ? [-lineDir[0], -lineDir[1]] : lineDir;
  const origin = reverse ? b : a;
  const segVec = reverse ? [a[0] - b[0], a[1] - b[1]] : [b[0] - a[0], b[1] - a[1]];
  const segLenSafe = Math.max(segLen, 1e-6);
  const ux = segVec[0] / segLenSafe;
  const uy = segVec[1] / segLenSafe;
  void dir;
  while (ch <= segLen + 1e-6) {
    const px = origin[0] + ux * ch;
    const py = origin[1] + uy * ch;
    const [lon, lat] = window.proj4(state.crs, 'EPSG:4326', [px, py]);
    pts.push({
      line_id: lineId,
      point_id: `P${String(idx).padStart(4, '0')}`,
      label: `${lineId}/P${idx}`,
      chainage: Math.round(ch * 10) / 10,
      easting: px,
      northing: py,
      utm_zone: utmZoneLabel(state.crs),
      latlng: [lat, lon],
      lat, lon,
      color: '#e67e22'
    });
    idx += 1;
    ch += photoInterval;
  }
  return pts;
}

// params:
//  camera, altitude, gsd (cm/px), frontOverlap, sideOverlap, lineAzimuth,
//  flightSpeed, crosshatch, boundaryBuffer, usableFlightMin (battery)
// state: { crs, boundaryUtm, boundaryLatlngs, mbr, areaHa }
export function planFlight(params, state) {
  if (!state || !state.boundaryUtm || state.boundaryUtm.length < 3) {
    throw new Error('Draw or import a boundary polygon first.');
  }
  const cam = params.camera;
  if (!cam) throw new Error('Select a camera preset.');

  const altitude = Math.max(1, Number(params.altitude) || 50);
  const frontOverlap = Math.max(0, Math.min(0.95, Number(params.frontOverlap) || 0.75));
  const sideOverlap = Math.max(0, Math.min(0.95, Number(params.sideOverlap) || 0.65));
  const flightSpeed = Math.max(0.5, Number(params.flightSpeed) || 8);
  const buffer = Math.max(0, Number(params.boundaryBuffer) || 0);
  const crosshatch = Boolean(params.crosshatch);

  const footprint = groundFootprint(cam, altitude);
  if (footprint.width <= 0 || footprint.height <= 0) {
    throw new Error('Invalid camera/altitude — footprint is zero.');
  }
  const lineSpacing = Math.max(0.1, footprint.width * (1 - sideOverlap));
  const photoInterval = Math.max(0.1, footprint.height * (1 - frontOverlap));

  // Azimuth: auto = longest MBR axis.
  let lineAz = params.lineAzimuth;
  if (lineAz === 'auto' || lineAz === '' || lineAz === null || Number.isNaN(Number(lineAz))) {
    lineAz = state.mbr ? state.mbr.angle : 0;
  } else {
    lineAz = Number(lineAz);
  }
  lineAz = ((lineAz % 360) + 360) % 360;

  // Buffered working polygon.
  const workRing = buffer > 0 ? bufferOutward(state.boundaryUtm, buffer) : state.boundaryUtm.slice();

  // Primary grid.
  const baseParams = { lineSpacing, photoInterval, lineAzimuth: lineAz, flightSpeed };
  const primaryLines = buildGrid(baseParams, workRing, state);

  // Serpentine: order lines by their perpendicular offset so neighbours connect.
  // We approximate ordering using the centroid of each line projected onto perpDir.
  const lineRad = lineAz * Math.PI / 180;
  const perpDir = [-Math.cos(lineRad), Math.sin(lineRad)];
  const ordered = primaryLines.slice().sort((p, q) => {
    const pc = [(p.utm[0][0] + p.utm[1][0]) / 2, (p.utm[0][1] + p.utm[1][1]) / 2];
    const qc = [(q.utm[0][0] + q.utm[1][0]) / 2, (q.utm[0][1] + q.utm[1][1]) / 2];
    const pp = pc[0] * perpDir[0] + pc[1] * perpDir[1];
    const qp = qc[0] * perpDir[0] + qc[1] * perpDir[1];
    return pp - qp;
  });

  const dirVec = [Math.sin(lineRad), Math.cos(lineRad)];
  const allLines = [];
  const waypoints = [];     // navigation vertices (line ends + turn points)
  const photoPoints = [];
  let photoIdx = 1;
  let totalFlightDistance = 0;

  // Walk serpentine: even lines forward, odd lines reversed.
  for (let i = 0; i < ordered.length; i += 1) {
    const ln = ordered[i];
    const reverse = (i % 2 === 1);
    const start = reverse ? ln.utm[1] : ln.utm[0];
    const end = reverse ? ln.utm[0] : ln.utm[1];
    allLines.push(ln);

    // Add start waypoint (skip if it duplicates previous end — handled by caller via distance).
    waypoints.push({
      line_id: ln.name,
      point_id: `WP${String(waypoints.length + 1).padStart(3, '0')}`,
      label: `${ln.name} ${reverse ? 'end' : 'start'}`,
      easting: start[0],
      northing: start[1],
      utm_zone: utmZoneLabel(state.crs),
      chainage: 0,
      latlng: utmToLatlngs([start], state.crs)[0],
      isPhoto: false
    });
    if (waypoints.length > 1) {
      const prev = waypoints[waypoints.length - 2];
      totalFlightDistance += dist([prev.easting, prev.northing], start);
    }

    // Photo points along this line.
    const pts = placePhotoPoints(ln.utm, dirVec, photoInterval, ln.name, state, photoIdx, reverse);
    pts.forEach((p) => {
      photoPoints.push(p);
      // Distance from last waypoint to first photo, then between photos.
      totalFlightDistance += (p === pts[0])
        ? dist(start, [p.easting, p.northing])
        : dist([photoPoints[photoPoints.length - 2].easting, photoPoints[photoPoints.length - 2].northing], [p.easting, p.northing]);
    });
    photoIdx += pts.length;

    // End waypoint.
    waypoints.push({
      line_id: ln.name,
      point_id: `WP${String(waypoints.length + 1).padStart(3, '0')}`,
      label: `${ln.name} ${reverse ? 'start' : 'end'}`,
      easting: end[0],
      northing: end[1],
      utm_zone: utmZoneLabel(state.crs),
      chainage: dist(start, end),
      latlng: utmToLatlngs([end], state.crs)[0],
      isPhoto: false
    });
    totalFlightDistance += dist(start, end);
  }

  // Crosshatch: second grid perpendicular, photos still placed.
  let crossLines = [];
  if (crosshatch) {
    const crossAz = (lineAz + 90) % 360;
    crossLines = buildGrid({ lineSpacing, photoInterval, lineAzimuth: crossAz, flightSpeed }, workRing, state);
    crossLines.forEach((ln) => {
      allLines.push(ln);
      const crossRad = crossAz * Math.PI / 180;
      const cdir = [Math.sin(crossRad), Math.cos(crossRad)];
      const pts = placePhotoPoints(ln.utm, cdir, photoInterval, ln.name, state, photoIdx, false);
      pts.forEach((p) => photoPoints.push(p));
      photoIdx += pts.length;
    });
  }

  // Flight time: distance / speed, +20% turn overhead.
  const speedMs = flightSpeed;
  const flightTimeMin = (totalFlightDistance / Math.max(speedMs, 0.1)) / 60;
  const flightTimeWithTurns = flightTimeMin * 1.2;
  const usableMin = Math.max(1, Number(params.usableFlightMin) || 20);
  const batteries = Math.max(1, Math.ceil(flightTimeWithTurns / usableMin));

  // Warnings.
  const warnings = [];
  if (altitude > 120) {
    warnings.push({
      level: 'regulatory',
      text: `Altitude ${fmt(altitude, 0)} m AGL exceeds the 120 m regulatory ceiling in most jurisdictions (incl. Uganda CAA). Lower altitude or accept a coarser GSD.`
    });
  }
  const photoIntervalSeconds = photoInterval / Math.max(speedMs, 0.01);
  if (photoIntervalSeconds < 2 && !cam.hasMechanicalShutter) {
    warnings.push({
      level: 'shutter',
      text: `Photo interval ${fmt(photoIntervalSeconds, 2)} s at ${fmt(flightSpeed, 1)} m/s is below the ~2 s safe shutter floor for an electronic-shutter camera. Slow down or raise altitude.`
    });
  }
  const litchiWaypoints = waypoints.length + photoPoints.length;
  if (litchiWaypoints > 99) {
    warnings.push({
      level: 'waypoints',
      text: `${litchiWaypoints} waypoints/photos exceed the 99-waypoint mission limit on some platforms (e.g. DJI Pilot). Split into multiple missions or use Litchi/UgCS which allow more.`
    });
  }
  if (state.areaHa > 0 && photoPoints.length === 0) {
    warnings.push({ level: 'plan', text: 'No photo points generated — polygon too small for this footprint/overlap.' });
  }

  // Area (ha) of the ORIGINAL boundary (not buffered).
  const areaHa = polygonAreaUtm(state.boundaryUtm) / 10000;
  const gsd = footprint.gsd;

  const stats = {
    mode: 'Drone photogrammetry',
    camera: cam.label,
    altitude: Math.round(altitude),
    gsd: Number(gsd.toFixed(2)),
    areaHa: Number(areaHa.toFixed(2)),
    lineCount: allLines.length,
    photoCount: photoPoints.length,
    waypointCount: waypoints.length,
    lineSpacing: Number(lineSpacing.toFixed(1)),
    photoInterval: Number(photoInterval.toFixed(1)),
    photoIntervalSeconds: Number(photoIntervalSeconds.toFixed(2)),
    footprintWidth: Number(footprint.width.toFixed(1)),
    footprintHeight: Number(footprint.height.toFixed(1)),
    flightDistanceKm: Number((totalFlightDistance / 1000).toFixed(2)),
    flightTimeMin: Number(flightTimeWithTurns.toFixed(1)),
    batteries,
    frontOverlapPct: Math.round(frontOverlap * 100),
    sideOverlapPct: Math.round(sideOverlap * 100),
    lineAzimuth: Number(lineAz.toFixed(0)),
    crosshatch
  };

  return {
    method: 'flight',
    lines: allLines.map((l) => ({ name: l.name, latlngs: l.latlngs, utm: l.utm })),
    tieLines: [],
    points: photoPoints,
    waypoints,
    photoPoints,
    boundary: { latlngs: state.boundaryLatlngs, utm: state.boundaryUtm },
    warnings,
    stats,
    meta: {
      camera: cam,
      altitude,
      gsd,
      lineSpacing,
      photoInterval,
      flightSpeed,
      frontOverlap,
      sideOverlap,
      lineAzimuth: lineAz,
      crosshatch,
      buffer,
      usableFlightMin: usableMin
    }
  };
}
