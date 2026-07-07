// planners/ert.js — electrical resistivity tomography electrode planner.
// Places electrodes along drawn lines, auto-splits long lines into roll-along
// segments with 25% overlap, computes pseudo-depth & n-levels per array type.

import { lineLength, pointAtChainage, dist, utmZoneLabel, utmToLatlngs, latlngsToUtm } from '../geometry.js';
import { ertDepth, ertLevels, ERT_ARRAY_LABELS, fieldDays } from '../calculators.js';

// params:
//  electrodeCount (24|32|48|64|72|96)
//  spacing (m)
//  arrayType: 'wenner'|'schlumberger'|'dipole-dipole'|'gradient'|'pole-pole'|'pole-dipole'
//  overlapRatio (default 0.25)
//  kmPerDay
// state: { crs, surveyLines }
export function planERT(params, state) {
  if (!state || !state.surveyLines || state.surveyLines.length === 0) {
    throw new Error('Draw one or more ERT lines on the map first (use the Line tool).');
  }
  const n = Math.max(4, Math.round(Number(params.electrodeCount) || 48));
  const spacing = Math.max(0.1, Number(params.spacing) || 5);
  const arrayType = params.arrayType || 'wenner';
  const overlapRatio = Math.max(0, Math.min(0.75, Number(params.overlapRatio) ?? 0.25));
  const cableLength = (n - 1) * spacing;
  const step = cableLength * (1 - overlapRatio); // roll-along step in metres

  const points = [];
  const lines = [];

  state.surveyLines.forEach((lineObj) => {
    const utm = lineObj.utm || latlngsToUtm(lineObj.latlngs, state.crs);
    const totalLen = lineLength(utm);
    if (totalLen < spacing) return;

    let segStart = 0;
    let segNo = 0;
    // Place electrode layouts until the line is covered.
    while (segStart <= totalLen + 1e-6) {
      segNo += 1;
      const segId = `${lineObj.name}_R${segNo}`;
      const segEnd = Math.min(segStart + cableLength, totalLen);
      // Number of electrodes that fit in this segment.
      const usable = Math.min(n, Math.floor((segEnd - segStart) / spacing) + 1);
      for (let e = 0; e < usable; e += 1) {
        const ch = segStart + e * spacing;
        if (ch > totalLen + 1e-6) break;
        const { point } = pointAtChainage(utm, ch);
        const [lon, lat] = window.proj4(state.crs, 'EPSG:4326', point);
        points.push({
          line_id: lineObj.name,
          point_id: `${segId}_E${e + 1}`,
          label: `${segId}/E${e + 1}`,
          chainage: Math.round(ch * 100) / 100,
          easting: point[0],
          northing: point[1],
          utm_zone: utmZoneLabel(state.crs),
          latlng: [lat, lon],
          lat, lon,
          kind: 'electrode',
          segment: segId,
          electrode: e + 1,
          color: '#4DA34D'
        });
      }
      // Segment extent line.
      const sp = pointAtChainage(utm, segStart).point;
      const ep = pointAtChainage(utm, segEnd).point;
      lines.push({ id: segId, name: segId, utm: [sp, ep], latlngs: utmToLatlngs([sp, ep], state.crs) });

      if (segEnd >= totalLen - 1e-6) break;
      segStart += step;
      if (step <= 0) break;
    }
  });

  // Depth & levels computed on the full electrode count (per spread).
  const depth = ertDepth(n, spacing, arrayType);
  const levels = ertLevels(n, arrayType);

  const lineKm = lines.reduce((s, l) => s + dist(l.utm[0], l.utm[1]), 0) / 1000;
  const electrodeCount = points.length;
  const stats = {
    mode: ERT_ARRAY_LABELS[arrayType] || arrayType,
    arrayType,
    lineCount: lines.length,
    segmentCount: lines.length,
    electrodeCount,
    cableLayout: cableLayoutNote(n),
    profileLengthPerCable: cableLength,
    maxDepth: depth.maxDepth,
    nLevels: levels.nLevels,
    dataPoints: levels.dataPoints,
    lineKm,
    fieldDays: fieldDays(lineKm, params.kmPerDay)
  };

  return {
    method: 'ert',
    mode: arrayType,
    lines,
    tieLines: [],
    points,
    pointsFolderName: 'Electrodes',
    boundary: null,
    stats
  };
}

function cableLayoutNote(n) {
  // Common takeout cable sizes.
  if (n <= 32) return '1 × 32-takeout cable';
  if (n <= 48) return '2 × 24-takeout cables';
  if (n <= 64) return '2 × 32-takeout cables';
  if (n <= 72) return '2 × 36-takeout cables (or 3 × 24)';
  return '3 × 32-takeout cables (multi-electrode switcher)';
}
