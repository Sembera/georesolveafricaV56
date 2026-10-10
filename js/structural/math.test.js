import assert from 'node:assert/strict';
import {vector,project,pole,greatCircle,direction,rose,validateRow,parseCSV,csvCell} from './math.js';
import {calculateRMR,sampleRMR,blankRMR,rqdRating,ORIENTATION} from './rmr.js';
import {combined} from './plots.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`), row=(a,d=45,c='dd',type='plane')=>({id:'a',type,azimuth:a,dip:d,convention:c,group:'G'});
for(const mode of ['area','angle']){
 const n=project(vector(0,0),mode),e=project(vector(90,0),mode),v=project(vector(0,90),mode);near(n[0],0);near(n[1],-1);near(e[0],1);near(e[1],0);near(v[0],0);near(v[1],0);
 near(Math.hypot(...project(vector(0,30),mode)),mode==='area'?Math.sqrt(.5):Math.tan(Math.PI/6));
 for(const dip of [0,30,90]){const p=row(90,dip);const normal=pole(p);near(Math.hypot(...normal),1);const dipVector=vector(90,dip);near(normal.reduce((s,x,i)=>s+x*dipVector[i],0),0);assert.ok(greatCircle(p,mode).every(v=>Math.hypot(...v)<=1+1e-9));}
 const vertical=greatCircle(row(90,90),mode);near(vertical[90][0],0);near(vertical[90][1],0);
 const horizontal=greatCircle(row(90,0),mode);assert.ok(horizontal.every(p=>Math.abs(Math.hypot(...p)-1)<1e-9));
}
near(direction(row(0,45,'rhr')),90);near(direction(row(360)),0);
assert.equal(validateRow(row('')).length,1);assert.equal(validateRow(row(0,91)).length,1);assert.equal(validateRow(row(361)).length,1);assert.equal(validateRow(row('x')).length,1);
const data=[row(10),row(190),row(0),row(360),row(180),row(359),row(5,20,'dd','line')];
for(const width of [5,10,15,20,30,45,60,90])for(const axial of [true,false]){const r=rose(data,'dd',axial,width);assert.equal(r.n,6);assert.equal(r.bins.reduce((a,b)=>a+b,0),6);}
const axial=rose([row(10),row(190)],'dd',true,10);assert.equal(axial.bins[1],2);assert.equal(rose([row(5,20,'dd','line')],'trend',false,10).n,1);
const cells=['id','with,comma','with"quote','two\nlines'];assert.deepEqual(parseCSV(cells.map(csvCell).join(',')),[cells]);assert.deepEqual(parseCSV('a\tb\r\n1\t2'),[['a','b'],['1','2']]);assert.throws(()=>parseCSV('a,"b'));
assert.deepEqual([24.999,25,49.999,50,74.999,75,89.999,90,100].map(rqdRating),[3,8,8,13,13,17,17,20,20]);
assert.equal(calculateRMR(blankRMR()).complete,false);
const sample=calculateRMR(sampleRMR());assert.equal(sample.condition,23);assert.equal(sample.basic,71);assert.equal(sample.total,66);assert.equal(sample.rockClass.id,'II');
// FHWA-NHI-09-010 worked example, p.6-10: 12+17+15+25+4-5=68.
assert.equal(calculateRMR({...sampleRMR(),conditionMode:'overall',conditionOverall:25}).total,68);
const max={...sampleRMR(),strength:0,rqd:100,spacing:0,persistence:0,aperture:0,roughness:0,infilling:0,weathering:0,water:0,orientation:0};assert.equal(calculateRMR(max).total,100);
const low={...sampleRMR(),strength:6,rqd:0,spacing:4,persistence:4,aperture:4,roughness:4,infilling:4,weathering:4,water:4,application:'slope',orientation:4};assert.equal(calculateRMR(low).raw,-52);assert.equal(calculateRMR(low).total,0);assert.equal(calculateRMR(low).rockClass.id,'V');
assert.deepEqual(ORIENTATION.slope,[0,-5,-25,-50,-60]);
for(const [score,id] of [[20,'V'],[21,'IV'],[40,'IV'],[41,'III'],[60,'III'],[61,'II'],[80,'II'],[81,'I']]){const {CLASSES}=await import('./rmr.js');assert.equal(CLASSES.find(c=>score>=c.min).id,id);}
for(const override of [{rqd:-1},{rqd:101},{rqd:''},{strength:99},{orientation:-1},{application:'bad'},{conditionMode:'overall',conditionOverall:''}])assert.equal(calculateRMR({...sampleRMR(),...override}).complete,false);
const svg=combined(data,{projection:'area',circles:true,poles:true,source:'dd',axial:true,bin:10,units:'count'},'Test <title>',true);assert.ok(svg.includes('Test &lt;title&gt;'));assert.ok(!svg.includes('NaN'));assert.ok(svg.includes('SYNTHETIC EXAMPLE'));
console.log('G-Structural checks passed: projections, orthogonality, boundaries, rose counts, CSV, RMR89 source fixture and invalid inputs.');
