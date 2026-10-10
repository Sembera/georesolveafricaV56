import {rad,vector,project,pole,greatCircle,rose,validateRow} from './math.js';
export const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const COLORS=['#176f74','#c66a31','#5568a5','#853e73','#627747','#b13e43'];
export function groups(rows) {return [...new Set(rows.map(r=>r.group||'Ungrouped'))];}
const xy=(p,c=250,r=185)=>[c+p[0]*r,290+p[1]*r];
const text=(x,y,t,size=12,anchor='middle',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" ${extra}>${esc(t)}</text>`;
const line=(x1,y1,x2,y2,stroke='#c6d1d5',w=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"/>`;
const base=(title,subtitle)=>`<rect width="500" height="630" fill="white"/>${text(30,34,title,20,'start','font-weight="700"')}${text(30,58,subtitle,11,'start','fill="#536b74"')}`;
const compass=()=>text(250,92,'N',14,'middle','font-weight="700"')+text(455,295,'E')+text(250,500,'S')+text(45,295,'W');
const shell=(body,label,height=630)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 ${height}" role="img" aria-label="${esc(label)}" style="font-family:Arial,sans-serif;fill:#173d47">${body}</svg>`;
export function stereonet(rows,s) {
 rows=rows.filter(r=>!validateRow(r).length);const gs=groups(rows),planes=rows.filter(r=>r.type==='plane'),lines=rows.filter(r=>r.type==='line');
 let body=base('Stereonet',`${s.projection==='area'?'Equal-area · Schmidt':'Equal-angle · Wulff'} / lower hemisphere · n = ${rows.length}`);
 for(let plunge=10;plunge<90;plunge+=10) {const r=Math.hypot(...project(vector(0,plunge),s.projection))*185;body+=`<circle cx="250" cy="290" r="${r}" fill="none" stroke="#e8edef"/>`;}
 for(let a=0;a<360;a+=10) {let p=xy(project(vector(a,0),s.projection)),q=xy(project(vector(a,a%30?2:4),s.projection));body+=line(...p,...q,'#889da5');if(a%30===0) {const x=250+167*Math.sin(rad(a)),y=290-167*Math.cos(rad(a));body+=text(x,y,a,9);}}
 body+=line(65,290,435,290,'#dde5e7')+line(250,105,250,475,'#dde5e7');
 rows.forEach(row=>{const color=COLORS[gs.indexOf(row.group||'Ungrouped')%COLORS.length];if(row.type==='plane'&&s.circles){const pts=greatCircle(row,s.projection).map(v=>xy(v).map(n=>n.toFixed(3)).join(',')).join(' ');body+=`<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.6"/>`;}
 if(row.type==='line'||s.poles){const [x,y]=xy(project(row.type==='line'?vector(Number(row.azimuth),Number(row.dip)):pole(row),s.projection));body+=row.type==='line'?`<path d="M${x},${y-5} l5,5 l-5,5 l-5,-5 Z" fill="${color}" stroke="white" stroke-width="0.7"/>`:`<circle cx="${x}" cy="${y}" r="3.6" fill="${color}" stroke="white" stroke-width="0.7"/>`;}});
 body+=`<circle cx="250" cy="290" r="185" fill="none" stroke="#425f69" stroke-width="1.4"/>`+compass();
 body+=text(30,525,`${planes.length} planes · ${lines.length} lines | dots = poles, diamonds = lines`,10,'start');
 const legendHeight=Math.ceil(gs.length/2)*19,footerY=555+legendHeight;
 gs.forEach((g,i)=>{const x=30+(i%2)*235,y=551+Math.floor(i/2)*19; body+=`<circle cx="${x+4}" cy="${y-4}" r="4" fill="${COLORS[i%COLORS.length]}"/>`+text(x+16,y,g.length>28?g.slice(0,26)+'…':g,11,'start');});
 body+=text(30,footerY+9,`${planes.filter(r=>r.convention==='dd').length} dip-direction / dip · ${planes.filter(r=>r.convention==='rhr').length} RHR strike / dip · lines: trend / plunge`,10,'start');
 body+=text(30,footerY+28,'GeoResolve Africa · G-Structural',10,'start');return shell(body,'Lower-hemisphere stereonet',Math.max(630,footerY+45));
}
export function rosePlot(rows,s) {
 const data=rose(rows,s.source,s.axial,Number(s.bin)),max=Math.max(1,...data.bins),cap=Math.ceil(max/5)*5;
 let body=base('Rose diagram',`${s.source==='dd'?'Dip direction':s.source==='trend'?'Line trend':'Strike'} · ${s.axial?'axial 180° (mirrored)':'directional 360°'} · n = ${data.n}`);
 for(let i=1;i<=4;i++){const r=185*i/4;body+=`<circle cx="250" cy="290" r="${r}" stroke="#dde5e7" fill="none"/>`;body+=text(256,290-r+12,s.units==='percent'?`${data.n?(cap*i/4/data.n*100).toFixed(1):0}%`:(cap*i/4).toFixed(1),10,'start');}
 for(let a=0;a<360;a+=30){const x=250+185*Math.sin(rad(a)),y=290-185*Math.cos(rad(a));body+=line(250,290,x,y,'#e8edef');}
 data.bins.forEach((count,i)=>{if(!count)return;for(let mirror=0;mirror<(s.axial?2:1);mirror++){const a=rad(i*data.width+mirror*180),b=a+rad(data.width),r=185*count/cap,x=250+r*Math.sin(a),y=290-r*Math.cos(a),u=250+r*Math.sin(b),v=290-r*Math.cos(b);body+=`<path d="M250,290 L${x},${y} A${r},${r} 0 0 1 ${u},${v} Z" fill="#176f74" opacity="0.82" stroke="white" stroke-width="0.8"/>`;}});
 body+=`<circle cx="250" cy="290" r="185" fill="none" stroke="#425f69" stroke-width="1.4"/>`+compass();
 body+=text(30,525,`Bins ${data.width}° · [start, end) · radius proportional to frequency`,11,'start');
 body+=text(30,548,s.axial?'Opposite petals repeat the same bins; sample count is not doubled.':'Directions are counted once across 0–360°.',10,'start');
 body+=text(30,571,`Eligible: ${data.n} ${s.source==='trend'?'lines':'planes'} · pooled groups`,10,'start')+text(30,610,'GeoResolve Africa · G-Structural',10,'start');return shell(body,'Structural orientation rose diagram');
}
export function combined(rows,s,title,example) {
 const net=stereonet(rows,s),height=Math.max(740,Number(net.match(/viewBox="0 0 500 (\d+)"/)[1])+110);
 const a=net.replace(/^<svg[^>]*>/,'<g transform="translate(20 90)">').replace(/<\/svg>$/,'</g>'),b=rosePlot(rows,s).replace(/^<svg[^>]*>/,'<g transform="translate(530 90)">').replace(/<\/svg>$/,'</g>');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="${height}" viewBox="0 0 1050 ${height}" style="font-family:Arial,sans-serif;fill:#173d47"><rect width="1050" height="${height}" fill="white"/>${text(30,36,title||'Structural measurements',(title||'').length>70?16:22,'start','font-weight="700"')}${text(30,61,example?'SYNTHETIC EXAMPLE · demonstration data':'Field dataset · orientations in degrees clockwise from north',12,'start')}${a}${b}</svg>`;
}
