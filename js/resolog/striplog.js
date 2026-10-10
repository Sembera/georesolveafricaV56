import { LITHOLOGY_ASSETS, lithologyDefs } from './lithology-assets.js?v=20261010-6';
import { LOG_TEMPLATES, logPurpose } from './templates.js?v=20261010-6';
// =============================================================================
// G-Log — Strip Log SVG Renderer (ES Module)
// Renders professional borehole strip logs as scalable SVG.
// Supports 1:50, 1:100, 1:200 scales; soil/core/testpit modes; dark mode.
// =============================================================================

// ─── SVG Namespace & Element Builder ─────────────────────────────────────────

var SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs, children) {
  var el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    Object.keys(attrs).forEach(function(k) {
      el.setAttribute(k, attrs[k]);
    });
  }
  if (children) {
    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(function(child) { el.appendChild(child); });
    } else {
      el.appendChild(children);
    }
  }
  return el;
}

function theme(dm, light, dark) {
  return dm ? dark : light;
}

// Source-tracked vector symbols, shared with the picker and symbol library.
function createPatternDefs() {
  const defs = lithologyDefs();
  const screen = svgEl('pattern',{id:'hatch-well_screen',patternUnits:'userSpaceOnUse',width:3,height:2},[
    svgEl('rect',{width:3,height:2,fill:'#f2f4f5'}),
    svgEl('line',{x1:.4,y1:1,x2:2.6,y2:1,stroke:'#354956','stroke-width':.16})
  ]);
  defs.appendChild(screen);
  return defs;
}

// ─── Drilling Method Lookup ──────────────────────────────────────────────────

var DRILL_METHODS = {
  'AD': {label:'AD',desc:'Auger'},
  'HA': {label:'HA',desc:'Hand Auger'},
  'RD': {label:'RD',desc:'Rotary Drill'},
  'CD': {label:'CD',desc:'Core Drill'},
  'PD': {label:'PD',desc:'Percussion'},
  'WS': {label:'WS',desc:'Wash Bore'},
  'TP': {label:'TP',desc:'Test Pit'},
  'DC': {label:'DC',desc:'Diamond Core'},
  'RC': {label:'RC',desc:'RC Drill'},
  'DT': {label:'DT',desc:'DTH Hammer'}
};

// ─── Pattern Name Resolution ─────────────────────────────────────────────────

var PATTERN_MAP = {
  'topsoil':       'hatch-topsoil',
  'clay':          'hatch-clay',
  'silt':          'hatch-silt',
  'sand':          'hatch-sand',
  'gravel':        'hatch-gravel',
  'laterite':      'hatch-laterite',
  'murram':        'hatch-laterite',
  'fill':          'hatch-fill',
  'made_ground':   'hatch-fill',
  'peat':          'hatch-peat',
  'sandstone':     'hatch-sandstone',
  'siltstone':     'hatch-siltstone',
  'mudstone':      'hatch-mudstone',
  'shale':         'hatch-shale',
  'limestone':     'hatch-limestone',
  'granite':       'hatch-granite',
  'gneiss':        'hatch-gneiss',
  'schist':        'hatch-schist',
  'quartzite':     'hatch-quartzite',
  'basalt':        'hatch-basalt',
  'weathered_rock':'hatch-weathered_rock',
  'core_loss':     'hatch-core_loss'
};

function resolvePattern(name) {
  if (!name) return 'hatch-core_loss';
  var key = name.toLowerCase().replace(/[^a-z_]/g, '_');
  if (LITHOLOGY_ASSETS[key]) return 'hatch-'+key;
  if (PATTERN_MAP[key]) return PATTERN_MAP[key];
  if (PATTERN_MAP[name]) return PATTERN_MAP[name];
  return 'hatch-core_loss';
}

// ─── Text Wrapping ───────────────────────────────────────────────────────────

function wrapText(text, maxWidth, fontSize, isDark) {
  if (!text) return [];
  var charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
  if (charsPerLine < 5) charsPerLine = 5;
  var words = text.split(' ');
  var lines = [];
  var current = '';
  for (var i = 0; i < words.length; i++) {
    var test = current ? current + ' ' + words[i] : words[i];
    if (test.length > charsPerLine && current.length > 0) {
      lines.push(current);
      current = words[i];
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── Depth-To-Y Conversion ───────────────────────────────────────────────────

function depthToY(self, depth) {
  return self._headerHeight + (depth - (self.topDepth || 0)) * self.mmPerUnit;
}

// =============================================================================
// STRIPLOG MODULE OBJECT
// =============================================================================

export var StripLog = {

  // ─── Configuration ─────────────────────────────────────────────────────

  scale: 100,
  depthUnit: 'm',
  mmPerUnit: 10,          // 1m = 10mm at 1:100

  showDepthRuler:    true,
  showDrillingMethod: true,
  showWater:         true,
  showSamples:       true,
  showSPT:           true,
  showLithology:     true,
  showDescription:   true,
  showWeathering:    true,
  showStrength:      true,
  showRQD:           true,
  showDefects:       true,

  colWidths: {
    depthRuler:     12,
    drillingMethod: 10,
    water:           8,
    samples:        12,
    spt:            15,
    lithology:      20,
    description:    50,
    weathering:     12,
    strength:       12,
    rqd:            12,
    defects:        15,
    construction: 35,
    recovery: 12
  },

  darkMode: false,

  _headerHeight: 61,
  _footerHeight: 10,

  // ─── Internal State ────────────────────────────────────────────────────

  _colOrder: ['depthRuler','drillingMethod','water','samples','spt','lithology','description','weathering','strength','rqd','defects','recovery','construction'],

  _colLabels: {
    depthRuler:     'DEPTH (m)',
    drillingMethod: 'METHOD',
    water:          'WATER',
    samples:        'SAMPLES',
    spt:            'SPT N',
    lithology:      'LITHOLOGY',
    description:    'DESCRIPTION',
    weathering:     'WEATH.',
    strength:       'STR.',
    rqd:            'RQD %',
    defects:        'DEFECTS',
    construction: 'WELL CONSTRUCTION',
    recovery: 'TCR (%)'
  },

  // ─── SVG Width ─────────────────────────────────────────────────────────

  getSVGWidth: function() {
    return this._colOrder.reduce((w, col) => w + (this._isColVisible(col) ? this.colWidths[col] : 0), 0);
  },

  // ─── Column Visibility Check ───────────────────────────────────────────

  _isColVisible: function(colName) {
    var self = this;
    switch (colName) {
      case 'depthRuler':     return self.showDepthRuler;
      case 'drillingMethod': return self.showDrillingMethod;
      case 'water':         return self.showWater;
      case 'samples':       return self.showSamples;
      case 'spt':           return self.showSPT;
      case 'lithology':     return self.showLithology;
      case 'description':   return self.showDescription;
      case 'weathering':    return self.showWeathering;
      case 'strength':      return self.showStrength;
      case 'rqd':           return self.showRQD;
      case 'defects':       return self.showDefects;
      case 'construction': return self.showConstruction;
      case 'recovery': return self.showRecovery;
      default: return false;
    }
  },

  // ─── Column X-Position Calculator ──────────────────────────────────────

  _colStartX: function(colName) {
    var self = this;
    var x = 0;
    for (var i = 0; i < self._colOrder.length; i++) {
      var col = self._colOrder[i];
      if (col === colName) return x;
      if (self._isColVisible(col)) {
        x += self.colWidths[col] || 0;
      }
    }
    return x;
  },

  // ─── Set Scale ─────────────────────────────────────────────────────────

  setScale: function(scale) {
    this.scale = scale;
    if (scale === 50)  this.mmPerUnit = 20;
    if (scale === 100) this.mmPerUnit = 10;
    if (scale === 200) this.mmPerUnit = 5;
  },

  // ─── Toggle Column Visibility ──────────────────────────────────────────

  toggleColumn: function(colName) {
    var self = this;
    switch (colName) {
      case 'depthRuler':     self.showDepthRuler     = !self.showDepthRuler;     break;
      case 'drillingMethod': self.showDrillingMethod  = !self.showDrillingMethod; break;
      case 'water':          self.showWater           = !self.showWater;          break;
      case 'samples':        self.showSamples         = !self.showSamples;        break;
      case 'spt':            self.showSPT             = !self.showSPT;            break;
      case 'lithology':      self.showLithology       = !self.showLithology;      break;
      case 'description':    self.showDescription     = !self.showDescription;    break;
      case 'weathering':     self.showWeathering      = !self.showWeathering;     break;
      case 'strength':       self.showStrength        = !self.showStrength;       break;
      case 'rqd':            self.showRQD             = !self.showRQD;            break;
      case 'defects':        self.showDefects         = !self.showDefects;        break;
    }
  },

  // ─── Dark Mode ─────────────────────────────────────────────────────────

  setDarkMode: function(enabled) {
    this.darkMode = !!enabled;
  },

  applyTemplate: function(hole) {
    var template = LOG_TEMPLATES[logPurpose(hole)];
    var cols = hole.reportColumns || template.columns;
    var flags = {depthRuler:'showDepthRuler',drillingMethod:'showDrillingMethod',water:'showWater',samples:'showSamples',spt:'showSPT',lithology:'showLithology',description:'showDescription',weathering:'showWeathering',strength:'showStrength',rqd:'showRQD',defects:'showDefects',construction:'showConstruction',recovery:'showRecovery'};
    Object.keys(flags).forEach(col => { this[flags[col]] = cols.includes(col); });
    this.colWidths.description = 80;
    this.colWidths.lithology = 16;
    // Keep every default layout at a readable, consistent report width.
    var otherWidth = this._colOrder.reduce((w, col) => w + (col !== 'description' && this._isColVisible(col) ? this.colWidths[col] : 0), 0);
    this.colWidths.description = Math.max(60, 190 - otherWidth);
  },

  _renderHeader: function(svg, hole, project) {
    var w = this.getSVGWidth();
    var group = svgEl('g', {class:'report-header'});
    function text(x,y,value,size,weight,anchor) { group.appendChild(svgEl('text',{x,y,'font-family':'Arial, sans-serif','font-size':size || 2.5,'font-weight':weight || 'normal','text-anchor':anchor || 'start',fill:'#152a35'}, value)); }
    text(2,5,'GEORESOLVE AFRICA',3.7,'bold');
    text(2,9,'GEOSCIENCE  /  FIELD RECORD',1.8);
    text(w-2,5,LOG_TEMPLATES[logPurpose(hole)].title,3.4,'bold','end');
    text(w-2,10,hole.name || 'UNNAMED BOREHOLE',3.2,'bold','end');
    group.appendChild(svgEl('rect',{x:0,y:13,width:w,height:29,fill:'none',stroke:'#253b46','stroke-width':.3}));
    var rows = [
      [['PROJECT',project.name],['CLIENT',project.client]],
      [['JOB / REFERENCE',project.jobNo],['DATE',hole.startDate]],
      [['EASTING / NORTHING',[hole.easting,hole.northing].filter(v=>v!=null).join(' / ')],['DATUM / CRS',[project.datum,project.epsg].filter(Boolean).join(' / ')]],
      [['GROUND LEVEL (m)',hole.rl],['DEPTH / DIAMETER',(this.totalDepth ?? hole.depth ?? '—')+' m / '+(hole.dia ?? '—')+' mm']],
      [['METHOD',hole.drillMethod],['LOGGED / CHECKED',[hole.loggedBy,hole.checkedBy].filter(Boolean).join(' / ')]]
    ];
    rows.forEach((row,i)=>{
      var y=13+i*5.8;
      if(i) group.appendChild(svgEl('line',{x1:0,y1:y,x2:w,y2:y,stroke:'#c4ccd0','stroke-width':.15}));
      row.forEach((cell,c)=>{
        var x=c*w/2+2;
        text(x,y+2,cell[0],1.65,'bold');
        var lines=wrapText(String(cell[1] ?? '—'),w/2-4,2.25);
        text(x,y+4.8,lines[0] || '—',2.25);
      });
    });
    group.appendChild(svgEl('line',{x1:w/2,y1:13,x2:w/2,y2:42,stroke:'#c4ccd0','stroke-width':.15}));
    svg.appendChild(group);
    return 44;
  },

  _renderColHeaders: function(svg, headerY) {
    var self=this; var group=svgEl('g',{class:'report-column-headings'});
    self._colOrder.forEach(function(col) {
      if(!self._isColVisible(col)) return;
      var x=self._colStartX(col), cw=self.colWidths[col];
      group.appendChild(svgEl('rect',{x,y:headerY,width:cw,height:17,fill:'#edf1f2',stroke:'#53636b','stroke-width':.2}));
      var label=self._colLabels[col];
      if(cw<18) {
        group.appendChild(svgEl('text',{x:x+cw/2,y:headerY+8.5,transform:'rotate(-90 '+(x+cw/2)+' '+(headerY+8.5)+')','font-family':'Arial','font-size':2.15,'font-weight':'bold','text-anchor':'middle',fill:'#1c303a'},label));
      } else {
        group.appendChild(svgEl('text',{x:x+cw/2,y:headerY+9.5,'font-family':'Arial','font-size':2.3,'font-weight':'bold','text-anchor':'middle',fill:'#1c303a'},label));
      }
    });
    svg.appendChild(group); return headerY+17;
  },

  // ─── Render Depth Ruler ────────────────────────────────────────────────

  _renderDepthRuler: function(svg, hole, contentStartY, isDark) {
    var self = this;
    if (!self.showDepthRuler) return;
    var dm = isDark;
    var g = svgEl('g');
    var x = self._colStartX('depthRuler');
    var cw = self.colWidths.depthRuler;
    var holeDepth = hole.depth || 0;
    var tickInterval = self.mmPerUnit; // 1m tick
    var minorInterval = tickInterval / 2; // 0.5m

    var yLimit = depthToY(self, holeDepth);

    // Vertical guideline
    g.appendChild(svgEl('line', {
      x1: x + cw - 0.5, y1: contentStartY, x2: x + cw - 0.5, y2: yLimit,
      stroke: theme(dm, '#333', '#666'), 'stroke-width': '0.3'
    }));

    // Tick marks and labels
    for (var d = Math.ceil((self.topDepth || 0) * 2) / 2; d <= holeDepth; d += 0.5) {
      var yPos = depthToY(self, d);
      if (yPos > yLimit) break;

      var isMajor = (d % 1 === 0);
      var tickLen = isMajor ? 3 : 1.5;

      g.appendChild(svgEl('line', {
        x1: x + cw - 0.5 - tickLen, y1: yPos, x2: x + cw - 0.5, y2: yPos,
        stroke: theme(dm, '#333', '#aaa'), 'stroke-width': isMajor ? '0.3' : '0.2'
      }));

      if (isMajor) {
        g.appendChild(svgEl('text', {
          x: x + cw - 1 - tickLen, y: yPos + 1.2, 'font-family': 'monospace',
          'font-size': '2.2', fill: theme(dm, '#333', '#ccc'), 'text-anchor': 'end'
        }, String(d)));
      }
    }

    // Depth increment at bottom
    var bottomY = depthToY(self, holeDepth);
    g.appendChild(svgEl('text', {
      x: x + cw - 2, y: bottomY + 4, 'font-family': 'monospace',
      'font-size': '2.2', fill: theme(dm, '#333', '#ccc'), 'text-anchor': 'end'
    }, holeDepth + ' m'));

    svg.appendChild(g);
  },

  // ─── Render Lithology Column ───────────────────────────────────────────

  _renderLithology: function(svg, intervals, isDark) {
    var self = this;
    if (!self.showLithology) return;
    var g = svgEl('g');
    var x = self._colStartX('lithology');
    var cw = self.colWidths.lithology;
    var dm = isDark;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var topY = depthToY(self, iv.topDepth || 0);
      var botY = depthToY(self, iv.baseDepth || 0);
      var h = botY - topY;
      if (h <= 0) continue;

      var patId = resolvePattern(iv.pattern);

      // Fill rectangle with hatch pattern
      g.appendChild(svgEl('rect', {
        x: x, y: topY, width: cw, height: h,
        fill: 'url(#' + patId + ')',
        stroke: theme(dm, '#666', '#555'), 'stroke-width': '0.3'
      }));

      // Interval boundary lines
      g.appendChild(svgEl('line', {
        x1: x, y1: topY, x2: x + cw, y2: topY,
        stroke: theme(dm, '#444', '#666'), 'stroke-width': '0.3'
      }));
    }

    // Draw left and right borders
    var totalH = depthToY(self, 0) + (self.mmPerUnit * 0);
    // We'll add borders later in _renderFrame

    svg.appendChild(g);
  },

  // ─── Render Description Column ─────────────────────────────────────────

  _renderDescription: function(svg, intervals, isDark) {
    var self = this;
    if (!self.showDescription) return;
    var g = svgEl('g');
    var x = self._colStartX('description');
    var cw = self.colWidths.description;
    var dm = isDark;
    var fontSize = 2.6;
    var lineHeight = 3.2;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var topY = depthToY(self, iv.topDepth || 0);
      var desc = iv.description || '';

      if (!desc) continue;

      var lines = wrapText(desc, cw - 3, fontSize);
      var availableH = depthToY(self, iv.baseDepth || 0) - topY;
      g.appendChild(svgEl('line',{x1:x,y1:topY+availableH,x2:x+cw,y2:topY+availableH,stroke:'#aeb8bd','stroke-width':.15}));
      var maxLines = Math.floor(availableH / lineHeight);

      // Show as many lines as fit
      var showLines = lines.slice(0, Math.max(1, maxLines));

      for (var l = 0; l < showLines.length; l++) {
        var ly = topY + 2 + l * lineHeight;
        g.appendChild(svgEl('text', {
          x: x + 1.5, y: ly + 0.6, 'font-family': 'Arial, sans-serif',
          'font-size': fontSize, fill: theme(dm, '#222', '#eee')
        }, showLines[l]));
      }
    }

    svg.appendChild(g);
  },

  // ─── Render Drilling Method Column ─────────────────────────────────────

  _renderDrillingMethod: function(svg, hole, intervals, isDark) {
    var self = this;
    if (!self.showDrillingMethod) return;
    var g = svgEl('g');
    var x = self._colStartX('drillingMethod');
    var cw = self.colWidths.drillingMethod;
    var dm = isDark;
    var methodCode = hole.drillMethod || '';
    var methodInfo = DRILL_METHODS[methodCode.toUpperCase()] || {label: methodCode || '—'};

    // If no intervals, just show method code once
    if (!intervals || intervals.length === 0) {
      g.appendChild(svgEl('text', {
        x: x + cw / 2, y: depthToY(self, 1) + 1, 'font-family': 'monospace',
        'font-size': '2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
      }, methodInfo.label));
      svg.appendChild(g);
      return;
    }

    // Show method code at top of each interval or once if consistent
    var midY = depthToY(self, hole.depth ? hole.depth / 2 : 1);
    g.appendChild(svgEl('text', {
      x: x + cw / 2, y: midY, 'font-family': 'monospace',
      'font-size': '2.2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle',
      'font-weight': 'bold'
    }, methodInfo.label));

    // Small desc below
    g.appendChild(svgEl('text', {
      x: x + cw / 2, y: midY + 3, 'font-family': 'sans-serif',
      'font-size': '1.5', fill: theme(dm, '#777', '#999'), 'text-anchor': 'middle'
    }, methodInfo.desc));

    svg.appendChild(g);
  },

  // ─── Render Water Column ───────────────────────────────────────────────

  _renderWater: function(svg, waterStrikes, hole, isDark) {
    var self = this;
    if (!self.showWater) return;
    var g = svgEl('g');
    var x = self._colStartX('water');
    var cw = self.colWidths.water;
    var dm = isDark;

    if (!waterStrikes || waterStrikes.length === 0) return;

    for (var i = 0; i < waterStrikes.length; i++) {
      var ws = waterStrikes[i];
      var yPos = depthToY(self, ws.depth || 0);

      // Blue triangle marker
      g.appendChild(svgEl('polygon', {
        points: (x + 1) + ',' + (yPos - 2.5) + ' ' + (x + cw - 1) + ',' + (yPos - 2.5) + ' ' + (x + cw / 2) + ',' + (yPos + 1.5),
        fill: theme(dm, '#3399ff', '#4488cc'),
        stroke: theme(dm, '#2277dd', '#5599dd'), 'stroke-width': '0.2'
      }));

      // Rest level annotation
      if (ws.restLevel != null) {
        g.appendChild(svgEl('text', {
          x: x + cw / 2, y: yPos + 3.5, 'font-family': 'monospace',
          'font-size': '2.2', fill: theme(dm, '#3399ff', '#5599dd'), 'text-anchor': 'middle'
        }, 'SWL ' + ws.restLevel));
      }
    }

    svg.appendChild(g);
  },

  // ─── Render Samples Column ─────────────────────────────────────────────

  _renderSamples: function(svg, samples, isDark) {
    var self = this;
    if (!self.showSamples) return;
    var g = svgEl('g');
    var x = self._colStartX('samples');
    var cw = self.colWidths.samples;
    var dm = isDark;

    if (!samples || samples.length === 0) return;

    for (var i = 0; i < samples.length; i++) {
      var s = samples[i];
      var midDepth = ((s.topDepth || 0) + (s.baseDepth || s.topDepth || 0)) / 2;
      var yPos = depthToY(self, midDepth);

      // Interval bar for sample range
      var sTop = depthToY(self, s.topDepth || 0);
      var sBot = depthToY(self, s.baseDepth || s.topDepth || 0);
      if (sBot - sTop > 2) {
        g.appendChild(svgEl('line', {
          x1: x + cw / 2, y1: sTop, x2: x + cw / 2, y2: sBot,
          stroke: theme(dm, '#333', '#aaa'), 'stroke-width': '0.6'
        }));
        // Tick ends
        g.appendChild(svgEl('line', {
          x1: x + cw / 2 - 1.5, y1: sTop, x2: x + cw / 2 + 1.5, y2: sTop,
          stroke: theme(dm, '#333', '#aaa'), 'stroke-width': '0.3'
        }));
        g.appendChild(svgEl('line', {
          x1: x + cw / 2 - 1.5, y1: sBot, x2: x + cw / 2 + 1.5, y2: sBot,
          stroke: theme(dm, '#333', '#aaa'), 'stroke-width': '0.3'
        }));
      }

      // Type label
      var label = s.type || s.label || 'S';
      g.appendChild(svgEl('text', {
        x: x + cw / 2, y: yPos + 1, 'font-family': 'monospace',
        'font-size': '2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle',
        'font-weight': 'bold'
      }, label));
    }

    svg.appendChild(g);
  },

  // ─── Render SPT Column ─────────────────────────────────────────────────

  _renderSPT: function(svg, fieldTests, isDark) {
    var self = this;
    if (!self.showSPT) return;
    var g = svgEl('g');
    var x = self._colStartX('spt');
    var cw = self.colWidths.spt;
    var dm = isDark;

    if (!fieldTests || fieldTests.length === 0) return;

    var sptTests = fieldTests.filter(function(ft) {
      return (ft.type || '').toUpperCase() === 'SPT';
    });

    var maxBarN = 50;
    var barMaxW = cw - 4;

    for (var i = 0; i < sptTests.length; i++) {
      var ft = sptTests[i];
      var yPos = depthToY(self, ft.depth || 0);
      var nVal = (ft.data && ft.data.n != null) ? ft.data.n : (ft.data && ft.data.N != null ? ft.data.N : null);
      if (nVal === null && typeof ft.data === 'number') nVal = ft.data;

      if (nVal != null) {
        var barW = Math.min((nVal / maxBarN) * barMaxW, barMaxW);
        if (barW < 1) barW = 1;

        // Bar
        g.appendChild(svgEl('rect', {
          x: x + 1, y: yPos - 1.5, width: barW, height: '3',
          fill: theme(dm, '#3366cc', '#4477dd'),
          stroke: theme(dm, '#2244aa', '#3355bb'), 'stroke-width': '0.2'
        }));

        // N value text
        g.appendChild(svgEl('text', {
          x: x + 1 + barW + 0.5, y: yPos + 1, 'font-family': 'monospace',
          'font-size': '2', fill: theme(dm, '#333', '#ddd')
        }, String(nVal)));

        // Horizontal line marking depth
        g.appendChild(svgEl('line', {
          x1: x, y1: yPos, x2: x + cw, y2: yPos,
          stroke: theme(dm, '#ccc', '#444'), 'stroke-width': '0.2'
        }));
      }
    }

    svg.appendChild(g);
  },

  // ─── Render Weathering Column ──────────────────────────────────────────

  _renderWeathering: function(svg, intervals, isDark) {
    var self = this;
    if (!self.showWeathering) return;
    var g = svgEl('g');
    var x = self._colStartX('weathering');
    var cw = self.colWidths.weathering;
    var dm = isDark;

    if (!intervals || intervals.length === 0) return;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var wg = iv.weathering || '';
      if (!wg) continue;
      var midY = (depthToY(self, iv.topDepth || 0) + depthToY(self, iv.baseDepth || 0)) / 2;

      g.appendChild(svgEl('text', {
        x: x + cw / 2, y: midY + 1, 'font-family': 'monospace',
        'font-size': '2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
      }, wg));
    }

    svg.appendChild(g);
  },

  // ─── Render Strength Column ────────────────────────────────────────────

  _renderStrength: function(svg, intervals, isDark) {
    var self = this;
    if (!self.showStrength) return;
    var g = svgEl('g');
    var x = self._colStartX('strength');
    var cw = self.colWidths.strength;
    var dm = isDark;

    if (!intervals || intervals.length === 0) return;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var st = iv.strength || '';
      if (!st) continue;
      var midY = (depthToY(self, iv.topDepth || 0) + depthToY(self, iv.baseDepth || 0)) / 2;

      g.appendChild(svgEl('text', {
        x: x + cw / 2, y: midY + 1, 'font-family': 'monospace',
        'font-size': '2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
      }, st));
    }

    svg.appendChild(g);
  },

  // ─── Render RQD Column ─────────────────────────────────────────────────

  _renderRQD: function(svg, intervals, isDark) {
    var self = this;
    if (!self.showRQD) return;
    var g = svgEl('g');
    var x = self._colStartX('rqd');
    var cw = self.colWidths.rqd;
    var dm = isDark;

    if (!intervals || intervals.length === 0) return;

    var barMaxW = cw - 3;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var rqd = iv.rqd;
      if (rqd == null || rqd === '') continue;
      rqd = Number(rqd);
      if (isNaN(rqd)) continue;

      var midY = (depthToY(self, iv.topDepth || 0) + depthToY(self, iv.baseDepth || 0)) / 2;

      // RQD bar
      var barW = Math.min((rqd / 100) * barMaxW, barMaxW);
      barW = Math.max(barW, 0.5);
      var barColor = rqd >= 75 ? '#33aa33' : rqd >= 50 ? '#cccc33' : rqd >= 25 ? '#cc8833' : '#cc3333';

      g.appendChild(svgEl('rect', {
        x: x + 1, y: midY - 1.5, width: barW, height: '3',
        fill: theme(dm, barColor, barColor),
        stroke: theme(dm, '#666', '#555'), 'stroke-width': '0.2'
      }));

      // RQD % text
      g.appendChild(svgEl('text', {
        x: x + 1 + barW + 0.3, y: midY + 1, 'font-family': 'monospace',
        'font-size': '2.2', fill: theme(dm, '#333', '#ddd')
      }, rqd + '%'));
    }

    svg.appendChild(g);
  },

  // ─── Render Defects Column ─────────────────────────────────────────────

  _renderDefects: function(svg, intervals, isDark) {
    var self = this;
    if (!self.showDefects) return;
    var g = svgEl('g');
    var x = self._colStartX('defects');
    var cw = self.colWidths.defects;
    var dm = isDark;

    if (!intervals || intervals.length === 0) return;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var ds = String(iv.defectSpacing || '');
      if (!ds) continue;
      var midY = (depthToY(self, iv.topDepth || 0) + depthToY(self, iv.baseDepth || 0)) / 2;

      // Determine marker based on spacing category
      var markerColor = theme(dm, '#333', '#ddd');
      var markerSize = 1.2;
      var dotSpacing = '3';

      // Show abbreviated text
      var label = ds.length > 8 ? ds.substring(0, 8) + '…' : ds;

      g.appendChild(svgEl('text', {
        x: x + cw / 2, y: midY + 1, 'font-family': 'monospace',
        'font-size': '2.2', fill: markerColor, 'text-anchor': 'middle'
      }, label));

      // Small dots as defect spacing markers
      for (var d = 0; d < 3; d++) {
        var dx = x + 1.5 + d * ( (cw - 3) / 2 );
        g.appendChild(svgEl('circle', {
          cx: dx, cy: midY + 3, r: markerSize,
          fill: 'none', stroke: markerColor, 'stroke-width': '0.2'
        }));
      }
    }

    svg.appendChild(g);
  },

  // ─── Render Casing ─────────────────────────────────────────────────────

  _renderCasing: function(svg, casing) {
    if (!this.showConstruction) return;
    var x=this._colStartX('construction'), width=this.colWidths.construction;
    var group=svgEl('g');
    casing.forEach(c=>{
      var y=depthToY(this,c.topDepth || 0), h=depthToY(this,c.baseDepth || 0)-y;
      if(h<=0) return;
      var screen=/screen|slotted/i.test(c.type || '');
      group.appendChild(svgEl('rect',{x:x+2,y,width:6,height:h,fill:screen?'url(#hatch-well_screen)':'#e5e9eb',stroke:'#354956','stroke-width':.35}));
      var lines=wrapText((c.type || 'Casing')+(c.dia ? ' / '+c.dia+' mm':''),width-11,2.1);
      lines.slice(0,Math.max(1,Math.floor(h/3))).forEach((line,i)=>group.appendChild(svgEl('text',{x:x+10,y:y+3+i*3,'font-size':2.1,'font-family':'Arial',fill:'#253b46'},line)));
    });
    svg.appendChild(group);
  },

  _renderRecovery: function(svg, intervals) {
    if(!this.showRecovery) return;
    var x=this._colStartX('recovery'), w=this.colWidths.recovery;
    var group=svgEl('g');
    intervals.forEach(iv=>{
      if(iv.tcr==null && iv.recovery==null) return;
      var y=depthToY(this,iv.topDepth||0), h=depthToY(this,iv.baseDepth||0)-y;
      group.appendChild(svgEl('text',{x:x+w/2,y:y+h/2+1,'text-anchor':'middle','font-family':'Arial','font-size':2.3,fill:'#253b46'},String(iv.tcr ?? iv.recovery)));
    }); svg.appendChild(group);
  },

  // ─── Render Core Run Table ─────────────────────────────────────────────

  _renderCoreTable: function(svg, intervals, hole, contentStartY, isDark) {
    var self = this;
    var dm = isDark;
    var holeDepth = hole.depth || 0;
    var baseY = depthToY(self, holeDepth) + 4;
    var w = self.getSVGWidth();

    // Filter intervals that have core run data
    var coreRuns = intervals.filter(function(iv) {
      return iv.runLength != null || iv.tcr != null || iv.scr != null || iv.rqd != null;
    });

    if (coreRuns.length === 0) return;

    // Section divider
    var sepY = baseY;
    svg.appendChild(svgEl('line', {
      x1: '0', y1: sepY, x2: w, y2: sepY,
      stroke: theme(dm, '#666', '#555'), 'stroke-width': '0.5'
    }));

    // "CORE RECOVERY DATA" header
    svg.appendChild(svgEl('text', {
      x: w / 2, y: sepY + 5, 'font-family': 'sans-serif',
      'font-size': '3', 'font-weight': 'bold', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
    }, 'CORE RECOVERY DATA'));

    var tableY = sepY + 8;
    var colW = w / 6;
    var rowH = 5;
    var headers = ['Run', 'From (m)', 'To (m)', 'TCR %', 'SCR %', 'RQD %'];

    // Table headers
    for (var h = 0; h < headers.length; h++) {
      svg.appendChild(svgEl('text', {
        x: h * colW + colW / 2, y: tableY + 2.5, 'font-family': 'sans-serif',
        'font-size': '2', 'font-weight': 'bold', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
      }, headers[h]));
    }

    // Separator after headers
    var dataStartY = tableY + 4;
    svg.appendChild(svgEl('line', {
      x1: '0', y1: dataStartY, x2: w, y2: dataStartY,
      stroke: theme(dm, '#999', '#666'), 'stroke-width': '0.2'
    }));

    // Data rows
    for (var r = 0; r < coreRuns.length; r++) {
      var run = coreRuns[r];
      var rowY = dataStartY + 2 + r * rowH;
      var vals = [
        r + 1,
        run.topDepth != null ? run.topDepth : 0,
        run.baseDepth != null ? run.baseDepth : 0,
        run.tcr != null ? run.tcr : '',
        run.scr != null ? run.scr : '',
        run.rqd != null ? run.rqd : ''
      ];

      for (var v = 0; v < vals.length; v++) {
        svg.appendChild(svgEl('text', {
          x: v * colW + colW / 2, y: rowY, 'font-family': 'monospace',
          'font-size': '2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
        }, String(vals[v])));
      }
    }

    // Recovery bar graph below table
    var barY = dataStartY + 3 + coreRuns.length * rowH;
    var barH = 6;

    svg.appendChild(svgEl('text', {
      x: 5, y: barY + 3, 'font-family': 'sans-serif',
      'font-size': '2', 'font-weight': 'bold', fill: theme(dm, '#333', '#ddd')
    }, 'Recovery %'));

    for (var b = 0; b < coreRuns.length; b++) {
      var run2 = coreRuns[b];
      var recVal = run2.tcr != null ? Number(run2.tcr) : 0;
      var barX = 25 + b * ( (w - 30) / coreRuns.length );
      var barW = (w - 30) / coreRuns.length - 2;
      var fillW = Math.max((recVal / 100) * barW, 0.5);

      svg.appendChild(svgEl('rect', {
        x: barX, y: barY, width: barW, height: barH,
        fill: 'none', stroke: theme(dm, '#666', '#555'), 'stroke-width': '0.2'
      }));

      svg.appendChild(svgEl('rect', {
        x: barX, y: barY, width: fillW, height: barH,
        fill: theme(dm, '#3366cc', '#4477dd'), opacity: '0.6'
      }));

      svg.appendChild(svgEl('text', {
        x: barX + barW / 2, y: barY + barH / 2 + 1, 'font-family': 'monospace',
        'font-size': '2', fill: theme(dm, '#333', '#ddd'), 'text-anchor': 'middle'
      }, recVal + '%'));
    }
  },

  // ─── Render Frame (Column Borders) ──────────────────────────────────────

  _renderFrame: function(svg, hole, contentStartY, isDark) {
    var self = this;
    var dm = isDark;
    var w = self.getSVGWidth();
    var holeDepth = hole.depth || 0;
    var yLimit = depthToY(self, holeDepth);
    var g = svgEl('g');

    // Vertical column separators
    self._colOrder.forEach(function(col) {
      if (!self._isColVisible(col)) return;
      var x = self._colStartX(col);
      g.appendChild(svgEl('line', {
        x1: x, y1: contentStartY, x2: x, y2: yLimit,
        stroke: theme(dm, '#999', '#555'), 'stroke-width': '0.25'
      }));
    });

    // Right-most edge
    g.appendChild(svgEl('line', {
      x1: w, y1: contentStartY, x2: w, y2: yLimit,
      stroke: theme(dm, '#999', '#555'), 'stroke-width': '0.25'
    }));

    // Bottom line
    g.appendChild(svgEl('line', {
      x1: 0, y1: yLimit, x2: w, y2: yLimit,
      stroke: theme(dm, '#666', '#555'), 'stroke-width': '0.4'
    }));

    svg.appendChild(g);
  },

  // ─── Render Test Pit Mode Layout ────────────────────────────────────────

  _renderTestPit: function(svg, hole, intervals, project, fieldTests, samples, waterStrikes, casing, isDark) {
    var self = this;
    var dm = isDark;

    // Wider lithology and description, simplified columns
    var origShowDefects = self.showDefects;
    var origShowRQD = self.showRQD;

    // Temporarily hide rock-specific columns
    self.showDefects = false;
    self.showRQD = false;

    // Widen description and lithology
    var origDW = self.colWidths.description;
    var origLW = self.colWidths.lithology;
    self.colWidths.description = 65;
    self.colWidths.lithology = 25;

    // Render with modified settings
    self._doRender(svg, hole, intervals, project, fieldTests, samples, waterStrikes, casing, isDark);

    // Restore original settings
    self.colWidths.description = origDW;
    self.colWidths.lithology = origLW;
    self.showDefects = origShowDefects;
    self.showRQD = origShowRQD;
  },

  // ─── SVG Background ────────────────────────────────────────────────────

  _renderBackground: function(svg, totalH, isDark) {
    svg.appendChild(svgEl('rect', {
      x: '0', y: '0', width: '100%', height: totalH,
      fill: theme(isDark, '#ffffff', '#1a1a2e')
    }));
  },

  // ─── Internal Render Orchestrator ───────────────────────────────────────

  _doRender: function(svg, hole, intervals, project, fieldTests, samples, waterStrikes, casing, isDark) {
    var self = this;
    var dm = isDark;

    // Build header and get content start Y
    var headerEndY = self._renderHeader(svg, hole, project, dm);
    var colHeaderY = self._renderColHeaders(svg, headerEndY, dm);

    // Render all columns
    self._renderDepthRuler(svg, hole, colHeaderY, dm);
    self._renderDrillingMethod(svg, hole, intervals, dm);
    self._renderWater(svg, waterStrikes, hole, dm);
    self._renderSamples(svg, samples, dm);
    self._renderSPT(svg, fieldTests, dm);
    self._renderLithology(svg, intervals, dm);
    self._renderDescription(svg, intervals, dm);
    self._renderWeathering(svg, intervals, dm);
    self._renderStrength(svg, intervals, dm);
    self._renderRQD(svg, intervals, dm);
    self._renderDefects(svg, intervals, dm);

    // Render casing overlay
    self._renderCasing(svg, casing, dm);
    self._renderRecovery(svg, intervals);

    // Render frame (column borders)
    self._renderFrame(svg, hole, colHeaderY, dm);

  },

  // ─── Main Render Method ────────────────────────────────────────────────

  render: function(hole, intervals, fieldTests, samples, waterStrikes, casing, project, options = {}) {
    var self = this;
    var dm = false; // Reports stay white and print-ready in either application theme.
    self.topDepth = options.topDepth || 0;

    // Ensure valid inputs
    hole = hole || {};
    intervals = intervals || [];
    fieldTests = fieldTests || [];
    samples = samples || [];
    waterStrikes = waterStrikes || [];
    casing = casing || [];
    project = project || {};

    self.totalDepth = hole.depth;
    self.applyTemplate(hole);
    var holeDepth = options.bottomDepth ?? hole.depth ?? 0;
    var reportHole = {...hole, depth: holeDepth};
    var svgW = self.getSVGWidth();
    var totalH = depthToY(self, holeDepth) + self._footerHeight;

    // Create SVG element
    var svg = svgEl('svg', {
      xmlns: SVG_NS,
      width: svgW + 'mm',
      height: totalH + 'mm',
      viewBox: '0 0 ' + svgW + ' ' + totalH,
      'font-family': 'sans-serif'
    });

    // Background
    svg.appendChild(svgEl('rect', {
      x: '0', y: '0', width: svgW, height: totalH,
      fill: theme(dm, '#ffffff', '#1a1a2e')
    }));

    // Add pattern definitions
    svg.appendChild(createPatternDefs());

    self._doRender(svg, reportHole, intervals, project, fieldTests, samples, waterStrikes, casing, dm);

    // Footer branding
    var footerY = totalH - 3;
    svg.appendChild(svgEl('text', {
      x: svgW / 2, y: footerY, 'font-family': 'sans-serif',
      'font-size': '2.2', fill: theme(dm, '#aaa', '#555'), 'text-anchor': 'middle'
    }, project.defaults?.example ? 'EXAMPLE DATA - synthetic observations; not a site record' : 'Georesolve Africa | G-Log'));

    // Create container div
    var container = document.createElement('div');
    container.className = 'strip-log-svg-container';
    container.style.cssText = 'overflow:auto;width:100%;max-width:' + (svgW + 10) + 'mm;';
    container.appendChild(svg);

    return container;
  }
};