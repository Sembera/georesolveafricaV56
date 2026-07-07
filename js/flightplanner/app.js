// app.js — G-FlightPlanner entry module.
// Wires the shared MapWorkspace (from geopylanner/map.js) with the drone
// photogrammetry engine, camera presets, exports, stats, print, mobile sheet.
// Strict ES module. Loaded via <script type="module">.

import { MapWorkspace, registerProjections } from '../geopylanner/map.js';
import { CAMERA_PRESETS, getCameraById, gsdFromAltitude, altitudeFromGsd, groundFootprint } from './cameras.js';
import { planFlight } from './planner.js';
import {
  exportKML, exportKMZ, exportLitchiCSV, exportWaypointsCSV, exportGeoJSON,
  buildPrintSummary, ATTRIBUTION
} from './exports.js';
import { fmt } from '../geopylanner/geometry.js';

const $ = (id) => document.getElementById(id);
const val = (id, fallback = '') => {
  const el = $(id);
  if (!el) return fallback;
  const v = el.type === 'number' ? el.valueAsNumber : el.value;
  return (v === '' || Number.isNaN(v)) ? fallback : v;
};

const state = {
  result: null,
  mapState: null,
  cameraId: 'mavic3e',
  showPhotos: true,
  homePoint: null,
  homeMarker: null,
  homeMode: false
};

let workspace = null;

function init() {
  registerProjections();
  workspace = new MapWorkspace('fp-map', 'fp-area-stats');
  workspace.init();
  workspace.onChange = (s) => { state.mapState = s; updateGenerateEnabled(); };

  populateCameras();
  bindAreaControls();
  bindCameraAndParams();
  bindGenerate();
  bindExports();
  bindPrint();
  bindMobile();
  bindToggles();
  syncGsdAltitude('altitude'); // initial sync
  updateGenerateEnabled();
}

function populateCameras() {
  const sel = $('fp-camera');
  if (!sel) return;
  sel.innerHTML = CAMERA_PRESETS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  sel.value = state.cameraId;
  const detail = $('fp-camera-notes');
  const cam = getCameraById(state.cameraId);
  if (detail) detail.textContent = cam.notes || '';
  syncCustomFields();
}

function bindCameraAndParams() {
  $('fp-camera')?.addEventListener('change', () => {
    state.cameraId = $('fp-camera').value;
    const cam = getCameraById(state.cameraId);
    const detail = $('fp-camera-notes');
    if (detail) detail.textContent = cam.notes || '';
    syncCustomFields();
    // Recompute altitude from current GSD target (keep GSD as the anchor).
    syncGsdAltitude('gsd');
  });

  // GSD <-> altitude linkage.
  $('fp-gsd')?.addEventListener('input', () => syncGsdAltitude('gsd'));
  $('fp-altitude')?.addEventListener('input', () => syncGsdAltitude('altitude'));
  // Show derived footprint + spacings live.
  ['fp-gsd', 'fp-altitude', 'fp-front-overlap', 'fp-side-overlap'].forEach((id) => {
    $(id)?.addEventListener('input', updateDerivedPreview);
  });
}

function syncCustomFields() {
  const cam = getCameraById(state.cameraId);
  const wrap = $('fp-custom-cam');
  if (!wrap) return;
  wrap.style.display = (cam.id === 'custom') ? '' : 'none';
  if (cam.id === 'custom') {
    setIfPresent('fp-cam-sw', cam.sensorWidth);
    setIfPresent('fp-cam-sh', cam.sensorHeight);
    setIfPresent('fp-cam-iw', cam.imageWidth);
    setIfPresent('fp-cam-ih', cam.imageHeight);
    setIfPresent('fp-cam-fl', cam.focalLength);
  }
}

function activeCamera() {
  const cam = getCameraById(state.cameraId);
  if (cam.id === 'custom') {
    return {
      ...cam,
      sensorWidth: Math.max(0.1, Number(val('fp-cam-sw', cam.sensorWidth))),
      sensorHeight: Math.max(0.1, Number(val('fp-cam-sh', cam.sensorHeight))),
      imageWidth: Math.max(1, Math.round(Number(val('fp-cam-iw', cam.imageWidth)))),
      imageHeight: Math.max(1, Math.round(Number(val('fp-cam-ih', cam.imageHeight)))),
      focalLength: Math.max(0.1, Number(val('fp-cam-fl', cam.focalLength)))
    };
  }
  return cam;
}

// source = 'gsd' (GSD edited → recompute altitude) or 'altitude' (altitude edited → recompute GSD).
function syncGsdAltitude(source) {
  const cam = activeCamera();
  if (source === 'gsd') {
    const gsd = Math.max(0.1, Number(val('fp-gsd', 2.5)));
    const alt = altitudeFromGsd(cam, gsd);
    setIfPresent('fp-altitude', Number(alt.toFixed(1)));
  } else {
    const alt = Math.max(1, Number(val('fp-altitude', 90)));
    const gsd = gsdFromAltitude(cam, alt);
    setIfPresent('fp-gsd', Number(gsd.toFixed(2)));
  }
  updateDerivedPreview();
}

function updateDerivedPreview() {
  const cam = activeCamera();
  const alt = Math.max(1, Number(val('fp-altitude', 90)));
  const fp = groundFootprint(cam, alt);
  const fo = Math.max(0, Math.min(0.95, Number(val('fp-front-overlap', 0.75))));
  const so = Math.max(0, Math.min(0.95, Number(val('fp-side-overlap', 0.65))));
  const lineSpacing = fp.width * (1 - so);
  const photoInterval = fp.height * (1 - fo);
  const el = $('fp-derived');
  if (el) {
    el.innerHTML = `
      <div class="gp-stat-row"><span>Footprint on ground</span><strong>${fmt(fp.width, 1)} × ${fmt(fp.height, 1)} m</strong></div>
      <div class="gp-stat-row"><span>Line spacing (side)</span><strong>${fmt(lineSpacing, 1)} m</strong></div>
      <div class="gp-stat-row"><span>Photo interval (front)</span><strong>${fmt(photoInterval, 1)} m</strong></div>`;
  }
}

function bindAreaControls() {
  $('fp-draw-polygon')?.addEventListener('click', () => workspace.startDraw('polygon'));
  $('fp-draw-line')?.addEventListener('click', () => workspace.startDraw('line'));
  $('fp-finish-draw')?.addEventListener('click', () => workspace.finishManualDraw());
  $('fp-cancel-draw')?.addEventListener('click', () => workspace.cancelDraw());
  $('fp-clear-area')?.addEventListener('click', () => {
    workspace.clearAll();
    state.result = null;
    renderResult(null);
    clearHomePoint();
  });

  $('fp-paste-apply')?.addEventListener('click', () => {
    const text = $('fp-paste-text').value;
    const crs = $('fp-paste-crs').value;
    const mode = $('fp-paste-mode').value;
    if (!text.trim()) { toast('Paste coordinates first.'); return; }
    try {
      const n = workspace.applyPastedCoordinates(text, crs, mode);
      toast(`${n} coordinates loaded as ${mode}.`);
    } catch (err) {
      alert(err.message);
    }
  });

  $('fp-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      try {
        const lower = file.name.toLowerCase();
        let n;
        if (lower.endsWith('.kml') || lower.endsWith('.xml') || text.trim().startsWith('<?xml') || text.includes('<kml')) {
          n = workspace.importKML(text);
        } else {
          n = workspace.importGeoJSON(text);
        }
        toast(`${n} feature(s) imported from ${file.name}.`);
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Home / takeoff point.
  $('fp-draw-home')?.addEventListener('click', () => {
    state.homeMode = !state.homeMode;
    const btn = $('fp-draw-home');
    if (btn) btn.classList.toggle('active', state.homeMode);
    if (state.homeMode) {
      toast('Click the map to set the home/takeoff point.');
      workspace.map.getContainer().style.cursor = 'crosshair';
      workspace.map.once('click', (e) => {
        setHomePoint([e.latlng.lat, e.latlng.lng]);
        state.homeMode = false;
        if (btn) btn.classList.remove('active');
        workspace.map.getContainer().style.cursor = '';
      });
    } else {
      workspace.map.getContainer().style.cursor = '';
    }
  });
  $('fp-clear-home')?.addEventListener('click', () => clearHomePoint());
}

function setHomePoint(latlng) {
  clearHomePoint();
  state.homePoint = latlng;
  const icon = L.divIcon({ className: 'fp-home-icon', html: '⌂', iconSize: [24, 24], iconAnchor: [12, 12] });
  state.homeMarker = L.marker(latlng, { icon, title: 'Home / takeoff' }).addTo(workspace.map).bindTooltip('Home / takeoff', { permanent: false });
}

function clearHomePoint() {
  if (state.homeMarker) { state.homeMarker.remove(); state.homeMarker = null; }
  state.homePoint = null;
}

function bindGenerate() {
  $('fp-generate')?.addEventListener('click', generate);
}

function generate() {
  const s = state.mapState;
  if (!s || !s.boundaryUtm || s.boundaryUtm.length < 3) {
    alert('Draw or import a boundary polygon first.');
    return;
  }
  const cam = activeCamera();
  let params;
  try {
    params = {
      camera: cam,
      altitude: Math.max(1, Number(val('fp-altitude', 90))),
      gsd: Number(val('fp-gsd', 2.5)),
      frontOverlap: Math.max(0, Math.min(0.95, Number(val('fp-front-overlap', 0.75)) / 100)),
      sideOverlap: Math.max(0, Math.min(0.95, Number(val('fp-side-overlap', 0.65)) / 100)),
      lineAzimuth: $('fp-line-az').value.trim(),
      flightSpeed: Math.max(0.5, Number(val('fp-speed', 8))),
      crosshatch: $('fp-crosshatch')?.checked || false,
      boundaryBuffer: Math.max(0, Number(val('fp-buffer', 0))),
      usableFlightMin: Math.max(1, Number(val('fp-battery-min', 20)))
    };
  } catch (err) {
    alert('Invalid parameters: ' + err.message);
    return;
  }

  let result;
  try {
    result = planFlight(params, s);
  } catch (err) {
    alert(err.message);
    return;
  }
  state.result = result;
  renderResult(result);
  renderStats(result);
  renderTable(result);
  updateGenerateEnabled();
}

function renderResult(result) {
  workspace.renderResult(result ? {
    lines: result.lines,
    tieLines: [],
    points: state.showPhotos ? result.photoPoints : [],
    boundary: result.boundary,
    pointsFolderName: 'Photo trigger points'
  } : null);
  // Re-add home marker if it existed (renderResult clears resultLayer only, but
  // home marker is added to workspace.map directly, not resultLayer — so it persists).
}

function renderStats(result) {
  const el = $('fp-stats');
  if (!el) return;
  if (!result) { el.innerHTML = '<div class="gp-stat-muted">No plan generated yet.</div>'; return; }
  const s = result.stats;
  const cards = [];
  const push = (label, value) => cards.push(`<div class="gp-stat-card"><div class="gp-stat-label">${label}</div><div class="gp-stat-value">${value}</div></div>`);
  push('Camera', s.camera);
  push('Altitude AGL', `${s.altitude} m`);
  push('GSD', `${s.gsd} cm/px`);
  push('Area', `${s.areaHa} ha`);
  push('Flight lines', s.lineCount);
  push('Photos', s.photoCount);
  push('Waypoints', s.waypointCount);
  push('Flight distance', `${s.flightDistanceKm} km`);
  push('Flight time', `${s.flightTimeMin} min`);
  push('Batteries', s.batteries);
  push('Line spacing', `${s.lineSpacing} m`);
  push('Photo interval', `${s.photoInterval} m (${s.photoIntervalSeconds}s)`);
  el.innerHTML = cards.join('');

  // Warnings.
  const wEl = $('fp-warnings');
  if (wEl) {
    if (!result.warnings || result.warnings.length === 0) {
      wEl.innerHTML = '';
      wEl.style.display = 'none';
    } else {
      wEl.style.display = '';
      wEl.innerHTML = result.warnings.map((w) => `<div class="fp-alert fp-alert-warn">${w.text}</div>`).join('');
    }
  }
}

function renderTable(result) {
  const el = $('fp-table');
  if (!el) return;
  const wrap = $('fp-table-wrap');
  if (!result || !result.photoPoints || result.photoPoints.length === 0) {
    if (wrap) wrap.style.display = 'none';
    return;
  }
  if (wrap) wrap.style.display = '';
  const headers = ['Line', 'Point ID', 'Chainage (m)', 'Easting', 'Northing', 'UTM zone', 'Latitude', 'Longitude'];
  let html = '<thead><tr>' + headers.map((h) => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
  const rows = result.photoPoints;
  const limit = 200;
  for (let i = 0; i < Math.min(limit, rows.length); i += 1) {
    const p = rows[i];
    const lat = p.latlng ? p.latlng[0] : p.lat;
    const lon = p.latlng ? p.latlng[1] : p.lon;
    html += `<tr><td>${p.line_id ?? ''}</td><td>${p.label ?? p.point_id ?? ''}</td><td>${fmt(p.chainage, 1)}</td><td>${fmt(p.easting, 2)}</td><td>${fmt(p.northing, 2)}</td><td>${p.utm_zone ?? ''}</td><td>${fmt(lat, 6)}</td><td>${fmt(lon, 6)}</td></tr>`;
  }
  if (rows.length > limit) html += `<tr><td colspan="8" class="gp-more">… ${rows.length - limit} more rows — export CSV for full data.</td></tr>`;
  html += '</tbody>';
  el.innerHTML = html;
}

function bindExports() {
  const handlers = {
    'fp-exp-kml': () => exportKML(state.result, meta('kml')),
    'fp-exp-kmz': () => exportKMZ(state.result, meta('kmz')),
    'fp-exp-litchi': () => exportLitchiCSV(state.result, meta('litchi')),
    'fp-exp-wp-csv': () => exportWaypointsCSV(state.result, meta('waypoints')),
    'fp-exp-geojson': () => exportGeoJSON(state.result, meta('geojson'))
  };
  for (const [id, fn] of Object.entries(handlers)) {
    $(id)?.addEventListener('click', () => {
      if (!state.result) { alert('Generate a plan first.'); return; }
      try { fn(); } catch (err) { alert(err.message); }
    });
  }
}

function meta(ext) {
  const s = state.result?.stats;
  return {
    name: `G-FlightPlanner ${s ? s.camera : ''} mission`,
    filename: `flightplan_${(s ? s.camera : 'mission').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
  };
}

function bindPrint() {
  $('fp-print')?.addEventListener('click', () => {
    const body = $('fp-print-body');
    if (!body) { window.print(); return; }
    if (!state.result) { alert('Generate a plan first.'); return; }
    body.innerHTML = buildPrintSummary(state.result);
    window.print();
  });
}

function bindToggles() {
  $('fp-toggle-photos')?.addEventListener('change', (e) => {
    state.showPhotos = e.target.checked;
    if (state.result) renderResult(state.result);
  });
}

function setIfPresent(id, v) {
  const el = $(id);
  if (el) el.value = v;
}

function updateGenerateEnabled() {
  const btn = $('fp-generate');
  if (!btn) return;
  const s = state.mapState;
  const ready = s ? s.boundaryUtm.length >= 3 : false;
  btn.disabled = !ready;
  btn.classList.toggle('is-disabled', !ready);
}

function bindMobile() {
  $('fp-sheet-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('fp-sheet-open');
  });
}

function toast(msg) {
  let el = document.getElementById('fp-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fp-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

document.addEventListener('DOMContentLoaded', init);
