// Lower-hemisphere orientations in an east, north, down coordinate frame.
export const rad = d => d * Math.PI / 180;
export const wrap = d => ((d % 360) + 360) % 360;
export function validateRow(row) {
 const errors=[];
 if (!['plane','line'].includes(row.type)) errors.push('type must be plane or line');
 if (!['dd','rhr'].includes(row.convention)) errors.push('convention must be dd or rhr');
 for (const [key,max] of [['azimuth',360],['dip',90]]) if(String(row[key]??'').trim()==='' || !Number.isFinite(Number(row[key])) || Number(row[key])<0 || Number(row[key])>max) errors.push(`${key} must be 0–${max}°`);
 return errors;
}
export function vector(trend, plunge) {return [Math.sin(rad(trend))*Math.cos(rad(plunge)),Math.cos(rad(trend))*Math.cos(rad(plunge)),Math.sin(rad(plunge))];}
export function direction(row) {return wrap(Number(row.azimuth)+(row.type==='plane'&&row.convention==='rhr'?90:0));}
export function pole(row) {return vector(wrap(direction(row)+180),90-Number(row.dip));}
export function project(v, mode='area') {
 if(v[2]<-1e-10) v=v.map(x=>-x);
 const z=Math.max(0,Math.min(1,v[2])),h=Math.hypot(v[0],v[1]);
 const r=mode==='angle'?Math.sqrt((1-z)/(1+z)):Math.sqrt(1-z);
 return h<1e-12?[0,0]:[v[0]/h*r,-v[1]/h*r];
}
export function greatCircle(row,mode='area') {
 const dd=direction(row),s=vector(dd-90,0),d=vector(dd,Number(row.dip));
 return Array.from({length:181},(_,i)=>{const t=rad(i);return project(s.map((x,j)=>x*Math.cos(t)+d[j]*Math.sin(t)),mode);});
}
export function rose(rows,source='strike',axial=true,width=10) {
 if(![5,10,15,20,30,45,60,90].includes(Number(width))) throw Error('Unsupported bin width');
 const extent=axial?180:360,bins=Array(extent/Number(width)).fill(0);
 let n=0;
 for(const row of rows) {
  if(validateRow(row).length || (source==='trend'?row.type!=='line':row.type!=='plane')) continue;
  let a=source==='trend'?Number(row.azimuth):direction(row)-(source==='strike'?90:0);
  a=wrap(a)%extent;bins[Math.floor(a/Number(width))]++;n++;
 }
 return {bins,n,extent,width:Number(width)};
}
export function parseCSV(text) {
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++) {const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\t')){row.push(cell);cell='';}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('Unclosed quote in CSV');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export const csvCell = v => '"'+String(v??'').replaceAll('"','""')+'"';
