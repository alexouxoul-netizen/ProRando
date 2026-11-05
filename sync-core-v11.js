/* Pure three-way merge: no clocks, no silent last-writer-wins. */
(function(root){
'use strict';
const copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
function canonical(v){if(v===undefined)return 'undefined';if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';}
const equal=(a,b)=>canonical(a)===canonical(b);
function merge(base,local,remote,choices={}){
 const data=Object.create(null),conflicts=[];
 for(const key of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){
  const b=base[key],l=local[key],r=remote[key];let value;
  if(equal(l,r)||equal(r,b))value=l;
  else if(equal(l,b))value=r;
  else if(choices[key]==='local')value=l;
  else if(choices[key]==='remote')value=r;
  else{conflicts.push({key,base:copy(b),local:copy(l),remote:copy(r)});continue;}
  if(value!==undefined)data[key]=copy(value);
 }
 return {data,conflicts};
}
const api={copy,canonical,equal,merge};
if(typeof module!=='undefined')module.exports=api;else root.RVSyncCore=api;
})(typeof window==='undefined'?globalThis:window);
