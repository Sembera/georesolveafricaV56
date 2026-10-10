"""Extract actual vector artwork from the USGS/FGDC Section 37 swatches.
Run with the bundled Python (pdfplumber required). No raster tracing or AI artwork.
"""
from pathlib import Path
import json, html
import pdfplumber
# PDF extraction must retain clipping. Otherwise neighboring swatch artwork can
# leak into the extracted asset, even though it is invisible in the source PDF.
from pdfminer.pdfinterp import PDFPageInterpreter, PDFGraphicState
from pdfminer.utils import apply_matrix_pt
from pdfplumber.page import PDFPageAggregator, ALL_ATTRS
_old_copy = PDFGraphicState.copy
def copy_state(self):
    result = _old_copy(self)
    result.clip_paths = getattr(self,'clip_paths',())
    return result
PDFGraphicState.copy = copy_state
def capture_clip(self):
    transformed=[]
    for command in self.curpath:
        op=command[0]; numbers=command[1:]
        points=[apply_matrix_pt(self.ctm,(numbers[i],numbers[i+1])) for i in range(0,len(numbers),2)]
        transformed.append((op,*points))
    self.graphicstate.clip_paths = getattr(self.graphicstate,'clip_paths',()) + (tuple(transformed),)
PDFPageInterpreter.do_W = capture_clip
PDFPageInterpreter.do_W_a = capture_clip
_old_paint = PDFPageAggregator.paint_path
def paint_with_clip(self,gstate,stroke,fill,evenodd,path):
    start=len(self.cur_item._objs)
    _old_paint(self,gstate,stroke,fill,evenodd,path)
    for item in self.cur_item._objs[start:]: item.clip_paths=getattr(gstate,'clip_paths',())
PDFPageAggregator.paint_path=paint_with_clip
ALL_ATTRS.add('clip_paths')
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'resources/lithology'
doc=pdfplumber.open(OUT/'fgdc-section37.pdf')
code_pages=[ [601,602,603,605,606,607,608,609,610,611,612,613,614,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644], list(range(645,687)), list(range(701,734)) ]
boxes={}
for page,codes in zip(doc.pages,code_pages):
    rects=[r for r in page.rects if 53<r['width']<55 and 42<r['height']<44]
    rects.sort(key=lambda r:(round(r['top']/2)*2,r['x0']))
    assert len(rects)==len(codes),(len(rects),len(codes))
    for code,rect in zip(codes,rects): boxes[code]=(page,rect)
mm=25.4/72

def extract(code,key):
    page,r=boxes[code]
    x,y=r['x0']+.45,r['top']+.45
    w,h=r['width']-.9,r['height']-.9
    def pt(p): return f'{(p[0]-x)*mm:.4f} {(p[1]-y)*mm:.4f}'
    def segment(a,b,bounds):
        left,top,right,bottom=bounds; dx=b[0]-a[0];dy=b[1]-a[1];lo,hi=0.,1.
        for p,q in [(-dx,a[0]-left),(dx,right-a[0]),(-dy,a[1]-top),(dy,bottom-a[1])]:
            if abs(p)<1e-10:
                if q<0:return None
            else:
                t=q/p
                if p<0:lo=max(lo,t)
                else:hi=min(hi,t)
        if lo>hi:return None
        return (a[0]+lo*dx,a[1]+lo*dy),(a[0]+hi*dx,a[1]+hi*dy)
    def polygon_clip(points,bounds):
        left,top,right,bottom=bounds
        for axis,value,greater in [(0,left,True),(0,right,False),(1,top,True),(1,bottom,False)]:
            if not points:break
            output=[];previous=points[-1]
            inside=lambda p: p[axis]>=value if greater else p[axis]<=value
            for current in points:
                if inside(current)!=inside(previous):
                    t=(value-previous[axis])/(current[axis]-previous[axis]);output.append((previous[0]+t*(current[0]-previous[0]),previous[1]+t*(current[1]-previous[1])))
                if inside(current):output.append(current)
                previous=current
            points=output
        return points
    def flatten(commands):
        paths=[];points=[]
        for c in commands:
            if c[0]=='m':
                if points:paths.append(points)
                points=[c[1]]
            elif c[0]=='l':points.append(c[1])
            elif c[0]=='c':
                a=points[-1];b,c1,d=c[1:]
                for n in range(1,25):
                    t=n/24;u=1-t;points.append((u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c1[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c1[1]+t*t*t*d[1]))
            elif c[0]=='h' and points:points.append(points[0])
        if points:paths.append(points)
        return paths
    def ink(value):
        # Source indexed colour 1 is black in these lithology swatches.
        return '#202a30'
    items=[]
    for obj in page.curves+page.lines+page.rects:
        if obj['x1']<=x or obj['x0']>=x+w or obj['bottom']<=y or obj['top']>=y+h:continue
        if obj['width']>w*1.2 or obj['height']>h*1.2:continue
        bounds=[x,y,x+w,y+h]
        for clip in obj.get('clip_paths',()):
            assert all(c[0] in ('m','l','h') for c in clip),'Nonrectangular source clip needs special handling'
            points=[(p[0],page.height-p[1]) for c in clip for p in c[1:]]
            if points:
                bounds=[max(bounds[0],min(p[0] for p in points)),max(bounds[1],min(p[1] for p in points)),min(bounds[2],max(p[0] for p in points)),min(bounds[3],max(p[1] for p in points))]
        if bounds[2]<=bounds[0] or bounds[3]<=bounds[1]:continue
        typ=obj['object_type']
        if typ=='curve':commands=obj['path']
        elif typ=='line':commands=[('m',obj['pts'][0]),('l',obj['pts'][-1])]
        else:commands=[('m',(obj['x0'],obj['top'])),('l',(obj['x1'],obj['top'])),('l',(obj['x1'],obj['bottom'])),('l',(obj['x0'],obj['bottom'])),('h',)]
        fill=ink(obj.get('non_stroking_color')) if obj.get('fill') else 'none'
        stroke=ink(obj.get('stroking_color')) if obj.get('stroke') else 'none'
        sw=max(.06,(obj.get('linewidth') or .25)*mm)
        contained=obj['x0']>=bounds[0] and obj['top']>=bounds[1] and obj['x1']<=bounds[2] and obj['bottom']<=bounds[3]
        if contained:
            d=' '.join(('Z' if c[0]=='h' else c[0].upper())+' '.join(pt(p) for p in c[1:]) for c in commands)
            items.append(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw:.4f}" stroke-linecap="round" stroke-linejoin="round"/>')
        else:
            for points in flatten(commands):
                if fill!='none':
                    polygon=polygon_clip(points,bounds)
                    if len(polygon)>2:items.append('<path d="M'+' L'.join(pt(p) for p in polygon)+' Z" fill="'+fill+'" stroke="none"/>')
                if stroke!='none':
                    segments=[segment(a,b,bounds) for a,b in zip(points,points[1:])]
                    d=' '.join('M'+pt(a)+' L'+pt(b) for pair in segments if pair for a,b in [pair])
                    if d:items.append(f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw:.4f}" stroke-linecap="round" stroke-linejoin="round"/>')
    return round(w*mm,4),round(h*mm,4),''.join(items)

# Codes refer to published chart artwork, not geotechnical classification compliance.
entries=[
 ('clay','Clay',620,'Soils / sediments'),('silt','Silt',616,'Soils / sediments'),('sand','Sand',607,'Soils / sediments'),('gravel','Gravel',601,'Soils / sediments'),('peat','Peat',657,'Soils / sediments'),
 ('sandstone','Sandstone',607,'Sedimentary rocks'),('siltstone','Siltstone',616,'Sedimentary rocks'),('mudstone','Mudstone',620,'Sedimentary rocks'),('shale','Shale',620,'Sedimentary rocks'),('limestone','Limestone',627,'Sedimentary rocks'),('dolostone','Dolostone',642,'Sedimentary rocks'),('conglomerate','Conglomerate',602,'Sedimentary rocks'),('breccia','Breccia',605,'Sedimentary rocks'),('chert','Chert',649,'Sedimentary rocks'),('coal','Coal',658,'Sedimentary rocks'),
 ('granite','Granite',718,'Igneous / metamorphic rocks'),('gneiss','Gneiss',708,'Igneous / metamorphic rocks'),('schist','Schist',705,'Igneous / metamorphic rocks'),('quartzite','Quartzite',702,'Igneous / metamorphic rocks'),('basalt','Basalt',717,'Igneous / metamorphic rocks'),('slate','Slate',703,'Igneous / metamorphic rocks'),('tuff','Tuff',711,'Igneous / metamorphic rocks'),('volcanic_breccia','Volcanic breccia',714,'Igneous / metamorphic rocks'),('quartz','Vein quartz',732,'Igneous / metamorphic rocks')]
assets={}
for key,label,code,group in entries:
    w,h,body=extract(code,key)
    assets[key]=dict(label=label,code=code,group=group,width=w,height=h,body=body,source='USGS/FGDC Section 37 vector artwork')
# Explicitly authored supplementary field symbols. Do not assign spurious FGDC codes.
custom={
 'topsoil':('Topsoil / organic soil',8,6,'<path d="M1 1h2m-1 0v2m0-1L1 3m1-1 1 1M5 .7h2m-1 0v2m0-1L5 3m1-1 1 1M3.5 4h2m-1 0v2m0-1-1 1m1-1 1 1" fill="none" stroke="#202a30" stroke-width=".18"/>'),
 'laterite':('Laterite / murram',8,7,'<path d="M1 1 2.1 .8 2.7 1.7 2 2.6 .9 2.1ZM5.1 3 6.4 2.7 7 3.6 6.3 4.7 5 4.2ZM1.7 5.1 3 4.8 3.6 5.7 2.7 6.5 1.5 6Z" fill="none" stroke="#202a30" stroke-width=".17"/><circle cx="4" cy="1.1" r=".13" fill="#202a30"/><circle cx=".6" cy="3.8" r=".13" fill="#202a30"/><circle cx="4.2" cy="5.6" r=".13" fill="#202a30"/>'),
 'fill':('Fill / made ground',8,7,'<path d="M.8 1.2 2.4 .8 2.8 2.1 1.1 2.5ZM5.3 .8 6.8 2.1 5.5 2.9ZM3.4 4.1 5.1 3.8 5.8 5.2 4.5 6.1 3.1 5.3ZM.5 5h1.3m.6-1.8h1m3.2 3h1.1" fill="none" stroke="#202a30" stroke-width=".17"/>'),
 'weathered_rock':('Weathered rock (unspecified)',8,7,'<path d="M0 2 2.2 1.3 4 2.3 6 1.6 8 2.1M2.2 1.3 2.7 4.3 1.5 7M6 1.6 5.3 4.4 6.7 7M0 5 2.7 4.3 5.3 4.4 8 5.3" fill="none" stroke="#202a30" stroke-width=".16" stroke-dasharray=".6 .35"/>'),
 'core_loss':('No recovery / core loss',8,8,'<path d="M2 2 6 6M6 2 2 6" fill="none" stroke="#56616a" stroke-width=".16"/>')}
for key,(label,w,h,body) in custom.items(): assets[key]=dict(label=label,code=None,group='Field-record symbols',width=w,height=h,body=body,source='GeoResolve supplementary field symbol; not an FGDC lithology code')
for key,a in assets.items():
    # Source paths remain vector; bounds clip artwork just as on the source chart.
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {a["width"]} {a["height"]}" width="{a["width"]}mm" height="{a["height"]}mm"><title>{html.escape(a["label"])}{(" - FGDC "+str(a["code"])) if a["code"] else ""}</title><rect width="100%" height="100%" fill="white"/>{a["body"]}</svg>'
    (OUT/(key+'.svg')).write_text(svg,encoding='utf-8')
module='// Generated from USGS/FGDC Section 37 vector artwork. See resources/lithology/README.md.\nexport const LITHOLOGY_ASSETS = '+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n'
module+='''export function lithologyDefs() {
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns,'defs');
  Object.entries(LITHOLOGY_ASSETS).forEach(([key,a])=>{
    const pattern = document.createElementNS(ns,'pattern');
    pattern.setAttribute('id','hatch-'+key);
    pattern.setAttribute('patternUnits','userSpaceOnUse');
    pattern.setAttribute('width',a.width); pattern.setAttribute('height',a.height);
    pattern.innerHTML='<rect width="'+a.width+'" height="'+a.height+'" fill="white"/>'+a.body;
    defs.appendChild(pattern);
  });
  return defs;
}
'''
(ROOT/'js/resolog/lithology-assets.js').write_text(module,encoding='utf-8')
(OUT/'README.md').write_text('''# Lithology symbol assets

Primary source: USGS/FGDC Digital Cartographic Standard for Geologic Map Symbolization (2006), Section 37, https://ngmdb.usgs.gov/fgdc_gds/geolsymstd/fgdc-geolsym-sec37.pdf . The original reference PDF is retained here. These US federal government geological-symbol artworks are attributed to USGS/FGDC; no USGS endorsement is implied. Copyright policy: https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits .

The SVGs are extracted directly from the source PDF vector paths, with the chart frames removed. They retain source linework and physical scale and are reproduced on white for monochrome printing. The generated browser module embeds the same vector artwork for reliable PDF export; the picker uses the standalone SVGs. Rebuild with scripts/build_lithology_assets.py and pdfplumber.

Codes: gravel 601, conglomerate 602, breccia 605, sand/sandstone 607, silt/siltstone 616, clay/shale 620, limestone 627, dolostone 642, chert 649, peat 657, coal 658, quartzite 702, slate 703, schist 705, gneiss 708, tuff 711, volcanic breccia 714, basalt 717, granite 718, vein quartz 732. Mudstone uses the clay/shale artwork as a labelled adaptation. Grain patterns describe lithology; they are not a statement of USCS or BS5930 classification compliance. Laterite, fill, topsoil, weathered-rock and core-loss symbols are supplementary GeoResolve field-record symbols, distinctly identified in the library. Weathering should be recorded separately whenever the parent lithology is known.
''',encoding='utf-8')
print('Built',len(assets),'vector lithology assets')
