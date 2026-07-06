// =============================================================================
// G-Resolog Pro v2 - Main UI Controller (ES Module)
// =============================================================================

import { Model } from './model.js';
import { StripLog } from './striplog.js';
import { Exports } from './exports.js';
import { DescBuilder } from './description-builder.js';

// ─── Embedded Stylesheet ─────────────────────────────────────────────────────

const STYLES = `
.gresolog-app{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f6f8;color:#1a1a2e;min-height:100vh;display:flex;flex-direction:column}
.gresolog-app *{box-sizing:border-box}
body.dark .gresolog-app{background:#1a1a2e;color:#e0e0e0}
.toolbar{display:flex;align-items:center;gap:6px;padding:8px 12px;background:#fff;border-bottom:1px solid #ddd;position:sticky;top:0;z-index:100;flex-wrap:wrap;box-shadow:0 1px 3px rgba(0,0,0,.08)}
body.dark .toolbar{background:#16213e;border-color:#333;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.toolbar-group{display:flex;align-items:center;gap:4px}
.toolbar-separator{width:1px;height:24px;background:#ddd;margin:0 6px}
body.dark .toolbar-separator{background:#333}
.toolbar-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border:1px solid #ddd;background:#fff;color:#1a1a2e;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:500;transition:background .15s;white-space:nowrap}
body.dark .toolbar-btn{background:#1e2d4a;color:#e0e0e0;border-color:#444}
.toolbar-btn:hover{background:#f0f4f8}
body.dark .toolbar-btn:hover{background:#243354}
.toolbar-btn:disabled{opacity:.4;cursor:not-allowed}
.toolbar-btn svg{width:14px;height:14px}
.toolbar-title{font-family:'Playfair Display',Georgia,serif;font-size:15px;font-weight:700;color:#345363;margin-right:8px}
body.dark .toolbar-title{color:#9EDB9E}
.save-indicator{position:fixed;bottom:16px;right:16px;padding:6px 14px;background:#fff;border:1px solid #ddd;border-radius:6px;font-size:12px;color:#555;box-shadow:0 4px 16px rgba(0,0,0,.12);opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;pointer-events:none;z-index:1000}
body.dark .save-indicator{background:#16213e;border-color:#333;color:#aaa;box-shadow:0 4px 16px rgba(0,0,0,.4)}
.save-indicator.show{opacity:1;transform:translateY(0)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:7px 14px;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .15s}
body.dark .btn{border-color:#444}
.btn-primary{background:#345363;color:#fff;border-color:#345363}
.btn-primary:hover{background:#4a7a8c;border-color:#4a7a8c}
.btn-secondary{background:#fff;color:#1a1a2e}
body.dark .btn-secondary{background:#1e2d4a;color:#e0e0e0}
.btn-secondary:hover{background:#f0f4f8}
body.dark .btn-secondary:hover{background:#243354}
.btn-success{background:#5cb85c;color:#fff;border-color:#5cb85c}
.btn-success:hover{opacity:.9}
.btn-danger{background:#d9534f;color:#fff;border-color:#d9534f}
.btn-danger:hover{opacity:.9}
.btn-warning{background:#f0ad4e;color:#fff;border-color:#f0ad4e}
.btn-info{background:#5bc0de;color:#fff;border-color:#5bc0de}
.btn-sm{padding:4px 8px;font-size:11px}
.btn-icon{padding:5px 8px;min-width:28px}
.btn-block{display:flex;width:100%}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.badge-soil{background:#e8d5a0;color:#6b4e16}
.badge-core{background:#b8d4e8;color:#1a4a6e}
.badge-rc{background:#e0d0e8;color:#4a2a6e}
.badge-testpit{background:#d0e8d0;color:#2a5e2a}
.project-manager{padding:24px;max-width:1200px;margin:0 auto;width:100%}
.project-manager-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}
.project-manager-header h1{font-family:'Playfair Display',Georgia,serif;font-size:28px;color:#345363;margin:0}
body.dark .project-manager-header h1{color:#9EDB9E}
.project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.project-card{background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);transition:box-shadow .15s;cursor:pointer}
body.dark .project-card{background:#1e2d4a;border-color:#333;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.project-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.12)}
body.dark .project-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.4)}
.project-card-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
.project-card-header h3{font-family:'Playfair Display',Georgia,serif;font-size:18px;margin:0;color:#345363}
body.dark .project-card-header h3{color:#9EDB9E}
.project-card-body{font-size:13px;color:#555;margin-bottom:12px}
body.dark .project-card-body{color:#aaa}
.project-card-body p{margin:3px 0}
.project-card-actions{display:flex;gap:4px;flex-wrap:wrap}
.logging-workspace{display:flex;flex:1;overflow:hidden}
.left-panel{width:420px;min-width:340px;border-right:1px solid #ddd;background:#fff;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column}
body.dark .left-panel{background:#16213e;border-color:#333}
.right-panel{flex:1;overflow:auto;background:#f5f6f8;display:flex;flex-direction:column}
body.dark .right-panel{background:#1a1a2e}
.hole-tabs{display:flex;align-items:center;gap:2px;padding:8px;background:#fff;border-bottom:1px solid #ddd;overflow-x:auto}
body.dark .hole-tabs{background:#16213e;border-color:#333}
.hole-tab{padding:6px 14px;border:1px solid #ddd;border-radius:4px 4px 0 0;font-size:12px;font-weight:500;cursor:pointer;background:#fafafa;color:#555;white-space:nowrap;transition:all .15s}
body.dark .hole-tab{background:#1e2d4a;color:#aaa;border-color:#444}
.hole-tab.active{background:#fff;color:#345363;border-bottom-color:#fff;font-weight:600}
body.dark .hole-tab.active{background:#16213e;color:#9EDB9E;border-bottom-color:#16213e}
.hole-tab:hover:not(.active){background:#f0f4f8}
body.dark .hole-tab:hover:not(.active){background:#243354}
.hole-tab-add{padding:6px 10px;border:1px dashed #ddd;border-radius:4px;font-size:12px;cursor:pointer;background:0 0;color:#4DA34D;white-space:nowrap;font-weight:500}
body.dark .hole-tab-add{border-color:#444}
.hole-tab-add:hover{background:#f0f4f8}
body.dark .hole-tab-add:hover{background:#243354}
.panel{background:#fff;margin:8px;border-radius:6px;border:1px solid #ddd;overflow:hidden}
body.dark .panel{background:#16213e;border-color:#333}
.panel-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;font-weight:600;font-size:13px;color:#1a1a2e;user-select:none}
body.dark .panel-header{color:#e0e0e0}
.panel-header:hover{background:#f0f4f8}
body.dark .panel-header:hover{background:#243354}
.panel-header-count{font-size:11px;color:#555;font-weight:400}
body.dark .panel-header-count{color:#aaa}
.panel-body{padding:12px 14px;border-top:1px solid #ddd}
body.dark .panel-body{border-color:#333}
.panel-body.collapsed{display:none}
.form-section{margin-bottom:8px}
.form-row{display:flex;gap:10px;margin-bottom:8px;align-items:flex-end}
.form-row-2>*{flex:1;min-width:0}
.form-row-3>*{flex:1;min-width:0}
.form-row-4>*{flex:1;min-width:0}
.form-group{display:flex;flex-direction:column;gap:3px}
.form-label{font-size:11px;font-weight:500;color:#555;text-transform:uppercase;letter-spacing:.3px}
body.dark .form-label{color:#aaa}
.form-input,.form-select,.form-textarea{padding:7px 10px;border:1px solid #ccc;border-radius:4px;font-family:inherit;font-size:13px;background:#fff;color:#1a1a2e;transition:border-color .15s}
body.dark .form-input,body.dark .form-select,body.dark .form-textarea{background:#1e2d4a;color:#e0e0e0;border-color:#444}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:0;border-color:#345363;box-shadow:0 0 0 2px rgba(52,83,99,.15)}
.form-textarea{resize:vertical;min-height:60px}
.form-input.depth-warning{border-color:#d9534f;box-shadow:0 0 0 2px rgba(217,83,79,.15)}
.form-input.depth-gap{border-color:#f0ad4e;box-shadow:0 0 0 2px rgba(240,173,78,.15)}
.interval-card{background:#fff;border:1px solid #ddd;border-radius:6px;margin-bottom:8px;overflow:hidden}
body.dark .interval-card{background:#1e2d4a;border-color:#333}
.interval-card-header{display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;background:#fafafa}
body.dark .interval-card-header{background:#16213e}
.interval-card-header:hover{background:#f0f4f8}
body.dark .interval-card-header:hover{background:#243354}
.interval-card-header .interval-number{font-weight:700;color:#345363;font-size:13px;min-width:24px}
.interval-card-header .interval-depths{font-size:12px;color:#555}
body.dark .interval-card-header .interval-depths{color:#aaa}
.interval-card-header .interval-preview{flex:1;font-size:12px;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.dark .interval-card-header .interval-preview{color:#e0e0e0}
.interval-card-header .interval-actions{display:flex;gap:4px}
.interval-card-body{padding:12px 14px;border-top:1px solid #ddd}
body.dark .interval-card-body{border-color:#333}
.interval-card-body.collapsed{display:none}
.interval-card.overlap{border-left:3px solid #d9534f}
.interval-card.gap{border-left:3px solid #f0ad4e}
.pattern-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:4px}
.pattern-swatch{padding:6px 4px;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:10px;text-align:center;background:#fff;color:#1a1a2e;transition:all .15s}
body.dark .pattern-swatch{background:#1e2d4a;color:#e0e0e0;border-color:#444}
.pattern-swatch:hover{background:#f0f4f8}
body.dark .pattern-swatch:hover{background:#243354}
.pattern-swatch.selected{border-color:#345363;background:rgba(52,83,99,.1);color:#345363;font-weight:600}
body.dark .pattern-swatch.selected{background:rgba(158,219,158,.1);color:#9EDB9E;border-color:#9EDB9E}
.pattern-swatch-preview{width:100%;height:18px;margin-bottom:2px;border-radius:2px}
.desc-builder{background:#fafafa;border:1px solid #ddd;border-radius:4px;padding:10px;margin-top:8px}
body.dark .desc-builder{background:#1e2d4a;border-color:#444}
.desc-builder-soil,.desc-builder-rock{display:flex;flex-direction:column;gap:8px}
.desc-form-group{display:flex;flex-direction:column;gap:3px}
.desc-label{font-size:11px;font-weight:500;color:#555;text-transform:uppercase}
body.dark .desc-label{color:#aaa}
.desc-select,.desc-input{padding:5px 8px;border:1px solid #ccc;border-radius:4px;font-size:12px;font-family:inherit;background:#fff;color:#1a1a2e}
body.dark .desc-select,body.dark .desc-input{background:#1e2d4a;color:#e0e0e0;border-color:#444}
.desc-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px}
.desc-row{display:flex;gap:4px}
.desc-preview{margin-top:8px;padding:8px;background:#fff;border-radius:4px;font-size:12px;color:#1a1a2e;border:1px solid #ddd}
body.dark .desc-preview{background:#16213e;color:#e0e0e0;border-color:#333}
.spt-form{background:#fafafa;border:1px solid #ddd;border-radius:4px;padding:10px;margin-top:8px}
body.dark .spt-form{background:#1e2d4a;border-color:#444}
.spt-form .form-row{margin-bottom:4px}
.spt-n-display{font-weight:700;font-size:18px;color:#345363}
body.dark .spt-n-display{color:#9EDB9E}
.fieldtest-card,.sample-card,.water-card,.casing-card{display:flex;align-items:center;gap:10px;padding:8px 10px;background:#fafafa;border:1px solid #ddd;border-radius:4px;margin-bottom:6px;font-size:12px}
body.dark .fieldtest-card,body.dark .sample-card,body.dark .water-card,body.dark .casing-card{background:#1e2d4a;border-color:#444}
.fieldtest-card .ft-info,.sample-card .s-info,.water-card .w-info,.casing-card .c-info{flex:1;min-width:0}
.fieldtest-card .ft-actions,.sample-card .s-actions,.water-card .w-actions,.casing-card .c-actions{display:flex;gap:4px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:200}
.modal{background:#fff;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);max-width:480px;width:90%;max-height:80vh;overflow-y:auto}
body.dark .modal{background:#16213e;box-shadow:0 4px 16px rgba(0,0,0,.4)}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #ddd}
body.dark .modal-header{border-color:#333}
.modal-header h3{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:17px;color:#345363}
body.dark .modal-header h3{color:#9EDB9E}
.modal-body{padding:18px}
.modal-footer{display:flex;gap:8px;padding:12px 18px;border-top:1px solid #ddd;justify-content:flex-end}
body.dark .modal-footer{border-color:#333}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;text-align:center}
.empty-state h2{font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#345363;margin:16px 0 8px}
body.dark .empty-state h2{color:#9EDB9E}
.empty-state p{color:#555;font-size:14px;max-width:400px;line-height:1.5}
body.dark .empty-state p{color:#aaa}
.striplog-container{padding:8px;display:flex;justify-content:center}
.striplog-toolbar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border-bottom:1px solid #ddd;flex-wrap:wrap}
body.dark .striplog-toolbar{background:#16213e;border-color:#333}
.striplog-toolbar .btn{font-size:11px;padding:4px 8px}
.striplog-toolbar .btn.active{background:#345363;color:#fff;border-color:#345363}
body.dark .striplog-toolbar .btn.active{background:#9EDB9E;color:#1a1a2e;border-color:#9EDB9E}
.hidden{display:none!important}
.mt-4{margin-top:4px}.mt-8{margin-top:8px}.mb-8{margin-bottom:8px}
.text-sm{font-size:12px}.text-muted{color:#555}
body.dark .text-muted{color:#aaa}
@media(max-width:1200px){.left-panel{width:350px;min-width:300px}}
@media(max-width:768px){.logging-workspace{flex-direction:column}.left-panel{width:100%;min-width:0;max-height:55vh;border-right:none;border-bottom:1px solid #ddd}.right-panel{max-height:45vh}.toolbar{gap:3px;padding:6px 8px}.toolbar-btn{padding:5px 7px;font-size:11px}.project-grid{grid-template-columns:1fr}.form-row-2,.form-row-3,.form-row-4{flex-wrap:wrap}.form-row-2>*,.form-row-3>*,.form-row-4>*{flex:0 0 calc(50% - 5px)}}
@media print{.toolbar,.left-panel,.save-indicator,.modal-overlay{display:none!important}.logging-workspace{display:block}.right-panel{max-width:none!important;width:100%!important;overflow:visible!important}body{background:#fff!important}@page{size:A4 landscape;margin:10mm}.striplog-container svg{max-width:100%;height:auto}}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function $(sel, parent) { return (parent || document).querySelector(sel); }
function $$(sel, parent) { return (parent || document).querySelectorAll(sel); }
function h(tag, attrs, children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') el.className = v;
      else if (k === 'innerHTML') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
  }
  if (children) {
    if (typeof children === 'string') el.textContent = children;
    else if (Array.isArray(children)) children.forEach(c => el.appendChild(c));
    else el.appendChild(children);
  }
  return el;
}
function clr(el) { while (el.firstChild) el.removeChild(el.firstChild); }
function esc(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
let _timers = {};
function debounce(k, fn, ms) { if (_timers[k]) clearTimeout(_timers[k]); _timers[k] = setTimeout(fn, ms); }

// ─── Constants ───────────────────────────────────────────────────────────────

const PATTERNS = ['topsoil','clay','silt','sand','gravel','laterite','fill','peat','sandstone','siltstone','mudstone','shale','limestone','granite','gneiss','schist','quartzite','basalt','weathered_rock','core_loss'];
const PATTERN_COLORS = {topsoil:'#f5f0e0',clay:'#faf8f0',silt:'#fdfbf7',sand:'#fffef8',gravel:'#fefefb',laterite:'#e8c8a0',fill:'#f5f2ea',peat:'#e8d8b8',sandstone:'#fef9e0',siltstone:'#f8f4ec',mudstone:'#d8d0c4',shale:'#e0dcd4',limestone:'#f8f4e8',granite:'#faf5f0',gneiss:'#f8f4f0',schist:'#f6f2ec',quartzite:'#fefefa',basalt:'#585858',weathered_rock:'#e8dcc8',core_loss:'#fff'};
const HOLE_TYPE_BADGE = {soil:'soil',core:'core',rc:'rc',testpit:'testpit'};
const SAMPLE_TYPE_LABELS = {S:'Small Disturbed',U:'Undisturbed',D:'Disturbed',B:'Bulk',W:'Water'};
const FT_LABELS = {SPT:'SPT N',PP:'Pocket Pen.',SV:'Shear Vane',PL:'Point Load',DCP:'DCP',Other:'Other'};
const WEATHERING_GRADES = ['','W1','W2','W3','W4','W5','W6','FR','SW','MW','HW','CW','RS','XW'];
const STRENGTH_GRADES = ['','R0','R1','R2','R3','R4','R5','R6','EL','VL','L','M','H','VH','EH'];

// ─── State ───────────────────────────────────────────────────────────────────

let _currentView = 'projects';
let _openModal = null;
let _saveTimer = null;

export const UI = {

  // ===========================================================================
  //  INITIALIZATION
  // ===========================================================================

  async init() {
    if (!document.getElementById('gresolog-styles')) {
      const s = h('style', { id: 'gresolog-styles', innerHTML: STYLES });
      document.head.appendChild(s);
    }
    this._ensureDOM();
    try { await Model.init(); } catch (e) { console.error('Model init failed:', e); }
    const savedDark = localStorage.getItem('gresolog_darkMode');
    if (savedDark === 'true') { Model.darkMode = true; document.body.classList.add('dark'); StripLog.setDarkMode(true); }
    const legacy = await Model.checkLegacy();
    if (legacy) { await this.handleLegacyMigration(legacy); }
    Exports.setupPrintStyles();
    this.setupKeyboardShortcuts();
    this.setupAutoSave();
    if (Model.projects.length > 0) { await this.renderProjectManager(); }
    else { this._showCreateProjectModal(); }
  },

  _ensureDOM() {
    const root = $('#app-root'); if (!root) return; root.className = 'gresolog-app';
    if (!$('#toolbar')) root.appendChild(h('div', { id: 'toolbar', className: 'toolbar' }));
    if (!$('#save-indicator')) root.appendChild(h('div', { id: 'save-indicator', className: 'save-indicator' }, 'Saved'));
    if (!$('#main-content')) root.appendChild(h('div', { id: 'main-content' }));
  },

  // ===========================================================================
  //  VIEW SWITCHING
  // ===========================================================================

  async showProjectManager() {
    _currentView = 'projects';
    const mc = $('#main-content'); clr(mc);
    mc.appendChild(h('div', { id: 'project-manager', className: 'project-manager' }));
    await this.renderProjectManager();
  },

  async showLoggingView() {
    if (!Model.currentProject) return;
    _currentView = 'logging';
    const mc = $('#main-content'); clr(mc);
    const ws = h('div', { id: 'logging-workspace', className: 'logging-workspace' });
    const left = h('div', { id: 'left-panel', className: 'left-panel' });
    left.appendChild(h('div', { id: 'hole-tabs', className: 'hole-tabs' }));
    left.appendChild(h('div', { id: 'left-scroll', style: { flex: '1', overflowY: 'auto' } }));
    const right = h('div', { id: 'right-panel', className: 'right-panel' });
    right.appendChild(h('div', { id: 'striplog-toolbar', className: 'striplog-toolbar' }));
    right.appendChild(h('div', { id: 'striplog-container', className: 'striplog-container' }));
    ws.appendChild(left); ws.appendChild(right); mc.appendChild(ws);
    this.renderToolbar();
    const scrollEl = $('#left-scroll');
    ['hole-form-section','intervals-section','fieldtests-section','samples-section','water-section','casing-section'].forEach(id => scrollEl.appendChild(h('div', { id })));
    this._renderStriplogToolbar();
    await this._loadHoleView();
  },

  async _loadHoleView() {
    const holes = await this._getProjectHoles();
    if (holes.length === 0) {
      Model.currentHole = null; Model.currentIntervals = []; Model.currentFieldTests = []; Model.currentSamples = []; Model.currentWaterStrikes = []; Model.currentCasing = [];
      this._showEmptyHoles(); this.renderToolbar(); return;
    }
    if (!Model.currentHole) { try { await Model.selectHole(holes[0].id); } catch (e) { return; } }
    await this.renderHoleTabs(); await this.renderHoleForm(); await this.renderIntervals();
    await this.renderFieldTests(); await this.renderSamples(); await this.renderWaterStrikes(); await this.renderCasing();
    this.renderToolbar(); this.refreshStripLog();
  },

  async _getProjectHoles() {
    if (!Model.currentProject) return [];
    const { DB } = await import('./db.js');
    return DB.getHoles(Model.currentProject.id);
  },

  _showEmptyHoles() {
    ['hole-form-section','intervals-section','fieldtests-section','samples-section','water-section','casing-section'].forEach(id => { const el = $(`#${id}`); if (el) clr(el); });
    const fs = $('#hole-form-section');
    if (fs) {
      fs.innerHTML = `<div class="empty-state"><h2>Add Your First Borehole</h2><p>Start by creating a borehole log for this project.</p><button class="btn btn-primary mt-8" id="quick-add-hole">Add Borehole</button></div>`;
      const btn = $('#quick-add-hole', fs); if (btn) btn.addEventListener('click', () => this._quickAddHole());
    }
    const sc = $('#striplog-container'); if (sc) clr(sc);
  },

  async _quickAddHole() {
    const name = prompt('Borehole name:', 'BH-01'); if (!name) return;
    try { await Model.createHole({ projectId: Model.currentProject.id, name, type: 'soil' }); await this._loadHoleView(); }
    catch (e) { console.error(e); }
  },

  // ===========================================================================
  //  PROJECT MANAGER
  // ===========================================================================

  async renderProjectManager() {
    const pm = $('#project-manager'); if (!pm) return; clr(pm);
    const hdr = h('div', { className: 'project-manager-header' });
    hdr.appendChild(h('h1', {}, 'Projects'));
    const acts = h('div', { className: 'toolbar-group' });
    const newBtn = h('button', { className: 'btn btn-primary', onclick: () => this._showCreateProjectModal() }, 'New Project');
    const impLbl = h('label', { className: 'btn btn-secondary', style: { cursor: 'pointer' } }, 'Import JSON');
    const impInp = h('input', { type: 'file', accept: '.json', style: { display: 'none' }, onchange: (e) => this._handleImportProject(e) });
    impLbl.appendChild(impInp); acts.appendChild(newBtn); acts.appendChild(impLbl); hdr.appendChild(acts); pm.appendChild(hdr);
    if (Model.projects.length === 0) {
      pm.appendChild(h('div', { className: 'empty-state' }, [h('h2', {}, 'Welcome to G-Resolog Pro v2'), h('p', {}, 'Create your first project to start logging boreholes.'), h('button', { className: 'btn btn-primary mt-8', onclick: () => this._showCreateProjectModal() }, 'Create Your First Project')]));
      return;
    }
    const grid = h('div', { className: 'project-grid' });
    for (const proj of Model.projects) grid.appendChild(this._buildProjectCard(proj));
    pm.appendChild(grid);
  },

  _buildProjectCard(proj) {
    const card = h('div', { className: 'project-card' });
    card.appendChild(h('div', { className: 'project-card-header' }, [h('h3', {}, esc(proj.name || 'Untitled'))]));
    const body = h('div', { className: 'project-card-body' });
    if (proj.client) body.appendChild(h('p', {}, `Client: ${esc(proj.client)}`));
    if (proj.jobNo) body.appendChild(h('p', {}, `Job: ${esc(proj.jobNo)}`));
    body.appendChild(h('p', { className: 'text-sm text-muted' }, `Modified: ${proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'N/A'}`));
    card.appendChild(body);
    const acts = h('div', { className: 'project-card-actions' });
    acts.appendChild(h('button', { className: 'btn btn-primary btn-sm', onclick: async () => { await Model.selectProject(proj.id); await this.showLoggingView(); } }, 'Open'));
    acts.appendChild(h('button', { className: 'btn btn-secondary btn-sm', onclick: async () => { await Model.duplicateProject(proj.id); await this.renderProjectManager(); } }, 'Duplicate'));
    acts.appendChild(h('button', { className: 'btn btn-info btn-sm', onclick: async () => { try { const j = await Model.exportProjectJSON(proj.id); this._downloadJSON(j, `${proj.name}.json`); } catch(e) { console.error(e); } } }, 'Export'));
    acts.appendChild(h('button', { className: 'btn btn-danger btn-sm', onclick: () => this._confirmAndDeleteProject(proj) }, 'Delete'));
    card.appendChild(acts); return card;
  },

  async _confirmAndDeleteProject(proj) {
    if (!confirm(`Delete project "${esc(proj.name)}"? This cannot be undone.`)) return;
    try { await Model.deleteProject(proj.id); await this.renderProjectManager(); } catch (e) { console.error(e); }
  },

  _downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = h('a', { href: url, download: filename });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  },

  async _handleImportProject(e) {
    const file = e.target.files[0]; if (!file) return;
    try {
      const text = await file.text(); const json = JSON.parse(text);
      await Model.importProjectJSON(json); await this.renderProjectManager();
      this.showSaveIndicator('Project imported');
    } catch (err) { alert('Import failed: ' + err.message); }
    e.target.value = '';
  },

  _showCreateProjectModal() {
    this._showModal('New Project', `
      <div class="form-group"><label class="form-label">Project Name *</label><input class="form-input" id="mp-name" required></div>
      <div class="form-row form-row-2 mt-8"><div class="form-group"><label class="form-label">Client</label><input class="form-input" id="mp-client"></div><div class="form-group"><label class="form-label">Job No</label><input class="form-input" id="mp-jobno"></div></div>
      <div class="form-row form-row-2 mt-8"><div class="form-group"><label class="form-label">Datum</label><input class="form-input" id="mp-datum"></div><div class="form-group"><label class="form-label">EPSG</label><input class="form-input" id="mp-epsg"></div></div>
    `, async () => {
      const name = $('#mp-name')?.value.trim(); if (!name) return alert('Project name is required');
      try {
        const proj = await Model.createProject({ name, client: $('#mp-client')?.value || '', jobNo: $('#mp-jobno')?.value || '', datum: $('#mp-datum')?.value || '', epsg: $('#mp-epsg')?.value || '' });
        Model.currentProject = proj;
        await this.showLoggingView();
      } catch (err) { console.error(err); }
    });
  },

  // ===========================================================================
  //  TOOLBAR
  // ===========================================================================

  renderToolbar() {
    const tb = $('#toolbar'); if (!tb) return; clr(tb);

    // Left group
    const left = h('div', { className: 'toolbar-group' });
    if (_currentView === 'logging') {
      left.appendChild(h('button', { className: 'toolbar-btn', onclick: () => this.showProjectManager() }, [h('span', { innerHTML: '&#8592;' }), 'Projects']));
      left.appendChild(h('span', { className: 'toolbar-separator' }));
      if (Model.currentProject) {
        left.appendChild(h('span', { className: 'toolbar-title' }, esc(Model.currentProject.name || 'Untitled')));
        if (Model.currentHole) {
          left.appendChild(h('span', { style: { fontSize: '12px', color: '#888' } }, ` / ${esc(Model.currentHole.name || 'Hole')}`));
        }
      }
    } else {
      left.appendChild(h('span', { className: 'toolbar-title' }, 'G-Resolog Pro'));
    }
    tb.appendChild(left);

    // Center
    const center = h('div', { className: 'toolbar-group', style: { flex: '1', justifyContent: 'center' } });
    center.appendChild(h('button', { className: `toolbar-btn`, disabled: true, title: 'Undo (Ctrl+Z)' }, 'Undo'));
    tb.appendChild(center);

    // Right group
    const right = h('div', { className: 'toolbar-group' });
    if (_currentView === 'logging') {
      right.appendChild(h('button', { className: 'toolbar-btn btn-sm', onclick: () => this._handleExportPDF(), title: 'Export PDF' }, 'PDF'));
      right.appendChild(h('button', { className: 'toolbar-btn btn-sm', onclick: () => this._handleExportExcel(), title: 'Export Excel' }, 'XLSX'));
      right.appendChild(h('button', { className: 'toolbar-btn btn-sm', onclick: () => this._handleExportCSV(), title: 'Export CSV' }, 'CSV'));
      right.appendChild(h('button', { className: 'toolbar-btn btn-sm', onclick: () => window.print(), title: 'Print' }, 'Print'));
      right.appendChild(h('span', { className: 'toolbar-separator' }));
    }
    const themeBtn = h('button', { className: 'toolbar-btn btn-icon', title: 'Toggle dark mode', onclick: () => this._toggleDarkMode() },
      h('span', { innerHTML: Model.darkMode ? '&#9788;' : '&#9790;' }));
    right.appendChild(themeBtn);
    tb.appendChild(right);
  },

  _renderStriplogToolbar() {
    const st = $('#striplog-toolbar'); if (!st) return; clr(st);

    // Scale buttons
    const scaleGroup = h('div', { className: 'toolbar-group' });
    [50, 100, 200].forEach(s => {
      const btn = h('button', { className: `btn ${Model.scale === s ? 'active' : ''}`, onclick: () => { Model.scale = s; StripLog.setScale(s); this.refreshStripLog(); this._renderStriplogToolbar(); } }, `1:${s}`);
      scaleGroup.appendChild(btn);
    });
    st.appendChild(h('span', { className: 'text-sm text-muted', style: { marginRight: '4px' } }, 'Scale:'));
    st.appendChild(scaleGroup);

    st.appendChild(h('span', { className: 'toolbar-separator' }));

    // Column toggles
    const cols = [
      ['depthRuler','Depth'],['drillingMethod','Method'],['water','Water'],['samples','Samples'],
      ['spt','SPT'],['lithology','Lithology'],['description','Desc'],['weathering','Weath.'],
      ['strength','Strength'],['rqd','RQD'],['defects','Defects']
    ];
    cols.forEach(([key, label]) => {
      const visible = StripLog[`show${key[0].toUpperCase()}${key.slice(1)}`];
      const btn = h('button', { className: `btn btn-sm ${visible ? 'active' : ''}`, onclick: () => { StripLog.toggleColumn(key); this.refreshStripLog(); this._renderStriplogToolbar(); } }, label);
      st.appendChild(btn);
    });
  },

  _toggleDarkMode() {
    Model.darkMode = !Model.darkMode;
    document.body.classList.toggle('dark', Model.darkMode);
    StripLog.setDarkMode(Model.darkMode);
    localStorage.setItem('gresolog_darkMode', Model.darkMode);
    this.renderToolbar();
    this.refreshStripLog();
  },

  // ===========================================================================
  //  STRIP LOG
  // ===========================================================================

  refreshStripLog() {
    const container = $('#striplog-container'); if (!container) return;
    clr(container);
    if (!Model.currentHole) return;
    const result = StripLog.render(Model.currentHole, Model.currentIntervals, Model.currentFieldTests, Model.currentSamples, Model.currentWaterStrikes, Model.currentCasing, Model.currentProject);
    if (result) container.appendChild(result);
  },

  // ===========================================================================
  //  HOLE TABS
  // ===========================================================================

  async renderHoleTabs() {
    const tabsEl = $('#hole-tabs'); if (!tabsEl) return; clr(tabsEl);
    const holes = await this._getProjectHoles();
    holes.sort((a,b) => (a.order||0)-(b.order||0));
    holes.forEach(hole => {
      const tab = h('div', { className: `hole-tab${Model.currentHole && Model.currentHole.id === hole.id ? ' active' : ''}`,
        onclick: async () => { await Model.selectHole(hole.id); await this._loadHoleView(); } }, esc(hole.name || 'Untitled'));
      tab.addEventListener('dblclick', async () => {
        const newName = prompt('Rename hole:', hole.name); if (!newName || newName === hole.name) return;
        await Model.updateHole(hole.id, { name: newName }); await this.renderHoleTabs(); this.renderToolbar();
      });
      tabsEl.appendChild(tab);
    });
    const addBtn = h('button', { className: 'hole-tab-add', onclick: () => this._quickAddHole() }, '+ Add Hole');
    tabsEl.appendChild(addBtn);
  },

  // ===========================================================================
  //  HOLE FORM
  // ===========================================================================

  async renderHoleForm() {
    const section = $('#hole-form-section'); if (!section) return; clr(section);
    if (!Model.currentHole) return;
    const hd = Model.currentHole;
    const collapsed = hd._formCollapsed; if (collapsed === undefined) Model.currentHole._formCollapsed = false;

    const panel = h('div', { className: 'panel' });
    const hdr = h('div', { className: 'panel-header', onclick: () => { Model.currentHole._formCollapsed = !Model.currentHole._formCollapsed; this.renderHoleForm(); } },
      [h('span', {}, `Borehole: ${esc(hd.name)}`), h('span', { className: `badge badge-${HOLE_TYPE_BADGE[hd.type]||'soil'}` }, hd.type)]);
    panel.appendChild(hdr);

    if (!Model.currentHole._formCollapsed) {
      const body = h('div', { className: 'panel-body' });

      const addRow = (rowClass, fields) => {
        const row = h('div', { className: `form-row ${rowClass} mb-8` });
        fields.forEach(f => {
          const g = h('div', { className: 'form-group' });
          const id = `hf-${f.key}`;
          g.appendChild(h('label', { className: 'form-label', for: id }, f.label));
          if (f.options) {
            g.appendChild(h('select', { id, className: f.className || 'form-select', onchange: (e) => this._onHoleFieldChange(f.key, e.target.value) },
              f.options.map(o => h('option', { value: o, selected: String(hd[f.key]||'') === o }, o))));
          } else if (f.type === 'textarea') {
            g.appendChild(h('textarea', { id, className: 'form-textarea', oninput: (e) => this._onHoleFieldChange(f.key, e.target.value) }, hd[f.key]||''));
          } else if (f.type === 'date') {
            g.appendChild(h('input', { id, type: 'date', className: 'form-input', value: hd[f.key]||'', onchange: (e) => this._onHoleFieldChange(f.key, e.target.value) }));
          } else {
            g.appendChild(h('input', { id, type: f.type || 'text', className: 'form-input', value: hd[f.key]!=null ? hd[f.key] : '', placeholder: f.placeholder||'', oninput: (e) => debounce(`hf-${f.key}`, () => this._onHoleFieldChange(f.key, e.target.value), 500) }));
          }
          row.appendChild(g);
        });
        body.appendChild(row);
      };

      addRow('form-row-4', [
        { key: 'name', label: 'Name *', placeholder: 'BH-01' },
        { key: 'type', label: 'Type *', options: ['soil','core','rc','testpit'] },
        { key: 'easting', label: 'Easting', type: 'number' },
        { key: 'northing', label: 'Northing', type: 'number' }
      ]);
      addRow('form-row-4', [
        { key: 'rl', label: 'RL (m)', type: 'number' },
        { key: 'depth', label: 'Total Depth (m) *', type: 'number' },
        { key: 'drillMethod', label: 'Drill Method', options: ['','AD','HA','RD','CD','PD','WS','TP','DC','RC','DT','RCD'] },
        { key: 'dia', label: 'Dia (mm)', type: 'number' }
      ]);
      addRow('form-row-4', [
        { key: 'inclination', label: 'Incl (°)', type: 'number' },
        { key: 'azimuth', label: 'Azimuth (°)', type: 'number' },
        { key: 'startDate', label: 'Start Date', type: 'date' },
        { key: 'loggedBy', label: 'Logged By' }
      ]);
      addRow('form-row-3', [
        { key: 'checkedBy', label: 'Checked By' }
      ]);

      // Delete hole button
      const delRow = h('div', { className: 'mt-8' });
      delRow.appendChild(h('button', { className: 'btn btn-danger btn-sm', onclick: async () => {
        if (!confirm(`Delete borehole "${esc(hd.name)}"? All data will be lost.`)) return;
        await Model.deleteHole(hd.id); await this._loadHoleView();
      } }, 'Delete Borehole'));
      body.appendChild(delRow);

      panel.appendChild(body);
    }

    section.appendChild(panel);
  },

  async _onHoleFieldChange(key, value) {
    if (!Model.currentHole) return;
    if (key === 'depth') value = value ? parseFloat(value) : null;
    if (key === 'easting' || key === 'northing' || key === 'rl' || key === 'dia' || key === 'inclination' || key === 'azimuth') value = value === '' ? null : parseFloat(value);
    try {
      await Model.updateHole(Model.currentHole.id, { [key]: value });
    } catch (e) { console.error(e); }
    if (key === 'name' || key === 'type') { this.renderHoleTabs(); this.renderToolbar(); }
    this.refreshStripLog();
  },

  // ===========================================================================
  //  INTERVALS
  // ===========================================================================

  async renderIntervals() {
    const section = $('#intervals-section'); if (!section) return; clr(section);
    if (!Model.currentHole) return;

    const intervals = Model.currentIntervals;
    const warnings = Model.validateDepths();
    const warnIds = {}; warnings.forEach(w => { warnIds[w.intervalId] = w.type; if (w.nextIntervalId && w.type === 'overlap') warnIds[w.nextIntervalId] = 'overlap'; });

    const panel = h('div', { className: 'panel' });
    const hdr = h('div', { className: 'panel-header', onclick: () => this._togglePanel('intervals-body') },
      [h('span', {}, 'Stratigraphy / Intervals'), h('span', { className: 'panel-header-count' }, `${intervals.length} layer(s)`)]);
    panel.appendChild(hdr);

    const body = h('div', { id: 'intervals-body', className: 'panel-body' });
    if (localStorage.getItem('gresolog_intervals_collapsed') === 'true') body.classList.add('collapsed');

    // Add interval button at top
    body.appendChild(h('button', { className: 'btn btn-success btn-sm mb-8', onclick: () => this._addNewInterval() }, '+ Add Interval'));

    if (intervals.length === 0) {
      body.appendChild(h('p', { className: 'text-muted text-sm' }, 'No layers logged yet. Add your first interval below.'));
    }

    intervals.forEach((iv, idx) => {
      const warnClass = warnIds[iv.id] === 'overlap' ? 'overlap' : (warnIds[iv.id] === 'gap' ? 'gap' : '');
      const card = h('div', { className: `interval-card ${warnClass}` });

      // Header
      const firstLine = (iv.description || '').split(/[.,\n]/)[0].trim();
      const cardHdr = h('div', { className: 'interval-card-header', onclick: () => this._toggleIntervalBody(iv.id, card) });
      cardHdr.appendChild(h('span', { className: 'interval-number' }, `#${idx+1}`));
      cardHdr.appendChild(h('span', { className: 'interval-depths' }, `${iv.topDepth||0} – ${iv.baseDepth||0}m`));
      cardHdr.appendChild(h('span', { className: 'interval-preview' }, esc(firstLine || 'No description')));
      const cardActs = h('div', { className: 'interval-actions' });
      cardActs.appendChild(h('button', { className: 'btn btn-sm btn-secondary', onclick: (e) => { e.stopPropagation(); this._duplicateInterval(iv); } }, 'Dup'));
      const moveUp = h('button', { className: 'btn btn-sm btn-icon', disabled: idx === 0, onclick: (e) => { e.stopPropagation(); this._moveInterval(iv, 'up'); } });
      moveUp.appendChild(h('span', { innerHTML: '&#8593;' })); cardActs.appendChild(moveUp);
      const moveDn = h('button', { className: 'btn btn-sm btn-icon', disabled: idx === intervals.length - 1, onclick: (e) => { e.stopPropagation(); this._moveInterval(iv, 'down'); } });
      moveDn.appendChild(h('span', { innerHTML: '&#8595;' })); cardActs.appendChild(moveDn);
      cardActs.appendChild(h('button', { className: 'btn btn-sm btn-danger', onclick: (e) => { e.stopPropagation(); this._deleteInterval(iv); } }, 'X'));
      cardHdr.appendChild(cardActs);
      card.appendChild(cardHdr);

      // Body
      const cardBody = h('div', { id: `iv-body-${iv.id}`, className: 'interval-card-body collapsed' });
      cardBody.appendChild(this._buildIntervalForm(iv, intervals));
      card.appendChild(cardBody);
      body.appendChild(card);
    });

    // Add interval button at bottom
    body.appendChild(h('button', { className: 'btn btn-success btn-sm mt-8', onclick: () => this._addNewInterval() }, '+ Add Interval'));

    panel.appendChild(body);
    section.appendChild(panel);
  },

  _togglePanel(bodyId) {
    const body = $(`#${bodyId}`); if (!body) return;
    body.classList.toggle('collapsed');
    localStorage.setItem(`gresolog_${bodyId}_collapsed`, body.classList.contains('collapsed'));
  },

  _toggleIntervalBody(ivId, card) {
    const body = $(`#iv-body-${ivId}`); if (!body) return;
    body.classList.toggle('collapsed');
  },

  async _addNewInterval() {
    if (!Model.currentHole) return;
    const last = Model.currentIntervals.length > 0 ? Math.max(...Model.currentIntervals.map(i => i.baseDepth||0)) : 0;
    try {
      const iv = await Model.createInterval({ holeId: Model.currentHole.id, topDepth: last, baseDepth: last + 1, order: Model.currentIntervals.length });
      await this.renderIntervals(); this.refreshStripLog();
      // Expand the new interval
      setTimeout(() => { const body = $(`#iv-body-${iv.id}`); if (body) body.classList.remove('collapsed'); }, 100);
    } catch (e) { console.error(e); }
  },

  async _duplicateInterval(iv) {
    const clone = { ...iv, id: undefined, order: Model.currentIntervals.length, fieldTests: [] };
    try { await Model.createInterval(clone); await this.renderIntervals(); this.refreshStripLog(); }
    catch (e) { console.error(e); }
  },

  async _deleteInterval(iv) {
    if (!confirm(`Delete interval ${iv.topDepth||0}-${iv.baseDepth||0}m?`)) return;
    try { await Model.deleteInterval(iv.id); await this.renderIntervals(); this.refreshStripLog(); }
    catch (e) { console.error(e); }
  },

  async _moveInterval(iv, dir) {
    const list = [...Model.currentIntervals];
    const idx = list.findIndex(i => i.id === iv.id); if (idx < 0) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    // Swap tops/base depths
    const a = list[idx], b = list[swapIdx];
    const aTop = a.topDepth, aBase = a.baseDepth, bTop = b.topDepth, bBase = b.baseDepth;
    try {
      await Model.updateInterval(a.id, { topDepth: bTop, baseDepth: bBase });
      await Model.updateInterval(b.id, { topDepth: aTop, baseDepth: aBase });
      await this._reloadIntervals(); await this.renderIntervals(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  async _reloadIntervals() {
    if (!Model.currentHole) return;
    const { DB } = await import('./db.js');
    Model.currentIntervals = await DB.getIntervals(Model.currentHole.id);
    Model.sortIntervals();
  },

  _buildIntervalForm(iv, allIntervals) {
    const form = h('div');
    const holeType = Model.currentHole ? Model.currentHole.type : 'soil';

    // Depth row
    const depthRow = h('div', { className: 'form-row form-row-2 mb-8' });
    const topG = h('div', { className: 'form-group' });
    topG.appendChild(h('label', { className: 'form-label' }, 'Top Depth (m) *'));
    const topInp = h('input', { type: 'number', className: 'form-input', value: iv.topDepth||0, step: '0.01',
      onchange: (e) => this._updateIntervalField(iv.id, 'topDepth', parseFloat(e.target.value)||0) });
    topG.appendChild(topInp); depthRow.appendChild(topG);
    const baseG = h('div', { className: 'form-group' });
    baseG.appendChild(h('label', { className: 'form-label' }, 'Base Depth (m) *'));
    const baseInp = h('input', { type: 'number', className: 'form-input', value: iv.baseDepth||0, step: '0.01',
      onchange: (e) => this._updateIntervalField(iv.id, 'baseDepth', parseFloat(e.target.value)||0) });
    baseG.appendChild(baseInp); depthRow.appendChild(baseG);
    form.appendChild(depthRow);

    // Pattern picker
    const patGroup = h('div', { className: 'form-group mb-8' });
    patGroup.appendChild(h('label', { className: 'form-label' }, 'Pattern'));
    const patGrid = h('div', { className: 'pattern-grid' });
    PATTERNS.forEach(p => {
      const sw = h('div', { className: `pattern-swatch${iv.pattern === p ? ' selected' : ''}`,
        onclick: () => this._updateIntervalField(iv.id, 'pattern', p) });
      sw.appendChild(h('div', { className: 'pattern-swatch-preview', style: { backgroundColor: PATTERN_COLORS[p]||'#ccc' } }));
      sw.appendChild(h('span', {}, p.replace(/_/g,' ')));
      patGrid.appendChild(sw);
    });
    patGroup.appendChild(patGrid); form.appendChild(patGroup);

    // Description
    const descG = h('div', { className: 'form-group mb-8' });
    descG.appendChild(h('label', { className: 'form-label' }, 'Description'));
    const ta = h('textarea', { className: 'form-textarea', oninput: (e) => debounce(`desc-${iv.id}`, () => this._updateIntervalField(iv.id, 'description', e.target.value), 500) }, iv.description||'');
    descG.appendChild(ta); form.appendChild(descG);

    // Desc builder toggle
    const dbToggle = h('button', { className: 'btn btn-secondary btn-sm mb-8', onclick: () => this.showDescriptionBuilder(iv, form) },
      iv._descBuilderOpen ? 'Hide Description Builder' : 'Use Description Builder');
    form.appendChild(dbToggle);

    // Desc builder panel
    const dbContainer = h('div', { id: `db-${iv.id}`, className: iv._descBuilderOpen ? 'desc-builder' : 'hidden' });
    form.appendChild(dbContainer);

    if (iv._descBuilderOpen) {
      this.showDescriptionBuilder(iv, form);
    }

    // Weathering / Strength for rock/soil
    const wsRow = h('div', { className: 'form-row form-row-2 mb-8' });
    const wg = h('div', { className: 'form-group' });
    wg.appendChild(h('label', { className: 'form-label' }, 'Weathering'));
    wg.appendChild(h('select', { className: 'form-select', onchange: (e) => this._updateIntervalField(iv.id, 'weathering', e.target.value) },
      WEATHERING_GRADES.map(w => h('option', { value: w, selected: iv.weathering === w }, w||'—'))));
    wsRow.appendChild(wg);
    const sg = h('div', { className: 'form-group' });
    sg.appendChild(h('label', { className: 'form-label' }, 'Strength'));
    sg.appendChild(h('select', { className: 'form-select', onchange: (e) => this._updateIntervalField(iv.id, 'strength', e.target.value) },
      STRENGTH_GRADES.map(s => h('option', { value: s, selected: iv.strength === s }, s||'—'))));
    wsRow.appendChild(sg); form.appendChild(wsRow);

    // Core-specific: run length, recovery
    if (holeType === 'core') {
      const coreRow = h('div', { className: 'form-row form-row-4 mb-8' });
      const fields = [
        ['Run Length (m)', 'runLength'], ['Recovered (m)', 'recLength'],
        ['Solid Core (m)', 'solidLength'], ['Pieces \u2265100mm (m)', 'pieces100']
      ];
      fields.forEach(([label, key]) => {
        const fg = h('div', { className: 'form-group' });
        fg.appendChild(h('label', { className: 'form-label' }, label));
        fg.appendChild(h('input', { type: 'number', step: '0.01', className: 'form-input', value: iv[key]!=null ? iv[key] : '',
          onchange: (e) => { const v = e.target.value === '' ? null : parseFloat(e.target.value);
            this._updateIntervalField(iv.id, key, v); this._recalcCoreMetrics(iv); } }));
        coreRow.appendChild(fg);
      });
      form.appendChild(coreRow);

      // TCR/SCR/RQD display
      const tcrRow = h('div', { className: 'form-row form-row-3 mb-8' });
      const metrics = DescBuilder.calculateCoreMetrics(iv.runLength, iv.recLength, iv.solidLength, iv.pieces100);
      ['tcr','scr','rqd'].forEach(key => {
        const fg = h('div', { className: 'form-group' });
        fg.appendChild(h('label', { className: 'form-label' }, key.toUpperCase() + ' %'));
        fg.appendChild(h('input', { type: 'number', className: 'form-input', value: iv[key]!=null ? iv[key] : metrics[key],
          onchange: (e) => this._updateIntervalField(iv.id, key, parseFloat(e.target.value)||0) }));
        tcrRow.appendChild(fg);
      });
      form.appendChild(tcrRow);
    }

    // Recovery % / RQD % as manual overrides
    const recRow = h('div', { className: 'form-row form-row-2 mb-8' });
    const recG = h('div', { className: 'form-group' });
    recG.appendChild(h('label', { className: 'form-label' }, 'Recovery %'));
    recG.appendChild(h('input', { type: 'number', className: 'form-input', value: iv.recovery!=null ? iv.recovery : '',
      onchange: (e) => this._updateIntervalField(iv.id, 'recovery', e.target.value === '' ? null : parseFloat(e.target.value)) }));
    recRow.appendChild(recG);
    const rqdG = h('div', { className: 'form-group' });
    rqdG.appendChild(h('label', { className: 'form-label' }, 'RQD %'));
    rqdG.appendChild(h('input', { type: 'number', className: 'form-input', value: iv.rqd!=null ? iv.rqd : '',
      onchange: (e) => this._updateIntervalField(iv.id, 'rqd', e.target.value === '' ? null : parseFloat(e.target.value)) }));
    recRow.appendChild(rqdG); form.appendChild(recRow);

    // Is(50)
    const isRow = h('div', { className: 'form-row form-row-2 mb-8' });
    const isG = h('div', { className: 'form-group' });
    isG.appendChild(h('label', { className: 'form-label' }, 'Is(50) MPa'));
    isG.appendChild(h('input', { type: 'number', step: '0.01', className: 'form-input', value: iv.is50!=null ? iv.is50 : '',
      onchange: (e) => this._updateIntervalField(iv.id, 'is50', e.target.value === '' ? null : parseFloat(e.target.value)) }));
    isRow.appendChild(isG);
    // Defect spacing checkboxes
    const defG = h('div', { className: 'form-group' });
    defG.appendChild(h('label', { className: 'form-label' }, 'Defect Spacing (mm)'));
    const defVal = (iv.defectSpacing||'').split(/,\s*/).filter(Boolean);
    const defDiv = h('div', { className: 'flex-center', style: { gap: '8px' } });
    ['30','100','300','1000','3000'].forEach(ds => {
      const checked = defVal.includes(ds);
      const lbl = h('label', { className: 'flex-center', style: { gap: '2px', fontSize: '12px', cursor: 'pointer' } });
      lbl.appendChild(h('input', { type: 'checkbox', checked, onchange: () => {
        const cur = (iv.defectSpacing||'').split(/,\s*/).filter(Boolean);
        if (cur.includes(ds)) { cur.splice(cur.indexOf(ds), 1); } else { cur.push(ds); }
        this._updateIntervalField(iv.id, 'defectSpacing', cur.join(', ')||null);
      } }));
      lbl.appendChild(document.createTextNode(ds));
      defDiv.appendChild(lbl);
    });
    defG.appendChild(defDiv); isRow.appendChild(defG); form.appendChild(isRow);

    // SPT sub-form
    const sptContainer = h('div', { id: `spt-${iv.id}`, className: 'spt-form' });
    sptContainer.appendChild(h('label', { className: 'form-label' }, 'SPT Test'));
    const sptData = this._getSptData(iv.id);
    const sptRow = h('div', { className: 'form-row form-row-4' });
    const sptFields = [
      ['Seating (150mm)', 'seating'],
      ['75mm #1', 'blow1'],
      ['75mm #2', 'blow2'],
      ['75mm #3', 'blow3']
    ];
    sptFields.forEach(([label, key]) => {
      const fg = h('div', { className: 'form-group' });
      fg.appendChild(h('label', { className: 'form-label' }, label));
      fg.appendChild(h('input', { type: 'text', className: 'form-input', value: sptData[key]||'', placeholder: key==='seating'?'0':'',
        oninput: (e) => { sptData[key] = e.target.value; this._updateIntervalSpt(iv.id, sptData); } }));
      sptRow.appendChild(fg);
    });
    sptContainer.appendChild(sptRow);
    // N display
    const nDisplay = h('div', { className: 'spt-n-display mt-4' });
    const sptResult = this._calcSptN(sptData);
    let nText = 'N = ';
    if (sptResult.refusal) { nText += 'R (Refusal)'; }
    else if (sptResult.n !== null) { nText += sptResult.n; }
    else { nText += '—'; }
    nDisplay.textContent = nText;
    sptContainer.appendChild(nDisplay);
    form.appendChild(sptContainer);

    return form;
  },

  _getSptData(ivId) {
    if (!Model.currentHole) return {};
    const ft = Model.currentFieldTests.find(t => t.intervalId === ivId && t.type === 'SPT');
    if (ft && ft.data) return { ...ft.data, ftId: ft.id };
    return {};
  },

  _calcSptN(data) {
    const seating = parseInt(data.seating) || 0;
    const b1 = data.blow1, b2 = data.blow2, b3 = data.blow3;
    const hasR = (b1||'').toString().toUpperCase() === 'R' || (b2||'').toString().toUpperCase() === 'R' || (b3||'').toString().toUpperCase() === 'R';
    if (hasR) return { n: null, refusal: true };
    const n = (parseInt(b2)||0) + (parseInt(b3)||0);
    return { n: isNaN(n) ? null : n, refusal: false };
  },

  async _updateIntervalSpt(ivId, sptData) {
    const { DB } = await import('./db.js');
    const existing = Model.currentFieldTests.find(t => t.intervalId === ivId && t.type === 'SPT');
    const ftId = sptData.ftId; delete sptData.ftId;
    if (existing) {
      await DB.updateFieldTest(existing.id, { data: sptData });
      const idx = Model.currentFieldTests.indexOf(existing);
      if (idx >= 0) Model.currentFieldTests[idx].data = sptData;
    } else {
      const ft = await DB.createFieldTest({ intervalId: ivId, holeId: Model.currentHole.id, type: 'SPT', depth: Model.currentIntervals.find(i => i.id === ivId)?.topDepth || 0, data: sptData });
      Model.currentFieldTests.push(ft);
    }
    this.refreshStripLog();
  },

  async _recalcCoreMetrics(iv) {
    const m = DescBuilder.calculateCoreMetrics(iv.runLength, iv.recLength, iv.solidLength, iv.pieces100);
    try { await Model.updateInterval(iv.id, { tcr: m.tcr, scr: m.scr, rqd: m.rqd }); } catch (e) { console.error(e); }
  },

  async _updateIntervalField(ivId, key, value) {
    try { await Model.updateInterval(ivId, { [key]: value }); } catch (e) { console.error(e); }
    await this.renderIntervals(); this.refreshStripLog();
  },

  showDescriptionBuilder(iv, formEl) {
    iv._descBuilderOpen = !iv._descBuilderOpen;
    const dbContainer = $(`#db-${iv.id}`);
    if (!dbContainer) return;

    if (!iv._descBuilderOpen) {
      dbContainer.classList.add('hidden');
      dbContainer.innerHTML = '';
      // Toggle button text
      const btn = formEl.querySelector('.btn-secondary.btn-sm');
      if (btn) btn.textContent = 'Use Description Builder';
      return;
    }

    dbContainer.classList.remove('hidden');
    const btn = formEl.querySelector('.btn-secondary.btn-sm');
    if (btn) btn.textContent = 'Hide Description Builder';

    const holeType = Model.currentHole ? Model.currentHole.type : 'soil';
    const isRock = holeType === 'core';

    const onChange = () => {
      let desc = '';
      if (isRock) {
        const sel = DescBuilder.getRockSelections(dbContainer);
        desc = DescBuilder.buildRockDescription(sel);
      } else {
        const sel = DescBuilder.getSoilSelections(dbContainer);
        desc = DescBuilder.buildSoilDescription(sel);
      }
      // Set description textarea
      const ta = formEl.querySelector('.form-textarea');
      if (ta) { ta.value = desc; this._updateIntervalField(iv.id, 'description', desc); }
      // Update preview
      const prev = dbContainer.querySelector('.desc-preview');
      if (prev) prev.textContent = desc || 'Description will appear here...';
    };

    if (isRock) {
      DescBuilder.renderRockPickers(dbContainer, onChange);
    } else {
      DescBuilder.renderSoilPickers(dbContainer, onChange);
    }

    // Add preview
    const preview = h('div', { className: 'desc-preview mt-8' }, iv.description || 'Description will appear here...');
    dbContainer.appendChild(preview);
  },

  // ===========================================================================
  //  FIELD TESTS
  // ===========================================================================

  async renderFieldTests() {
    const section = $('#fieldtests-section'); if (!section) return; clr(section);
    if (!Model.currentHole) return;

    const tests = Model.currentFieldTests;
    const panel = h('div', { className: 'panel' });
    const hdr = h('div', { className: 'panel-header', onclick: () => this._togglePanel('fieldtests-body') },
      [h('span', {}, 'Field Tests'), h('span', { className: 'panel-header-count' }, `${tests.length} test(s)`)]);
    panel.appendChild(hdr);

    const body = h('div', { id: 'fieldtests-body', className: 'panel-body' });
    if (localStorage.getItem('gresolog_fieldtests-body_collapsed') === 'true') body.classList.add('collapsed');

    // Add test dropdown
    const addRow = h('div', { className: 'mb-8' });
    const sel = h('select', { id: 'ft-type-select', className: 'form-select', style: { display: 'inline-block', width: 'auto', marginRight: '4px' } },
      ['SPT','PP','SV','PL','DCP','Other'].map(t => h('option', { value: t }, FT_LABELS[t])));
    const addBtn = h('button', { className: 'btn btn-success btn-sm', onclick: () => this._addFieldTest($('#ft-type-select', addRow)?.value || 'SPT') }, 'Add Test');
    addRow.appendChild(sel); addRow.appendChild(addBtn); body.appendChild(addRow);

    if (tests.length === 0) {
      body.appendChild(h('p', { className: 'text-muted text-sm' }, 'None added'));
    }

    tests.forEach(ft => {
      const card = h('div', { className: 'fieldtest-card' });
      const info = h('div', { className: 'ft-info' });
      info.appendChild(h('strong', {}, `${FT_LABELS[ft.type] || ft.type}`));
      info.appendChild(h('span', { className: 'text-muted' }, ` @ ${ft.depth}m`));
      const dataStr = typeof ft.data === 'object' ? JSON.stringify(ft.data) : (ft.data || '');
      info.appendChild(h('span', { className: 'text-sm' }, ` ${dataStr.length > 40 ? dataStr.substring(0,40)+'...' : dataStr}`));
      card.appendChild(info);
      const acts = h('div', { className: 'ft-actions' });
      acts.appendChild(h('button', { className: 'btn btn-sm btn-secondary', onclick: () => this._editFieldTest(ft) }, 'Edit'));
      acts.appendChild(h('button', { className: 'btn btn-sm btn-danger', onclick: async () => { await Model.deleteFieldTest(ft.id); await this.renderFieldTests(); this.refreshStripLog(); } }, 'X'));
      card.appendChild(acts); body.appendChild(card);
    });

    panel.appendChild(body); section.appendChild(panel);
  },

  async _addFieldTest(type) {
    if (!Model.currentHole) return;
    const depth = prompt('Depth (m):', '0'); if (depth === null) return;
    let data = {};
    if (type === 'SPT') {
      data.seating = parseInt(prompt('Seating blows:', '0')) || 0;
      data.blow1 = prompt('75mm #1:', '0') || '0';
      data.blow2 = prompt('75mm #2:', '0') || '0';
      data.blow3 = prompt('75mm #3:', '0') || '0';
      const hasR = data.blow1 === 'R' || data.blow2 === 'R' || data.blow3 === 'R';
      data.n = hasR ? 'R' : ((parseInt(data.blow2)||0) + (parseInt(data.blow3)||0));
    } else if (type === 'PP') {
      data.reading = parseFloat(prompt('Reading (kPa):', '0')) || 0;
    } else if (type === 'SV') {
      data.reading = parseFloat(prompt('Reading (kPa):', '0')) || 0;
    } else if (type === 'PL') {
      data.is50 = parseFloat(prompt('Is(50) value:', '0')) || 0;
      data.type = prompt('Type (Diametral/Axial):', 'Diametral') || 'Diametral';
    } else if (type === 'DCP') {
      data.blows = parseInt(prompt('Blows/100mm:', '0')) || 0;
    } else {
      data.desc = prompt('Description:', '') || '';
    }
    try {
      await Model.createFieldTest({ intervalId: '', holeId: Model.currentHole.id, type, depth: parseFloat(depth)||0, data });
      await this.renderFieldTests(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  async _editFieldTest(ft) {
    const newDepth = prompt('Depth (m):', ft.depth); if (newDepth === null) return;
    let data = ft.data || {};
    if (ft.type === 'SPT') {
      data.seating = parseInt(prompt('Seating blows:', data.seating||'0')) || 0;
      data.blow1 = prompt('75mm #1:', data.blow1||'0') || '0';
      data.blow2 = prompt('75mm #2:', data.blow2||'0') || '0';
      data.blow3 = prompt('75mm #3:', data.blow3||'0') || '0';
      const hasR = data.blow1 === 'R' || data.blow2 === 'R' || data.blow3 === 'R';
      data.n = hasR ? 'R' : ((parseInt(data.blow2)||0) + (parseInt(data.blow3)||0));
    }
    try {
      await Model.updateFieldTest(ft.id, { depth: parseFloat(newDepth)||0, data });
      await this.renderFieldTests(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  // ===========================================================================
  //  SAMPLES
  // ===========================================================================

  async renderSamples() {
    const section = $('#samples-section'); if (!section) return; clr(section);
    if (!Model.currentHole) return;

    const samples = Model.currentSamples;
    const panel = h('div', { className: 'panel' });
    const hdr = h('div', { className: 'panel-header', onclick: () => this._togglePanel('samples-body') },
      [h('span', {}, 'Samples'), h('span', { className: 'panel-header-count' }, `${samples.length} sample(s)`)]);
    panel.appendChild(hdr);

    const body = h('div', { id: 'samples-body', className: 'panel-body' });
    if (localStorage.getItem('gresolog_samples-body_collapsed') === 'true') body.classList.add('collapsed');

    const addBtn = h('button', { className: 'btn btn-success btn-sm mb-8', onclick: () => this._addSample() }, '+ Add Sample');
    body.appendChild(addBtn);

    if (samples.length === 0) {
      body.appendChild(h('p', { className: 'text-muted text-sm' }, 'None added'));
    }

    samples.forEach(s => {
      const card = h('div', { className: 'sample-card' });
      const info = h('div', { className: 's-info' });
      info.appendChild(h('span', { className: `badge badge-${s.type ? s.type.toLowerCase() : 's'}` }, s.type || 'S'));
      info.appendChild(h('span', { style: { marginLeft: '8px' } }, `${s.topDepth||0}-${s.baseDepth||0}m`));
      if (s.label) info.appendChild(h('span', { className: 'text-muted', style: { marginLeft: '8px' } }, esc(s.label)));
      card.appendChild(info);
      const acts = h('div', { className: 's-actions' });
      acts.appendChild(h('button', { className: 'btn btn-sm btn-secondary', onclick: () => this._editSample(s) }, 'Edit'));
      acts.appendChild(h('button', { className: 'btn btn-sm btn-danger', onclick: async () => { await Model.deleteSample(s.id); await this.renderSamples(); this.refreshStripLog(); } }, 'X'));
      card.appendChild(acts); body.appendChild(card);
    });

    panel.appendChild(body); section.appendChild(panel);
  },

  async _addSample() {
    const type = prompt('Type (S/U/D/B/W):', 'S'); if (!type) return;
    const topDepth = prompt('Top Depth (m):', '0'); if (topDepth === null) return;
    const baseDepth = prompt('Base Depth (m):', topDepth); if (baseDepth === null) return;
    const label = prompt('Label:', '') || '';
    try {
      await Model.createSample({ type: type.toUpperCase(), topDepth: parseFloat(topDepth)||0, baseDepth: parseFloat(baseDepth)||0, label, holeId: Model.currentHole.id });
      await this.renderSamples(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  async _editSample(s) {
    const type = prompt('Type (S/U/D/B/W):', s.type); if (!type) return;
    const topDepth = prompt('Top Depth (m):', s.topDepth); if (topDepth === null) return;
    const baseDepth = prompt('Base Depth (m):', s.baseDepth); if (baseDepth === null) return;
    const label = prompt('Label:', s.label); if (label === null) return;
    try {
      await Model.updateSample(s.id, { type: type.toUpperCase(), topDepth: parseFloat(topDepth)||0, baseDepth: parseFloat(baseDepth)||0, label });
      await this.renderSamples(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  // ===========================================================================
  //  WATER STRIKES
  // ===========================================================================

  async renderWaterStrikes() {
    const section = $('#water-section'); if (!section) return; clr(section);
    if (!Model.currentHole) return;

    const strikes = Model.currentWaterStrikes;
    const panel = h('div', { className: 'panel' });
    const hdr = h('div', { className: 'panel-header', onclick: () => this._togglePanel('water-body') },
      [h('span', {}, 'Water Strikes'), h('span', { className: 'panel-header-count' }, `${strikes.length} strike(s)`)]);
    panel.appendChild(hdr);

    const body = h('div', { id: 'water-body', className: 'panel-body' });
    if (localStorage.getItem('gresolog_water-body_collapsed') === 'true') body.classList.add('collapsed');

    const addBtn = h('button', { className: 'btn btn-success btn-sm mb-8', onclick: () => this._addWaterStrike() }, '+ Add Water Strike');
    body.appendChild(addBtn);

    if (strikes.length === 0) {
      body.appendChild(h('p', { className: 'text-muted text-sm' }, 'None added'));
    }

    strikes.forEach(ws => {
      const card = h('div', { className: 'water-card' });
      const info = h('div', { className: 'w-info' });
      info.appendChild(h('strong', {}, `@ ${ws.depth}m`));
      if (ws.restLevel) info.appendChild(h('span', { style: { marginLeft: '8px' } }, `Rest: ${ws.restLevel}m`));
      if (ws.date) info.appendChild(h('span', { className: 'text-muted', style: { marginLeft: '8px' } }, ws.date));
      card.appendChild(info);
      const acts = h('div', { className: 'w-actions' });
      acts.appendChild(h('button', { className: 'btn btn-sm btn-secondary', onclick: () => this._editWaterStrike(ws) }, 'Edit'));
      acts.appendChild(h('button', { className: 'btn btn-sm btn-danger', onclick: async () => { await Model.deleteWaterStrike(ws.id); await this.renderWaterStrikes(); this.refreshStripLog(); } }, 'X'));
      card.appendChild(acts); body.appendChild(card);
    });

    panel.appendChild(body); section.appendChild(panel);
  },

  async _addWaterStrike() {
    const depth = prompt('Depth (m) *:', '0'); if (depth === null) return;
    const restLevel = prompt('Rest Level (m):', '') || '';
    const date = prompt('Date:', '') || '';
    const remarks = prompt('Remarks:', '') || '';
    try {
      await Model.createWaterStrike({ depth: parseFloat(depth)||0, restLevel: restLevel ? parseFloat(restLevel) : null, date, remarks, holeId: Model.currentHole.id });
      await this.renderWaterStrikes(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  async _editWaterStrike(ws) {
    const depth = prompt('Depth (m):', ws.depth); if (depth === null) return;
    const restLevel = prompt('Rest Level (m):', ws.restLevel); if (restLevel === null) return;
    const date = prompt('Date:', ws.date); if (date === null) return;
    try {
      await Model.updateWaterStrike(ws.id, { depth: parseFloat(depth)||0, restLevel: restLevel ? parseFloat(restLevel) : null, date });
      await this.renderWaterStrikes(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  // ===========================================================================
  //  CASING
  // ===========================================================================

  async renderCasing() {
    const section = $('#casing-section'); if (!section) return; clr(section);
    if (!Model.currentHole) return;

    const casing = Model.currentCasing;
    const panel = h('div', { className: 'panel' });
    const hdr = h('div', { className: 'panel-header', onclick: () => this._togglePanel('casing-body') },
      [h('span', {}, 'Casing'), h('span', { className: 'panel-header-count' }, `${casing.length} entry(s)`)]);
    panel.appendChild(hdr);

    const body = h('div', { id: 'casing-body', className: 'panel-body' });
    if (localStorage.getItem('gresolog_casing-body_collapsed') === 'true') body.classList.add('collapsed');

    const addBtn = h('button', { className: 'btn btn-success btn-sm mb-8', onclick: () => this._addCasing() }, '+ Add Casing');
    body.appendChild(addBtn);

    if (casing.length === 0) {
      body.appendChild(h('p', { className: 'text-muted text-sm' }, 'None added'));
    }

    casing.forEach(c => {
      const card = h('div', { className: 'casing-card' });
      const info = h('div', { className: 'c-info' });
      info.appendChild(h('strong', {}, `${c.topDepth||0}-${c.baseDepth||0}m`));
      if (c.dia) info.appendChild(h('span', { style: { marginLeft: '8px' } }, `${c.dia}mm`));
      if (c.type) info.appendChild(h('span', { className: 'text-muted', style: { marginLeft: '8px' } }, esc(c.type)));
      card.appendChild(info);
      const acts = h('div', { className: 'c-actions' });
      acts.appendChild(h('button', { className: 'btn btn-sm btn-secondary', onclick: () => this._editCasing(c) }, 'Edit'));
      acts.appendChild(h('button', { className: 'btn btn-sm btn-danger', onclick: async () => { await Model.deleteCasing(c.id); await this.renderCasing(); this.refreshStripLog(); } }, 'X'));
      card.appendChild(acts); body.appendChild(card);
    });

    panel.appendChild(body); section.appendChild(panel);
  },

  async _addCasing() {
    const top = prompt('Top Depth (m):', '0'); if (top === null) return;
    const base = prompt('Base Depth (m):', '0'); if (base === null) return;
    const dia = prompt('Diameter (mm):', '') || '';
    const type = prompt('Type:', '') || '';
    try {
      await Model.createCasing({ topDepth: parseFloat(top)||0, baseDepth: parseFloat(base)||0, dia: dia ? parseFloat(dia) : null, type, holeId: Model.currentHole.id });
      await this.renderCasing(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  async _editCasing(c) {
    const top = prompt('Top Depth (m):', c.topDepth); if (top === null) return;
    const base = prompt('Base Depth (m):', c.baseDepth); if (base === null) return;
    const dia = prompt('Diameter (mm):', c.dia); if (dia === null) return;
    const type = prompt('Type:', c.type); if (type === null) return;
    try {
      await Model.updateCasing(c.id, { topDepth: parseFloat(top)||0, baseDepth: parseFloat(base)||0, dia: dia ? parseFloat(dia) : null, type });
      await this.renderCasing(); this.refreshStripLog();
    } catch (e) { console.error(e); }
  },

  // ===========================================================================
  //  EXPORT HANDLERS
  // ===========================================================================

  async _handleExportPDF() {
    if (!Model.currentHole) return;
    this.showSaveIndicator('Generating PDF...');
    try {
      await Exports.exportPDF(Model.currentHole, Model.currentIntervals, Model.currentFieldTests, Model.currentSamples, Model.currentWaterStrikes, Model.currentCasing, Model.currentProject);
      this.showSaveIndicator('PDF ready');
    } catch (e) { console.error(e); this.showSaveIndicator('PDF failed'); }
  },

  async _handleExportExcel() {
    if (!Model.currentProject) return;
    this.showSaveIndicator('Generating Excel...');
    try {
      const holes = await this._getProjectHoles();
      const { DB } = await import('./db.js');
      let allIntervals = [], allFieldTests = [], allSamples = [], allWaterStrikes = [];
      for (const h of holes) {
        const [ivs, fts, ss, wss] = await Promise.all([DB.getIntervals(h.id), DB.getFieldTests(h.id), DB.getSamples(h.id), DB.getWaterStrikes(h.id)]);
        allIntervals = allIntervals.concat(ivs); allFieldTests = allFieldTests.concat(fts); allSamples = allSamples.concat(ss); allWaterStrikes = allWaterStrikes.concat(wss);
      }
      await Exports.exportExcel(Model.currentProject, holes, allIntervals, allFieldTests, allSamples, allWaterStrikes);
      this.showSaveIndicator('Excel ready');
    } catch (e) { console.error(e); this.showSaveIndicator('Excel failed'); }
  },

  async _handleExportCSV() {
    if (!Model.currentProject) return;
    this.showSaveIndicator('Generating CSV...');
    try {
      const holes = await this._getProjectHoles();
      const { DB } = await import('./db.js');
      let allIntervals = [], allFieldTests = [], allSamples = [], allWaterStrikes = [];
      for (const h of holes) {
        const [ivs, fts, ss, wss] = await Promise.all([DB.getIntervals(h.id), DB.getFieldTests(h.id), DB.getSamples(h.id), DB.getWaterStrikes(h.id)]);
        allIntervals = allIntervals.concat(ivs); allFieldTests = allFieldTests.concat(fts); allSamples = allSamples.concat(ss); allWaterStrikes = allWaterStrikes.concat(wss);
      }
      Exports.exportCSV(Model.currentProject, holes, allIntervals, allFieldTests, allSamples, allWaterStrikes);
      this.showSaveIndicator('CSV ready');
    } catch (e) { console.error(e); this.showSaveIndicator('CSV failed'); }
  },

  // ===========================================================================
  //  MODAL
  // ===========================================================================

  _showModal(title, bodyHTML, onConfirm) {
    this._closeModal();
    const overlay = h('div', { className: 'modal-overlay', onclick: (e) => { if (e.target === overlay) this._closeModal(); } });
    const modal = h('div', { className: 'modal' });
    modal.appendChild(h('div', { className: 'modal-header' }, [h('h3', {}, title), h('button', { className: 'btn btn-sm', onclick: () => this._closeModal() }, 'X')]));
    modal.appendChild(h('div', { className: 'modal-body', innerHTML: bodyHTML }));
    const footer = h('div', { className: 'modal-footer' });
    footer.appendChild(h('button', { className: 'btn btn-secondary', onclick: () => this._closeModal() }, 'Cancel'));
    footer.appendChild(h('button', { className: 'btn btn-primary', onclick: async () => { await onConfirm(); this._closeModal(); } }, 'OK'));
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    _openModal = overlay;
    // Focus first input
    setTimeout(() => { const inp = overlay.querySelector('input'); if (inp) inp.focus(); }, 100);
  },

  _closeModal() {
    if (_openModal) { _openModal.remove(); _openModal = null; }
  },

  // ===========================================================================
  //  SAVE INDICATOR
  // ===========================================================================

  showSaveIndicator(text) {
    const si = $('#save-indicator'); if (!si) return;
    si.textContent = text || 'Saved';
    si.classList.add('show');
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => { si.classList.remove('show'); }, 2000);
  },

  // ===========================================================================
  //  AUTO SAVE
  // ===========================================================================

  setupAutoSave() {
    window.addEventListener('beforeunload', () => {
      this._doSave();
    });
  },

  async _doSave() {
    if (!Model.currentHole) return;
    this.showSaveIndicator('Saving...');
    try {
      await Model.updateHole(Model.currentHole.id, {});
      this.showSaveIndicator('Saved');
    } catch (e) { console.error('Auto-save failed:', e); }
  },

  // ===========================================================================
  //  KEYBOARD SHORTCUTS
  // ===========================================================================

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+S: Force save
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); this._doSave(); return; }
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (Model.undoStack.length > 0) {
          Model.undo().then(() => {
            this._reloadAll().then(() => {
              this.renderHoleTabs(); this.renderHoleForm(); this.renderIntervals();
              this.renderFieldTests(); this.renderSamples(); this.renderWaterStrikes(); this.renderCasing();
              this.refreshStripLog(); this.showSaveIndicator('Undo');
            });
          });
        }
        return;
      }
      // Ctrl+N: New interval
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); this._addNewInterval(); return; }
      // Ctrl+D: Duplicate interval
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); if (Model.currentIntervals.length > 0) { this._duplicateInterval(Model.currentIntervals[Model.currentIntervals.length - 1]); } return; }
      // Escape: Close modal
      if (e.key === 'Escape') { this._closeModal(); return; }
    });
  },

  async _reloadAll() {
    if (!Model.currentHole) return;
    const { DB } = await import('./db.js');
    const [intervals, fieldTests, samples, waterStrikes, casing] = await Promise.all([
      DB.getIntervals(Model.currentHole.id), DB.getFieldTests(Model.currentHole.id),
      DB.getSamples(Model.currentHole.id), DB.getWaterStrikes(Model.currentHole.id), DB.getCasing(Model.currentHole.id)
    ]);
    Model.currentIntervals = intervals; Model.sortIntervals();
    Model.currentFieldTests = fieldTests; Model.currentSamples = samples;
    Model.currentWaterStrikes = waterStrikes; Model.currentCasing = casing;
  },

  // ===========================================================================
  //  LEGACY MIGRATION
  // ===========================================================================

  async handleLegacyMigration(legacyData) {
    if (!legacyData) return;
    const confirmed = confirm('We found data from the previous version of G-Resolog. Would you like to import it as a new project?');
    if (confirmed) {
      try {
        await Model.importLegacy(legacyData);
        this.showSaveIndicator('Legacy data imported');
        await this.renderProjectManager();
      } catch (e) { console.error(e); }
    } else {
      const clear = confirm('Would you like to clear the old data?');
      if (clear) { Model.clearLegacyStored(); }
    }
  },

  // ===========================================================================
  //  TOAST
  // ===========================================================================

  _showToast(msg) {
    const toast = h('div', { style: { position: 'fixed', bottom: '60px', left: '50%', transform: 'translateX(-50%)', padding: '8px 20px', background: 'var(--gresolog-surface,#333)', color: 'var(--gresolog-text,#fff)', borderRadius: '6px', zIndex: '999', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,.2)' } }, msg);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};