export function shotPositions(length,{inlineShots=3,endShots=2,offEndShots=1,sourceOffset=10,offsetStep=10}) {
 const shots=[];const add=(x,type)=>shots.push({x,type});
 for(const [k,v,max] of [['Inline shots',inlineShots,50],['End shots',endShots,2],['Off-end shots',offEndShots,10]])if(!Number.isInteger(Number(v))||Number(v)<0||Number(v)>max)throw Error(k+' count is invalid');
 if(offEndShots>0&&(!(sourceOffset>0)||!(offsetStep>0)))throw Error('Off-end distances must be positive');
 for(let i=Number(offEndShots)-1;i>=0;i--)add(-Number(sourceOffset)-i*Number(offsetStep),'off-end');
 if(Number(endShots)>0)add(0,'end');for(let i=1;i<=Number(inlineShots);i++)add(length*i/(Number(inlineShots)+1),'inline');if(Number(endShots)===2)add(length,'end');
 for(let i=0;i<Number(offEndShots);i++)add(length+Number(sourceOffset)+i*Number(offsetStep),'off-end');return shots;
}
export function extendedPoint(points,ch){let length=0;for(let i=1;i<points.length;i++)length+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);let a,b,delta;
 if(ch<0){a=points[0];b=points.find(p=>Math.hypot(p[0]-a[0],p[1]-a[1])>0);delta=ch;}else if(ch>length){b=points.at(-1);a=[...points].reverse().find(p=>Math.hypot(p[0]-b[0],p[1]-b[1])>0);delta=ch-length;const n=Math.hypot(b[0]-a[0],b[1]-a[1]);return[b[0]+delta*(b[0]-a[0])/n,b[1]+delta*(b[1]-a[1])/n];}else{let acc=0;for(let i=1;i<points.length;i++){const n=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);if(n>0&&acc+n>=ch){const t=(ch-acc)/n;return points[i-1].map((v,k)=>v+t*(points[i][k]-v));}acc+=n;}return points.at(-1);}
 if(!b)throw Error('Line must have positive length');const n=Math.hypot(b[0]-a[0],b[1]-a[1]);return[a[0]+delta*(b[0]-a[0])/n,a[1]+delta*(b[1]-a[1])/n];}
export function headRay(source,receiver,v1,v2,h){if(!(v2>v1&&v1>0&&h>0))return null;const angle=Math.asin(v1/v2),leg=h*Math.tan(angle),d=Math.abs(receiver-source);if(d<2*leg)return null;const sign=Math.sign(receiver-source);return{points:[[source,0],[source+sign*leg,h],[receiver-sign*leg,h],[receiver,0]],directTime:d/v1,headTime:2*h*Math.cos(angle)/v1+d/v2};}
