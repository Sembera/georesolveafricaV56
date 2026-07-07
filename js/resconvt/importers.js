import { toNumber } from './formats.js';

function splitCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

export function parseCSV(text) {
  const lines = String(text || '').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { rows: [], columns: [], mapping: {} };
  const first = splitCsvLine(lines[0]);
  const headerScore = first.filter((cell) => /lat|lon|east|north|name|desc|id|x|y/i.test(cell)).length;
  const hasHeader = headerScore > 0 || first.some((cell) => Number.isNaN(toNumber(cell)));
  const columns = hasHeader ? first.map((h, i) => h || `Column ${i + 1}`) : first.map((_, i) => `Column ${i + 1}`);
  const start = hasHeader ? 1 : 0;
  const mapping = detectColumns(columns);
  const rows = [];
  for (let i = start; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]);
    const props = {};
    columns.forEach((column, index) => { props[column] = cells[index] ?? ''; });
    const xValue = cells[mapping.x] ?? '';
    const yValue = cells[mapping.y] ?? '';
    rows.push({
      rowNumber: i + 1,
      x: toNumber(xValue),
      y: toNumber(yValue),
      name: cells[mapping.name] || props.Name || props.name || `Point ${rows.length + 1}`,
      description: cells[mapping.description] || props.Description || props.description || '',
      properties: props
    });
  }
  return { rows, columns, mapping };
}

export function detectColumns(columns) {
  const normalized = columns.map((column) => String(column).toLowerCase().replace(/[^a-z0-9]/g, ''));
  const find = (tests, fallback) => {
    const index = normalized.findIndex((name) => tests.some((test) => test.test(name)));
    return index >= 0 ? index : fallback;
  };
  const lon = find([/^lon/, /^long/, /longitude/, /^x$/, /easting/, /^east$/], 1);
  const lat = find([/^lat/, /latitude/, /^y$/, /northing/, /^north$/], 0);
  return {
    x: lon,
    y: lat,
    name: find([/^name$/, /^id$/, /pointid/, /label/], -1),
    description: find([/^desc/, /description/, /remarks/, /comment/], -1)
  };
}

export function parseGeoJSON(text) {
  const json = typeof text === 'string' ? JSON.parse(text) : text;
  const features = json.type === 'FeatureCollection' ? json.features : json.type === 'Feature' ? [json] : [{ type: 'Feature', geometry: json, properties: {} }];
  const rows = [];
  features.forEach((feature, index) => collectGeoJsonGeometry(feature.geometry, feature.properties || {}, rows, index));
  return { rows, columns: ['longitude', 'latitude', 'name', 'description'], mapping: { x: 0, y: 1, name: 2, description: 3 }, crs: 'EPSG:4326' };
}

function collectGeoJsonGeometry(geometry, properties, rows, index) {
  if (!geometry) return;
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((child) => collectGeoJsonGeometry(child, properties, rows, index));
    return;
  }
  const coords = geometry.coordinates;
  const addPoint = (coord, suffix = '') => rows.push({
    rowNumber: rows.length + 1,
    x: toNumber(coord[0]),
    y: toNumber(coord[1]),
    name: properties.name || properties.Name || `Feature ${index + 1}${suffix}`,
    description: properties.description || properties.Description || '',
    properties: { ...properties }
  });
  if (geometry.type === 'Point') addPoint(coords);
  if (geometry.type === 'MultiPoint' || geometry.type === 'LineString') coords.forEach((coord, i) => addPoint(coord, `-${i + 1}`));
  if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') coords.flat(1).forEach((coord, i) => addPoint(coord, `-${i + 1}`));
  if (geometry.type === 'MultiPolygon') coords.flat(2).forEach((coord, i) => addPoint(coord, `-${i + 1}`));
}

export function parseKML(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
  const rows = [];
  placemarks.forEach((pm, index) => {
    const name = pm.getElementsByTagName('name')[0]?.textContent?.trim() || `Placemark ${index + 1}`;
    const description = pm.getElementsByTagName('description')[0]?.textContent?.trim() || '';
    const coords = Array.from(pm.getElementsByTagName('coordinates'));
    coords.forEach((node, nodeIndex) => {
      String(node.textContent || '').trim().split(/\s+/).forEach((tuple, tupleIndex) => {
        const parts = tuple.split(',');
        if (parts.length >= 2) {
          rows.push({
            rowNumber: rows.length + 1,
            x: toNumber(parts[0]),
            y: toNumber(parts[1]),
            name: coords.length > 1 ? `${name}-${nodeIndex + 1}-${tupleIndex + 1}` : name,
            description,
            properties: { name, description }
          });
        }
      });
    });
  });
  return { rows, columns: ['longitude', 'latitude', 'name', 'description'], mapping: { x: 0, y: 1, name: 2, description: 3 }, crs: 'EPSG:4326' };
}

export function parseGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const nodes = [...Array.from(doc.getElementsByTagName('wpt')), ...Array.from(doc.getElementsByTagName('trkpt')), ...Array.from(doc.getElementsByTagName('rtept'))];
  const rows = nodes.map((node, index) => ({
    rowNumber: index + 1,
    x: toNumber(node.getAttribute('lon')),
    y: toNumber(node.getAttribute('lat')),
    name: node.getElementsByTagName('name')[0]?.textContent?.trim() || `GPX ${index + 1}`,
    description: node.getElementsByTagName('desc')[0]?.textContent?.trim() || '',
    properties: {}
  }));
  return { rows, columns: ['longitude', 'latitude', 'name', 'description'], mapping: { x: 0, y: 1, name: 2, description: 3 }, crs: 'EPSG:4326' };
}

export function parseByFileName(name, text) {
  const lower = String(name || '').toLowerCase();
  if (lower.endsWith('.geojson') || lower.endsWith('.json')) return parseGeoJSON(text);
  if (lower.endsWith('.kml')) return parseKML(text);
  if (lower.endsWith('.gpx')) return parseGPX(text);
  return parseCSV(text);
}
