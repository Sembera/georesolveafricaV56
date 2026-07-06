// G-Resolog Pro v2 - Export Module (ES Module)
// Handles PDF (vector), Excel, CSV, and Print output.
// CDN deps: svg2pdf.js, jsPDF, SheetJS — loaded dynamically.

import { StripLog } from './striplog.js';

// ─── Private Helpers ──────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

async function _ensurePDFLibs() {
  if (!window.jspdf) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js');
  }
  if (!window.svg2pdf) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/svg2pdf.js/2.2.3/svg2pdf.bundle.min.js');
  }
}

async function _ensureXLSX() {
  if (!window.XLSX) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  }
}

function _fmtDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function _safeStr(val) {
  if (val == null) return '';
  return String(val);
}

function _numOrEmpty(val) {
  if (val == null || val === '') return '';
  return val;
}

// ─── SVG Header Builder ───────────────────────────────────────

/**
 * Build an SVG header block that repeats at the top of every PDF page.
 * Returns an SVG <g> element as a string with data contained in a single group.
 */
function _makeSVGHeader(hole, project, pageNum, totalPages, pageW, headerH) {
  const logoText = 'GEORESOLVE AFRICA';
  const headerW = pageW;
  const fontSize = 2.8;  // mm
  const lineH = 4.5;     // mm line spacing
  const marginX = 5;
  let y = 4;

  function textLine(leftLabel, leftVal, rightLabel, rightVal) {
    const left = `${leftLabel}${leftVal}`;
    const right = `${rightLabel || ''}${rightVal || ''}`;
    let html = '';
    html += `<text x="${marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#000">${_escXml(left)}</text>`;
    if (right) {
      html += `<text x="${headerW - marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#000" text-anchor="end">${_escXml(right)}</text>`;
    }
    y += lineH;
    return html;
  }

  let html = `<g class="pdf-header">`;

  // Logo
  html += `<text x="${marginX}" y="${y}" font-family="Arial, sans-serif" font-size="4" font-weight="bold" fill="#1a5276">${_escXml(logoText)}</text>`;
  y += lineH + 2;

  // Divider
  html += `<line x1="${marginX}" y1="${y}" x2="${headerW - marginX}" y2="${y}" stroke="#1a5276" stroke-width="0.3"/>`;
  y += 3;

  // Project / Hole line
  html += textLine('Project: ', project.name || '', 'Hole: ', hole.name || '');

  // Client / Job No line
  html += textLine('Client: ', project.client || '', 'Job No: ', project.jobNo || '');

  // Coordinates line
  html += textLine('Easting: ', _numOrEmpty(hole.easting), 'Northing: ', _numOrEmpty(hole.northing));
  html += textLine('RL: ', _numOrEmpty(hole.rl), '', '');

  // Method / Dia / Depth line
  html += textLine('Method: ', hole.drillMethod || '', 'Dia: ', _numOrEmpty(hole.dia));
  html += textLine('Depth: ', hole.depth ? `${hole.depth}m` : '', '', '');

  // Date / Logged / Checked line
  html += textLine('Date: ', hole.startDate || '', 'Logged: ', hole.loggedBy || '');
  html += textLine('Checked: ', hole.checkedBy || '', '', '');

  // Page number
  y += 1;
  html += `<text x="${headerW - marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#555" text-anchor="end">Page ${pageNum} of ${totalPages}</text>`;

  y += 3;
  // Bottom border of header
  html += `<line x1="${marginX}" y1="${y}" x2="${headerW - marginX}" y2="${y}" stroke="#333" stroke-width="0.5"/>`;

  html += `</g>`;
  return html;
}

/**
 * Build an SVG footer block for the last page (signature lines).
 */
function _makeSVGFooter(pageW, footerH) {
  const marginX = 5;
  const fontSize = 2.5;
  let y = 4;

  let html = `<g class="pdf-footer">`;

  // Top divider
  html += `<line x1="${marginX}" y1="${y}" x2="${pageW - marginX}" y2="${y}" stroke="#333" stroke-width="0.3"/>`;
  y += 4;

  // App branding
  html += `<text x="${marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#555">G-Resolog Pro v2 — Georesolve Africa</text>`;
  html += `<text x="${pageW - marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#555" text-anchor="end">Generated: ${_fmtDate()}</text>`;
  y += 6;

  // Signature lines
  html += `<text x="${marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#333">Logged by: _________________________</text>`;
  html += `<text x="${pageW / 2 + marginX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#333">Checked by: _________________________</text>`;

  html += `</g>`;
  return html;
}

function _escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── CSV Helpers ──────────────────────────────────────────────

function _escapeCSV(val) {
  const str = _safeStr(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCSV(filename, csvString) {
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  _downloadBlob(blob, filename);
}

// ─── Exports Object ───────────────────────────────────────────

export const Exports = {

  // ─── PDF Export (Vector) ────────────────────────────────────

  /**
   * Generate a vector PDF borehole log with text-selectable content.
   *
   * @param {Object} hole       - Hole data object
   * @param {Array}  intervals   - Sorted interval array
   * @param {Array}  fieldTests  - Field test array
   * @param {Array}  samples     - Sample array
   * @param {Array}  waterStrikes- Water strike array
   * @param {Array}  casing      - Casing array
   * @param {Object} project     - Project data object
   * @param {Object} options     - { scale, a4, landscape, includeHeader, includeFooter }
   */
  async exportPDF(hole, intervals, fieldTests, samples, waterStrikes, casing, project, options = {}) {
    try {
      const opts = {
        scale: 100,
        a4: true,
        landscape: true,
        includeHeader: true,
        includeFooter: true,
        ...options
      };

      // Show a loading indicator if available
      const loadingEl = document.getElementById('save-indicator');
      if (loadingEl) {
        loadingEl.textContent = 'Generating PDF\u2026';
        loadingEl.style.display = 'block';
      }

      // Load CDN libraries
      await _ensurePDFLibs();

      const { jspdf } = window;
      // eslint-disable-next-line no-undef
      const svg2pdf = window.svg2pdf;

      // Page dimensions in mm
      const pageW = opts.landscape ? 297 : 210;
      const pageH = opts.landscape ? 210 : 297;

      // Fixed header / footer heights (mm)
      const headerHeight = opts.includeHeader ? 30 : 0;
      const footerHeight = opts.includeFooter ? 15 : 0;

      // Usable log area
      const usableH = pageH - headerHeight - footerHeight;

      // Scale: mm per metre of depth
      const mmPerM = opts.scale / 100;
      // How much depth fits per page
      const depthPerPage = usableH / mmPerM;

      // Determine total depth
      let totalDepth = hole.depth || 0;
      if (!totalDepth && intervals.length > 0) {
        totalDepth = Math.max(...intervals.map(i => i.baseDepth != null ? i.baseDepth : (i.topDepth != null ? i.topDepth : 0)));
      }
      if (totalDepth <= 0) {
        totalDepth = 10; // fallback
      }

      // Split into pages
      const pages = [];
      let currentTop = 0;
      while (currentTop < totalDepth) {
        const pageBottom = Math.min(currentTop + depthPerPage, totalDepth);

        // Filter intervals that overlap this page's depth range
        const pageIntervals = intervals.filter(iv => {
          const t = iv.topDepth != null ? iv.topDepth : 0;
          const b = iv.baseDepth != null ? iv.baseDepth : t;
          return t < pageBottom && b > currentTop;
        }).map(iv => {
          // Clone and clamp to page range
          const t = Math.max(iv.topDepth != null ? iv.topDepth : 0, currentTop);
          const b = Math.min(iv.baseDepth != null ? iv.baseDepth : t, pageBottom);
          return { ...iv, topDepth: t, baseDepth: b };
        });

        // Filter field tests for this page
        const pageFieldTests = fieldTests.filter(ft => {
          const d = ft.depth != null ? ft.depth : 0;
          return d >= currentTop && d < pageBottom;
        });

        // Filter samples for this page
        const pageSamples = samples.filter(s => {
          const st = s.topDepth != null ? s.topDepth : 0;
          const sb = s.baseDepth != null ? s.baseDepth : st;
          return st < pageBottom && sb > currentTop;
        });

        // Filter water strikes for this page
        const pageWaterStrikes = waterStrikes.filter(ws => {
          const d = ws.depth != null ? ws.depth : 0;
          return d >= currentTop && d < pageBottom;
        });

        // Filter casing for this page
        const pageCasing = casing.filter(c => {
          const ct = c.topDepth != null ? c.topDepth : 0;
          const cb = c.baseDepth != null ? c.baseDepth : ct;
          return ct < pageBottom && cb > currentTop;
        });

        pages.push({
          topDepth: currentTop,
          bottomDepth: pageBottom,
          intervals: pageIntervals,
          fieldTests: pageFieldTests,
          samples: pageSamples,
          waterStrikes: pageWaterStrikes,
          casing: pageCasing
        });

        currentTop = pageBottom;
      }

      const totalPages = pages.length;

      // Create jsPDF document
      const doc = new jspdf.jsPDF({
        orientation: opts.landscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];

        if (i > 0) {
          doc.addPage();
        }

        // Build the SVG for this page
        let svgContent = '';

        // Header
        if (opts.includeHeader) {
          svgContent += _makeSVGHeader(hole, project, i + 1, totalPages, pageW, headerHeight);
        }

        // Log body — use StripLog to render SVG for this page's depth range
        const logSVG = await _renderLogSVGForPage(
          page, hole, project, pageW, usableH, headerHeight, mmPerM
        );
        svgContent += logSVG;

        // Footer on last page
        if (opts.includeFooter && i === totalPages - 1) {
          svgContent += _makeSVGFooter(pageW, footerHeight);
        }

        // Wrap in full SVG
        const fullSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageW}mm" height="${pageH}mm" viewBox="0 0 ${pageW} ${pageH}">${svgContent}</svg>`;

        // Convert SVG to PDF via svg2pdf
        await svg2pdf(fullSVG, doc, {
          x: 0,
          y: 0,
          width: pageW,
          height: pageH
        });
      }

      // Save
      const dateStr = _fmtDate();
      const holeName = (hole.name || 'BH').replace(/[^a-zA-Z0-9_-]/g, '_');
      const projName = (project.name || 'Project').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${holeName}_${projName}_Log_${dateStr}.pdf`);

      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
    } catch (err) {
      console.error('exportPDF error:', err);
      const loadingEl = document.getElementById('save-indicator');
      if (loadingEl) {
        loadingEl.textContent = 'PDF generation failed';
        loadingEl.style.display = 'block';
        setTimeout(() => { loadingEl.style.display = 'none'; }, 3000);
      }
    }
  },

  // ─── Excel Export ───────────────────────────────────────────

  /**
   * Export all borehole data as a multi-sheet Excel workbook.
   *
   * @param {Object} project
   * @param {Array}  holes
   * @param {Array}  allIntervals    - flat array of all intervals across all holes
   * @param {Array}  allFieldTests
   * @param {Array}  allSamples
   * @param {Array}  allWaterStrikes
   */
  async exportExcel(project, holes, allIntervals, allFieldTests, allSamples, allWaterStrikes) {
    try {
      await _ensureXLSX();

      const XLSX = window.XLSX;
      const wb = XLSX.utils.book_new();

      // --- Sheet 1: Holes ---
      const holesData = [
        ['Name', 'Type', 'Easting', 'Northing', 'RL', 'Depth (m)', 'Method',
          'Diameter (mm)', 'Inclination', 'Azimuth', 'Start Date', 'Logged By', 'Checked By']
      ];
      for (const h of (holes || [])) {
        holesData.push([
          _safeStr(h.name),
          _safeStr(h.type),
          _numOrEmpty(h.easting),
          _numOrEmpty(h.northing),
          _numOrEmpty(h.rl),
          _numOrEmpty(h.depth),
          _safeStr(h.drillMethod),
          _numOrEmpty(h.dia),
          _numOrEmpty(h.inclination),
          _numOrEmpty(h.azimuth),
          _safeStr(h.startDate),
          _safeStr(h.loggedBy),
          _safeStr(h.checkedBy)
        ]);
      }
      _addSheet(wb, XLSX, holesData, 'Holes');

      // --- Sheet 2: Intervals ---
      const intervalsData = [
        ['Hole', 'Top (m)', 'Base (m)', 'Thickness (m)', 'Description', 'Pattern',
          'Weathering', 'Strength', 'Recovery%', 'RQD%', 'TCR%', 'SCR%',
          'Is(50) MPa', 'Defect Spacing']
      ];
      // Build a hole name lookup
      const holeNameMap = {};
      if (holes) {
        for (const h of holes) {
          holeNameMap[h.id] = h.name;
        }
      }
      for (const iv of (allIntervals || [])) {
        intervalsData.push([
          _safeStr(holeNameMap[iv.holeId] || iv.holeId),
          _numOrEmpty(iv.topDepth),
          _numOrEmpty(iv.baseDepth),
          _numOrEmpty(iv.baseDepth != null && iv.topDepth != null
            ? (iv.baseDepth - iv.topDepth).toFixed(2) : ''),
          _safeStr(iv.description),
          _safeStr(iv.pattern),
          _safeStr(iv.weathering),
          _safeStr(iv.strength),
          _numOrEmpty(iv.recovery),
          _numOrEmpty(iv.rqd),
          _numOrEmpty(iv.tcr),
          _numOrEmpty(iv.scr),
          _numOrEmpty(iv.is50),
          _safeStr(iv.defectSpacing)
        ]);
      }
      _addSheet(wb, XLSX, intervalsData, 'Intervals');

      // --- Sheet 3: FieldTests ---
      const ftData = [['Hole', 'Depth (m)', 'Type', 'Data']];
      for (const ft of (allFieldTests || [])) {
        ftData.push([
          _safeStr(holeNameMap[ft.holeId] || ft.holeId),
          _numOrEmpty(ft.depth),
          _safeStr(ft.type),
          _safeStr(typeof ft.data === 'object' ? JSON.stringify(ft.data) : ft.data)
        ]);
      }
      _addSheet(wb, XLSX, ftData, 'FieldTests');

      // --- Sheet 4: Samples ---
      const samplesData = [['Hole', 'Type', 'Top (m)', 'Base (m)', 'Label', 'Date']];
      for (const s of (allSamples || [])) {
        samplesData.push([
          _safeStr(holeNameMap[s.holeId] || s.holeId),
          _safeStr(s.type),
          _numOrEmpty(s.topDepth),
          _numOrEmpty(s.baseDepth),
          _safeStr(s.label),
          _safeStr(s.date)
        ]);
      }
      _addSheet(wb, XLSX, samplesData, 'Samples');

      // --- Sheet 5: Water ---
      const waterData = [['Hole', 'Depth (m)', 'Rest Level (m)', 'Date', 'Remarks']];
      for (const ws of (allWaterStrikes || [])) {
        waterData.push([
          _safeStr(holeNameMap[ws.holeId] || ws.holeId),
          _numOrEmpty(ws.depth),
          _numOrEmpty(ws.restLevel),
          _safeStr(ws.date),
          _safeStr(ws.remarks)
        ]);
      }
      _addSheet(wb, XLSX, waterData, 'Water');

      // Save
      const dateStr = _fmtDate();
      const projName = (project.name || 'Project').replace(/[^a-zA-Z0-9_-]/g, '_');
      XLSX.writeFile(wb, `${projName}_BoreholeLogs_${dateStr}.xlsx`);
    } catch (err) {
      console.error('exportExcel error:', err);
    }
  },

  // ─── CSV Export ─────────────────────────────────────────────

  /**
   * Export data as separate CSV files, one per table.
   *
   * @param {Object} project
   * @param {Array}  holes
   * @param {Array}  allIntervals
   * @param {Array}  allFieldTests
   * @param {Array}  allSamples
   * @param {Array}  allWaterStrikes
   */
  exportCSV(project, holes, allIntervals, allFieldTests, allSamples, allWaterStrikes) {
    try {
      const projNameBase = (project.name || 'Project').replace(/[^a-zA-Z0-9_-]/g, '_');

      // Hole name lookup
      const holeNameMap = {};
      if (holes) {
        for (const h of holes) {
          holeNameMap[h.id] = h.name;
        }
      }

      // Holes
      let csv = 'Name,Type,Easting,Northing,RL,Depth (m),Method,Diameter (mm),Inclination,Azimuth,Start Date,Logged By,Checked By\r\n';
      for (const h of (holes || [])) {
        csv += [
          _escapeCSV(h.name),
          _escapeCSV(h.type),
          _numOrEmpty(h.easting),
          _numOrEmpty(h.northing),
          _numOrEmpty(h.rl),
          _numOrEmpty(h.depth),
          _escapeCSV(h.drillMethod),
          _numOrEmpty(h.dia),
          _numOrEmpty(h.inclination),
          _numOrEmpty(h.azimuth),
          _escapeCSV(h.startDate),
          _escapeCSV(h.loggedBy),
          _escapeCSV(h.checkedBy)
        ].join(',') + '\r\n';
      }
      downloadCSV(`${projNameBase}_Holes.csv`, csv);

      // Intervals
      csv = 'Hole,Top (m),Base (m),Thickness (m),Description,Pattern,Weathering,Strength,Recovery%,RQD%,TCR%,SCR%,Is(50) MPa,Defect Spacing\r\n';
      for (const iv of (allIntervals || [])) {
        csv += [
          _escapeCSV(holeNameMap[iv.holeId] || iv.holeId),
          _numOrEmpty(iv.topDepth),
          _numOrEmpty(iv.baseDepth),
          _numOrEmpty(iv.baseDepth != null && iv.topDepth != null
            ? (iv.baseDepth - iv.topDepth).toFixed(2) : ''),
          _escapeCSV(iv.description),
          _escapeCSV(iv.pattern),
          _escapeCSV(iv.weathering),
          _escapeCSV(iv.strength),
          _numOrEmpty(iv.recovery),
          _numOrEmpty(iv.rqd),
          _numOrEmpty(iv.tcr),
          _numOrEmpty(iv.scr),
          _numOrEmpty(iv.is50),
          _escapeCSV(iv.defectSpacing)
        ].join(',') + '\r\n';
      }
      downloadCSV(`${projNameBase}_Intervals.csv`, csv);

      // FieldTests
      csv = 'Hole,Depth (m),Type,Data\r\n';
      for (const ft of (allFieldTests || [])) {
        csv += [
          _escapeCSV(holeNameMap[ft.holeId] || ft.holeId),
          _numOrEmpty(ft.depth),
          _escapeCSV(ft.type),
          _escapeCSV(typeof ft.data === 'object' ? JSON.stringify(ft.data) : ft.data)
        ].join(',') + '\r\n';
      }
      downloadCSV(`${projNameBase}_FieldTests.csv`, csv);

      // Samples
      csv = 'Hole,Type,Top (m),Base (m),Label,Date\r\n';
      for (const s of (allSamples || [])) {
        csv += [
          _escapeCSV(holeNameMap[s.holeId] || s.holeId),
          _escapeCSV(s.type),
          _numOrEmpty(s.topDepth),
          _numOrEmpty(s.baseDepth),
          _escapeCSV(s.label),
          _escapeCSV(s.date)
        ].join(',') + '\r\n';
      }
      downloadCSV(`${projNameBase}_Samples.csv`, csv);

      // Water
      csv = 'Hole,Depth (m),Rest Level (m),Date,Remarks\r\n';
      for (const ws of (allWaterStrikes || [])) {
        csv += [
          _escapeCSV(holeNameMap[ws.holeId] || ws.holeId),
          _numOrEmpty(ws.depth),
          _numOrEmpty(ws.restLevel),
          _escapeCSV(ws.date),
          _escapeCSV(ws.remarks)
        ].join(',') + '\r\n';
      }
      downloadCSV(`${projNameBase}_Water.csv`, csv);
    } catch (err) {
      console.error('exportCSV error:', err);
    }
  },

  // ─── Print Stylesheet ───────────────────────────────────────

  /**
   * Inject a @media print stylesheet to enable clean Ctrl+P output.
   * Safe to call multiple times — replaces any existing injected style.
   */
  setupPrintStyles() {
    const existing = document.getElementById('resolog-print-styles');
    if (existing) {
      existing.remove();
    }

    const style = document.createElement('style');
    style.id = 'resolog-print-styles';
    style.textContent = `
@media print {
  /* Hide UI chrome */
  .toolbar,
  #project-manager,
  #left-panel,
  .file-operations,
  .preloaded-data,
  .btn,
  .navbar,
  footer,
  .clients-section,
  #save-indicator,
  #theme-toggle {
    display: none !important;
  }

  /* Full-width log area */
  #right-panel {
    max-width: none !important;
    width: 100% !important;
  }
  #right-panel .panel {
    max-height: none !important;
    overflow: visible !important;
  }

  /* Page layout */
  @page {
    size: A4 landscape;
    margin: 10mm;
  }
  body {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* SVG scaling */
  #striplog-container svg {
    max-width: 100%;
    height: auto;
  }
}
    `;
    document.head.appendChild(style);
  }
};

// ─── Private: Sheet helper for Excel ──────────────────────────

function _addSheet(wb, XLSX, rows, name) {
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-calculate column widths based on content
  const colWidths = [];
  for (let c = 0; c < rows[0].length; c++) {
    let maxLen = 0;
    for (let r = 0; r < rows.length; r++) {
      const val = _safeStr(rows[r][c]);
      if (val.length > maxLen) maxLen = val.length;
    }
    colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 8), 60) });
  }
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, name);
}

// ─── Private: SVG Log Renderer ────────────────────────────────

/**
 * Generate SVG for a single page's worth of the borehole log.
 * Tries to use StripLog.render() if available; falls back to a
 * simple depth-axis placeholder.
 */
async function _renderLogSVGForPage(page, hole, project, pageW, usableH, headerOffsetY, mmPerM) {
  const bodyY = headerOffsetY;

  try {
    // Attempt to use the StripLog module to render this depth range
    if (StripLog && typeof StripLog.render === 'function') {
      const svgString = await StripLog.render({
        hole,
        intervals: page.intervals,
        fieldTests: page.fieldTests,
        samples: page.samples,
        waterStrikes: page.waterStrikes,
        casing: page.casing,
        project,
        options: {
          width: pageW,
          height: usableH,
          x: 0,
          y: bodyY,
          topDepth: page.topDepth,
          bottomDepth: page.bottomDepth,
          mmPerMetre: mmPerM
        }
      });
      return svgString;
    }
  } catch (e) {
    console.warn('StripLog.render() not available or failed, using fallback SVG:', e);
  }

  // Fallback: simple depth-axis placeholder
  return _fallbackLogSVG(page, pageW, usableH, bodyY, mmPerM);
}

function _fallbackLogSVG(page, pageW, usableH, bodyY, mmPerM) {
  let html = `<g class="log-body-fallback">`;

  // Draw a border around the log area
  html += `<rect x="0" y="${bodyY}" width="${pageW}" height="${usableH}" fill="none" stroke="#ccc" stroke-width="0.3"/>`;

  // Draw depth scale on the left
  const scaleX = 10;
  const tickEveryM = 1; // major tick every 1m
  let depth = page.topDepth;

  while (depth <= page.bottomDepth) {
    const y = bodyY + (depth - page.topDepth) * mmPerM;
    const isMajor = (Math.abs(depth - Math.round(depth)) < 0.001);

    if (isMajor) {
      html += `<line x1="${scaleX}" y1="${y}" x2="${scaleX + 5}" y2="${y}" stroke="#333" stroke-width="0.25"/>`;
      html += `<text x="${scaleX + 6}" y="${y + 1}" font-family="Arial, sans-serif" font-size="2.2" fill="#333">${depth.toFixed(1)}</text>`;
    } else {
      html += `<line x1="${scaleX}" y1="${y}" x2="${scaleX + 3}" y2="${y}" stroke="#999" stroke-width="0.15"/>`;
    }

    depth += 0.5;
  }

  // Render intervals as colored rectangles with labels
  const logStartX = 25;
  const logWidth = pageW - logStartX - 5;

  for (const iv of (page.intervals || [])) {
    const t = iv.topDepth != null ? iv.topDepth : page.topDepth;
    const b = iv.baseDepth != null ? iv.baseDepth : t;
    if (b <= t) continue;

    const rectY = bodyY + (t - page.topDepth) * mmPerM;
    const rectH = Math.max((b - t) * mmPerM, 1);

    const color = _patternColor(iv.pattern);
    html += `<rect x="${logStartX}" y="${rectY}" width="${logWidth}" height="${rectH}" fill="${color}" stroke="#555" stroke-width="0.2"/>`;

    // Description label
    if (iv.description && rectH > 5) {
      const truncated = iv.description.length > 80 ? iv.description.substring(0, 77) + '...' : iv.description;
      html += `<text x="${logStartX + 2}" y="${rectY + rectH / 2 + 1}" font-family="Arial, sans-serif" font-size="2.4" fill="#111">${_escXml(truncated)}</text>`;
    }

    // Depth labels
    html += `<text x="${logStartX + 2}" y="${rectY + 3}" font-family="Arial, sans-serif" font-size="2" fill="#444">${_escXml(_safeStr(t))}</text>`;
    html += `<text x="${logStartX + logWidth - 2}" y="${rectY + rectH - 1}" font-family="Arial, sans-serif" font-size="2" fill="#444" text-anchor="end">${_escXml(_safeStr(b))}</text>`;
  }

  html += `</g>`;
  return html;
}

function _patternColor(pattern) {
  const colors = {
    clay: '#d4a76a',
    silt: '#c9b87e',
    sand: '#f0d58c',
    gravel: '#e0c068',
    rock: '#a0a0a0',
    sandstone: '#d4b896',
    limestone: '#b0c4de',
    shale: '#8b8b83',
    granite: '#c0a0a0',
    basalt: '#6b6b6b',
    concrete: '#c8c8c8',
    topsoil: '#4a3728',
    fill: '#d0d0d0',
    water: '#4a90d9',
    default: '#e8dcc8'
  };
  return colors[pattern] || colors['default'];
}