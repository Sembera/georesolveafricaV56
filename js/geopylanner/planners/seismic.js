// planners/seismic.js — seismic refraction & MASW spread planner.
// Spreads placed along drawn polylines; geophones + shots interpolated by chainage.
// Supports roll-along overlap for multi-spread lines.

import { lineLength, pointAtChainage, azimuth, dist, utmZoneLabel, utmToLatlngs, latlngsToUtm } from '../geometry.js';
import { seismicShotOffsets, refractionDepthEstimate, maswDepthEstimate, fieldDays } from '../calculators.js';

// params:
//  mode: 'refraction' | 'masw'
//  geophonesPerSpread (12|24|48|96)
//  geophoneSpacing (m)
//  shotSpec: '5shot' | '7shot' | 'mid' | number[] | { offsets:[m] }
//  sourceOffset (m) — for masw single-spread, distance from first geophone to source
//  rollAlongOverlap (geophones) — overlap between consecutive spreads
//  kmPerDay
// state: { crs, surveyLines:[{name,latlngs,utm}] }
export function planSeismic(params, state) {
  if (!state || !state.surveyLines || state.surveyLines.length === 0) {
    throw new Error('Draw one or more survey lines on the map first (use the Line tool).');
  }
  const mode = params.mode || 'refraction';
  const gPerSpread = Math.max(2, Math.round(Number(params.geophonesPerSpread) || 24));
  const gSpacing = Math.max(0.1, Number(params.geophoneSpacing) || 2);
  const overlap = Math.max(0, Math.round(Number(params.rollAlongOverlap) || 0));
  const spreadLength = (gPerSpread - 1) * gSpacing;
  const step = Math.max(gSpacing, (gPerSpread - overlap) * gSpacing); // roll-along step
  if (step <= 0) throw new Error('Roll-along overlap must be smaller than the spread size.');

  const points = [];
  const lines = [];

  state.surveyLines.forEach((lineObj) => {
    const utm = lineObj.utm || latlngsToUtm(lineObj.latlngs, state.crs);
    const totalLen = lineLength(utm);
    if (totalLen < gSpacing) return;

    // Determine shot offsets (relative to spread start chainage).
    let shotOffsets;
    if (mode === 'masw') {
      const src = Math.max(0, Number(params.sourceOffset) || 5);
      shotOffsets = [-src]; // source before first geophone
    } else {
      shotOffsets = seismicShotOffsets(params.shotSpec, spreadLength);
    }

    // Place spreads along the line.
    let spreadStart = 0;
    let spreadNo = 0;
    while (spreadStart <= totalLen + 1e-6) {
      spreadNo += 1;
      const spreadId = `${lineObj.name}_S${spreadNo}`;
      // Geophones.
      for (let g = 0; g < gPerSpread; g += 1) {
        const ch = spreadStart + g * gSpacing;
        if (ch > totalLen + 1e-6) break;
        const { point } = pointAtChainage(utm, ch);
        const [lon, lat] = window.proj4(state.crs, 'EPSG:4326', point);
        points.push({
          line_id: lineObj.name,
          point_id: `${spreadId}_G${g + 1}`,
          label: `${spreadId}/G${g + 1}`,
          chainage: Math.round(ch * 100) / 100,
          easting: point[0],
          northing: point[1],
          utm_zone: utmZoneLabel(state.crs),
          latlng: [lat, lon],
          lat, lon,
          kind: 'geophone',
          spread: spreadId,
          color: '#4DA34D'
        });
      }
      // Shots.
      shotOffsets.forEach((off, i) => {
        const ch = spreadStart + off;
        if (ch < -1e-6 || ch > totalLen + 1e-6) return;
        const clamped = Math.max(0, Math.min(totalLen, ch));
        const { point } = pointAtChainage(utm, clamped);
        const [lon, lat] = window.proj4(state.crs, 'EPSG:4326', point);
        points.push({
          line_id: lineObj.name,
          point_id: `${spreadId}_SP${i + 1}`,
          label: `${spreadId}/SP${i + 1}`,
          chainage: Math.round(clamped * 100) / 100,
          easting: point[0],
          northing: point[1],
          utm_zone: utmZoneLabel(state.crs),
          latlng: [lat, lon],
          lat, lon,
          kind: 'shot',
          spread: spreadId,
          color: '#e74c3c'
        });
      });

      // Spread extent line for rendering.
      const sp = pointAtChainage(utm, spreadStart).point;
      const ep = pointAtChainage(utm, Math.min(spreadStart + spreadLength, totalLen)).point;
      lines.push({ id: spreadId, name: spreadId, utm: [sp, ep], latlngs: utmToLatlngs([sp, ep], state.crs) });

      // Advance: if only one spread fits, stop.
      const next = spreadStart + step;
      if (next <= spreadStart) break;
      if (spreadStart + spreadLength >= totalLen - 1e-6) break;
      spreadStart = next;
    }
  });

  const geoCount = points.filter((p) => p.kind === 'geophone').length;
  const shotCount = points.filter((p) => p.kind === 'shot').length;
  const lineKm = lines.reduce((s, l) => s + dist(l.utm[0], l.utm[1]), 0) / 1000;
  const depth = mode === 'masw'
    ? maswDepthEstimate(gPerSpread, gSpacing)
    : refractionDepthEstimate(gPerSpread, gSpacing, Number(params.velocity) || 1500);

  const stats = {
    mode: mode === 'masw' ? 'MASW' : 'Seismic refraction',
    lineCount: lines.length,
    spreadCount: lines.length,
    geophoneCount: geoCount,
    shotCount,
    lineKm,
    spreadLength,
    maxDepth: depth.estimatedDepth,
    fieldDays: fieldDays(lineKm, params.kmPerDay)
  };

  return {
    method: 'seismic',
    mode,
    lines,
    tieLines: [],
    points,
    pointsFolderName: 'Geophones & shots',
    boundary: null,
    stats
  };
}
