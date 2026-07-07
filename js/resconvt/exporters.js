import { csvEscape } from './formats.js';

function validRows(results) {
  return results.filter((row) => !row.error && Number.isFinite(row.lon) && Number.isFinite(row.lat));
}

function xmlEscape(value) {
  return String(value ?? '').replace(/[<>&"']/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;'
  }[char]));
}

export function resultsToCSV(results) {
  const headers = ['Row', 'Name', 'Description', 'Input_X', 'Input_Y', 'Output_X', 'Output_Y', 'Output_CRS', 'Latitude', 'Longitude', 'DD', 'DMS', 'DDM', 'MGRS', 'Error'];
  const lines = [headers.join(',')];
  results.forEach((row) => {
    lines.push([
      row.rowNumber,
      row.name,
      row.description,
      row.inputX,
      row.inputY,
      row.outputX,
      row.outputY,
      row.outputCRS,
      row.lat,
      row.lon,
      row.outputDD,
      row.outputDMS,
      row.outputDDM,
      row.outputMGRS,
      row.error || ''
    ].map(csvEscape).join(','));
  });
  return `${lines.join('\n')}\n`;
}

export function resultsToGeoJSON(results) {
  return JSON.stringify({
    type: 'FeatureCollection',
    features: validRows(results).map((row) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [row.lon, row.lat] },
      properties: {
        name: row.name,
        description: row.description,
        output_crs: row.outputCRS,
        output_x: row.outputX,
        output_y: row.outputY,
        dd: row.outputDD,
        dms: row.outputDMS,
        ddm: row.outputDDM,
        mgrs: row.outputMGRS,
        ...row.properties
      }
    }))
  }, null, 2);
}

export function resultsToKML(results) {
  const placemarks = validRows(results).map((row) => `
    <Placemark>
      <name>${xmlEscape(row.name || `Point ${row.rowNumber}`)}</name>
      <description>${xmlEscape(row.description || `${row.outputCRS}: ${row.outputX}, ${row.outputY}`)}</description>
      <styleUrl>#convertedPoint</styleUrl>
      <Point><coordinates>${row.lon},${row.lat},0</coordinates></Point>
    </Placemark>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>G-Resconvt converted coordinates</name>
    <Style id="convertedPoint">
      <IconStyle><color>ff4da34d</color><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href></Icon></IconStyle>
      <LabelStyle><scale>0.85</scale></LabelStyle>
    </Style>${placemarks}
  </Document>
</kml>`;
}

export function resultsToGPX(results) {
  const waypoints = validRows(results).map((row) => `
  <wpt lat="${row.lat}" lon="${row.lon}">
    <name>${xmlEscape(row.name || `Point ${row.rowNumber}`)}</name>
    <desc>${xmlEscape(row.description || `${row.outputCRS}: ${row.outputX}, ${row.outputY}`)}</desc>
  </wpt>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="G-Resconvt" xmlns="http://www.topografix.com/GPX/1/1">${waypoints}
</gpx>`;
}

export function resultsToDXF(results) {
  const lines = ['0', 'SECTION', '2', 'HEADER', '0', 'ENDSEC', '0', 'SECTION', '2', 'TABLES', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'];
  validRows(results).forEach((row) => {
    const label = String(row.name || `Point ${row.rowNumber}`).replace(/[^ -~]/g, '');
    lines.push('0', 'POINT', '8', 'G-Resconvt-POINTS', '10', String(row.outputX), '20', String(row.outputY), '30', '0');
    lines.push('0', 'TEXT', '8', 'G-Resconvt-LABELS', '10', String(row.outputX), '20', String(row.outputY), '30', '0', '40', '2.5', '1', label);
  });
  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

export function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  try { window.showGResconvtLeadAfterExport?.(); } catch (error) { /* non-critical */ }
}

