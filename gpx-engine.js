/* Shared GPX measurement engine. No route-specific constants or Strava calibration. */
(function(root){'use strict';
const R=6371000, rad=Math.PI/180;
function distance(a,b){const h=Math.sin((b.lat-a.lat)*rad/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lon-a.lon)*rad/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));}
const median=a=>{a=a.slice().sort((a,b)=>a-b);return a.length?a[a.length>>1]:0;};
// Simplify only the geometry. Dense altitude observations stay on an independent axis.
function simplifyIndices(points, ids, tolerance) {
 if (ids.length < 3 || tolerance === 0) return ids.slice();
 const meanLat=ids.reduce((sum,i)=>sum+points[i].lat,0)/ids.length*rad;
 const origin=points[ids[0]],xy=ids.map(i=>[(points[i].lon-origin.lon)*R*rad*Math.cos(meanLat),(points[i].lat-origin.lat)*R*rad]);
 const keep=new Set([0,ids.length-1]),stack=[[0,ids.length-1]];
 while(stack.length){const [a,b]=stack.pop(),[ax,ay]=xy[a],[bx,by]=xy[b],dx=bx-ax,dy=by-ay;let best=tolerance*tolerance,index=-1;
  for(let i=a+1;i<b;i++){const [x,y]=xy[i],u=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1))),d=(x-ax-u*dx)**2+(y-ay-u*dy)**2;if(d>best){best=d;index=i;}}
  if(index>=0){keep.add(index);stack.push([a,index],[index,b]);}
 }
 return [...keep].sort((a,b)=>a-b).map(i=>ids[i]);
}
function geometry(points,originalDistances,groups,tolerance){
 const distances=Array(points.length).fill(0),vertices=[];let total=0;
 for(const ids of groups){const retained=simplifyIndices(points,ids,tolerance);vertices.push(...retained);distances[ids[0]]=total;
  for(const i of ids){points[i].rawLat=points[i].lat;points[i].rawLon=points[i].lon;points[i].geometryVertex=false;}
  for(const i of retained)points[i].geometryVertex=true;
  for(let k=1;k<retained.length;k++){
   const a=retained[k-1],b=retained[k],pa=points[a],pb=points[b],length=distance({lat:pa.rawLat,lon:pa.rawLon},{lat:pb.rawLat,lon:pb.rawLon}),span=originalDistances[b]-originalDistances[a];
   for(let i=a;i<=b;i++){
    const ratio=span>0?(originalDistances[i]-originalDistances[a])/span:(i-a)/(b-a);
    distances[i]=total+length*ratio;
    // Intermediate altitude samples are located along the simplified segment.
    points[i].lat=pa.rawLat+(pb.rawLat-pa.rawLat)*ratio;
    points[i].lon=pa.rawLon+(pb.rawLon-pa.rawLon)*ratio;
   }
   total+=length;
  }
 }
 return {distances,distance:total,vertices,tolerance};
}
function read(doc){
 if(doc.getElementsByTagName('parsererror').length)throw Error('GPX invalide ou endommagé.');
 const get=(p,n)=>Array.from(p.getElementsByTagNameNS('*',n));
 let nodes=get(doc,'trkpt');if(!nodes.length)nodes=get(doc,'rtept');
 const ids=new Map();let next=0;
 const num=s=>s===null||!String(s).trim()?null:(Number.isFinite(Number(s))?Number(s):null);
 return nodes.map(n=>{const parent=n.parentNode;if(!ids.has(parent))ids.set(parent,next++);const e=get(n,'ele')[0],t=get(n,'time')[0];return {lat:num(n.getAttribute('lat')),lon:num(n.getAttribute('lon')),elevation:num(e?.textContent??null),time:t?.textContent||null,segment:ids.get(parent)};});
}
function analyze(input, options={}){
 const tolerance=options.simplifyMeters ?? 3;
 if(!Number.isFinite(tolerance)||tolerance<0||tolerance>100)throw Error('Tolérance de simplification invalide.');
 const quality={invalid:0,duplicates:0,spikes:0,breaks:0,missing:0,altitudeSpikes:0,interpolated:0,suspectZeros:0};
 let pending=false;const valid=[];
 for(const p of input){if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180){quality.invalid++;pending=true;continue;}valid.push({...p,breakBefore:pending,elevation:Number.isFinite(p.elevation)?p.elevation:null});pending=false;}
 const rawDistance=valid.reduce((s,p,i)=>s+(i?distance(valid[i-1],p):0),0);
 const spacings=valid.slice(1).map((p,i)=>p.segment===valid[i].segment?distance(valid[i],p):0).filter(d=>d>.2);
 const spacing=median(spacings),gapLimit=Math.max(250,spacing*20);
 const points=[];
 for(let i=0;i<valid.length;i++){
  const p=valid[i],a=points.at(-1),b=valid[i+1];
  if(a&&b&&!p.breakBefore&&!b.breakBefore&&a.segment===p.segment&&p.segment===b.segment){
   const x=distance(a,p),y=distance(p,b),z=distance(a,b);
   // Only a strong isolated excursion with a return nearby is removed.
   const dt1=(Date.parse(p.time)-Date.parse(a.time))/1000,dt2=(Date.parse(b.time)-Date.parse(p.time))/1000;
   if(x>50&&y>50&&x+y>5*Math.max(z,1)&&dt1>0&&dt2>0&&x/dt1>15&&y/dt2>15){quality.spikes++;continue;}
  }
  if(a&&!p.breakBefore&&a.segment===p.segment&&distance(a,p)<.01&&p.elevation===a.elevation){quality.duplicates++;continue;}
  points.push({...p,rawElevation:p.elevation});
 }
 if(points.length<2)throw Error('Au moins deux points GPS valides sont nécessaires.');
 const ds=[0],discontinuities=[];let block=0;
 points[0].block=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],p=points[i],d=distance(a,p),dt=(Date.parse(p.time)-Date.parse(a.time))/1000;
  const cut=p.breakBefore||p.segment!==a.segment||d>gapLimit||(dt>0&&d>30&&d/dt>15);
  if(cut){block++;quality.breaks++;discontinuities.push({from:i-1,to:i,meters:d,seconds:Number.isFinite(dt)?dt:null,reason:p.breakBefore?'invalid-coordinates':p.segment!==a.segment?'segment':d>gapLimit?'spatial-gap':'speed'});}p.block=block;p.breakBefore=!!cut;ds.push(ds[i-1]+(cut?0:d));
 }
 const groups=[];for(let i=0;i<points.length;i++){(groups[points[i].block]??=[]).push(i);}
 // A zero plateau adjacent to a >100 m vertical discontinuity is a missing-data sentinel.
 // Zero elevations without that evidence remain valid (sea-level routes).
 for(const ids of groups){for(let j=0;j<ids.length;){if(points[ids[j]].elevation!==0){j++;continue;}const start=j;while(j<ids.length&&points[ids[j]].elevation===0)j++;
  const left=start>0?ids[start-1]:null,right=j<ids.length?ids[j]:null;
  const jump=(a,b)=>a!==null&&b!==null&&Math.abs(points[a].elevation-points[b].elevation)>100&&Math.abs(points[a].elevation-points[b].elevation)/Math.max(1,Math.abs(ds[a]-ds[b]))>3;
  if(jump(left,ids[start])||jump(ids[j-1],right)){for(let k=start;k<j;k++){points[ids[k]].elevation=null;quality.suspectZeros++;}}
 }}
 // Mark isolated altitude spikes as missing; never replace absent elevations by zero.
 for(const ids of groups){for(let j=1;j<ids.length-1;j++){
  const i=ids[j],a=points[ids[j-1]],p=points[i],b=points[ids[j+1]];
  if([a.elevation,p.elevation,b.elevation].every(Number.isFinite)){
   const x=p.elevation-a.elevation,y=p.elevation-b.elevation;
   if(x*y>0&&Math.abs(x)>30&&Math.abs(y)>30&&Math.abs(x)/Math.max(1,ds[i]-ds[i-1])>3&&Math.abs(y)/Math.max(1,ds[i+1]-ds[i])>3){p.elevation=null;quality.altitudeSpikes++;}
  }
 }
 for(let j=0;j<ids.length;){if(points[ids[j]].elevation!==null){j++;continue;}const start=j;while(j<ids.length&&points[ids[j]].elevation===null)j++;quality.missing+=j-start;
  if(start>0&&j<ids.length){const l=ids[start-1],r=ids[j],span=ds[r]-ds[l];if(span>0&&span<=50){for(let k=start;k<j;k++){const i=ids[k];points[i].elevation=points[l].elevation+(points[r].elevation-points[l].elevation)*(ds[i]-ds[l])/span;quality.interpolated++;}}}
 }
 }
 const altitudeMethod=options.altitudeMethod??'regular';
 if(!['regular','legacy'].includes(altitudeMethod))throw Error('Méthode altimétrique invalide.');
 for(const point of points)point.controlledElevation=point.elevation;
 const {ascent,descent,ascentList,descentList}=altitudeMethod==='legacy'?legacyAltitude(points,ds):regularAltitude(points,ds);
 const recordedDistance=ds.at(-1);
 const shape=geometry(points,ds,groups,tolerance);
 let geometryKnownMeters=0;
 for(let i=1;i<points.length;i++)if(!points[i].breakBefore&&points[i-1].elevation!==null&&points[i].elevation!==null)geometryKnownMeters+=shape.distances[i]-shape.distances[i-1];
 return {points,distances:shape.distances,distance:shape.distance,recordedDistance,altitudeDistances:ds,rawDistance,ascent,descent,ascentList,descentList,knownMeters:geometryKnownMeters,knownShare:shape.distance?geometryKnownMeters/shape.distance:0,quality,spacing,gapLimit,discontinuities,geometryIndices:shape.vertices,simplificationMeters:tolerance,altitudeMethod,altitudeStepMeters:altitudeMethod==='regular'?5:null};
}
function regularAltitude(points,ds){
 const ascentList=Array(points.length).fill(0),descentList=Array(points.length).fill(0);
 let ascent=0,descent=0,start=0;
 while(start<points.length){
  if(points[start].elevation===null){ascentList[start]=ascent;descentList[start]=descent;start++;continue;}
  let end=start;while(end+1<points.length&&!points[end+1].breakBefore&&points[end+1].elevation!==null)end++;
  const span=ds[end]-ds[start];
  if(span<=1e-9){for(let i=start;i<=end;i++){ascentList[i]=ascent;descentList[i]=descent;}start=end+1;continue;}
  const count=Math.max(1,Math.ceil(span/5-1e-9)),step=span/count,x=[],z=[];let right=start;
  for(let k=0;k<=count;k++){
   const target=k===count?ds[end]:ds[start]+k*step;x.push(target);
   if(k===0){z.push(points[start].elevation);continue;}if(k===count){z.push(points[end].elevation);continue;}
   while(right<end&&ds[right+1]<=target)right++;
   if(ds[right]===target||right===end){z.push(points[right].elevation);continue;}
   const ratio=(target-ds[right])/(ds[right+1]-ds[right]);z.push(points[right].elevation+(points[right+1].elevation-points[right].elevation)*ratio);
  }
  // Symmetric triangular filter, support <=20 m. Known run endpoints are untouched.
  const smooth=z.map((v,i)=>i<2||i>z.length-3?v:(z[i-2]+2*z[i-1]+3*v+2*z[i+1]+z[i+2])/9);
  const turns=[0];let direction=0,extreme=0,anchor=0;
  for(let k=1;k<smooth.length;k++){
   const value=smooth[k];
   if(!direction){if(Math.abs(value-smooth[anchor])>=3){direction=Math.sign(value-smooth[anchor]);extreme=k;}}
   else if(direction*(value-smooth[extreme])>=0)extreme=k;
   else if(direction*(smooth[extreme]-value)>=3){turns.push(extreme);anchor=extreme;direction=-direction;extreme=k;}
  }
  if(turns.at(-1)!==smooth.length-1)turns.push(smooth.length-1);
  const ups=Array(x.length).fill(0),downs=Array(x.length).fill(0);let runUp=0,runDown=0;
  for(let k=1;k<turns.length;k++){
   const a=turns[k-1],b=turns[k],dz=smooth[b]-smooth[a];
   for(let j=a;j<=b;j++){const fraction=(x[j]-x[a])/(x[b]-x[a]);ups[j]=runUp+Math.max(0,dz)*fraction;downs[j]=runDown+Math.max(0,-dz)*fraction;}
   runUp+=Math.max(0,dz);runDown+=Math.max(0,-dz);
  }
  let left=0;
  for(let i=start;i<=end;i++){
   while(left<x.length-2&&x[left+1]<ds[i])left++;
   const fraction=Math.max(0,Math.min(1,(ds[i]-x[left])/(x[left+1]-x[left])));
   points[i].elevation=smooth[left]+(smooth[left+1]-smooth[left])*fraction;
   ascentList[i]=ascent+ups[left]+(ups[left+1]-ups[left])*fraction;
   descentList[i]=descent+downs[left]+(downs[left+1]-downs[left])*fraction;
  }
  ascent+=runUp;descent+=runDown;start=end+1;
 }
 return {ascent,descent,ascentList,descentList};
}
function legacyAltitude(points,ds){
 // Distance-weighted sampling avoids dependence on recording frequency / pauses.
 const source=points.map(p=>({...p}));
 for(let i=0;i<points.length;i++){
  if(source[i].elevation===null)continue;
  let sum=0,n=0;
  for(let offset=-10;offset<=10;offset+=5){const z=at(source,ds,ds[i]+offset,source[i].block);if(z!==null){sum+=z;n++;}}
  points[i].elevation=n?sum/n:null;
 }
 let ascent=0,descent=0,knownMeters=0,anchor=null,extreme=null,dir=0;
 const ascentList=[],descentList=[];
 for(let i=0;i<points.length;i++){
  const p=points[i],z=p.elevation,prev=points[i-1];
  if(i&&p.block===prev.block&&z!==null&&prev.elevation!==null)knownMeters+=ds[i]-ds[i-1];
  if(z===null||!i||p.block!==prev.block||prev.elevation===null){anchor=z;extreme=z;dir=0;}
  else {
   if(dir===0){if(Math.abs(z-anchor)>=3){dir=Math.sign(z-anchor);extreme=z;}}
   else if(dir*(z-extreme)>0)extreme=z;
   else if(dir*(extreme-z)>=3){if(dir>0)ascent+=extreme-anchor;else descent+=anchor-extreme;anchor=extreme;extreme=z;dir=-dir;}
  }
  const terminal=i===points.length-1||points[i+1].block!==p.block||points[i+1].elevation===null;
  if(terminal&&anchor!==null&&z!==null){const end=dir?extreme:z;if(end>anchor)ascent+=end-anchor;else descent+=anchor-end;anchor=z;extreme=z;dir=0;}
  ascentList.push(ascent+(dir>0?extreme-anchor:0));descentList.push(descent+(dir<0?anchor-extreme:0));
 }
 return {ascent,descent,ascentList,descentList};
}
function at(points,ds,target,block){
 if(target<0||target>ds.at(-1))return null;
 let lo=0,hi=ds.length-1;while(lo<hi){const m=(lo+hi)>>1;if(ds[m]<target)lo=m+1;else hi=m;}
 let i=lo;
 if(block!==undefined){while(i<points.length-1&&ds[i]===target&&points[i].block<block)i++;if(points[i].block!==block)return null;}
 const p=points[i];if(ds[i]===target)return p.elevation;
 const a=points[i-1];if(!a||a.block!==p.block||a.elevation===null||p.elevation===null)return null;
 return a.elevation+(p.elevation-a.elevation)*(target-ds[i-1])/(ds[i]-ds[i-1]);
}
function slope(points,ds,i,window=30){if(i<1||points[i].block!==points[i-1].block||ds[i]<=ds[i-1])return null;const mid=(ds[i]+ds[i-1])/2,b=points[i].block;
 let l=i-1,r=i;while(l>0&&points[l-1].block===b&&ds[l]>mid-window/2)l--;while(r<points.length-1&&points[r+1].block===b&&ds[r]<mid+window/2)r++;
 const start=Math.max(ds[l],mid-window/2),end=Math.min(ds[r],mid+window/2);const a=at(points,ds,start,b),z=at(points,ds,end,b);
 // Reject windows crossing unknown altitude intervals.
 for(let j=l;j<=r;j++)if(ds[j]>=start&&ds[j]<=end&&points[j].elevation===null)return null;
 return a!==null&&z!==null&&end>start?(z-a)/(end-start)*100:null;
}
function intervalKnown(points,ds,start,end){
 let lo=0,hi=ds.length-1;while(lo<hi){const m=(lo+hi)>>1;if(ds[m]<start)lo=m+1;else hi=m;}
 for(let i=lo;i<points.length&&ds[i]<=end;i++)if(points[i].breakBefore||points[i].elevation===null)return false;
 return at(points,ds,start)!==null&&at(points,ds,end)!==null;
}
const api={read,analyze,distance,at,slope,intervalKnown,simplifyIndices};root.RVGPX=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
