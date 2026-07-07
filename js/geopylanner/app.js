// app.js — G-Geopylanner entry module.
// Wires the shared map workspace, per-method planners, exports, stats, print, mobile sheet.
// Strict ES module. Loaded via <script type="module">.

import { MapWorkspace, registerProjections } from './map.js';
import { planGrid, getPresets } from './planners/grid.js';
import { planSeismic } from './planners/seismic.js';
import { planERT } from './planners/ert.js';
import {
  exportKMZ, exportKML, exportGPX, exportCSV, exportGeoJSON, exportDXF, downloadText, ATTRIBUTION
} from './exports.js';
import {
  maswDepthEstimate, refractionDepthEstimate, ertDepth, ertLevels, ERT_ARRAY_LABELS,
  magneticEstimate, gravityStationCount, gravitySpacingForTarget, gprVelocityFromPicks,
  fieldDays, seismicShotOffsets
} from './calculators.js';
import { fmt } from './geometry.js';

const $ = (id) => document.getElementById(id);
const val = (id, fallback = '') => {
  const el = $(id);
  if (!el) return fallback;
  const v = el.type === 'number' ? el.valueAsNumber : el.value;
  return (v === '' || Number.isNaN(v)) ? fallback : v;
};

const state = {
  method: 'magnetic',
  subtab: 'planner',
  result: null,
  mapState: null,
  kmPerDay: 5,
  gpr: { image: null, picks: [] }
};

let workspace = null;

function init() {
  registerProjections();
  workspace = new MapWorkspace('gp-map', 'gp-area-stats');
  workspace.init();
  workspace.onChange = (s) => { state.mapState = s; updateGenerateEnabled(); };

  bindMethodNav();
  bindSubtabs();
  bindAreaControls();
  bindPlannerControls();
  bindExports();
  bindPrint();
  bindMobile();
  bindGprAnalyzer();
  applyPreset(state.method);
  updateGenerateEnabled();
}

function bindMethodNav() {
  document.querySelectorAll('.gp-method-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const method = btn.dataset.method;
      state.method = method;
      document.querySelectorAll('.gp-method-btn').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.gp-method-panel').forEach((p) => p.classList.toggle('active', p.dataset.method === method));
      applyPreset(method);
      // default subtab
      const firstSub = document.querySelector(`.gp-method-panel[data-method="${method}"] .gp-subtab`);
      if (firstSub) selectSubtab(method, firstSub.dataset.subtab);
      syncDrawModeForMethod(method);
    });
  });
}

function bindSubtabs() {
  document.querySelectorAll('.gp-subtab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.gp-method-panel');
      selectSubtab(panel.dataset.method, btn.dataset.subtab);
    });
  });
}

function selectSubtab(method, subtab) {
  state.subtab = subtab;
  document.querySelectorAll(`.gp-method-panel[data-method="${method}"] .gp-subtab`).forEach((b) => b.classList.toggle('active', b.dataset.subtab === subtab));
  document.querySelectorAll(`.gp-method-panel[data-method="${method}"] .gp-subpanel`).forEach((p) => p.classList.toggle('active', p.dataset.subtab === subtab));
}

function bindAreaControls() {
  $('gp-draw-polygon')?.addEventListener('click', () => { workspace.startDraw('polygon'); });
  $('gp-draw-line')?.addEventListener('click', () => { workspace.startDraw('line'); });
  $('gp-finish-draw')?.addEventListener('click', () => workspace.finishManualDraw());
  $('gp-cancel-draw')?.addEventListener('click', () => workspace.cancelDraw());
  $('gp-clear-area')?.addEventListener('click', () => { workspace.clearAll(); state.result = null; renderResult(null); });

  $('gp-paste-apply')?.addEventListener('click', () => {
    const text = $('gp-paste-text').value;
    const crs = $('gp-paste-crs').value;
    const mode = $('gp-paste-mode').value;
    if (!text.trim()) { alert('Paste coordinates first.'); return; }
    try {
      const n = workspace.applyPastedCoordinates(text, crs, mode);
      toast(`${n} coordinates loaded as ${mode}.`);
    } catch (err) {
      alert(err.message);
    }
  });

  $('gp-file-input')?.addEventListener('change', (e) => {
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
}

function syncDrawModeForMethod(method) {
  // Grid methods need a polygon; line methods need lines.
  const lineMethods = ['seismic', 'ert'];
  if (lineMethods.includes(method) && state.mapState && !state.mapState.surveyLines.length) {
    toast('Draw a survey line for this method (Line tool).');
  }
}

function bindPlannerControls() {
  $('gp-generate')?.addEventListener('click', generate);
  $('gp-km-day')?.addEventListener('change', (e) => { state.kmPerDay = Number(e.target.value) || 5; });
  // Preset buttons inside each method panel.
  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  // Seismic mode toggle.
  document.querySelectorAll('input[name="sei-mode"]').forEach((r) => {
    r.addEventListener('change', () => toggleSeismicMode(r.value));
  });
}

function applyPreset(method) {
  const presets = getPresets();
  if (method === 'magnetic' && presets.magnetic) {
    setIfPresent('mag-line-spacing', presets.magnetic.lineSpacing);
    setIfPresent('mag-station-spacing', presets.magnetic.stationSpacing);
    setIfPresent('mag-line-az', 'auto');
    setIfPresent('mag-tie-spacing', presets.magnetic.lineSpacing * presets.magnetic.tieMultiplier);
    setIfPresent('mag-tie-az', 'auto');
  } else if (method === 'gravity' && presets.gravity) {
    setIfPresent('grav-line-spacing', presets.gravity.lineSpacing);
    setIfPresent('grav-station-spacing', presets.gravity.stationSpacing);
    setIfPresent('grav-line-az', 'auto');
    setIfPresent('grav-tie-spacing', presets.gravity.lineSpacing * presets.gravity.tieMultiplier);
    setIfPresent('grav-tie-az', 'auto');
  } else if (method === 'gpr' && presets.gpr) {
    setIfPresent('gpr-line-spacing', presets.gpr.lineSpacing);
    setIfPresent('gpr-line-az', 'auto');
  }
}

function setIfPresent(id, v) {
  const el = $(id);
  if (el) el.value = v;
}

function toggleSeismicMode(mode) {
  const maswExtras = $('sei-masw-extras');
  const refExtras = $('sei-ref-extras');
  if (maswExtras) maswExtras.style.display = mode === 'masw' ? '' : 'none';
  if (refExtras) refExtras.style.display = mode === 'masw' ? 'none' : '';
}

function generate() {
  const s = state.mapState;
  if (!s) { alert('Define a survey area or line first.'); return; }
  const kmPerDay = state.kmPerDay;
  let result;
  try {
    if (state.method === 'magnetic') {
      result = planGrid({
        mode: 'magnetic',
        lineSpacing: val('mag-line-spacing', 50),
        stationSpacing: val('mag-station-spacing', 2),
        lineAzimuth: val('mag-line-az', 'auto'),
        tieSpacing: val('mag-tie-spacing', 500),
        tieAzimuth: val('mag-tie-az', 'auto'),
        boundaryInset: val('mag-inset', 0),
        kmPerDay
      }, s);
    } else if (state.method === 'gravity') {
      result = planGrid({
        mode: 'gravity',
        lineSpacing: val('grav-line-spacing', 250),
        stationSpacing: val('grav-station-spacing', 250),
        lineAzimuth: val('grav-line-az', 'auto'),
        tieSpacing: val('grav-tie-spacing', 500),
        tieAzimuth: val('grav-tie-az', 'auto'),
        boundaryInset: val('grav-inset', 0),
        kmPerDay
      }, s);
    } else if (state.method === 'gpr') {
      result = planGrid({
        mode: 'gpr',
        lineSpacing: val('gpr-line-spacing', 0.5),
        stationSpacing: 0,
        lineAzimuth: val('gpr-line-az', 'auto'),
        tieSpacing: 0,
        tieAzimuth: 'auto',
        boundaryInset: val('gpr-inset', 0),
        kmPerDay
      }, s);
    } else if (state.method === 'seismic') {
      const mode = document.querySelector('input[name="sei-mode"]:checked')?.value || 'refraction';
      result = planSeismic({
        mode,
        geophonesPerSpread: val('sei-channels', 24),
        geophoneSpacing: val('sei-spacing', 2),
        shotSpec: $('sei-shot-spec').value,
        sourceOffset: val('sei-source-offset', 5),
        rollAlongOverlap: val('sei-roll', 0),
        velocity: val('sei-velocity', 1500),
        kmPerDay
      }, s);
    } else if (state.method === 'ert') {
      result = planERT({
        electrodeCount: val('ert-electrodes', 48),
        spacing: val('ert-spacing', 5),
        arrayType: $('ert-array').value,
        overlapRatio: val('ert-overlap', 0.25),
        kmPerDay
      }, s);
    }
  } catch (err) {
    alert(err.message);
    return;
  }
  if (!result) return;
  state.result = result;
  renderResult(result);
  renderStats(result);
  renderTable(result);
  updateGenerateEnabled();
}

function renderResult(result) {
  workspace.renderResult(result);
}

function renderStats(result) {
  const el = $('gp-stats');
  if (!el) return;
  if (!result) { el.innerHTML = '<div class="gp-stat-muted">No plan generated yet.</div>'; return; }
  const s = result.stats;
  const cards = [];
  const push = (label, value) => cards.push(`<div class="gp-stat-card"><div class="gp-stat-label">${label}</div><div class="gp-stat-value">${value}</div></div>`);
  push('Method', s.mode);
  if (s.lineCount !== undefined) push(s.method === 'ert' ? 'Segments' : (s.method === 'seismic' ? 'Spreads' : 'Lines'), s.lineCount);
  if (s.tieCount !== undefined && s.tieCount > 0) push('Tie lines', s.tieCount);
  if (s.stationCount !== undefined) push('Stations', s.stationCount);
  if (s.electrodeCount !== undefined) push('Electrodes', s.electrodeCount);
  if (s.geophoneCount !== undefined) push('Geophones', s.geophoneCount);
  if (s.shotCount !== undefined) push('Shots', s.shotCount);
  if (s.swathCount !== undefined && s.swathCount > 0) push('Swaths', s.swathCount);
  push('Total line-km', fmt(s.lineKm, 2));
  if (s.maxDepth !== undefined) push('Max depth (est.)', `${fmt(s.maxDepth, 1)} m`);
  if (s.nLevels !== undefined) push('n-levels', s.nLevels);
  if (s.dataPoints !== undefined) push('Datapoints', s.dataPoints);
  if (s.cableLayout) push('Cable layout', s.cableLayout);
  push('Est. field days', s.fieldDays || 0);
  el.innerHTML = cards.join('');
}

function renderTable(result) {
  const el = $('gp-table');
  if (!el) return;
  const wrap = $('gp-table-wrap');
  if (!result || !result.points || result.points.length === 0) {
    if (wrap) wrap.style.display = 'none';
    return;
  }
  if (wrap) wrap.style.display = '';
  const cols = ['line_id', 'point_id', 'chainage', 'easting', 'northing', 'utm_zone', 'latitude', 'longitude'];
  const headers = ['Line', 'Point ID', 'Chainage (m)', 'Easting', 'Northing', 'UTM zone', 'Latitude', 'Longitude'];
  let html = '<thead><tr>' + headers.map((h) => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
  const rows = result.points;
  const limit = 200;
  for (let i = 0; i < Math.min(limit, rows.length); i += 1) {
    const p = rows[i];
    const lat = p.latlng ? p.latlng[0] : p.lat;
    const lon = p.latlng ? p.latlng[1] : p.lon;
    html += `<tr><td>${p.line_id ?? ''}</td><td>${p.label ?? p.point_id ?? ''}</td><td>${fmt(p.chainage, 2)}</td><td>${fmt(p.easting, 2)}</td><td>${fmt(p.northing, 2)}</td><td>${p.utm_zone ?? ''}</td><td>${fmt(lat, 6)}</td><td>${fmt(lon, 6)}</td></tr>`;
  }
  if (rows.length > limit) html += `<tr><td colspan="8" class="gp-more">… ${rows.length - limit} more rows — export CSV for full data.</td></tr>`;
  html += '</tbody>';
  el.innerHTML = html;
}

function bindExports() {
  const handlers = {
    'gp-exp-kmz': () => exportKMZ(state.result, meta('kmz')),
    'gp-exp-kml': () => exportKML(state.result, meta('kml')),
    'gp-exp-gpx': () => exportGPX(state.result, meta('gpx')),
    'gp-exp-csv': () => exportCSV(state.result, meta('csv')),
    'gp-exp-geojson': () => exportGeoJSON(state.result, meta('geojson')),
    'gp-exp-dxf': () => exportDXF(state.result, meta('dxf'))
  };
  for (const [id, fn] of Object.entries(handlers)) {
    $(id)?.addEventListener('click', () => {
      if (!state.result) { alert('Generate a plan first.'); return; }
      try { fn(); } catch (err) { alert(err.message); }
    });
  }
}

function meta(ext) {
  return {
    name: `G-Geopylanner ${state.method} plan`,
    filename: `geopylanner_${state.method}`,
    utmZone: state.mapState?.crs ? state.mapState.crs : ''
  };
}

function bindPrint() {
  $('gp-print')?.addEventListener('click', () => {
    const body = $('gp-print-body');
    if (!body) { window.print(); return; }
    const r = state.result;
    if (!r) { alert('Generate a plan first.'); return; }
    const s = r.stats;
    const params = collectParams();
    const paramRows = params.map((p) => `<tr><th>${p[0]}</th><td>${p[1]}</td></tr>`).join('');
    const statRows = Object.entries(s).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
    body.innerHTML = `
      <h2>G-Geopylanner — ${s.mode} survey plan</h2>
      <p class="gp-print-attrib">${ATTRIBUTION}</p>
      <table class="gp-print-tbl"><caption>Parameters</caption>${paramRows}</table>
      <table class="gp-print-tbl"><caption>Statistics</caption>${statRows}</table>
      <p class="gp-print-foot">Generated ${new Date().toLocaleString()}</p>`;
    window.print();
  });
}

function collectParams() {
  const method = state.method;
  const rows = [['Method', method]];
  const ids = [];
  document.querySelectorAll(`.gp-method-panel[data-method="${method}"] .gp-subpanel[data-subtab="planner"] input, .gp-method-panel[data-method="${method}"] .gp-subpanel[data-subtab="planner"] select`)
    .forEach((el) => { if (el.id && el.type !== 'button') ids.push(el.id); });
  ids.push('gp-km-day');
  for (const id of ids) {
    const el = $(id);
    if (!el) continue;
    const label = el.dataset.label || el.id;
    rows.push([label, el.value]);
  }
  return rows;
}

function updateGenerateEnabled() {
  const btn = $('gp-generate');
  if (!btn) return;
  const s = state.mapState;
  const lineMethods = ['seismic', 'ert'];
  const ready = s ? (lineMethods.includes(state.method) ? s.surveyLines.length > 0 : s.boundaryUtm.length >= 3) : false;
  btn.disabled = !ready;
  btn.classList.toggle('is-disabled', !ready);
}

function bindMobile() {
  $('gp-sheet-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('gp-sheet-open');
  });
}

function toast(msg) {
  let el = document.getElementById('gp-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gp-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

// ----- GPR hyperbola velocity analyzer (kept as-is) -----
function bindGprAnalyzer() {
  const fileInput = $('gpr-image');
  const canvas = $('gpr-canvas');
  if (!fileInput || !canvas) return;
  fileInput.addEventListener('change', (e) => loadGPRImage(e));
  canvas.addEventListener('click', (e) => pickGPRPoint(e));
  $('gp-gpr-calc')?.addEventListener('click', calculateGPRVelocity);
  $('gp-gpr-clear')?.addEventListener('click', clearGPR);
  $('gp-gpr-exp')?.addEventListener('click', () => {
    if (!state.gpr.picks.length) { alert('No picks to export.'); return; }
    let csv = 'Pick,X_pixel,Y_pixel\n';
    state.gpr.picks.forEach((p, i) => { csv += `${i + 1},${p.x.toFixed(2)},${p.y.toFixed(2)}\n`; });
    downloadText(`gpr_picks_${Date.now()}.csv`, csv, 'text/csv');
  });
}

function loadGPRImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.gpr.image = img;
      const canvas = $('gpr-canvas');
      canvas.width = Math.min(img.width, 900);
      canvas.height = Math.min(img.height, 520);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function pickGPRPoint(event) {
  if (!state.gpr.image) { alert('Upload a radargram image first.'); return; }
  const canvas = $('gpr-canvas');
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  state.gpr.picks.push({ x, y });
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px Arial';
  ctx.fillText(String(state.gpr.picks.length), x + 8, y - 8);
  const info = $('gpr-picks-info');
  if (info) info.innerHTML = `<strong>Picks:</strong> ${state.gpr.picks.length} ${state.gpr.picks.length >= 3 ? '(ready)' : '(need ' + (3 - state.gpr.picks.length) + ' more)'}`;
}

function calculateGPRVelocity() {
  if (state.gpr.picks.length < 3) { alert('Pick at least 3 points: apex + two arms.'); return; }
  const canvas = $('gpr-canvas');
  const timeWindow = Number($('gpr-time').value) || 100;
  const traceSpacing = Number($('gpr-trace').value) || 0.05;
  const [apex, arm1, arm2] = state.gpr.picks;
  const r = gprVelocityFromPicks(apex, arm1, arm2, timeWindow, traceSpacing, canvas.width, canvas.height);
  const el = $('gpr-stats');
  if (!el) return;
  el.innerHTML = `
    <div class="gp-stat-card"><div class="gp-stat-label">EM velocity</div><div class="gp-stat-value">${fmt(r.velocity / 1e6, 2)} m/µs (${fmt(r.velocity, 0)} m/s)</div></div>
    <div class="gp-stat-card"><div class="gp-stat-label">Depth to reflector</div><div class="gp-stat-value">${fmt(r.depth, 2)} m</div></div>
    <div class="gp-stat-card"><div class="gp-stat-label">Relative permittivity εr</div><div class="gp-stat-value">${fmt(r.permittivity, 1)}</div></div>`;
}

function clearGPR() {
  state.gpr.picks = [];
  if (state.gpr.image) {
    const canvas = $('gpr-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(state.gpr.image, 0, 0, canvas.width, canvas.height);
  }
  const info = $('gpr-picks-info');
  if (info) info.innerHTML = '';
}

// ----- Design-math tab handlers (kept existing math) -----
window.gpDesign = {
  masw() {
    const ch = Number(val('d-masw-channels', 24));
    const sp = Number(val('d-masw-spacing', 2));
    const r = maswDepthEstimate(ch, sp);
    designOut('d-masw-out', [
      ['Profile length', `${fmt(r.profileLength, 1)} m`],
      ['Est. investigation depth', `${fmt(r.estimatedDepth, 1)} m`],
      ['Channels', ch],
      ['Channel spacing', `${fmt(sp, 2)} m`]
    ]);
  },
  refraction() {
    const ch = Number(val('d-ref-channels', 24));
    const sp = Number(val('d-ref-spacing', 5));
    const v = Number(val('d-ref-velocity', 1500));
    const r = refractionDepthEstimate(ch, sp, v);
    designOut('d-ref-out', [
      ['Profile length', `${fmt(r.profileLength, 1)} m`],
      ['Est. penetration depth', `${fmt(r.estimatedDepth, 1)} m`],
      ['Assumed P-wave velocity', `${fmt(v, 0)} m/s`]
    ]);
  },
  ert() {
    const n = Number(val('d-ert-electrodes', 48));
    const sp = Number(val('d-ert-spacing', 5));
    const arr = $('d-ert-array').value;
    const d = ertDepth(n, sp, arr);
    const lvl = ertLevels(n, arr);
    designOut('d-ert-out', [
      ['Array', ERT_ARRAY_LABELS[arr] || arr],
      ['Profile length', `${fmt(d.profileLength, 1)} m`],
      ['Max pseudo-depth', `${fmt(d.maxDepth, 1)} m (factor ${d.factor})`],
      ['n-levels', lvl.nLevels],
      ['Datapoints', lvl.dataPoints]
    ]);
  },
  gravity() {
    const L = Number(val('d-grav-length', 1000));
    const W = Number(val('d-grav-width', 1000));
    const sp = Number(val('d-grav-spacing', 50));
    const gt = $('d-grav-grid').value;
    const tgt = Number(val('d-grav-target', 0));
    const n = gravityStationCount(L, W, sp, gt);
    const rec = tgt > 0 ? gravitySpacingForTarget(tgt) : null;
    designOut('d-grav-out', [
      ['Area', `${L} × ${W} m`],
      ['Station spacing', `${fmt(sp, 1)} m`],
      ['Grid type', gt],
      ['Stations', n],
      ...(rec ? [['Recommended spacing for target', `${fmt(rec, 1)} m`]] : [])
    ]);
  },
  magnetic() {
    const L = Number(val('d-mag-length', 500));
    const W = Number(val('d-mag-width', 300));
    const ls = Number(val('d-mag-line-spacing', 50));
    const ts = Number(val('d-mag-tie-spacing', 500));
    const ss = Number(val('d-mag-station', 2));
    const r = magneticEstimate(L, W, ls, ts, ss);
    designOut('d-mag-out', [
      ['Survey lines', r.numLines],
      ['Tie lines', r.numTies],
      ['Total line-km', fmt(r.lineKm, 2)],
      ['Total stations', r.stationCount]
    ]);
  },
  refractionShots() {
    const ch = Number(val('d-ref-channels', 24));
    const sp = Number(val('d-ref-spacing', 5));
    const spread = (ch - 1) * sp;
    const spec = $('d-ref-shot-spec')?.value || '5shot';
    const offs = seismicShotOffsets(spec, spread);
    designOut('d-ref-shots-out', offs.map((o, i) => [`Shot ${i + 1} offset`, `${fmt(o, 1)} m`]));
  }
};

function designOut(id, rows) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = rows.map(([k, v]) => `<div class="gp-stat-card"><div class="gp-stat-label">${k}</div><div class="gp-stat-value">${v}</div></div>`).join('');
}

document.addEventListener('DOMContentLoaded', init);
