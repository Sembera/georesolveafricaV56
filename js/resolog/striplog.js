// =============================================================================
// G-Resolog Pro v2 — Strip Log SVG Renderer (ES Module)
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

// ─── 20 SVG Geotechnical Hatch Pattern Definitions ───────────────────────────

function createPatternDefs() {
  var defs = svgEl('defs');

  // 1. topsoil
  defs.appendChild(svgEl('pattern', {id:'hatch-topsoil',patternUnits:'userSpaceOnUse',width:'12',height:'12'}, [
    svgEl('rect', {x:'0',y:'0',width:'12',height:'12',fill:'#f5f0e0'}),
    svgEl('path', {d:'M0,4 Q3,1 6,4 T12,4',fill:'none',stroke:'#8B7355','stroke-width':'0.5'}),
    svgEl('circle', {cx:'3',cy:'9',r:'0.6',fill:'#6B4226'}),
    svgEl('circle', {cx:'9',cy:'7',r:'0.5',fill:'#6B4226'}),
    svgEl('circle', {cx:'7',cy:'11',r:'0.4',fill:'#6B4226'}),
    svgEl('circle', {cx:'1',cy:'2',r:'0.5',fill:'#6B4226'})
  ]));

  // 2. clay
  defs.appendChild(svgEl('pattern', {id:'hatch-clay',patternUnits:'userSpaceOnUse',width:'6',height:'6'}, [
    svgEl('rect', {x:'0',y:'0',width:'6',height:'6',fill:'#faf8f0'}),
    svgEl('line', {x1:'0',y1:'0',x2:'6',y2:'6',stroke:'#8B8B7A','stroke-width':'0.5'}),
    svgEl('line', {x1:'-3',y1:'3',x2:'3',y2:'9',stroke:'#8B8B7A','stroke-width':'0.3'})
  ]));

  // 3. silt
  defs.appendChild(svgEl('pattern', {id:'hatch-silt',patternUnits:'userSpaceOnUse',width:'10',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'10',fill:'#fdfbf7'}),
    svgEl('line', {x1:'0',y1:'5',x2:'10',y2:'5',stroke:'#d0c8b0','stroke-width':'0.3','stroke-dasharray':'2,2'}),
    svgEl('circle', {cx:'2',cy:'2',r:'0.4',fill:'#a09880'}),
    svgEl('circle', {cx:'7',cy:'3',r:'0.3',fill:'#a09880'}),
    svgEl('circle', {cx:'4',cy:'8',r:'0.4',fill:'#a09880'}),
    svgEl('circle', {cx:'9',cy:'7',r:'0.3',fill:'#a09880'}),
    svgEl('circle', {cx:'1',cy:'6',r:'0.3',fill:'#a09880'}),
    svgEl('circle', {cx:'6',cy:'9',r:'0.4',fill:'#a09880'})
  ]));

  // 4. sand
  defs.appendChild(svgEl('pattern', {id:'hatch-sand',patternUnits:'userSpaceOnUse',width:'10',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'10',fill:'#fffef8'}),
    svgEl('circle', {cx:'1',cy:'1',r:'0.5',fill:'#aaa090'}),
    svgEl('circle', {cx:'4',cy:'2',r:'0.4',fill:'#aaa090'}),
    svgEl('circle', {cx:'7',cy:'1',r:'0.3',fill:'#aaa090'}),
    svgEl('circle', {cx:'2',cy:'4',r:'0.5',fill:'#aaa090'}),
    svgEl('circle', {cx:'9',cy:'3',r:'0.4',fill:'#aaa090'}),
    svgEl('circle', {cx:'5',cy:'5',r:'0.3',fill:'#aaa090'}),
    svgEl('circle', {cx:'1',cy:'8',r:'0.4',fill:'#aaa090'}),
    svgEl('circle', {cx:'6',cy:'7',r:'0.5',fill:'#aaa090'}),
    svgEl('circle', {cx:'3',cy:'9',r:'0.3',fill:'#aaa090'}),
    svgEl('circle', {cx:'8',cy:'9',r:'0.5',fill:'#aaa090'}),
    svgEl('circle', {cx:'0',cy:'6',r:'0.3',fill:'#aaa090'})
  ]));

  // 5. gravel
  defs.appendChild(svgEl('pattern', {id:'hatch-gravel',patternUnits:'userSpaceOnUse',width:'12',height:'12'}, [
    svgEl('rect', {x:'0',y:'0',width:'12',height:'12',fill:'#fefefb'}),
    svgEl('circle', {cx:'3',cy:'3',r:'2.5',fill:'none',stroke:'#777','stroke-width':'0.5'}),
    svgEl('circle', {cx:'9',cy:'9',r:'2.5',fill:'none',stroke:'#777','stroke-width':'0.5'}),
    svgEl('circle', {cx:'3',cy:'9',r:'1.8',fill:'none',stroke:'#777','stroke-width':'0.4'}),
    svgEl('circle', {cx:'9',cy:'3',r:'1.8',fill:'none',stroke:'#777','stroke-width':'0.4'})
  ]));

  // 6. laterite/murram
  defs.appendChild(svgEl('pattern', {id:'hatch-laterite',patternUnits:'userSpaceOnUse',width:'8',height:'8'}, [
    svgEl('rect', {x:'0',y:'0',width:'8',height:'8',fill:'#e8c8a0'}),
    svgEl('path', {d:'M0,0 L4,4 M4,0 L8,4 M0,4 L4,8 M4,4 L8,8',stroke:'#c07040','stroke-width':'0.5'}),
    svgEl('path', {d:'M0,8 L4,4 M4,8 L8,4 M0,0 L4,-4 M4,0 L8,-4',stroke:'#c07040','stroke-width':'0.5'}),
    svgEl('line', {x1:'0',y1:'2',x2:'8',y2:'2',stroke:'#b06030','stroke-width':'0.2'}),
    svgEl('line', {x1:'0',y1:'6',x2:'8',y2:'6',stroke:'#b06030','stroke-width':'0.2'})
  ]));

  // 7. fill
  defs.appendChild(svgEl('pattern', {id:'hatch-fill',patternUnits:'userSpaceOnUse',width:'14',height:'14'}, [
    svgEl('rect', {x:'0',y:'0',width:'14',height:'14',fill:'#f5f2ea'}),
    svgEl('polygon', {points:'1,1 5,2 4,6 0,5',fill:'none',stroke:'#777','stroke-width':'0.5'}),
    svgEl('polygon', {points:'7,1 13,3 11,7 8,5',fill:'none',stroke:'#777','stroke-width':'0.5'}),
    svgEl('polygon', {points:'1,8 6,9 5,13 0,12',fill:'none',stroke:'#777','stroke-width':'0.5'}),
    svgEl('polygon', {points:'8,8 12,9 13,13 9,12',fill:'none',stroke:'#777','stroke-width':'0.4'}),
    svgEl('polygon', {points:'3,3 4,5 2,6 1,4',fill:'#ccc',stroke:'#777','stroke-width':'0.3'})
  ]));

  // 8. peat
  defs.appendChild(svgEl('pattern', {id:'hatch-peat',patternUnits:'userSpaceOnUse',width:'14',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'14',height:'10',fill:'#e8d8b8'}),
    svgEl('path', {d:'M0,2 Q3,0 7,2 T14,2',fill:'none',stroke:'#5a4030','stroke-width':'0.5'}),
    svgEl('path', {d:'M0,6 Q4,8 7,6 T14,6',fill:'none',stroke:'#5a4030','stroke-width':'0.5'}),
    svgEl('path', {d:'M0,9 Q5,7 10,9 T14,9',fill:'none',stroke:'#4a3020','stroke-width':'0.3'}),
    svgEl('circle', {cx:'4',cy:'4',r:'0.4',fill:'#4a3020'}),
    svgEl('circle', {cx:'11',cy:'8',r:'0.3',fill:'#4a3020'})
  ]));

  // 9. sandstone
  defs.appendChild(svgEl('pattern', {id:'hatch-sandstone',patternUnits:'userSpaceOnUse',width:'10',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'10',fill:'#fef9e0'}),
    svgEl('circle', {cx:'1',cy:'2',r:'0.5',fill:'#c8a850'}),
    svgEl('circle', {cx:'5',cy:'1',r:'0.4',fill:'#c8a850'}),
    svgEl('circle', {cx:'8',cy:'3',r:'0.3',fill:'#c8a850'}),
    svgEl('circle', {cx:'2',cy:'6',r:'0.4',fill:'#c8a850'}),
    svgEl('circle', {cx:'6',cy:'5',r:'0.5',fill:'#c8a850'}),
    svgEl('circle', {cx:'9',cy:'8',r:'0.4',fill:'#c8a850'}),
    svgEl('circle', {cx:'3',cy:'9',r:'0.3',fill:'#c8a850'}),
    svgEl('circle', {cx:'7',cy:'9',r:'0.5',fill:'#c8a850'})
  ]));

  // 10. siltstone
  defs.appendChild(svgEl('pattern', {id:'hatch-siltstone',patternUnits:'userSpaceOnUse',width:'10',height:'8'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'8',fill:'#f8f4ec'}),
    svgEl('line', {x1:'0',y1:'1',x2:'10',y2:'1',stroke:'#a09080','stroke-width':'0.3','stroke-dasharray':'2,1.5'}),
    svgEl('line', {x1:'0',y1:'3',x2:'10',y2:'3',stroke:'#a09080','stroke-width':'0.3','stroke-dasharray':'2.5,2'}),
    svgEl('line', {x1:'0',y1:'5',x2:'10',y2:'5',stroke:'#a09080','stroke-width':'0.3','stroke-dasharray':'1.5,2'}),
    svgEl('line', {x1:'0',y1:'7',x2:'10',y2:'7',stroke:'#a09080','stroke-width':'0.3','stroke-dasharray':'2,1.5'})
  ]));

  // 11. mudstone
  defs.appendChild(svgEl('pattern', {id:'hatch-mudstone',patternUnits:'userSpaceOnUse',width:'10',height:'8'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'8',fill:'#d8d0c4'}),
    svgEl('line', {x1:'0',y1:'2',x2:'10',y2:'2',stroke:'#8a7a6a','stroke-width':'0.4'}),
    svgEl('line', {x1:'0',y1:'4',x2:'10',y2:'4',stroke:'#8a7a6a','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'6',x2:'10',y2:'6',stroke:'#8a7a6a','stroke-width':'0.4'}),
    svgEl('line', {x1:'0',y1:'1',x2:'10',y2:'1',stroke:'#9a8a7a','stroke-width':'0.2'}),
    svgEl('line', {x1:'0',y1:'5',x2:'10',y2:'5',stroke:'#9a8a7a','stroke-width':'0.2'})
  ]));

  // 12. shale
  defs.appendChild(svgEl('pattern', {id:'hatch-shale',patternUnits:'userSpaceOnUse',width:'10',height:'6'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'6',fill:'#e0dcd4'}),
    svgEl('line', {x1:'0',y1:'0.5',x2:'10',y2:'0.5',stroke:'#6a6a5a','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'1.5',x2:'10',y2:'1.5',stroke:'#6a6a5a','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'2.5',x2:'10',y2:'2.5',stroke:'#6a6a5a','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'3.5',x2:'10',y2:'3.5',stroke:'#6a6a5a','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'4.5',x2:'10',y2:'4.5',stroke:'#6a6a5a','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'5.5',x2:'10',y2:'5.5',stroke:'#6a6a5a','stroke-width':'0.3'})
  ]));

  // 13. limestone
  defs.appendChild(svgEl('pattern', {id:'hatch-limestone',patternUnits:'userSpaceOnUse',width:'16',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'16',height:'10',fill:'#f8f4e8'}),
    svgEl('rect', {x:'0',y:'0',width:'8',height:'5',fill:'none',stroke:'#a09070','stroke-width':'0.4'}),
    svgEl('rect', {x:'8',y:'5',width:'8',height:'5',fill:'none',stroke:'#a09070','stroke-width':'0.4'}),
    svgEl('rect', {x:'4',y:'5',width:'8',height:'5',fill:'none',stroke:'#a09070','stroke-width':'0.4'}),
    svgEl('rect', {x:'8',y:'0',width:'4',height:'5',fill:'none',stroke:'#a09070','stroke-width':'0.4'}),
    svgEl('path', {d:'M1,3 L2,1 L3,3',fill:'none',stroke:'#807050','stroke-width':'0.3'}),
    svgEl('path', {d:'M10,7 L11,5 L12,7',fill:'none',stroke:'#807050','stroke-width':'0.3'})
  ]));

  // 14. granite
  defs.appendChild(svgEl('pattern', {id:'hatch-granite',patternUnits:'userSpaceOnUse',width:'12',height:'12'}, [
    svgEl('rect', {x:'0',y:'0',width:'12',height:'12',fill:'#faf5f0'}),
    svgEl('line', {x1:'0',y1:'0',x2:'12',y2:'12',stroke:'#c0b0a0','stroke-width':'0.4'}),
    svgEl('line', {x1:'12',y1:'0',x2:'0',y2:'12',stroke:'#c0b0a0','stroke-width':'0.4'}),
    svgEl('line', {x1:'6',y1:'2',x2:'6',y2:'4.5',stroke:'#555','stroke-width':'0.5'}),
    svgEl('line', {x1:'5',y1:'3.25',x2:'7',y2:'3.25',stroke:'#555','stroke-width':'0.5'}),
    svgEl('line', {x1:'3',y1:'9',x2:'3',y2:'11',stroke:'#555','stroke-width':'0.4'}),
    svgEl('line', {x1:'2',y1:'10',x2:'4',y2:'10',stroke:'#555','stroke-width':'0.4'}),
    svgEl('circle', {cx:'9',cy:'2',r:'0.5',fill:'#555'}),
    svgEl('circle', {cx:'8',cy:'8',r:'0.6',fill:'#555'})
  ]));

  // 15. gneiss
  defs.appendChild(svgEl('pattern', {id:'hatch-gneiss',patternUnits:'userSpaceOnUse',width:'14',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'14',height:'10',fill:'#f8f4f0'}),
    svgEl('path', {d:'M0,2 Q3,1 7,2 T14,2',fill:'none',stroke:'#888','stroke-width':'0.6'}),
    svgEl('path', {d:'M0,4 Q3,3 7,4 T14,4',fill:'none',stroke:'#666','stroke-width':'0.8'}),
    svgEl('path', {d:'M0,6 Q3,5 7,6 T14,6',fill:'none',stroke:'#888','stroke-width':'0.6'}),
    svgEl('path', {d:'M0,8 Q3,7 7,8 T14,8',fill:'none',stroke:'#aaa','stroke-width':'0.4'}),
    svgEl('rect', {x:'0',y:'0',width:'14',height:'1.5',fill:'#f0ece8',opacity:'0.5'}),
    svgEl('rect', {x:'0',y:'5',width:'14',height:'1',fill:'#f0ece8',opacity:'0.5'})
  ]));

  // 16. schist
  defs.appendChild(svgEl('pattern', {id:'hatch-schist',patternUnits:'userSpaceOnUse',width:'10',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'10',fill:'#f6f2ec'}),
    svgEl('path', {d:'M0,2 Q2,0 5,3 T10,4',fill:'none',stroke:'#7a6a5a','stroke-width':'0.5'}),
    svgEl('path', {d:'M0,5 Q3,3 5,6 T10,7',fill:'none',stroke:'#7a6a5a','stroke-width':'0.4'}),
    svgEl('path', {d:'M0,8 Q2,6 5,9 T10,10',fill:'none',stroke:'#7a6a5a','stroke-width':'0.5'}),
    svgEl('path', {d:'M-1,0 Q1,-1 3,1 T9,2',fill:'none',stroke:'#8a7a6a','stroke-width':'0.3'})
  ]));

  // 17. quartzite
  defs.appendChild(svgEl('pattern', {id:'hatch-quartzite',patternUnits:'userSpaceOnUse',width:'16',height:'12'}, [
    svgEl('rect', {x:'0',y:'0',width:'16',height:'12',fill:'#fefefa'}),
    svgEl('polygon', {points:'1,1 5,0 8,3 4,6 0,4',fill:'none',stroke:'#c8c0b0','stroke-width':'0.5'}),
    svgEl('polygon', {points:'8,3 12,2 15,5 11,8 7,6',fill:'none',stroke:'#c8c0b0','stroke-width':'0.5'}),
    svgEl('polygon', {points:'4,6 8,3 13,6 9,10 3,9',fill:'none',stroke:'#c8c0b0','stroke-width':'0.5'}),
    svgEl('polygon', {points:'0,4 4,6 3,9 0,8',fill:'none',stroke:'#c8c0b0','stroke-width':'0.4'}),
    svgEl('polygon', {points:'11,8 15,5 16,9 13,11',fill:'none',stroke:'#c8c0b0','stroke-width':'0.4'}),
    svgEl('circle', {cx:'3',cy:'2',r:'0.3',fill:'#a09080'}),
    svgEl('circle', {cx:'10',cy:'5',r:'0.3',fill:'#a09080'})
  ]));

  // 18. basalt
  defs.appendChild(svgEl('pattern', {id:'hatch-basalt',patternUnits:'userSpaceOnUse',width:'14',height:'14'}, [
    svgEl('rect', {x:'0',y:'0',width:'14',height:'14',fill:'#585858'}),
    svgEl('line', {x1:'4',y1:'0',x2:'4',y2:'6',stroke:'#3a3a3a','stroke-width':'0.6'}),
    svgEl('line', {x1:'4',y1:'10',x2:'4',y2:'14',stroke:'#3a3a3a','stroke-width':'0.6'}),
    svgEl('line', {x1:'10',y1:'0',x2:'10',y2:'5',stroke:'#3a3a3a','stroke-width':'0.5'}),
    svgEl('line', {x1:'10',y1:'8',x2:'10',y2:'14',stroke:'#3a3a3a','stroke-width':'0.5'}),
    svgEl('line', {x1:'7',y1:'5',x2:'7',y2:'10',stroke:'#4a4a4a','stroke-width':'0.3'}),
    svgEl('circle', {cx:'7',cy:'1',r:'0.4',fill:'#4a4a4a'}),
    svgEl('circle', {cx:'2',cy:'12',r:'0.3',fill:'#4a4a4a'})
  ]));

  // 19. weathered_rock
  defs.appendChild(svgEl('pattern', {id:'hatch-weathered_rock',patternUnits:'userSpaceOnUse',width:'10',height:'10'}, [
    svgEl('rect', {x:'0',y:'0',width:'10',height:'10',fill:'#e8dcc8'}),
    svgEl('line', {x1:'0',y1:'0',x2:'10',y2:'10',stroke:'#b08050','stroke-width':'0.5'}),
    svgEl('line', {x1:'-5',y1:'0',x2:'5',y2:'10',stroke:'#b08050','stroke-width':'0.4'}),
    svgEl('line', {x1:'10',y1:'0',x2:'0',y2:'10',stroke:'#c09060','stroke-width':'0.3'}),
    svgEl('line', {x1:'0',y1:'5',x2:'10',y2:'5',stroke:'#a87040','stroke-width':'0.3','stroke-dasharray':'2,3'}),
    svgEl('circle', {cx:'5',cy:'2',r:'0.5',fill:'#a87040'}),
    svgEl('circle', {cx:'2',cy:'8',r:'0.4',fill:'#a87040'})
  ]));

  // 20. core_loss / no recovery
  defs.appendChild(svgEl('pattern', {id:'hatch-core_loss',patternUnits:'userSpaceOnUse',width:'20',height:'20'}, [
    svgEl('rect', {x:'0',y:'0',width:'20',height:'20',fill:'#ffffff'}),
    svgEl('text', {x:'10',y:'11','font-family':'monospace','font-size':'5',fill:'#999','text-anchor':'middle'}, 'NR'),
    svgEl('line', {x1:'0',y1:'10',x2:'20',y2:'10',stroke:'#ddd','stroke-width':'0.2'}),
    svgEl('line', {x1:'10',y1:'13',x2:'17',y2:'20',stroke:'#ddd','stroke-width':'0.2'}),
    svgEl('line', {x1:'10',y1:'13',x2:'3',y2:'20',stroke:'#ddd','stroke-width':'0.2'})
  ]));

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
  return self._headerHeight + depth * self.mmPerUnit;
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
    defects:        15
  },

  darkMode: false,

  _headerHeight: 55,
  _footerHeight: 10,

  // ─── Internal State ────────────────────────────────────────────────────

  _colOrder: ['depthRuler','drillingMethod','water','samples','spt','lithology','description','weathering','strength','rqd','defects'],

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
    defects:        'DEFECTS'
  },

  // ─── SVG Width ─────────────────────────────────────────────────────────

  getSVGWidth: function() {
    var self = this;
    var w = 0;
    self._colOrder.forEach(function(col) {
      if (self['show' + col[0].toUpperCase() + col.slice(1)] || col === 'depthRuler' ? self.showDepthRuler : self['show' + col[0].toUpperCase() + col.slice(1)]) {
        w += self.colWidths[col] || 0;
      }
    });
    return w;
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

  // ─── Render Header Block ───────────────────────────────────────────────

  _renderHeader: function(svg, hole, project, isDark) {
    var self = this;
    var w = self.getSVGWidth();
    var dm = isDark;
    var txt = theme(dm, '#333', '#ddd');
    var ln  = theme(dm, '#999', '#555');

    // Title
    var gHdr = svgEl('g');
    gHdr.appendChild(svgEl('text', {
      x: w / 2, y: '6', 'font-family': 'sans-serif', 'font-size': '5',
      'font-weight': 'bold', fill: txt, 'text-anchor': 'middle'
    }, 'BOREHOLE LOG'));

    // Metadata rows
    var fs = 2.2;
    var lh = 3.2;
    var ly = 11;
    var meta = [
      ['Project: ' + (project.name || ''), 'Hole: ' + (hole.name || ''), 'Client: ' + (project.client || '')],
      ['Job No: ' + (project.jobNo || ''), 'Type: ' + (hole.type || 'soil'), 'Date: ' + (hole.startDate || '')],
      ['Easting: ' + (hole.easting || ''), 'Northing: ' + (hole.northing || ''), 'RL: ' + (hole.rl || '')],
      ['Method: ' + (hole.drillMethod || ''), 'Dia: ' + (hole.dia || ''), 'Inclination: ' + (hole.inclination || ''), 'Azimuth: ' + (hole.azimuth || '')],
      ['Logged by: ' + (hole.loggedBy || ''), 'Checked by: ' + (hole.checkedBy || '')]
    ];

    var colWidths = [w * 0.33, w * 0.33, w * 0.34];

    for (var r = 0; r < meta.length; r++) {
      var cx = 0;
      for (var c = 0; c < meta[r].length; c++) {
        gHdr.appendChild(svgEl('text', {
          x: cx + 0.5, y: ly + r * lh, 'font-family': 'sans-serif', 'font-size': fs,
          fill: txt
        }, meta[r][c]));
        cx += colWidths[c] || (w / meta[r].length);
      }
    }

    // Branding line
    gHdr.appendChild(svgEl('text', {
      x: w / 2, y: ly + meta.length * lh + 2.5, 'font-family': 'sans-serif',
      'font-size': '1.8', fill: theme(dm, '#888', '#666'), 'text-anchor': 'middle'
    }, 'Georesolve — G-Resolog Pro v2'));

    // Horizontal separator line
    var sepY = ly + meta.length * lh + 4;
    gHdr.appendChild(svgEl('line', {x1:'0',y1:sepY,x2:w,y2:sepY,stroke:ln,'stroke-width':'0.3'}));

    svg.appendChild(gHdr);
    return sepY + 2;
  },

  // ─── Render Column Headers ─────────────────────────────────────────────

  _renderColHeaders: function(svg, headerY, isDark) {
    var self = this;
    var dm = isDark;
    var g = svgEl('g');

    self._colOrder.forEach(function(col) {
      if (!self._isColVisible(col)) return;
      var x = self._colStartX(col);
      var cw = self.colWidths[col];

      // Header background
      g.appendChild(svgEl('rect', {
        x: x, y: headerY, width: cw, height: '5',
        fill: theme(dm, '#e8e8e8', '#2a2a3e'),
        stroke: theme(dm, '#999', '#555'), 'stroke-width': '0.2'
      }));

      // Header label
      g.appendChild(svgEl('text', {
        x: x + cw / 2, y: headerY + 3.8, 'font-family': 'sans-serif',
        'font-size': '1.8', 'font-weight': 'bold', fill: theme(dm, '#333', '#ddd'),
        'text-anchor': 'middle'
      }, self._colLabels[col] || ''));
    });

    svg.appendChild(g);
    return headerY + 5;
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
    for (var d = 0; d <= holeDepth; d += self.mmPerUnit / tickInterval) {
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
          'font-size': '1.8', fill: theme(dm, '#333', '#ccc'), 'text-anchor': 'end'
        }, String(d)));
      }
    }

    // Depth increment at bottom
    var bottomY = depthToY(self, holeDepth);
    g.appendChild(svgEl('text', {
      x: x + cw - 2, y: bottomY + 4, 'font-family': 'monospace',
      'font-size': '1.8', fill: theme(dm, '#333', '#ccc'), 'text-anchor': 'end'
    }, 'Depth: ' + holeDepth + 'm'));

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
    var fontSize = 2;
    var lineHeight = 2.5;

    for (var i = 0; i < intervals.length; i++) {
      var iv = intervals[i];
      var topY = depthToY(self, iv.topDepth || 0);
      var desc = iv.description || '';

      if (!desc) continue;

      var lines = wrapText(desc, cw - 1, fontSize);
      var availableH = depthToY(self, iv.baseDepth || 0) - topY;
      var maxLines = Math.floor(availableH / lineHeight);

      // Show as many lines as fit
      var showLines = lines.slice(0, Math.max(1, maxLines));

      for (var l = 0; l < showLines.length; l++) {
        var ly = topY + 2 + l * lineHeight;
        g.appendChild(svgEl('text', {
          x: x + 0.5, y: ly, 'font-family': 'monospace',
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
          'font-size': '1.6', fill: theme(dm, '#3399ff', '#5599dd'), 'text-anchor': 'middle'
        }, 'RL:' + ws.restLevel));
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
        'font-size': '1.8', fill: theme(dm, '#333', '#ddd')
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
      var ds = iv.defectSpacing || '';
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
        'font-size': '1.6', fill: markerColor, 'text-anchor': 'middle'
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

  _renderCasing: function(svg, casing, isDark) {
    var self = this;
    if (!casing || casing.length === 0) return;

    var g = svgEl('g');
    var dm = isDark;

    // Casings appear as shaded rectangles across the full log width
    var w = self.getSVGWidth();

    for (var i = 0; i < casing.length; i++) {
      var c = casing[i];
      var topY = depthToY(self, c.topDepth || 0);
      var botY = depthToY(self, c.baseDepth || 0);
      var h = botY - topY;
      if (h <= 0) continue;

      // Semi-transparent overlay rectangle
      g.appendChild(svgEl('rect', {
        x: 0, y: topY, width: w, height: h,
        fill: theme(dm, '#666666', '#888888'), opacity: '0.15',
        stroke: theme(dm, '#555', '#777'), 'stroke-width': '0.3'
      }));

      // Casing label
      var cx = w - 5;
      var cy = (topY + botY) / 2;
      var cLabel = (c.dia ? c.dia + 'mm ' : '') + (c.type || 'Casing');
      g.appendChild(svgEl('text', {
        x: cx, y: cy + 1, 'font-family': 'sans-serif',
        'font-size': '1.8', fill: theme(dm, '#555', '#aaa'), 'text-anchor': 'end'
      }, cLabel));
    }

    svg.appendChild(g);
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

    // Render frame (column borders)
    self._renderFrame(svg, hole, colHeaderY, dm);

    // Core hole mode: add core recovery table
    if (hole.type === 'core') {
      self._renderCoreTable(svg, intervals, hole, colHeaderY, dm);
    }
  },

  // ─── Main Render Method ────────────────────────────────────────────────

  render: function(hole, intervals, fieldTests, samples, waterStrikes, casing, project) {
    var self = this;
    var dm = self.darkMode;

    // Ensure valid inputs
    hole = hole || {};
    intervals = intervals || [];
    fieldTests = fieldTests || [];
    samples = samples || [];
    waterStrikes = waterStrikes || [];
    casing = casing || [];
    project = project || {};

    var holeDepth = hole.depth || 0;
    var svgW = self.getSVGWidth();
    var totalH = depthToY(self, holeDepth) + self._footerHeight;

    // Add core table height if needed
    var hasCoreRuns = intervals.some(function(iv) {
      return iv.runLength != null || iv.tcr != null || iv.scr != null;
    });
    if (hole.type === 'core' && hasCoreRuns) {
      var coreRuns = intervals.filter(function(iv) {
        return iv.runLength != null || iv.tcr != null || iv.scr != null || iv.rqd != null;
      });
      totalH += 20 + coreRuns.length * 5 + 15;
    }

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

    // Test pit mode
    if (hole.type === 'testpit') {
      self._renderTestPit(svg, hole, intervals, project, fieldTests, samples, waterStrikes, casing, dm);
    } else {
      self._doRender(svg, hole, intervals, project, fieldTests, samples, waterStrikes, casing, dm);
    }

    // Footer branding
    var footerY = totalH - 3;
    svg.appendChild(svgEl('text', {
      x: svgW / 2, y: footerY, 'font-family': 'sans-serif',
      'font-size': '1.6', fill: theme(dm, '#aaa', '#555'), 'text-anchor': 'middle'
    }, 'Generated by Georesolve G-Resolog Pro v2'));

    // Create container div
    var container = document.createElement('div');
    container.className = 'strip-log-svg-container';
    container.style.cssText = 'overflow:auto;width:100%;max-width:' + (svgW + 10) + 'mm;';
    container.appendChild(svg);

    return container;
  }
};