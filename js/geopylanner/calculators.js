// calculators.js — preserves the existing "engineering math" design calculators.
// MASW, Seismic refraction, ERT pseudo-depth, GPR hyperbola velocity, Gravity stationing.
// Pure functions, no DOM coupling beyond the GPR pick/canvas helpers exposed for app.js.

export const ERT_DEPTH_FACTORS = {
  wenner: 0.17,
  schlumberger: 0.22,
  'dipole-dipole': 0.25,
  gradient: 0.18,
  'pole-pole': 0.30,
  'pole-dipole': 0.28
};

export const ERT_ARRAY_LABELS = {
  wenner: 'Wenner (alpha)',
  schlumberger: 'Schlumberger',
  'dipole-dipole': 'Dipole-Dipole',
  gradient: 'Gradient (Wenner-Schlumberger hybrid)',
  'pole-pole': 'Pole-Pole',
  'pole-dipole': 'Pole-Dipole'
};

// Estimate number of independent measurement levels & datapoints for an ERT array.
// electrodeCount: total electrodes on a straight line; spacing: metres.
export function ertLevels(electrodeCount, arrayType) {
  const n = Math.max(0, electrodeCount - 1);
  let nLevels = 0;
  let dataPoints = 0;
  switch (arrayType) {
    case 'wenner':
      // levels k = 1..n-2 (need 3 electrodes); levels = n-1; per level (n - 2k) points.
      nLevels = Math.floor(n / 1) - 1;
      for (let k = 1; k <= nLevels; k += 1) dataPoints += Math.max(0, electrodeCount - 2 * k);
      break;
    case 'schlumberger':
      nLevels = Math.floor((n - 1) / 1);
      for (let k = 1; k <= nLevels; k += 1) dataPoints += Math.max(0, electrodeCount - 2 * k);
      break;
    case 'dipole-dipole':
      nLevels = Math.floor(n / 1) - 1;
      for (let k = 1; k <= nLevels; k += 1) dataPoints += Math.max(0, electrodeCount - k - 2);
      break;
    case 'gradient':
      nLevels = Math.floor(n / 2);
      for (let k = 1; k <= nLevels; k += 1) dataPoints += Math.max(0, electrodeCount - 2 * k);
      break;
    case 'pole-pole':
      nLevels = n - 1;
      dataPoints = (electrodeCount - 1) * (electrodeCount - 2) / 2;
      break;
    case 'pole-dipole':
      nLevels = n - 1;
      for (let k = 1; k <= nLevels; k += 1) dataPoints += Math.max(0, electrodeCount - k - 1);
      break;
    default:
      nLevels = 0;
      dataPoints = 0;
  }
  return { nLevels: Math.max(0, nLevels), dataPoints: Math.max(0, dataPoints) };
}

export function ertDepth(electrodeCount, spacing, arrayType) {
  const L = (electrodeCount - 1) * spacing;
  const factor = ERT_DEPTH_FACTORS[arrayType] ?? 0.2;
  return { profileLength: L, maxDepth: L * factor, factor };
}

export function maswDepthEstimate(channels, spacing) {
  const profileLength = (channels - 1) * spacing;
  return { profileLength, estimatedDepth: profileLength / 2 };
}

export function refractionDepthEstimate(channels, spacing, velocity) {
  const profileLength = (channels - 1) * spacing;
  // Rule of thumb: investigation depth ~ profileLength / 3 for typical layouts.
  return { profileLength, estimatedDepth: profileLength / 3, velocity };
}

// Gravity: compute expected station count for a regular grid over a rectangle.
export function gravityStationCount(length, width, spacing, gridType) {
  const numX = Math.floor(length / spacing) + 1;
  const numY = Math.floor(width / spacing) + 1;
  if (gridType === 'regular') return numX * numY;
  if (gridType === 'profile') return numX;
  return Math.round(numX * numY * 0.6); // semi-random
}

// Gravity: station spacing needed to resolve a target body of given radius/depth
// (based on half-wavelength rule). Returns metres.
export function gravitySpacingForTarget(targetDepthM) {
  return Math.max(1, targetDepthM / 2);
}

// GPR hyperbola velocity from three pixel picks (apex + two arm points).
// Returns { velocity, depth, permittivity } using canvas pixel->(distance,time) scaling.
export function gprVelocityFromPicks(apex, arm1, arm2, timeWindowNs, traceSpacingM, canvasW, canvasH) {
  // Average the two arm measurements.
  const dx1 = Math.abs(arm1.x - apex.x) * traceSpacingM / canvasW;
  const dt1 = Math.abs(arm1.y - apex.y) * timeWindowNs / canvasH;
  const dx2 = Math.abs(arm2.x - apex.x) * traceSpacingM / canvasW;
  const dt2 = Math.abs(arm2.y - apex.y) * timeWindowNs / canvasH;

  // v = 2 * dx / dt  (two-way: apex-to-arm); convert ns to s.
  const v1 = dt1 > 0 ? (2 * dx1) / (dt1 * 1e-9) : 0;
  const velocityArm2 = dt2 > 0 ? (2 * dx2) / (dt2 * 1e-9) : 0;
  const velocity = (v1 + velocityArm2) / 2 || 0;

  // Depth at apex: apex.y corresponds to two-way time t0.
  const t0 = apex.y * timeWindowNs / canvasH;
  const depth = (velocity * t0 * 1e-9) / 2;
  const permittivity = velocity > 0 ? Math.pow(299792458 / velocity, 2) : 0;
  return { velocity, depth, permittivity, t0 };
}

// Magnetic: total line-km & station count for a rectangular grid (legacy estimate, kept for parity).
export function magneticEstimate(length, width, lineSpacing, tieSpacing, stationSpacing) {
  const numLines = Math.floor(width / lineSpacing) + 1;
  const numTies = Math.floor(length / tieSpacing) + 1;
  const stationsPerLine = Math.floor(length / stationSpacing) + 1;
  const stationsPerTie = Math.floor(width / stationSpacing) + 1;
  const lineKm = (numLines * length + numTies * width) / 1000;
  const stationCount = numLines * stationsPerLine + numTies * stationsPerTie;
  return { numLines, numTies, lineKm, stationCount };
}

// Seismic: produce a symmetric shot-offset list given a layout spec.
// layout: '5shot' | '7shot' | { offsets:[m] } | 'custom'
// Returns array of shot chainage offsets (metres) relative to spread start.
export function seismicShotOffsets(spec, spreadLength) {
  if (Array.isArray(spec)) return spec.slice();
  if (spec && Array.isArray(spec.offsets)) return spec.offsets.slice();
  switch (spec) {
    case '5shot': {
      // End-on ±offset, mid, far-offset.
      return [-spreadLength * 0.25, 0, spreadLength * 0.5, spreadLength, spreadLength + spreadLength * 0.25];
    }
    case '7shot': {
      return [-spreadLength * 0.5, -spreadLength * 0.25, 0, spreadLength * 0.5, spreadLength, spreadLength * 1.25, spreadLength * 1.5];
    }
    case 'mid': {
      return [spreadLength / 2];
    }
    default:
      return [0, spreadLength];
  }
}

// Production estimate given total line-km and a user-set km/day rate.
export function fieldDays(lineKm, kmPerDay) {
  if (!kmPerDay || kmPerDay <= 0) return 0;
  return Math.ceil(lineKm / kmPerDay);
}
