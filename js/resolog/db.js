// G-Resolog Pro v2 - IndexedDB Helper (ES Module)
// Promise-based wrapper around IndexedDB with no external dependencies.

let db = null;

export const DB = {
  init(name = 'gresolog', version = 1) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);

      request.onupgradeneeded = (event) => {
        const idb = event.target.result;

        // Projects store
        if (!idb.objectStoreNames.contains('projects')) {
          const projectsStore = idb.createObjectStore('projects', { keyPath: 'id' });
          projectsStore.createIndex('name', 'name', { unique: false });
          projectsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Holes store
        if (!idb.objectStoreNames.contains('holes')) {
          const holesStore = idb.createObjectStore('holes', { keyPath: 'id' });
          holesStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Intervals store
        if (!idb.objectStoreNames.contains('intervals')) {
          const intervalsStore = idb.createObjectStore('intervals', { keyPath: 'id' });
          intervalsStore.createIndex('holeId', 'holeId', { unique: false });
          intervalsStore.createIndex('topDepth', 'topDepth', { unique: false });
        }

        // Field Tests store
        if (!idb.objectStoreNames.contains('fieldTests')) {
          const fieldTestsStore = idb.createObjectStore('fieldTests', { keyPath: 'id' });
          fieldTestsStore.createIndex('intervalId', 'intervalId', { unique: false });
          fieldTestsStore.createIndex('holeId', 'holeId', { unique: false });
        }

        // Samples store
        if (!idb.objectStoreNames.contains('samples')) {
          const samplesStore = idb.createObjectStore('samples', { keyPath: 'id' });
          samplesStore.createIndex('holeId', 'holeId', { unique: false });
        }

        // Water Strikes store
        if (!idb.objectStoreNames.contains('waterStrikes')) {
          const waterStrikesStore = idb.createObjectStore('waterStrikes', { keyPath: 'id' });
          waterStrikesStore.createIndex('holeId', 'holeId', { unique: false });
        }

        // Casing store
        if (!idb.objectStoreNames.contains('casing')) {
          const casingStore = idb.createObjectStore('casing', { keyPath: 'id' });
          casingStore.createIndex('holeId', 'holeId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  },

  _ensureDB() {
    if (!db) {
      return Promise.reject(new Error('Database not initialized. Call DB.init() first.'));
    }
    return Promise.resolve(db);
  },

  // ─── Project CRUD ────────────────────────────────────────────

  getProjects() {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('projects', 'readonly');
        const store = tx.objectStore('projects');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  getProject(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('projects', 'readonly');
        const store = tx.objectStore('projects');
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createProject(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        const project = {
          id: crypto.randomUUID(),
          name: data.name || '',
          client: data.client || '',
          jobNo: data.jobNo || '',
          datum: data.datum || '',
          epsg: data.epsg || '',
          defaults: data.defaults || {},
          createdAt: now,
          updatedAt: now
        };

        const tx = db.transaction('projects', 'readwrite');
        const store = tx.objectStore('projects');
        const request = store.add(project);

        request.onsuccess = () => resolve(project);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateProject(id, data) {
    return this._ensureDB().then(() => {
      return this.getProject(id).then((existing) => {
        if (!existing) {
          return Promise.reject(new Error(`Project ${id} not found`));
        }

        return new Promise((resolve, reject) => {
          const updated = {
            ...existing,
            ...data,
            id,
            updatedAt: new Date().toISOString()
          };

          const tx = db.transaction('projects', 'readwrite');
          const store = tx.objectStore('projects');
          const request = store.put(updated);

          request.onsuccess = () => resolve(updated);
          request.onerror = () => reject(request.error);
        });
      });
    });
  },

  deleteProject(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['projects', 'holes', 'intervals', 'fieldTests', 'samples', 'waterStrikes', 'casing'], 'readwrite');

        // Delete project
        tx.objectStore('projects').delete(id);

        // Cascade delete holes and children
        const holesStore = tx.objectStore('holes');
        const holesIndex = holesStore.index('projectId');
        const holesReq = holesIndex.getAllKeys(id);

        holesReq.onsuccess = () => {
          const holeIds = holesReq.result;

          holeIds.forEach(holeId => {
            holesStore.delete(holeId);

            // Cascade delete intervals
            const intervalsStore = tx.objectStore('intervals');
            const intervalsIndex = intervalsStore.index('holeId');
            const intervalsReq = intervalsIndex.getAllKeys(holeId);
            intervalsReq.onsuccess = () => {
              intervalsReq.result.forEach(intervalId => {
                intervalsStore.delete(intervalId);

                // Delete field tests for this interval
                const ftStore = tx.objectStore('fieldTests');
                const ftIndex = ftStore.index('intervalId');
                const ftReq = ftIndex.getAllKeys(intervalId);
                ftReq.onsuccess = () => {
                  ftReq.result.forEach(ftId => ftStore.delete(ftId));
                };
              });
            };

            // Delete field tests for this hole
            const ftStore = tx.objectStore('fieldTests');
            const ftHoleIndex = ftStore.index('holeId');
            const ftHoleReq = ftHoleIndex.getAllKeys(holeId);
            ftHoleReq.onsuccess = () => {
              ftHoleReq.result.forEach(ftId => ftStore.delete(ftId));
            };

            // Delete samples
            const samplesStore = tx.objectStore('samples');
            const samplesIndex = samplesStore.index('holeId');
            const samplesReq = samplesIndex.getAllKeys(holeId);
            samplesReq.onsuccess = () => {
              samplesReq.result.forEach(sampleId => samplesStore.delete(sampleId));
            };

            // Delete water strikes
            const wsStore = tx.objectStore('waterStrikes');
            const wsIndex = wsStore.index('holeId');
            const wsReq = wsIndex.getAllKeys(holeId);
            wsReq.onsuccess = () => {
              wsReq.result.forEach(wsId => wsStore.delete(wsId));
            };

            // Delete casing
            const casingStore = tx.objectStore('casing');
            const casingIndex = casingStore.index('holeId');
            const casingReq = casingIndex.getAllKeys(holeId);
            casingReq.onsuccess = () => {
              casingReq.result.forEach(casingId => casingStore.delete(casingId));
            };
          });
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  // ─── Hole CRUD ───────────────────────────────────────────────

  getHoles(projectId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('holes', 'readonly');
        const store = tx.objectStore('holes');
        const index = store.index('projectId');
        const request = index.getAll(projectId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createHole(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        const hole = {
          id: crypto.randomUUID(),
          projectId: data.projectId || '',
          type: data.type || 'soil',
          name: data.name || '',
          easting: data.easting || null,
          northing: data.northing || null,
          rl: data.rl || null,
          depth: data.depth || null,
          drillMethod: data.drillMethod || '',
          dia: data.dia || null,
          inclination: data.inclination || null,
          azimuth: data.azimuth || null,
          startDate: data.startDate || '',
          loggedBy: data.loggedBy || '',
          checkedBy: data.checkedBy || '',
          order: data.order != null ? data.order : 0,
          createdAt: now,
          updatedAt: now
        };

        const tx = db.transaction('holes', 'readwrite');
        const store = tx.objectStore('holes');
        const request = store.add(hole);

        request.onsuccess = () => resolve(hole);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateHole(id, data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('holes', 'readwrite');
        const store = tx.objectStore('holes');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error(`Hole ${id} not found`));
            return;
          }

          const updated = {
            ...existing,
            ...data,
            id,
            updatedAt: new Date().toISOString()
          };

          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  deleteHole(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['holes', 'intervals', 'fieldTests', 'samples', 'waterStrikes', 'casing'], 'readwrite');

        tx.objectStore('holes').delete(id);

        // Cascade delete intervals and their field tests
        const intervalsStore = tx.objectStore('intervals');
        const intervalsIndex = intervalsStore.index('holeId');
        const intervalsReq = intervalsIndex.getAllKeys(id);
        intervalsReq.onsuccess = () => {
          intervalsReq.result.forEach(intervalId => {
            intervalsStore.delete(intervalId);

            const ftStore = tx.objectStore('fieldTests');
            const ftIndex = ftStore.index('intervalId');
            const ftReq = ftIndex.getAllKeys(intervalId);
            ftReq.onsuccess = () => {
              ftReq.result.forEach(ftId => ftStore.delete(ftId));
            };
          });
        };

        // Delete field tests directly by holeId
        const ftStore = tx.objectStore('fieldTests');
        const ftHoleIndex = ftStore.index('holeId');
        const ftHoleReq = ftHoleIndex.getAllKeys(id);
        ftHoleReq.onsuccess = () => {
          ftHoleReq.result.forEach(ftId => ftStore.delete(ftId));
        };

        // Delete samples
        const samplesStore = tx.objectStore('samples');
        const samplesIndex = samplesStore.index('holeId');
        const samplesReq = samplesIndex.getAllKeys(id);
        samplesReq.onsuccess = () => {
          samplesReq.result.forEach(sampleId => samplesStore.delete(sampleId));
        };

        // Delete water strikes
        const wsStore = tx.objectStore('waterStrikes');
        const wsIndex = wsStore.index('holeId');
        const wsReq = wsIndex.getAllKeys(id);
        wsReq.onsuccess = () => {
          wsReq.result.forEach(wsId => wsStore.delete(wsId));
        };

        // Delete casing
        const casingStore = tx.objectStore('casing');
        const casingIndex = casingStore.index('holeId');
        const casingReq = casingIndex.getAllKeys(id);
        casingReq.onsuccess = () => {
          casingReq.result.forEach(casingId => casingStore.delete(casingId));
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  // ─── Interval CRUD ───────────────────────────────────────────

  getIntervals(holeId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('intervals', 'readonly');
        const store = tx.objectStore('intervals');
        const index = store.index('holeId');
        const request = index.getAll(holeId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createInterval(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const interval = {
          id: crypto.randomUUID(),
          holeId: data.holeId || '',
          topDepth: data.topDepth != null ? data.topDepth : 0,
          baseDepth: data.baseDepth != null ? data.baseDepth : 0,
          description: data.description || '',
          pattern: data.pattern || '',
          weathering: data.weathering || '',
          strength: data.strength || '',
          recovery: data.recovery || null,
          rqd: data.rqd || null,
          tcr: data.tcr || null,
          scr: data.scr || null,
          is50: data.is50 || null,
          runLength: data.runLength || null,
          recLength: data.recLength || null,
          solidLength: data.solidLength || null,
          pieces100: data.pieces100 || null,
          defectSpacing: data.defectSpacing || null,
          order: data.order != null ? data.order : 0,
          fieldTests: data.fieldTests || []
        };

        const tx = db.transaction('intervals', 'readwrite');
        const store = tx.objectStore('intervals');
        const request = store.add(interval);

        request.onsuccess = () => resolve(interval);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateInterval(id, data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('intervals', 'readwrite');
        const store = tx.objectStore('intervals');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error(`Interval ${id} not found`));
            return;
          }

          const updated = { ...existing, ...data, id };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  deleteInterval(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['intervals', 'fieldTests'], 'readwrite');

        tx.objectStore('intervals').delete(id);

        // Cascade delete field tests for this interval
        const ftStore = tx.objectStore('fieldTests');
        const ftIndex = ftStore.index('intervalId');
        const ftReq = ftIndex.getAllKeys(id);
        ftReq.onsuccess = () => {
          ftReq.result.forEach(ftId => ftStore.delete(ftId));
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  // ─── FieldTest CRUD ──────────────────────────────────────────

  getFieldTests(holeId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fieldTests', 'readonly');
        const store = tx.objectStore('fieldTests');
        const index = store.index('holeId');
        const request = index.getAll(holeId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  getFieldTestsByInterval(intervalId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fieldTests', 'readonly');
        const store = tx.objectStore('fieldTests');
        const index = store.index('intervalId');
        const request = index.getAll(intervalId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createFieldTest(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const fieldTest = {
          id: crypto.randomUUID(),
          intervalId: data.intervalId || '',
          holeId: data.holeId || '',
          type: data.type || 'SPT',
          depth: data.depth != null ? data.depth : 0,
          data: data.data || {}
        };

        const tx = db.transaction('fieldTests', 'readwrite');
        const store = tx.objectStore('fieldTests');
        const request = store.add(fieldTest);

        request.onsuccess = () => resolve(fieldTest);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateFieldTest(id, data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fieldTests', 'readwrite');
        const store = tx.objectStore('fieldTests');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error(`FieldTest ${id} not found`));
            return;
          }

          const updated = { ...existing, ...data, id };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  deleteFieldTest(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fieldTests', 'readwrite');
        const store = tx.objectStore('fieldTests');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  // ─── Sample CRUD ─────────────────────────────────────────────

  getSamples(holeId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('samples', 'readonly');
        const store = tx.objectStore('samples');
        const index = store.index('holeId');
        const request = index.getAll(holeId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createSample(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const sample = {
          id: crypto.randomUUID(),
          holeId: data.holeId || '',
          type: data.type || 'S',
          topDepth: data.topDepth != null ? data.topDepth : 0,
          baseDepth: data.baseDepth != null ? data.baseDepth : 0,
          label: data.label || '',
          date: data.date || ''
        };

        const tx = db.transaction('samples', 'readwrite');
        const store = tx.objectStore('samples');
        const request = store.add(sample);

        request.onsuccess = () => resolve(sample);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateSample(id, data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('samples', 'readwrite');
        const store = tx.objectStore('samples');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error(`Sample ${id} not found`));
            return;
          }

          const updated = { ...existing, ...data, id };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  deleteSample(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('samples', 'readwrite');
        const store = tx.objectStore('samples');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  // ─── WaterStrike CRUD ────────────────────────────────────────

  getWaterStrikes(holeId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('waterStrikes', 'readonly');
        const store = tx.objectStore('waterStrikes');
        const index = store.index('holeId');
        const request = index.getAll(holeId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createWaterStrike(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const waterStrike = {
          id: crypto.randomUUID(),
          holeId: data.holeId || '',
          depth: data.depth != null ? data.depth : 0,
          restLevel: data.restLevel || null,
          date: data.date || '',
          remarks: data.remarks || ''
        };

        const tx = db.transaction('waterStrikes', 'readwrite');
        const store = tx.objectStore('waterStrikes');
        const request = store.add(waterStrike);

        request.onsuccess = () => resolve(waterStrike);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateWaterStrike(id, data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('waterStrikes', 'readwrite');
        const store = tx.objectStore('waterStrikes');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error(`WaterStrike ${id} not found`));
            return;
          }

          const updated = { ...existing, ...data, id };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  deleteWaterStrike(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('waterStrikes', 'readwrite');
        const store = tx.objectStore('waterStrikes');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  // ─── Casing CRUD ─────────────────────────────────────────────

  getCasing(holeId) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('casing', 'readonly');
        const store = tx.objectStore('casing');
        const index = store.index('holeId');
        const request = index.getAll(holeId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  createCasing(data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const casing = {
          id: crypto.randomUUID(),
          holeId: data.holeId || '',
          topDepth: data.topDepth != null ? data.topDepth : 0,
          baseDepth: data.baseDepth != null ? data.baseDepth : 0,
          dia: data.dia || null,
          type: data.type || ''
        };

        const tx = db.transaction('casing', 'readwrite');
        const store = tx.objectStore('casing');
        const request = store.add(casing);

        request.onsuccess = () => resolve(casing);
        request.onerror = () => reject(request.error);
      });
    });
  },

  updateCasing(id, data) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('casing', 'readwrite');
        const store = tx.objectStore('casing');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error(`Casing ${id} not found`));
            return;
          }

          const updated = { ...existing, ...data, id };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  deleteCasing(id) {
    return this._ensureDB().then(() => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('casing', 'readwrite');
        const store = tx.objectStore('casing');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  // ─── Export / Import ─────────────────────────────────────────

  exportProject(projectId) {
    return this._ensureDB().then(() => {
      return this.getProject(projectId).then((project) => {
        if (!project) {
          return Promise.reject(new Error(`Project ${projectId} not found`));
        }

        return this.getHoles(projectId).then((holes) => {
          const holeExports = holes.map((hole) => {
            return Promise.all([
              this.getIntervals(hole.id),
              this.getFieldTests(hole.id),
              this.getSamples(hole.id),
              this.getWaterStrikes(hole.id),
              this.getCasing(hole.id)
            ]).then(([intervals, fieldTests, samples, waterStrikes, casing]) => {
              return {
                hole,
                intervals,
                fieldTests,
                samples,
                waterStrikes,
                casing
              };
            });
          });

          return Promise.all(holeExports).then((holesData) => {
            return {
              version: 2,
              exportedAt: new Date().toISOString(),
              project,
              holes: holesData
            };
          });
        });
      });
    });
  },

  importProject(jsonData) {
    return this._ensureDB().then(() => {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      if (!data.project) {
        return Promise.reject(new Error('Invalid project data: missing project'));
      }

      // Generate new IDs for the imported project and all children
      const idMap = new Map();
      const newProjectId = crypto.randomUUID();

      return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        const newProject = {
          ...data.project,
          id: newProjectId,
          createdAt: now,
          updatedAt: now
        };

        const tx = db.transaction(['projects', 'holes', 'intervals', 'fieldTests', 'samples', 'waterStrikes', 'casing'], 'readwrite');

        tx.objectStore('projects').add(newProject);

        if (data.holes && data.holes.length > 0) {
          data.holes.forEach((holeExport) => {
            const oldHoleId = holeExport.hole.id;
            const newHoleId = crypto.randomUUID();
            idMap.set(oldHoleId, newHoleId);

            const newHole = {
              ...holeExport.hole,
              id: newHoleId,
              projectId: newProjectId
            };
            tx.objectStore('holes').add(newHole);

            // Import intervals
            if (holeExport.intervals) {
              holeExport.intervals.forEach((interval) => {
                const newIntervalId = crypto.randomUUID();
                const newInterval = {
                  ...interval,
                  id: newIntervalId,
                  holeId: newHoleId
                };
                tx.objectStore('intervals').add(newInterval);
                idMap.set(interval.id, newIntervalId);
              });
            }

            // Import field tests
            if (holeExport.fieldTests) {
              holeExport.fieldTests.forEach((ft) => {
                const newFtId = crypto.randomUUID();
                const newFt = {
                  ...ft,
                  id: newFtId,
                  holeId: newHoleId,
                  intervalId: idMap.get(ft.intervalId) || ft.intervalId || ''
                };
                tx.objectStore('fieldTests').add(newFt);
              });
            }

            // Import samples
            if (holeExport.samples) {
              holeExport.samples.forEach((sample) => {
                const newSample = {
                  ...sample,
                  id: crypto.randomUUID(),
                  holeId: newHoleId
                };
                tx.objectStore('samples').add(newSample);
              });
            }

            // Import water strikes
            if (holeExport.waterStrikes) {
              holeExport.waterStrikes.forEach((ws) => {
                const newWs = {
                  ...ws,
                  id: crypto.randomUUID(),
                  holeId: newHoleId
                };
                tx.objectStore('waterStrikes').add(newWs);
              });
            }

            // Import casing
            if (holeExport.casing) {
              holeExport.casing.forEach((casing) => {
                const newCasing = {
                  ...casing,
                  id: crypto.randomUUID(),
                  holeId: newHoleId
                };
                tx.objectStore('casing').add(newCasing);
              });
            }
          });
        }

        tx.oncomplete = () => resolve(newProject);
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  // ─── Migration Helpers ───────────────────────────────────────

  hasLegacyData() {
    return localStorage.getItem('gresolog_enhanced') !== null;
  },

  getLegacyData() {
    const raw = localStorage.getItem('gresolog_enhanced');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
};