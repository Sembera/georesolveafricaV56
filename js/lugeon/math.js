export const factors={MPa:1,bar:.1,kPa:.001,psi:.006894757293168};
const number=v=>v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v));
export function calculate(c,r){
 const errors=[];for(const k of ['top','bottom'])if(!number(c[k])||Number(c[k])<0)errors.push('Enter nonnegative interval depths');
 const length=Number(c.bottom)-Number(c.top);if(!(length>0))errors.push('Bottom must exceed top');
 for(const k of c.basis==='gauge'?['pressure','loss']:['pressure'])if(!number(r[k])||Number(r[k])<0)errors.push('Pressure and loss must be nonnegative');
 let head=0;if(c.basis==='gauge'){
 for(const k of ['height','water'])if(!number(c[k]))errors.push('Enter gauge height and groundwater depth');
 const mid=c.geometry==='vertical'?(Number(c.top)+Number(c.bottom))/2:Number(c.mid);
 if(!Number.isFinite(mid)||mid<0||(c.geometry!=='vertical'&&!number(c.mid)))errors.push('Enter midpoint vertical depth');
 head=.00980665*(Number(c.height)+Math.min(mid,Number(c.water)));
 }
 const effective=Number(r.pressure)*factors[c.unit]+head-(c.basis==='gauge'?Number(r.loss)*factors[c.unit]:0);
 if(!(effective>0)||!Number.isFinite(effective))errors.push('Effective pressure must be positive');
 let flow;
 if(c.mode==='flow'){if(!number(r.flow)||Number(r.flow)<0)errors.push('Enter nonnegative flow');flow=Number(r.flow);}
 else {if(!number(r.time)||Number(r.time)<=0)errors.push('Duration must be positive');let volume=Number(r.volume);if(c.mode==='meter'){if(!number(r.start)||!number(r.end))errors.push('Enter meter readings');volume=Number(r.end)-Number(r.start);}else if(!number(r.volume))errors.push('Enter volume');if(volume<0)errors.push('Volume must be nonnegative');flow=volume/Number(r.time);}
 if(!Number.isFinite(flow))errors.push('Flow must be finite');
 return {errors:[...new Set(errors)],length,head,effective,flow,lu:errors.length?null:flow/length/effective};
}
export function summary(c,rows){const results=rows.map(r=>calculate(c,r)),valid=results.filter(r=>r.lu!==null);let reported=null;
 if(valid.length){if(c.rule==='mean')reported=valid.reduce((s,r)=>s+r.lu,0)/valid.length;if(c.rule==='maximum')reported=Math.max(...valid.map(r=>r.lu));if(c.rule==='peak'){const peak=Math.max(...valid.map(r=>r.effective));const a=valid.filter(r=>Math.abs(r.effective-peak)<1e-9);reported=a.reduce((s,r)=>s+r.lu,0)/a.length;}if(c.rule==='final')reported=results.at(-1)?.lu??null;if(c.rule==='selected')reported=results[Number(c.selected)]?.lu??null;}
 return {results,valid,reported,mean:valid.length?valid.reduce((s,r)=>s+r.lu,0)/valid.length:null,max:valid.length?Math.max(...valid.map(r=>r.lu)):null};}
