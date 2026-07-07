// planners/grid.js — grid survey planner for Magnetic, Gravity, GPR-grid modes.
// Generates parallel survey lines + tie lines clipped to the boundary polygon,
// stations by chainage, professional naming, stats. All metric math in UTM.

import {
  boundingBoxUtm, minimumBoundingRectangle, clipSegmentToPolygon,
  projectAtAzimuth, dist, azimuth, pointAtChainage, latlngsToUtm, utmToLatlngs,
  fmt, utmZoneLabel
} from '../geometry.js';
import { magneticEstimate, fieldDays } from '../calculators.js';

const PRESETS = {
  magnetic: { lineSpacing: 50, stationSpacing: 2, tieMultiplier: 10, defaultAzimuth: 0, hasStations: true, label: 'Magnetic' },
  gravity: { lineSpacing: 250, stationSpacing: 250, tieMultiplier: 5, defaultAzimuth: 0, hasStations: true, label: 'Gravity' },
  gpr: { lineSpacing: 0.5, stationSpacing: 0, tieMultiplier: 0, defaultAzimuth: 0, hasStations: false, label: 'GPR grid' }
};

export function getPresets() { return PRESETS; }

// params:
//  mode: 'magnetic' | 'gravity' | 'gpr'
//  lineSpacing (m), stationSpacing (m), lineAzimuth (deg | 'auto'),
//  tieSpacing (m, 0 = none), tieAzimuth (deg | 'auto' = perpendicular to lines),
//  boundaryInset (m)
// state: { crs, boundaryUtm, boundaryLatlngs, mbr, bbox }
export function planGrid(params, state) {
  if (!state || !state.boundaryUtm || state.boundaryUtm.length < 3) {
    throw new Error('Draw or import a survey boundary polygon first.');
  }
  const preset = PRESETS[params.mode] || PRESETS.magnetic;
  const lineSpacing = Math.max(0.01, Number(params.lineSpacing) || preset.lineSpacing);
  const stationSpacing = Math.max(0, Number(params.stationSpacing) ?? preset.stationSpacing);
  const inset = Math.max(0, Number(params.boundaryInset) || 0);

  // Working polygon (optionally inset).
  let poly = state.boundaryUtm;
  // For inset we keep the original polygon; clipping already keeps lines inside.

  // Azimuth: auto = polygon longest axis via MBR.
  let lineAz = params.lineAzimuth;
  if (lineAz === 'auto' || lineAz === '' || lineAz === null || Number.isNaN(Number(lineAz))) {
    lineAz = state.mbr ? state.mbr.angle : preset.defaultAzimuth;
  } else {
    lineAz = Number(lineAz);
  }
  lineAz = ((lineAz % 360) + 360) % 360;

  // Tie azimuth: default perpendicular to lines.
  let tieAz = params.tieAzimuth;
  const tieAuto = tieAz === 'auto' || tieAz === '' || tieAz === null || Number.isNaN(Number(tieAz));
  tieAz = tieAuto ? (lineAz + 90) % 360 : ((Number(tieAz) % 360) + 360) % 360;

  const tieSpacing = Math.max(0, Number(params.tieSpacing) ?? (lineSpacing * (preset.tieMultiplier || 10)));

  const bbox = boundingBoxUtm(poly);
  // Expand bbox slightly to ensure full coverage at the azimuth.
  const pad = Math.max(bbox.width, bbox.height) + lineSpacing * 2 + inset * 2 + 10;

  // Direction vectors.
  // Line direction unit vector (azimuth 0 = north => (sin, cos)).
  const lineRad = lineAz * Math.PI / 180;
  const lineDir = [Math.sin(lineRad), Math.cos(lineRad)];
  const perpDir = [-lineDir[1], lineDir[0]]; // right-hand perpendicular (az+90)

  // Center of bbox as origin for generating parallel offsets.
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  const center = [cx, cy];

  // Generate line starting points along the perpendicular direction, spaced by lineSpacing.
  // We sweep from -pad to +pad along perpDir.
  const lineCount = Math.ceil((2 * pad) / lineSpacing) + 1;
  const lines = [];
  const stations = [];
  let lineIndex = 0;

  for (let i = -Math.floor(lineCount / 2); i <= Math.ceil(lineCount / 2); i += 1) {
    const offset = i * lineSpacing;
    // Line passes through center + offset*perpDir, runs along lineDir for length 2*pad.
    const lineStart = [center[0] + offset * perpDir[0] - pad * lineDir[0], center[1] + offset * perpDir[1] - pad * lineDir[1]];
    const lineEnd = [center[0] + offset * perpDir[0] + pad * lineDir[0], center[1] + offset * perpDir[1] + pad * lineDir[1]];

    // Clip this segment to the polygon.
    const segs = clipSegmentToPolygon(lineStart, lineEnd, poly);
    if (segs.length === 0) continue;

    // Drop segments shorter than 2*stationSpacing (or 2m minimum for continuous GPR).
    const minSegLen = preset.hasStations ? Math.max(2 * Math.max(stationSpacing, 0.1), 1) : 1;
    const kept = segs.filter((s) => dist(s[0], s[1]) >= minSegLen);
    if (kept.length === 0) continue;

    lineIndex += 1;
    const lineId = `L${1000 + lineIndex * 100}`;
    // For multi-segment lines we keep each as a sub-line with the same line id + a suffix.
    kept.forEach((seg, sIdx) => {
      const segLatlngs = utmToLatlngs([seg[0], seg[1]], state.crs);
      lines.push({ id: lineId + (kept.length > 1 ? `_${sIdx + 1}` : ''), name: lineId, utm: [seg[0], seg[1]], latlngs: segLatlngs });

      if (preset.hasStations && stationSpacing > 0) {
        const segLen = dist(seg[0], seg[1]);
        const startChainage = Math.round(dist(lineStart, seg[0])); // approx chainage from line origin
        // Stations from seg start by chainage along the segment.
        let ch = 0;
        const baseChainage = Math.round(startChainage / Math.max(stationSpacing, 1)) * Math.max(stationSpacing, 1);
        let stnNo = 0;
        while (ch <= segLen + 1e-6) {
          stnNo += 1;
          const pt = [seg[0][0] + lineDir[0] * ch, seg[0][1] + lineDir[1] * ch];
          const [lon, lat] = window.proj4(state.crs, 'EPSG:4326', pt);
          stations.push({
            line_id: lineId,
            point_id: `${lineId}_${baseChainage + Math.round(ch)}`,
            label: `${lineId}/${baseChainage + Math.round(ch)}`,
            chainage: Math.round(baseChainage + ch),
            easting: pt[0],
            northing: pt[1],
            utm_zone: utmZoneLabel(state.crs),
            latlng: [lat, lon],
            lat, lon,
            color: '#345363'
          });
          ch += stationSpacing;
        }
      } else if (!preset.hasStations) {
        // GPR continuous: no discrete stations, but record line endpoints for stats.
      }
    });
  }

  // Tie lines: perpendicular grid.
  const tieLines = [];
  if (tieSpacing > 0) {
    const tieRad = tieAz * Math.PI / 180;
    const tieDir = [Math.sin(tieRad), Math.cos(tieRad)];
    const tiePerp = [-tieDir[1], tieDir[0]];
    const tieCount = Math.ceil((2 * pad) / tieSpacing) + 1;
    let tieIndex = 0;
    for (let i = -Math.floor(tieCount / 2); i <= Math.ceil(tieCount / 2); i += 1) {
      const offset = i * tieSpacing;
      const start = [center[0] + offset * tiePerp[0] - pad * tieDir[0], center[1] + offset * tiePerp[1] - pad * tieDir[1]];
      const end = [center[0] + offset * tiePerp[0] + pad * tieDir[0], center[1] + offset * tiePerp[1] + pad * tieDir[1]];
      const segs = clipSegmentToPolygon(start, end, poly);
      const kept = segs.filter((s) => dist(s[0], s[1]) >= Math.max(2 * Math.max(stationSpacing, 0.1), 1));
      if (kept.length === 0) continue;
      tieIndex += 1;
      const tieId = `T${9000 + tieIndex * 100}`;
      kept.forEach((seg, sIdx) => {
        const segLatlngs = utmToLatlngs([seg[0], seg[1]], state.crs);
        tieLines.push({ id: tieId + (kept.length > 1 ? `_${sIdx + 1}` : ''), name: tieId, utm: [seg[0], seg[1]], latlngs: segLatlngs });
      });
    }
  }

  // Stats.
  const lineKm = (lines.reduce((s, l) => s + dist(l.utm[0], l.utm[1]), 0) + tieLines.reduce((s, l) => s + dist(l.utm[0], l.utm[1]), 0)) / 1000;
  const totalStations = stations.length;
  const lineOnlyKm = lines.reduce((s, l) => s + dist(l.utm[0], l.utm[1]), 0) / 1000;
  const stats = {
    mode: preset.label,
    lineCount: lines.length,
    tieCount: tieLines.length,
    lineKm,
    lineOnlyKm,
    stationCount: totalStations,
    swathCount: preset.hasStations ? 0 : lines.length,
    lineAzimuth: lineAz,
    tieAzimuth: tieAz,
    fieldDays: fieldDays(lineKm, params.kmPerDay)
  };

  return {
    method: 'grid',
    mode: params.mode,
    lines,
    tieLines,
    points: stations,
    pointsFolderName: preset.hasStations ? 'Stations' : 'Line endpoints',
    boundary: { latlngs: state.boundaryLatlngs, utm: state.boundaryUtm },
    stats
  };
}

// Convenience: estimate stats without recomputing the full grid (used by quick math tab).
export function gridEstimate(params, state) {
  if (!state || !state.boundaryUtm) return null;
  const bbox = boundingBoxUtm(state.boundaryUtm);
  return magneticEstimate(bbox.width, bbox.height, params.lineSpacing, params.tieSpacing, params.stationSpacing);
}
