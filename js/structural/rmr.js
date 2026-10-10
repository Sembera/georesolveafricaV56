// Discrete Bieniawski 1989 ratings: FHWA-NHI-09-010 Table 6-3.
export const FIELDS={
 strength:{label:'Intact rock strength · UCS',max:15,options:[['>250 MPa',15],['100–250 MPa',12],['50–<100 MPa',7],['25–<50 MPa',4],['5–<25 MPa',2],['1–<5 MPa',1],['<1 MPa',0]]},
 spacing:{label:'Discontinuity spacing',max:20,options:[['>2 m',20],['0.6–2 m',15],['0.2–<0.6 m',10],['0.06–<0.2 m',8],['<0.06 m',5]]},
 persistence:{label:'Persistence',max:6,options:[['<1 m',6],['1–<3 m',4],['3–<10 m',2],['10–20 m',1],['>20 m',0]]},
 aperture:{label:'Aperture',max:6,options:[['None / closed',6],['<0.1 mm',5],['0.1–<1 mm',4],['1–5 mm',1],['>5 mm',0]]},
 roughness:{label:'Roughness',max:6,options:[['Very rough',6],['Rough',5],['Slightly rough',3],['Smooth',1],['Slickensided',0]]},
 infilling:{label:'Infilling',max:6,options:[['None',6],['Hard filling <5 mm',4],['Hard filling ≥5 mm',2],['Soft filling <5 mm',2],['Soft filling ≥5 mm',0]]},
 weathering:{label:'Weathering of joint walls',max:6,options:[['Unweathered',6],['Slightly weathered',5],['Moderately weathered',3],['Highly weathered',1],['Decomposed',0]]},
 water:{label:'Groundwater · observed condition',max:15,options:[['Completely dry',15],['Damp',10],['Wet',7],['Dripping',4],['Flowing',0]]}
};
export const ORIENTATION={tunnel:[0,-2,-5,-10,-12],foundation:[0,-2,-7,-15,-25],slope:[0,-5,-25,-50,-60]};
export const FAVOR=['Very favourable','Favourable','Fair','Unfavourable','Very unfavourable'];
export const CLASSES=[{min:81,id:'I',name:'Very good rock'},{min:61,id:'II',name:'Good rock'},{min:41,id:'III',name:'Fair rock'},{min:21,id:'IV',name:'Poor rock'},{min:0,id:'V',name:'Very poor rock'}];
export const rqdRating = x => x>=90?20:x>=75?17:x>=50?13:x>=25?8:3;
export function calculateRMR(input) {
 const errors=[],parts={};
 for(const [k,f] of Object.entries(FIELDS)) {
  if(input.conditionMode==='overall'&&['persistence','aperture','roughness','infilling','weathering'].includes(k))continue;
  const i=Number(input[k]);if(input[k]===''||input[k]===null||input[k]===undefined||!Number.isInteger(i)||!f.options[i])errors.push(f.label);else parts[k]=f.options[i][1];
 }
 const q=Number(input.rqd);if(String(input.rqd??'').trim()===''||!Number.isFinite(q)||q<0||q>100)errors.push('RQD (0–100%)');else parts.rqd=rqdRating(q);
 const o=Number(input.orientation);if(input.orientation===''||input.orientation==null||!Number.isInteger(o)||!ORIENTATION[input.application]?.[o]&&ORIENTATION[input.application]?.[o]!==0)errors.push('Application / orientation');
 if(input.conditionMode==='overall'&&(input.conditionOverall===''||input.conditionOverall==null||![0,10,20,25,30].includes(Number(input.conditionOverall))))errors.push('Overall discontinuity condition');
 if(errors.length)return {complete:false,errors,parts};
 const condition=input.conditionMode==='overall'?Number(input.conditionOverall):['persistence','aperture','roughness','infilling','weathering'].reduce((s,k)=>s+parts[k],0);
 const basic=parts.strength+parts.rqd+parts.spacing+condition+parts.water,adjustment=ORIENTATION[input.application][o],raw=basic+adjustment,total=Math.max(0,raw);
 return {complete:true,parts,condition,basic,adjustment,raw,total,rockClass:CLASSES.find(c=>total>=c.min)};
}
export const sampleRMR = () => ({strength:1,rqd:82,spacing:1,persistence:1,aperture:1,roughness:2,infilling:0,weathering:1,water:3,application:'tunnel',orientation:2,conditionMode:'detail',conditionOverall:'',station:'EXAMPLE · jointed rock',notes:'Synthetic assessment for demonstration. Not project observations.',example:true});
export const blankRMR=()=>({...Object.fromEntries(Object.keys(FIELDS).map(k=>[k,''])),rqd:'',application:'tunnel',orientation:'',conditionMode:'detail',conditionOverall:'',station:'',notes:'',example:false});
