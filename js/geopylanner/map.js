// map.js — shared Leaflet map workspace: drawing, paste, file import, live stats, plan rendering.
// Strict ES module. Depends on global L, window.proj4.

import {
  registerProjections, detectUtmCrs, latlngsToUtm, utmToLatlngs, inverseToLonLat,
  polygonAreaUtm, polygonPerimeterUtm, boundingBoxUtm, minimumBoundingRectangle,
  utmZoneLabel, isGeographic, parseCoordinateBlock, coordsToLatlngs, fmt
} from './geometry.js';

const TILES = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 20, attribution: '&copy; OpenStreetMap contributors' }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 20, attribution: '&copy; Esri, Maxar, Earthstar Geographics' }
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 17, attribution: '&copy; OpenTopoMap (CC-BY-SA)' }
  }
};

export class MapWorkspace {
  constructor(containerId, statsId) {
    this.containerId = containerId;
    this.statsId = statsId;
    this.map = null;
    this.baseLayers = {};
    this.boundaryLayer = null;       // polygon
    this.boundaryVerts = [];         // latlng ring
    this.linesLayer = null;          // layerGroup of polylines
    this.surveyLines = [];           // [{ latlngs, utm, name }]
    this.resultLayer = null;         // layerGroup for planner output
    this.markersLayer = null;
    this.utmCrs = null;
    this.geomanReady = false;
    this.onChange = null;            // callback(state)
    this.drawMode = 'none';          // 'polygon' | 'line' | 'none'
  }

  init() {
    registerProjections();
    const el = document.getElementById(this.containerId);
    if (!el) throw new Error(`Map container #${this.containerId} not found`);
    this.map = L.map(el, { zoomControl: true, preferCanvas: true }).setView([0.3476, 32.5825], 13);
    this.baseLayers.osm = L.tileLayer(TILES.osm.url, TILES.osm.options).addTo(this.map);
    this.baseLayers.satellite = L.tileLayer(TILES.satellite.url, TILES.satellite.options);
    this.baseLayers.topo = L.tileLayer(TILES.topo.url, TILES.topo.options);
    L.control.layers(this.baseLayers, { 'Survey result': this._ensureResultLayer() }, { position: 'topright' }).addTo(this.map);
    L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(this.map);

    this._ensureResultLayer();
    this.linesLayer = L.layerGroup().addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);

    this._initGeoman();
    this._initMapClickDraw();
    // invalidate size after layout settles
    setTimeout(() => this.map.invalidateSize(), 200);
  }

  _ensureResultLayer() {
    if (!this.resultLayer) this.resultLayer = L.layerGroup().addTo(this.map);
    return this.resultLayer;
  }

  _initGeoman() {
    if (!window.L || typeof window.L.PM !== 'undefined' && window.L.PM) {
      this.geomanReady = true;
    }
    if (window.L && window.L.PM) {
      this.map.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawMarker: false,
        drawText: false,
        cutPolygon: false,
        rotateMode: false
      });
      this.map.pm.setLang('en');
      this.geomanReady = true;
      this.map.on('pm:create', (e) => this._onGeomanCreate(e));
    } else {
      this.geomanReady = false;
    }
  }

  // Fallback click-to-draw when geoman is unavailable.
  _initMapClickDraw() {
    this._clickHandler = null;
    this._tempVerts = [];
    this._tempLayer = null;
  }

  startDraw(mode) {
    this.drawMode = mode;
    this._tempVerts = [];
    if (this._tempLayer) { this.map.removeLayer(this._tempLayer); this._tempLayer = null; }
    if (this.geomanReady && window.L?.PM) {
      const tool = mode === 'polygon' ? 'Polygon' : 'Line';
      try {
        this.map.pm.enableDraw(tool, { finishOn: 'dblclick', allowSelfIntersection: false, hintLineMenuItems: [] });
      } catch (err) { /* fall through to manual */ this.geomanReady = false; }
    }
    if (!this.geomanReady || !window.L?.PM) {
      this._clickHandler = (e) => this._onManualVertex(e);
      this.map.on('click', this._clickHandler);
      this.map.getContainer().style.cursor = 'crosshair';
    }
  }

  cancelDraw() {
    this.drawMode = 'none';
    if (this.geomanReady && window.L?.PM) {
      try { this.map.pm.disableDraw(); } catch (err) { /* ignore */ }
    }
    if (this._clickHandler) {
      this.map.off('click', this._clickHandler);
      this._clickHandler = null;
    }
    if (this._tempLayer) { this.map.removeLayer(this._tempLayer); this._tempLayer = null; }
    this._tempVerts = [];
    this.map.getContainer().style.cursor = '';
  }

  _onManualVertex(e) {
    const ll = [e.latlng.lat, e.latlng.lng];
    this._tempVerts.push(ll);
    if (this._tempLayer) this.map.removeLayer(this._tempLayer);
    if (this.drawMode === 'polygon' && this._tempVerts.length >= 2) {
      this._tempLayer = L.polygon(this._tempVerts, { color: '#4DA34D', dashArray: '4 4' }).addTo(this.map);
    } else {
      this._tempLayer = L.polyline(this._tempVerts, { color: '#345363', dashArray: '4 4' }).addTo(this.map);
    }
  }

  finishManualDraw() {
    if (!this._tempVerts || this._tempVerts.length < 2) return;
    if (this.drawMode === 'polygon') {
      if (this._tempVerts.length < 3) return;
      this.setBoundary(this._tempVerts.slice());
    } else {
      this.addSurveyLine(this._tempVerts.slice());
    }
    this.cancelDraw();
  }

  _onGeomanCreate(e) {
    const layer = e.layer;
    const latlngs = this._extractLatlngs(layer);
    if (e.shape === 'Polygon' || e.shape === 'Rectangle') {
      this.setBoundary(latlngs);
    } else if (e.shape === 'Line') {
      this.addSurveyLine(latlngs);
    }
    try { this.map.pm.disableDraw(); } catch (err) { /* ignore */ }
    layer.remove();
  }

  _extractLatlngs(layer) {
    const raw = layer.getLatLngs();
    const flat = [];
    const walk = (arr) => {
      for (const p of arr) {
        if (Array.isArray(p)) walk(p);
        else flat.push([p.lat, p.lng]);
      }
    };
    walk(raw);
    return flat;
  }

  setBoundary(latlngs) {
    if (!latlngs || latlngs.length < 3) return;
    if (this.boundaryLayer) this.boundaryLayer.remove();
    this.boundaryVerts = latlngs.slice();
    this.boundaryLayer = L.polygon(latlngs, {
      color: '#345363', weight: 2, fillColor: '#4DA34D', fillOpacity: 0.15
    }).addTo(this.map);
    this.utmCrs = detectUtmCrs(latlngs);
    this._fitIfBoth();
    this._emitChange();
  }

  addSurveyLine(latlngs) {
    if (!latlngs || latlngs.length < 2) return;
    const idx = this.surveyLines.length + 1;
    const name = `L${idx}`;
    const polyline = L.polyline(latlngs, { color: '#345363', weight: 3 }).addTo(this.linesLayer);
    L.marker(latlngs[0], { title: `${name} start` }).addTo(this.markersLayer).bindTooltip(`${name} start`);
    L.marker(latlngs[latlngs.length - 1], { title: `${name} end` }).addTo(this.markersLayer).bindTooltip(`${name} end`);
    this.surveyLines.push({ name, latlngs: latlngs.slice(), layer: polyline });
    this.utmCrs = this.utmCrs || detectUtmCrs(latlngs);
    this._fitIfBoth();
    this._emitChange();
  }

  clearLines() {
    this.surveyLines = [];
    if (this.linesLayer) this.linesLayer.clearLayers();
    if (this.markersLayer) this.markersLayer.clearLayers();
    this._emitChange();
  }

  clearBoundary() {
    this.boundaryVerts = [];
    if (this.boundaryLayer) { this.boundaryLayer.remove(); this.boundaryLayer = null; }
    this._emitChange();
  }

  clearAll() {
    this.clearBoundary();
    this.clearLines();
    this.clearResult();
    this.utmCrs = null;
  }

  _fitIfBoth() {
    const all = [];
    if (this.boundaryVerts.length) all.push(...this.boundaryVerts);
    for (const l of this.surveyLines) all.push(...l.latlngs);
    if (all.length) {
      try { this.map.fitBounds(L.latLngBounds(all).pad(0.15)); } catch (err) { /* ignore */ }
    }
  }

  // Paste coordinate block.
  applyPastedCoordinates(text, crs, asMode) {
    const parsed = parseCoordinateBlock(text, crs);
    const latlngs = coordsToLatlngs(parsed);
    if (latlngs.length < 2) throw new Error('No valid coordinates parsed.');
    if (asMode === 'polygon') {
      if (latlngs.length < 3) throw new Error('Need at least 3 coordinates for a polygon.');
      this.setBoundary(latlngs);
    } else {
      this.addSurveyLine(latlngs);
    }
    return latlngs.length;
  }

  // Import KML text. Reads Placemark Polygon/LineString/Point.
  importKML(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) throw new Error('Invalid KML/XML.');
    let added = 0;
    const polys = doc.querySelectorAll('Placemark Polygon');
    polys.forEach((pl) => {
      const coords = this._kmlCoordStringToArray(pl.querySelector('outerBoundaryIs coordinates')?.textContent || '');
      if (coords.length >= 3) { this.setBoundary(coords); added += 1; }
    });
    const lines = doc.querySelectorAll('Placemark LineString');
    lines.forEach((pl) => {
      const coords = this._kmlCoordStringToArray(pl.querySelector('coordinates')?.textContent || '');
      if (coords.length >= 2) { this.addSurveyLine(coords); added += 1; }
    });
    if (added === 0) throw new Error('No polygon or line found in KML.');
    return added;
  }

  _kmlCoordStringToArray(s) {
    return s.trim().split(/\s+/).map((tok) => {
      const [lon, lat] = tok.split(',').map(Number);
      return [lat, lon];
    }).filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
  }

  // Import GeoJSON text.
  importGeoJSON(text) {
    const gj = JSON.parse(text);
    let added = 0;
    const walk = (geom) => {
      if (!geom) return;
      switch (geom.type) {
        case 'Polygon': {
          const ring = geom.coordinates[0].map(([lon, lat]) => [lat, lon]);
          if (ring.length >= 3) { this.setBoundary(ring); added += 1; }
          break;
        }
        case 'MultiPolygon': {
          const ring = geom.coordinates[0][0].map(([lon, lat]) => [lat, lon]);
          if (ring.length >= 3) { this.setBoundary(ring); added += 1; }
          break;
        }
        case 'LineString': {
          const ll = geom.coordinates.map(([lon, lat]) => [lat, lon]);
          if (ll.length >= 2) { this.addSurveyLine(ll); added += 1; }
          break;
        }
        case 'MultiLineString': {
          geom.coordinates.forEach((c) => {
            const ll = c.map(([lon, lat]) => [lat, lon]);
            if (ll.length >= 2) { this.addSurveyLine(ll); added += 1; }
          });
          break;
        }
        case 'GeometryCollection':
          geom.geometries.forEach(walk);
          break;
        default: break;
      }
    };
    if (gj.type === 'FeatureCollection') gj.features.forEach((f) => walk(f.geometry));
    else if (gj.type === 'Feature') walk(gj.geometry);
    else walk(gj);
    if (added === 0) throw new Error('No supported geometry found in GeoJSON.');
    return added;
  }

  // Render a planner result on the map.
  renderResult(result) {
    this.clearResult();
    if (!result) return;
    const lines = result.lines || [];
    const tieLines = result.tieLines || [];
    const points = result.points || [];

    lines.forEach((ln) => {
      if (ln.latlngs && ln.latlngs.length >= 2) {
        L.polyline(ln.latlngs, { color: '#27ae60', weight: 2 }).addTo(this.resultLayer);
      }
    });
    tieLines.forEach((ln) => {
      if (ln.latlngs && ln.latlngs.length >= 2) {
        L.polyline(ln.latlngs, { color: '#e67e22', weight: 2, dashArray: '6 4' }).addTo(this.resultLayer);
      }
    });
    points.forEach((p) => {
      if (p.latlng) {
        const m = L.circleMarker(p.latlng, {
          radius: 4, color: p.color || '#345363', fillColor: p.color || '#345363',
          fillOpacity: 0.9, weight: 1
        }).addTo(this.resultLayer);
        if (p.label) m.bindTooltip(p.label, { direction: 'top', permanent: false });
      }
    });
    // Fit to result if no boundary fit pending.
    const all = [];
    lines.forEach((l) => l.latlngs && all.push(...l.latlngs));
    tieLines.forEach((l) => l.latlngs && all.push(...l.latlngs));
    points.forEach((p) => p.latlng && all.push(p.latlng));
    if (all.length && !this.boundaryVerts.length) {
      try { this.map.fitBounds(L.latLngBounds(all).pad(0.15)); } catch (err) { /* ignore */ }
    }
  }

  clearResult() {
    if (this.resultLayer) this.resultLayer.clearLayers();
  }

  _emitChange() {
    const state = this.getState();
    this._renderStats(state);
    if (this.onChange) this.onChange(state);
  }

  getState() {
    const crs = this.utmCrs;
    let areaHa = 0;
    let perim = 0;
    let bbox = null;
    let mbr = null;
    let boundaryUtm = [];
    if (this.boundaryVerts.length >= 3 && crs) {
      boundaryUtm = latlngsToUtm(this.boundaryVerts, crs);
      areaHa = polygonAreaUtm(boundaryUtm) / 10000;
      perim = polygonPerimeterUtm(boundaryUtm);
      bbox = boundingBoxUtm(boundaryUtm);
      mbr = minimumBoundingRectangle(boundaryUtm);
    }
    const surveyLines = this.surveyLines.map((l) => ({
      name: l.name,
      latlngs: l.latlngs,
      utm: crs ? latlngsToUtm(l.latlngs, crs) : []
    }));
    return { crs, boundaryUtm, boundaryLatlngs: this.boundaryVerts, areaHa, perim, bbox, mbr, surveyLines };
  }

  _renderStats(state) {
    const el = document.getElementById(this.statsId);
    if (!el) return;
    if (!state.boundaryUtm.length && !state.surveyLines.length) {
      el.innerHTML = '<div class="gp-stat-muted">Draw or paste a survey area / line to begin.</div>';
      return;
    }
    const rows = [];
    if (state.boundaryUtm.length) {
      rows.push(`<div class="gp-stat-row"><span>Area</span><strong>${fmt(state.areaHa, 3)} ha</strong></div>`);
      rows.push(`<div class="gp-stat-row"><span>Perimeter</span><strong>${fmt(state.perim, 1)} m</strong></div>`);
      if (state.bbox) {
        rows.push(`<div class="gp-stat-row"><span>Bounding box</span><strong>${fmt(state.bbox.width, 0)} × ${fmt(state.bbox.height, 0)} m</strong></div>`);
      }
      if (state.mbr) {
        rows.push(`<div class="gp-stat-row"><span>Longest axis (auto)</span><strong>${fmt(state.mbr.angle, 1)}° (${fmt(state.mbr.length, 0)} m)</strong></div>`);
      }
    }
    if (state.crs) rows.push(`<div class="gp-stat-row"><span>UTM CRS</span><strong>${utmZoneLabel(state.crs)}</strong></div>`);
    if (state.surveyLines.length) {
      rows.push(`<div class="gp-stat-row"><span>Survey lines</span><strong>${state.surveyLines.length}</strong></div>`);
    }
    el.innerHTML = rows.join('');
  }
}

// Helper: build a [lat,lon] from UTM [e,n] given a crs.
export function enToLatlng(enu, crs) {
  const [lon, lat] = inverseToLonLat(enu, crs);
  return [lat, lon];
}

export { registerProjections, isGeographic };
