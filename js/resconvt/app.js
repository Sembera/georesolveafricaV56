import { CRS_DEFS, registerProjections, isGeographic, projectionDetails, wgs84UtmCode } from './crs.js';
import { dmsToDD, ddmToDD, escapeHtml, formatDD, formatDDM, formatDMS, lonLatToMGRS, mgrsToLonLat, toNumber } from './formats.js';
import { parseByFileName, parseCSV } from './importers.js';
import { downloadText, resultsToCSV, resultsToDXF, resultsToGeoJSON, resultsToGPX, resultsToKML } from './exporters.js';

const state = {
  results: [],
  imported: null,
  map: null,
  pointLayer: null,
  previewLayer: null,
  singleMarker: null
};

const idle = window.requestIdleCallback || ((callback) => setTimeout(() => callback({ timeRemaining: () => 20 }), 0));

function $(id) {
  return document.getElementById(id);
}

function settings() {
  return {
    places: Math.max(0, Math.min(10, Number($('decimalPlaces')?.value || 6))),
    notation: $('hemisphereNotation')?.value || 'letters'
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function init() {
  if (!window.proj4) return showAlert('error', 'Projection library could not be loaded.');
  registerProjections();
  enhanceCRSSelectors();
  initMap();
  bindEvents();
  exposeGlobals();
  updateInputFields();
  updateProjectionDetails();
  renderHistory();
  applyHash();
}

function enhanceCRSSelectors() {
  ['inputCRS', 'outputCRS', 'batchInputCRS', 'batchOutputCRS'].forEach((id) => {
    const select = $(id);
    if (!select) return;
    if (!select.querySelector('option[value="UTM_AUTO"]')) {
      const group = document.createElement('optgroup');
      group.label = 'Utilities';
      const option = new Option('UTM (auto zone from lat/lon)', 'UTM_AUTO');
      group.appendChild(option);
      select.insertBefore(group, select.firstChild);
    }
    if (!select.querySelector('option[value="EPSG:10793"]')) {
      const group = document.createElement('optgroup');
      group.label = 'Uganda National Grid (UGRF)';
      ['EPSG:10792', 'EPSG:10793', 'EPSG:10794', 'EPSG:10795'].forEach((code) => group.appendChild(new Option(CRS_DEFS[code].name, code)));
      select.appendChild(group);
    }
  });
}

function bindEvents() {
  ['inputCRS', 'outputCRS', 'batchInputCRS', 'batchOutputCRS'].forEach((id) => $(id)?.addEventListener('change', updateProjectionDetails));
  $('decimalPlaces')?.addEventListener('change', () => state.results.length && displayResults());
  $('hemisphereNotation')?.addEventListener('change', () => state.results.length && displayResults());
  $('batchInput')?.addEventListener('input', debounce(previewPastedBatch, 250));
}

function exposeGlobals() {
  Object.assign(window, {
    switchTab,
    updateInputFields,
    convertSingle,
    convertBatch,
    clearSingleForm,
    clearBatchForm,
    clearResults,
    handleFileUpload,
    downloadCSV,
    downloadGeoJSON,
    downloadKML,
    downloadGPX,
    downloadDXF,
    copyFormat,
    copyToClipboard,
    swapCRS
  });
}

function initMap() {
  if (!window.L || !$('resconvtMap')) return;
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  });
  state.map = L.map('resconvtMap', { layers: [osm], renderer: L.canvas({ padding: 0.5 }) }).setView([0.3476, 32.5825], 7);
  L.control.layers({ OpenStreetMap: osm, 'Esri Satellite': satellite }).addTo(state.map);
  state.pointLayer = L.layerGroup().addTo(state.map);
  state.previewLayer = L.layerGroup().addTo(state.map);
  state.map.on('click', (event) => {
    $('inputFormat').value = 'dd';
    updateInputFields();
    $('inputCRS').value = 'EPSG:4326';
    $('latDD').value = event.latlng.lat.toFixed(8);
    $('lonDD').value = event.latlng.lng.toFixed(8);
    $('mapStatus').textContent = `Input filled from map: ${event.latlng.lat.toFixed(6)}, ${event.latlng.lng.toFixed(6)}`;
    convertSingle();
  });
  setTimeout(() => state.map.invalidateSize(), 100);
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((button) => button.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
  const index = tab === 'single' ? 1 : 2;
  document.querySelector(`.tab:nth-child(${index})`)?.classList.add('active');
  $(`${tab}-tab`)?.classList.add('active');
  updateProjectionDetails();
  setTimeout(() => state.map?.invalidateSize(), 50);
}

function updateInputFields() {
  const format = $('inputFormat')?.value || 'dd';
  ['DD', 'DMS', 'DDM', 'UTM', 'MGRS'].forEach((name) => {
    const node = $(`inputFields${name}`);
    if (node) node.style.display = name.toLowerCase() === format ? 'grid' : 'none';
  });
}

function updateProjectionDetails() {
  const batchActive = $('batch-tab')?.classList.contains('active');
  const from = batchActive ? ($('batchInputCRS')?.value || 'EPSG:4326') : ($('inputCRS')?.value || 'EPSG:4326');
  const to = batchActive ? ($('batchOutputCRS')?.value || 'EPSG:4326') : ($('outputCRS')?.value || 'EPSG:4326');
  if ($('proj4Details')) $('proj4Details').textContent = projectionDetails(from, to);
}

function readSingleInput() {
  const format = $('inputFormat').value;
  let x;
  let y;
  let source = $('inputCRS').value;
  if (format === 'dd') {
    y = toNumber($('latDD').value);
    x = toNumber($('lonDD').value);
  } else if (format === 'dms') {
    y = dmsToDD($('latDeg').value, $('latMin').value, $('latSec').value);
    x = dmsToDD($('lonDeg').value, $('lonMin').value, $('lonSec').value);
  } else if (format === 'ddm') {
    y = ddmToDD($('latDegDDM').value, $('latMinDDM').value);
    x = ddmToDD($('lonDegDDM').value, $('lonMinDDM').value);
  } else if (format === 'mgrs') {
    [x, y] = mgrsToLonLat($('mgrsInput').value);
    source = 'EPSG:4326';
  } else {
    x = toNumber($('easting').value);
    y = toNumber($('northing').value);
    source = resolveUtmInputCRS(source, $('utmZone').value, $('hemisphere').value);
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Enter valid coordinate values.');
  return { x, y, source, name: 'Single point', rowNumber: 1, properties: {} };
}

function resolveUtmInputCRS(source, zoneValue, hemisphere) {
  if (source !== 'EPSG:4326' && source !== 'UTM_AUTO') return source;
  const zone = Number(zoneValue);
  if (!Number.isInteger(zone) || zone < 1 || zone > 60) throw new Error('Enter a valid UTM zone for UTM input.');
  const code = `EPSG:${hemisphere === 'S' ? 327 : 326}${String(zone).padStart(2, '0')}`;
  ensureWgsUtmDef(code, zone, hemisphere);
  return code;
}

function convertSingle() {
  try {
    showLoader();
    clearAlerts();
    const input = readSingleInput();
    const result = convertRow(input, input.source, $('outputCRS').value, true);
    state.results = [result];
    displayResults();
    plotResults(state.results, true);
    saveHistory(result);
    updateHash(result);
    hideLoader();
  } catch (error) {
    hideLoader();
    showAlert('error', error.message);
  }
}

function convertRow(row, fromCRS, requestedToCRS, single = false) {
  const toCRS = requestedToCRS === 'UTM_AUTO' ? autoTargetCRS(row.x, row.y, fromCRS) : requestedToCRS;
  const output = transform(row.x, row.y, fromCRS, toCRS);
  const wgs = transform(row.x, row.y, fromCRS, 'EPSG:4326');
  const s = settings();
  const validLatLon = validateLatLon(wgs[1], wgs[0]);
  if (validLatLon) throw new Error(validLatLon);
  const outputIsGeographic = isGeographic(toCRS);
  const lat = wgs[1];
  const lon = wgs[0];
  return {
    rowNumber: row.rowNumber,
    name: row.name || (single ? 'Single point' : `Point ${row.rowNumber}`),
    description: row.description || '',
    inputX: Number(row.x).toFixed(s.places),
    inputY: Number(row.y).toFixed(s.places),
    outputX: Number(output[0]).toFixed(s.places),
    outputY: Number(output[1]).toFixed(s.places),
    outputCRS: toCRS,
    lat: Number(lat.toFixed(10)),
    lon: Number(lon.toFixed(10)),
    outputDD: outputIsGeographic ? formatDD(output[1], output[0], s.places, s.notation) : formatDD(lat, lon, s.places, s.notation),
    outputDMS: outputIsGeographic ? formatDMS(output[1], output[0], 2, s.notation) : formatDMS(lat, lon, 2, s.notation),
    outputDDM: outputIsGeographic ? formatDDM(output[1], output[0], 4, s.notation) : formatDDM(lat, lon, 4, s.notation),
    outputMGRS: lonLatToMGRS(lon, lat),
    properties: row.properties || {}
  };
}

function transform(x, y, fromCRS, toCRS) {
  if (fromCRS === toCRS) return [x, y];
  if (fromCRS === 'UTM_AUTO') fromCRS = 'EPSG:4326';
  if (!CRS_DEFS[fromCRS] && fromCRS !== 'EPSG:4326') throw new Error(`Unsupported input CRS: ${fromCRS}`);
  if (!CRS_DEFS[toCRS] && toCRS !== 'EPSG:4326') throw new Error(`Unsupported output CRS: ${toCRS}`);
  return window.proj4(fromCRS, toCRS, [x, y]);
}

function autoTargetCRS(x, y, fromCRS) {
  const [lon, lat] = transform(x, y, fromCRS === 'UTM_AUTO' ? 'EPSG:4326' : fromCRS, 'EPSG:4326');
  const code = wgs84UtmCode(lat, lon);
  const zone = Number(code.slice(-2));
  ensureWgsUtmDef(code, zone, lat >= 0 ? 'N' : 'S');
  return code;
}

function ensureWgsUtmDef(code, zone, hemisphere) {
  if (CRS_DEFS[code]) return;
  const south = hemisphere === 'S' ? ' +south' : '';
  CRS_DEFS[code] = {
    name: `WGS84 / UTM zone ${zone}${hemisphere} (${code})`,
    proj4: `+proj=utm +zone=${zone}${south} +datum=WGS84 +units=m +no_defs +type=crs`,
    zone,
    hemisphere
  };
  window.proj4.defs(code, CRS_DEFS[code].proj4);
}

function validateLatLon(lat, lon) {
  if (Math.abs(lat) > 90) return 'Latitude is outside -90 to 90 degrees after transformation.';
  if (Math.abs(lon) > 180) return 'Longitude is outside -180 to 180 degrees after transformation.';
  return null;
}

function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || '');
      $('batchInput').value = text;
      state.imported = parseByFileName(file.name, text);
      if (state.imported.crs) $('batchInputCRS').value = state.imported.crs;
      renderImportPreview(state.imported, file.name);
      previewRowsOnMap(state.imported.rows, $('batchInputCRS').value);
    } catch (error) {
      showAlert('error', `Could not read file: ${error.message}`);
    }
  };
  reader.readAsText(file);
}

function previewPastedBatch() {
  const text = $('batchInput')?.value || '';
  if (!text.trim()) return;
  try {
    state.imported = parseCSV(text);
    renderImportPreview(state.imported, 'Pasted CSV/text');
    previewRowsOnMap(state.imported.rows, $('batchInputCRS').value);
  } catch (error) {
    // Keep typing calm; conversion will surface the actionable error.
  }
}

function renderImportPreview(imported, name) {
  const panel = $('importPreviewPanel');
  const table = $('importPreviewTable');
  if (!panel || !table) return;
  panel.classList.add('active');
  $('importPreviewTitle').textContent = `${name}: ${imported.rows.length.toLocaleString()} detected point(s)`;
  const mapping = imported.mapping || {};
  $('columnMappingSummary').textContent = `Detected X/lon column ${Number(mapping.x) + 1}, Y/lat column ${Number(mapping.y) + 1}. Preview shows first 10 rows.`;
  const rows = imported.rows.slice(0, 10).map((row) => `<tr><td>${escapeHtml(row.rowNumber)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.x)}</td><td>${escapeHtml(row.y)}</td></tr>`).join('');
  table.innerHTML = `<table><thead><tr><th>Row</th><th>Name</th><th>X/Lon</th><th>Y/Lat</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function previewRowsOnMap(rows, crs) {
  if (!state.map || !state.previewLayer) return;
  state.previewLayer.clearLayers();
  const bounds = [];
  rows.slice(0, 5000).forEach((row) => {
    try {
      if (!Number.isFinite(row.x) || !Number.isFinite(row.y)) return;
      const [lon, lat] = transform(row.x, row.y, crs, 'EPSG:4326');
      if (validateLatLon(lat, lon)) return;
      bounds.push([lat, lon]);
      L.circleMarker([lat, lon], { radius: 3, color: '#345363', weight: 1, fillColor: '#f0b429', fillOpacity: 0.6, renderer: state.map.options.renderer }).addTo(state.previewLayer);
    } catch (error) { /* preview skips invalid rows */ }
  });
  if (bounds.length) state.map.fitBounds(bounds, { padding: [24, 24] });
  $('mapStatus').textContent = `Preview mapped ${bounds.length.toLocaleString()} point(s).`;
}

function convertBatch() {
  try {
    clearAlerts();
    showLoader();
    const imported = state.imported?.rows?.length ? state.imported : parseCSV($('batchInput').value);
    if (!imported.rows.length) throw new Error('No valid rows were found.');
    state.results = new Array(imported.rows.length);
    convertRowsChunked(imported.rows, $('batchInputCRS').value, $('batchOutputCRS').value);
  } catch (error) {
    hideLoader();
    showAlert('error', error.message);
  }
}

function convertRowsChunked(rows, fromCRS, toCRS) {
  const progressWrap = $('batchProgressWrap');
  const progressBar = $('batchProgressBar');
  progressWrap?.classList.add('active');
  if (progressBar) progressBar.style.width = '0%';
  let index = 0;
  let errors = 0;
  const started = performance.now();
  const step = (deadline) => {
    const stopAt = Math.min(rows.length, index + 750);
    while (index < stopAt || (deadline.timeRemaining?.() > 4 && index < rows.length)) {
      const row = rows[index];
      try {
        if (!Number.isFinite(row.x) || !Number.isFinite(row.y)) throw new Error('Missing or invalid coordinate values.');
        state.results[index] = convertRow(row, fromCRS, toCRS);
      } catch (error) {
        errors += 1;
        state.results[index] = errorResult(row, error.message, toCRS);
      }
      index += 1;
      if (index >= rows.length) break;
    }
    if (progressBar) progressBar.style.width = `${Math.round((index / rows.length) * 100)}%`;
    if (index < rows.length) {
      idle(step);
      return;
    }
    hideLoader();
    displayResults();
    plotResults(state.results);
    const elapsed = ((performance.now() - started) / 1000).toFixed(2);
    showAlert(errors ? 'warning' : 'success', `Converted ${rows.length.toLocaleString()} row(s) in ${elapsed}s. ${errors ? `${errors.toLocaleString()} row(s) were flagged.` : 'No row errors.'}`);
  };
  idle(step);
}

function errorResult(row, message, outputCRS) {
  return {
    rowNumber: row.rowNumber,
    name: row.name || `Point ${row.rowNumber}`,
    description: row.description || '',
    inputX: row.x,
    inputY: row.y,
    outputX: 'ERROR',
    outputY: 'ERROR',
    outputCRS,
    outputDD: 'ERROR',
    outputDMS: 'ERROR',
    outputDDM: 'ERROR',
    outputMGRS: 'ERROR',
    error: message,
    properties: row.properties || {}
  };
}

function displayResults() {
  const header = $('resultsHeader');
  const body = $('resultsBody');
  if (!header || !body) return;
  const headers = ['Row', 'Name', 'Input X', 'Input Y', 'Output CRS', 'Output X', 'Output Y', 'DD', 'DMS', 'DDM', 'MGRS', 'Error'];
  header.innerHTML = headers.map((name) => `<th>${name}</th>`).join('');
  const visible = state.results.slice(0, 1000);
  body.innerHTML = visible.map((row) => `<tr class="${row.error ? 'row-error' : ''}">
    <td>${escapeHtml(row.rowNumber)}</td>
    <td>${escapeHtml(row.name)}</td>
    <td>${escapeHtml(row.inputX)}</td>
    <td>${escapeHtml(row.inputY)}</td>
    <td>${escapeHtml(row.outputCRS)}</td>
    <td>${escapeHtml(row.outputX)}</td>
    <td>${escapeHtml(row.outputY)}</td>
    <td>${escapeHtml(row.outputDD)}</td>
    <td>${escapeHtml(row.outputDMS)}</td>
    <td>${escapeHtml(row.outputDDM)}</td>
    <td>${escapeHtml(row.outputMGRS)}</td>
    <td>${escapeHtml(row.error || '')}</td>
  </tr>`).join('');
  if (state.results.length > visible.length) {
    body.insertAdjacentHTML('beforeend', `<tr><td colspan="12">Showing first ${visible.length.toLocaleString()} of ${state.results.length.toLocaleString()} rows. Exports include all rows.</td></tr>`);
  }
  $('resultsSection').classList.add('active');
  $('resultsContent').style.display = 'block';
}

function plotResults(results, single = false) {
  if (!state.map || !state.pointLayer) return;
  state.pointLayer.clearLayers();
  state.previewLayer?.clearLayers();
  const bounds = [];
  results.forEach((row) => {
    if (row.error || !Number.isFinite(row.lat) || !Number.isFinite(row.lon)) return;
    const latlng = [row.lat, row.lon];
    bounds.push(latlng);
    const popup = `<strong>${escapeHtml(row.name)}</strong><br>CRS: ${escapeHtml(row.outputCRS)}<br>X/Y: ${escapeHtml(row.outputX)}, ${escapeHtml(row.outputY)}<br>DD: ${escapeHtml(row.outputDD)}<br>DMS: ${escapeHtml(row.outputDMS)}<br>DDM: ${escapeHtml(row.outputDDM)}<br>MGRS: ${escapeHtml(row.outputMGRS)}`;
    L.circleMarker(latlng, { radius: single ? 7 : 4, color: '#345363', weight: 1, fillColor: '#4DA34D', fillOpacity: 0.8, renderer: state.map.options.renderer }).bindPopup(popup).addTo(state.pointLayer);
  });
  if (bounds.length === 1) state.map.setView(bounds[0], Math.max(state.map.getZoom(), 13));
  if (bounds.length > 1) state.map.fitBounds(bounds, { padding: [24, 24] });
  $('mapStatus').textContent = `Mapped ${bounds.length.toLocaleString()} converted point(s).`;
}

function downloadCSV() {
  if (!state.results.length) return;
  downloadText(`converted_coordinates_${timestamp()}.csv`, resultsToCSV(state.results), 'text/csv');
}

function downloadGeoJSON() {
  if (!state.results.length) return;
  downloadText(`converted_coordinates_${timestamp()}.geojson`, resultsToGeoJSON(state.results), 'application/geo+json');
}

function downloadKML() {
  if (!state.results.length) return;
  downloadText(`converted_coordinates_${timestamp()}.kml`, resultsToKML(state.results), 'application/vnd.google-earth.kml+xml');
}

function downloadGPX() {
  if (!state.results.length) return;
  downloadText(`converted_coordinates_${timestamp()}.gpx`, resultsToGPX(state.results), 'application/gpx+xml');
}

function downloadDXF() {
  if (!state.results.length) return;
  downloadText(`converted_coordinates_${timestamp()}.dxf`, resultsToDXF(state.results), 'application/dxf');
}

async function copyFormat(format) {
  if (!state.results.length) return;
  const key = { dd: 'outputDD', dms: 'outputDMS', ddm: 'outputDDM', mgrs: 'outputMGRS' }[format] || 'outputDD';
  await navigator.clipboard.writeText(state.results.map((row) => row[key]).join('\n'));
  showAlert('success', `${format.toUpperCase()} values copied.`);
}

async function copyToClipboard() {
  if (!state.results.length) return;
  await navigator.clipboard.writeText(resultsToCSV(state.results));
  showAlert('success', 'Results table copied as CSV.');
}

function swapCRS() {
  const input = $('inputCRS');
  const output = $('outputCRS');
  const inputValue = input.value;
  input.value = output.value;
  output.value = inputValue;
  updateProjectionDetails();
}

function clearSingleForm() {
  ['latDD', 'lonDD', 'latDeg', 'latMin', 'latSec', 'lonDeg', 'lonMin', 'lonSec', 'latDegDDM', 'latMinDDM', 'lonDegDDM', 'lonMinDDM', 'easting', 'northing', 'utmZone', 'mgrsInput'].forEach((id) => { if ($(id)) $(id).value = ''; });
  clearResults();
}

function clearBatchForm() {
  $('batchInput').value = '';
  $('csvFile').value = '';
  state.imported = null;
  $('importPreviewPanel')?.classList.remove('active');
  $('batchProgressWrap')?.classList.remove('active');
  state.previewLayer?.clearLayers();
  clearResults();
}

function clearResults() {
  state.results = [];
  $('resultsSection')?.classList.remove('active');
  if ($('resultsContent')) $('resultsContent').style.display = 'none';
  state.pointLayer?.clearLayers();
  clearAlerts();
}

function showLoader() { $('loader')?.classList.add('active'); }
function hideLoader() { $('loader')?.classList.remove('active'); }
function clearAlerts() { if ($('alertContainer')) $('alertContainer').innerHTML = ''; }

function showAlert(type, message) {
  const container = $('alertContainer');
  if (!container) return;
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `<strong>${type === 'error' ? 'Error:' : type === 'warning' ? 'Warning:' : 'Success:'}</strong> ${escapeHtml(message)}`;
  container.appendChild(alert);
  if (type === 'success') setTimeout(() => alert.remove(), 5000);
}

function updateHash(row) {
  if (!row || !Number.isFinite(row.lat) || !Number.isFinite(row.lon)) return;
  const hash = `#${row.lat.toFixed(6)},${row.lon.toFixed(6)},${encodeURIComponent(row.outputCRS)}`;
  history.replaceState(null, '', hash);
  if ($('permalinkStatus')) $('permalinkStatus').textContent = hash;
}

function applyHash() {
  const hash = decodeURIComponent(location.hash.replace(/^#/, ''));
  const match = hash.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(.+)$/);
  if (!match) return;
  $('inputFormat').value = 'dd';
  updateInputFields();
  $('latDD').value = match[1];
  $('lonDD').value = match[2];
  $('inputCRS').value = 'EPSG:4326';
  if ([...$('outputCRS').options].some((option) => option.value === match[3])) $('outputCRS').value = match[3];
}

function saveHistory(row) {
  try {
    const historyRows = JSON.parse(localStorage.getItem('gResconvtHistory') || '[]');
    historyRows.unshift({ lat: row.lat, lon: row.lon, crs: row.outputCRS, x: row.outputX, y: row.outputY, when: new Date().toLocaleString() });
    localStorage.setItem('gResconvtHistory', JSON.stringify(historyRows.slice(0, 20)));
    renderHistory();
  } catch (error) { /* localStorage can be unavailable */ }
}

function renderHistory() {
  try {
    const rows = JSON.parse(localStorage.getItem('gResconvtHistory') || '[]');
    const panel = $('historyPanel');
    const list = $('historyList');
    if (!rows.length || !panel || !list) return;
    panel.classList.add('active');
    list.innerHTML = rows.slice(0, 20).map((row) => `<button class="btn-secondary compact-button" type="button" data-lat="${row.lat}" data-lon="${row.lon}" data-crs="${escapeHtml(row.crs)}">${escapeHtml(row.crs)} ${escapeHtml(row.x)}, ${escapeHtml(row.y)}</button>`).join('');
    list.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      $('inputFormat').value = 'dd';
      updateInputFields();
      $('inputCRS').value = 'EPSG:4326';
      $('outputCRS').value = button.dataset.crs;
      $('latDD').value = button.dataset.lat;
      $('lonDD').value = button.dataset.lon;
      convertSingle();
    }));
  } catch (error) { /* ignore */ }
}

function debounce(fn, delay) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


