import {FIELDS,FAVOR} from './rmr.js';
const clean = value => String(value??'').replace(/[–−—]/g,'-').replace(/≥/g,'>=').replace(/·/g,'|').replace(/[^\x20-\x7E\n]/g,'');
export function exportRMR(doc,input,r,overallLabel) {
 let y=86,page=1;
 const ink=()=>doc.setTextColor(25,63,73);
 const footer=()=>{doc.setDrawColor(196,210,213);doc.line(16,279,194,279);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(95,117,124);doc.text('GeoResolve Africa | G-Structural | Bieniawski 1989',16,285);doc.text(`${new Date().toISOString().slice(0,10)} | ${page}`,194,285,{align:'right'});};
 const ensure=h=>{if(y+h>272){footer();doc.addPage();page++;y=24;ink();}};
 const heading=t=>{ensure(14);doc.setFont('helvetica','bold');doc.setFontSize(10);ink();doc.text(t,16,y);y+=8;};
 const paragraph=(t,size=9)=>{doc.setFont('helvetica','normal');doc.setFontSize(size);ink();const lines=doc.splitTextToSize(clean(t),177);for(const line of lines){ensure(4.4);doc.text(line,16,y);y+=4.4;}y+=3;};
 doc.setProperties({title:'G-Structural RMR89 assessment',author:'GeoResolve Africa'});
 doc.setFillColor(25,63,73);doc.rect(0,0,210,40,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(19);doc.text('G-Structural',16,17);doc.setFontSize(10);doc.text('ROCK MASS RATING / RMR89',16,27);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('GEORESOLVE AFRICA',194,17,{align:'right'});doc.text('Data Driven, Research Based',194,25,{align:'right'});
 ink();doc.setFontSize(12);doc.setFont('helvetica','bold');doc.text(clean(input.station||'Unnamed assessment').slice(0,85),16,49);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(input.example?'SYNTHETIC EXAMPLE - not project observations':'Field assessment',16,56);
 doc.setFillColor(235,243,242);doc.roundedRect(16,62,178,17,2,2,'F');doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(`RMR ${r.total} | Class ${r.rockClass.id}`,21,69);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(r.rockClass.name,21,75);doc.text(`Basic ${r.basic}  |  Orientation ${r.adjustment}  |  Raw ${r.raw}`,190,69,{align:'right'});doc.text(clean(`${input.application} / ${FAVOR[Number(input.orientation)]}`),190,75,{align:'right'});
 heading('OBSERVATIONS AND RATINGS');
 const tableRow=(label,value,rating,header=false)=>{doc.setFont('helvetica',header?'bold':'normal');doc.setFontSize(8.5);const a=doc.splitTextToSize(clean(label),58),b=doc.splitTextToSize(clean(value),92),h=Math.max(a.length,b.length)*4+4;ensure(h);doc.setFillColor(header?225:247,header?236:250,header?237:250);doc.rect(16,y-3,178,h,'F');ink();doc.text(a,19,y+1);doc.text(b,80,y+1);doc.text(String(rating),190,y+1,{align:'right'});doc.setDrawColor(223,233,235);doc.line(16,y+h-3,194,y+h-3);y+=h;};
 tableRow('Parameter','Observed category / value','Score',true);
 tableRow(FIELDS.strength.label,FIELDS.strength.options[Number(input.strength)][0],r.parts.strength);
 tableRow('Rock quality designation',`${input.rqd}%`,r.parts.rqd);
 tableRow(FIELDS.spacing.label,FIELDS.spacing.options[Number(input.spacing)][0],r.parts.spacing);
 if(input.conditionMode==='overall')tableRow('Discontinuity condition',overallLabel,r.condition);
 else {for(const k of ['persistence','aperture','roughness','infilling','weathering'])tableRow(FIELDS[k].label,FIELDS[k].options[Number(input[k])][0],r.parts[k]);tableRow('Condition subtotal','Five sub-parameters',r.condition);}
 tableRow(FIELDS.water.label,FIELDS.water.options[Number(input.water)][0],r.parts.water);
 tableRow('Basic RMR','Strength + RQD + spacing + condition + water',r.basic,true);
 tableRow('Orientation adjustment',`${input.application} / ${FAVOR[Number(input.orientation)]}`,r.adjustment);
 tableRow('Adjusted classification RMR',`Raw ${r.raw}; classification floored at 0`,r.total,true);
 y+=8;heading('OBSERVATION NOTES / EVIDENCE');paragraph(input.notes||'No notes supplied.');
 heading('METHOD AND TRACEABILITY');paragraph('Discrete Bieniawski 1989 ratings. RQD exact thresholds 25 / 50 / 75 / 90% enter the higher category. Category endpoints follow the input labels. Orientation is assessed by the user relative to excavation geometry. The overall condition method replaces the five-part sum.');
 paragraph('Classification aid; support and design require site geometry, stresses and engineering assessment. Slope RMR adjustment is not SMR or a stability analysis.');
 paragraph('Sources: FHWA-NHI-09-010 Table 6-3, pp. 6-10 to 6-11; FHWA-NHI-16-072 Table 9-6, p. 9-35.');
 footer();
 doc.save(clean(input.station||'rmr-assessment').replace(/[^a-z0-9]+/gi,'-')+'-RMR89.pdf');
}
