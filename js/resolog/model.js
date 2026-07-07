// G-Resolog - Application State Model (ES Module)
// Manages in-memory state, wraps DB CRUD, undo/redo, legacy migration.

import { DB } from './db.js';

export const Model = {
  // ─── State ───────────────────────────────────────────────────

  projects: [],
  currentProject: null,
  currentHole: null,
  currentIntervals: [],
  currentFieldTests: [],
  currentSamples: [],
  currentWaterStrikes: [],
  currentCasing: [],

  // Undo stack (last 20 states)
  undoStack: [],
  maxUndo: 20,

  // Settings
  scale: 100,
  standard: 'BS5930',
  darkMode: false,

  // ─── Init ────────────────────────────────────────────────────

  async init() {
    await DB.init('gresolog', 1);
    await this.loadProjects();
    await this.checkLegacy();
  },

  async loadProjects() {
    this.projects = await DB.getProjects();
  },

  async selectProject(id) {
    this.currentProject = await DB.getProject(id);
    if (!this.currentProject) {
      throw new Error(`Project ${id} not found`);
    }
    this.currentHole = null;
    this.clearHoleState();
  },

  async selectHole(id) {
    const holes = await DB.getHoles(this.currentProject.id);
    this.currentHole = holes.find(h => h.id === id) || null;
    if (!this.currentHole) {
      throw new Error(`Hole ${id} not found in current project`);
    }
    await this._loadHoleChildren();
  },

  async selectHoleByIndex(projectId, index) {
    const holes = await DB.getHoles(projectId);
    const sorted = holes.sort((a, b) => (a.order || 0) - (b.order || 0));
    if (index < 0 || index >= sorted.length) {
      throw new Error(`Hole index ${index} out of range`);
    }
    this.currentProject = await DB.getProject(projectId);
    this.currentHole = sorted[index];
    await this._loadHoleChildren();
  },

  async _loadHoleChildren() {
    const holeId = this.currentHole.id;
    const [intervals, fieldTests, samples, waterStrikes, casing] = await Promise.all([
      DB.getIntervals(holeId),
      DB.getFieldTests(holeId),
      DB.getSamples(holeId),
      DB.getWaterStrikes(holeId),
      DB.getCasing(holeId)
    ]);

    this.currentIntervals = intervals;
    this.sortIntervals();
    this.currentFieldTests = fieldTests;
    this.currentSamples = samples;
    this.currentWaterStrikes = waterStrikes;
    this.currentCasing = casing;
    this.clearUndo();
  },

  clearHoleState() {
    this.currentHole = null;
    this.currentIntervals = [];
    this.currentFieldTests = [];
    this.currentSamples = [];
    this.currentWaterStrikes = [];
    this.currentCasing = [];
    this.clearUndo();
  },

  // ─── Project CRUD ────────────────────────────────────────────

  async createProject(data) {
    const project = await DB.createProject(data);
    this.projects.push(project);
    return project;
  },

  async updateProject(id, data) {
    const updated = await DB.updateProject(id, data);
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx !== -1) this.projects[idx] = updated;
    if (this.currentProject && this.currentProject.id === id) {
      this.currentProject = updated;
    }
    return updated;
  },

  async deleteProject(id) {
    await DB.deleteProject(id);
    this.projects = this.projects.filter(p => p.id !== id);
    if (this.currentProject && this.currentProject.id === id) {
      this.currentProject = null;
      this.clearHoleState();
    }
  },

  async duplicateProject(id) {
    const json = await DB.exportProject(id);
    const newProject = await DB.importProject(json);
    this.projects.push(newProject);
    return newProject;
  },

  // ─── Hole CRUD ───────────────────────────────────────────────

  async createHole(data) {
    const holeData = {
      ...data,
      projectId: data.projectId || (this.currentProject ? this.currentProject.id : '')
    };
    const hole = await DB.createHole(holeData);
    if (this.currentProject && this.currentProject.id === hole.projectId) {
      this.currentHole = hole;
      this.clearHoleState();
    }
    return hole;
  },

  async updateHole(id, data) {
    const updated = await DB.updateHole(id, data);
    if (this.currentHole && this.currentHole.id === id) {
      this.currentHole = { ...this.currentHole, ...updated };
    }
    return updated;
  },

  async deleteHole(id) {
    await DB.deleteHole(id);
    if (this.currentHole && this.currentHole.id === id) {
      this.currentHole = null;
      this.clearHoleState();
    }
  },

  // ─── Interval CRUD ───────────────────────────────────────────

  async createInterval(data) {
    this.pushUndo();
    const intervalData = {
      ...data,
      holeId: data.holeId || (this.currentHole ? this.currentHole.id : '')
    };
    const interval = await DB.createInterval(intervalData);
    this.currentIntervals.push(interval);
    this.sortIntervals();
    return interval;
  },

  async updateInterval(id, data) {
    this.pushUndo();
    const updated = await DB.updateInterval(id, data);
    const idx = this.currentIntervals.findIndex(i => i.id === id);
    if (idx !== -1) this.currentIntervals[idx] = updated;
    this.sortIntervals();
    return updated;
  },

  async deleteInterval(id) {
    this.pushUndo();
    await DB.deleteInterval(id);
    this.currentIntervals = this.currentIntervals.filter(i => i.id !== id);
  },

  // ─── FieldTest CRUD ──────────────────────────────────────────

  async createFieldTest(data) {
    this.pushUndo();
    const ftData = {
      ...data,
      holeId: data.holeId || (this.currentHole ? this.currentHole.id : ''),
      intervalId: data.intervalId || ''
    };
    const fieldTest = await DB.createFieldTest(ftData);
    this.currentFieldTests.push(fieldTest);
    return fieldTest;
  },

  async updateFieldTest(id, data) {
    this.pushUndo();
    const updated = await DB.updateFieldTest(id, data);
    const idx = this.currentFieldTests.findIndex(ft => ft.id === id);
    if (idx !== -1) this.currentFieldTests[idx] = updated;
    return updated;
  },

  async deleteFieldTest(id) {
    this.pushUndo();
    await DB.deleteFieldTest(id);
    this.currentFieldTests = this.currentFieldTests.filter(ft => ft.id !== id);
  },

  // ─── Sample CRUD ─────────────────────────────────────────────

  async createSample(data) {
    this.pushUndo();
    const sampleData = {
      ...data,
      holeId: data.holeId || (this.currentHole ? this.currentHole.id : '')
    };
    const sample = await DB.createSample(sampleData);
    this.currentSamples.push(sample);
    return sample;
  },

  async updateSample(id, data) {
    this.pushUndo();
    const updated = await DB.updateSample(id, data);
    const idx = this.currentSamples.findIndex(s => s.id === id);
    if (idx !== -1) this.currentSamples[idx] = updated;
    return updated;
  },

  async deleteSample(id) {
    this.pushUndo();
    await DB.deleteSample(id);
    this.currentSamples = this.currentSamples.filter(s => s.id !== id);
  },

  // ─── WaterStrike CRUD ────────────────────────────────────────

  async createWaterStrike(data) {
    this.pushUndo();
    const wsData = {
      ...data,
      holeId: data.holeId || (this.currentHole ? this.currentHole.id : '')
    };
    const waterStrike = await DB.createWaterStrike(wsData);
    this.currentWaterStrikes.push(waterStrike);
    return waterStrike;
  },

  async updateWaterStrike(id, data) {
    this.pushUndo();
    const updated = await DB.updateWaterStrike(id, data);
    const idx = this.currentWaterStrikes.findIndex(ws => ws.id === id);
    if (idx !== -1) this.currentWaterStrikes[idx] = updated;
    return updated;
  },

  async deleteWaterStrike(id) {
    this.pushUndo();
    await DB.deleteWaterStrike(id);
    this.currentWaterStrikes = this.currentWaterStrikes.filter(ws => ws.id !== id);
  },

  // ─── Casing CRUD ─────────────────────────────────────────────

  async createCasing(data) {
    this.pushUndo();
    const casingData = {
      ...data,
      holeId: data.holeId || (this.currentHole ? this.currentHole.id : '')
    };
    const casing = await DB.createCasing(casingData);
    this.currentCasing.push(casing);
    return casing;
  },

  async updateCasing(id, data) {
    this.pushUndo();
    const updated = await DB.updateCasing(id, data);
    const idx = this.currentCasing.findIndex(c => c.id === id);
    if (idx !== -1) this.currentCasing[idx] = updated;
    return updated;
  },

  async deleteCasing(id) {
    this.pushUndo();
    await DB.deleteCasing(id);
    this.currentCasing = this.currentCasing.filter(c => c.id !== id);
  },

  // ─── Undo System ─────────────────────────────────────────────

  pushUndo() {
    if (!this.currentHole) return;

    const snapshot = {
      hole: structuredClone(this.currentHole),
      intervals: structuredClone(this.currentIntervals),
      fieldTests: structuredClone(this.currentFieldTests),
      samples: structuredClone(this.currentSamples),
      waterStrikes: structuredClone(this.currentWaterStrikes),
      casing: structuredClone(this.currentCasing)
    };

    this.undoStack.push(snapshot);

    // Keep only last maxUndo states
    while (this.undoStack.length > this.maxUndo) {
      this.undoStack.shift();
    }
  },

  async undo() {
    if (!this.currentHole || this.undoStack.length === 0) {
      return;
    }

    const snapshot = this.undoStack.pop();

    // Restore hole
    await DB.updateHole(this.currentHole.id, snapshot.hole);
    this.currentHole = snapshot.hole;

    // Restore intervals
    const existingIntervals = await DB.getIntervals(this.currentHole.id);
    // Remove all existing intervals
    for (const interval of existingIntervals) {
      await DB.deleteInterval(interval.id);
    }
    // Recreate from snapshot
    for (const interval of snapshot.intervals) {
      await DB.createInterval(interval);
    }
    this.currentIntervals = snapshot.intervals;

    // Restore field tests
    const existingFT = await DB.getFieldTests(this.currentHole.id);
    for (const ft of existingFT) {
      await DB.deleteFieldTest(ft.id);
    }
    for (const ft of snapshot.fieldTests) {
      await DB.createFieldTest(ft);
    }
    this.currentFieldTests = snapshot.fieldTests;

    // Restore samples
    const existingSamples = await DB.getSamples(this.currentHole.id);
    for (const s of existingSamples) {
      await DB.deleteSample(s.id);
    }
    for (const s of snapshot.samples) {
      await DB.createSample(s);
    }
    this.currentSamples = snapshot.samples;

    // Restore water strikes
    const existingWS = await DB.getWaterStrikes(this.currentHole.id);
    for (const ws of existingWS) {
      await DB.deleteWaterStrike(ws.id);
    }
    for (const ws of snapshot.waterStrikes) {
      await DB.createWaterStrike(ws);
    }
    this.currentWaterStrikes = snapshot.waterStrikes;

    // Restore casing
    const existingCasing = await DB.getCasing(this.currentHole.id);
    for (const c of existingCasing) {
      await DB.deleteCasing(c.id);
    }
    for (const c of snapshot.casing) {
      await DB.createCasing(c);
    }
    this.currentCasing = snapshot.casing;
  },

  clearUndo() {
    this.undoStack = [];
  },

  // ─── Legacy Migration ────────────────────────────────────────

  async checkLegacy() {
    if (DB.hasLegacyData()) {
      return DB.getLegacyData();
    }
    return null;
  },

  async importLegacy(legacyData) {
    const data = typeof legacyData === 'string' ? JSON.parse(legacyData) : legacyData;
    const info = data.projectInfo || {};

    // Create project from legacy project info
    const project = await this.createProject({
      name: info.projectName || info.address || 'Legacy Project',
      client: info.client || '',
      jobNo: info.jobNo || '',
      datum: info.datum || '',
      epsg: '',
      defaults: {}
    });

    // Create a single hole from legacy borehole info
    const hole = await this.createHole({
      projectId: project.id,
      type: info.drillingMethod ? 'core' : 'soil',
      name: info.boreholeNo || info.projectName || 'BH-01',
      easting: parseFloat(info.easting) || null,
      northing: parseFloat(info.northing) || null,
      rl: parseFloat(info.rlSurface) || null,
      depth: null,
      drillMethod: info.drillingMethod || '',
      dia: parseFloat(info.holeDiameter) || null,
      inclination: parseFloat(info.slope) || null,
      azimuth: parseFloat(info.bearing) || null,
      startDate: info.drillingDate || '',
      loggedBy: info.loggedBy || '',
      checkedBy: info.checkedBy || '',
      order: 0
    });

    // Select the hole
    this.currentProject = project;
    this.currentHole = hole;

    // Convert layers to intervals
    const layers = data.layers || [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      await this.createInterval({
        holeId: hole.id,
        topDepth: parseFloat(layer.topDepth) || 0,
        baseDepth: parseFloat(layer.bottomDepth) || 0,
        description: layer.description || '',
        pattern: layer.pattern || 'clay',
        weathering: layer.weathering || '',
        strength: layer.strength || '',
        recovery: layer.recovery || null,
        rqd: layer.rqd || null,
        is50: layer.is50 || null,
        defectSpacing: Array.isArray(layer.defectSpacing) ? layer.defectSpacing.join(', ') : (layer.defectSpacing || null),
        order: i,
        fieldTests: []
      });

      // Convert legacy field tests within layers
      if (Array.isArray(layer.fieldTests)) {
        for (const test of layer.fieldTests) {
          await this.createFieldTest({
            intervalId: this.currentIntervals[this.currentIntervals.length - 1].id,
            holeId: hole.id,
            type: test.type || 'other',
            depth: parseFloat(test.depth) || parseFloat(layer.topDepth) || 0,
            data: test.data || test.value || {}
          });
        }
      }
    }

    return project;
  },

  clearLegacyStored() {
    localStorage.removeItem('gresolog_enhanced');
  },

  // ─── Import / Export ─────────────────────────────────────────

  async exportProjectJSON(projectId) {
    return await DB.exportProject(projectId || this.currentProject.id);
  },

  async importProjectJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const project = await DB.importProject(data);
    await this.loadProjects();
    return project;
  },

  // ─── Sorting / Validation ────────────────────────────────────

  sortIntervals() {
    this.currentIntervals.sort((a, b) => {
      const aDepth = a.topDepth != null ? a.topDepth : 0;
      const bDepth = b.topDepth != null ? b.topDepth : 0;
      return aDepth - bDepth;
    });
  },

  validateDepths() {
    const warnings = [];

    for (let i = 0; i < this.currentIntervals.length; i++) {
      const curr = this.currentIntervals[i];

      // Check for invalid depth range
      if (curr.topDepth != null && curr.baseDepth != null && curr.topDepth >= curr.baseDepth) {
        warnings.push({
          type: 'invalid_range',
          intervalId: curr.id,
          message: `Interval at ${curr.topDepth}m has topDepth >= baseDepth`
        });
      }

      // Check overlap with next interval
      if (i < this.currentIntervals.length - 1) {
        const next = this.currentIntervals[i + 1];
        if (curr.baseDepth != null && next.topDepth != null && curr.baseDepth > next.topDepth) {
          warnings.push({
            type: 'overlap',
            intervalId: curr.id,
            nextIntervalId: next.id,
            message: `Overlap between ${curr.topDepth}-${curr.baseDepth}m and ${next.topDepth}-${next.baseDepth}m`
          });
        }

        // Check for gaps
        if (curr.baseDepth != null && next.topDepth != null && curr.baseDepth < next.topDepth) {
          warnings.push({
            type: 'gap',
            intervalId: curr.id,
            nextIntervalId: next.id,
            message: `Gap between ${curr.baseDepth}m and ${next.topDepth}m`
          });
        }
      }
    }

    return warnings;
  }
};