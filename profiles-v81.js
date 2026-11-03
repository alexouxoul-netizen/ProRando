/* Pro Rando V8.1 — profils locaux et simulation temporaire. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='pro-rando-hiker-profiles-v81';
const names=['Très débutant','Débutant','Bon marcheur','Aguerri','Expert'];
const defaults=()=>({profiles:[{id:'wife',name:'Ma femme',level:1},{id:'me',name:'Moi',level:3}],selected:'wife'});
let state;
try{const parsed=JSON.parse(localStorage.getItem(KEY));state=valid(parsed)?parsed:defaults();}catch(_){state=defaults();}
let simulation=false,temporary=2,lastRadar=null;
function valid(v){return v&&Array.isArray(v.profiles)&&v.profiles.length>0&&v.profiles.length<=30&&v.profiles.every(p=>typeof p.id==='string'&&typeof p.name==='string'&&p.name.length<=80&&Number.isInteger(p.level)&&p.level>=0&&p.level<=4)&&typeof v.selected==='string'&&v.profiles.some(p=>p.id===v.selected);}
function active(){return state.profiles.find(p=>p.id===state.selected)||state.profiles[0];}
function getActive(){const p=active();return {name:p.name,level:simulation?temporary:p.level,temporary:simulation,id:p.id};}
window.proRandoProfiles={getActive};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('Profils non enregistrés',e);}}
function refreshVerdict(){if(lastRadar)window.dispatchEvent(new CustomEvent('pr-radar-data',{detail:lastRadar}));}
window.addEventListener('pr-radar-data',e=>{lastRadar=e.detail;});
function render(){const p=active();$('hiker-select').replaceChildren(...state.profiles.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.name;return o;}));$('hiker-select').value=p.id;$('hiker-level').value=p.level;$('hiker-level-name').textContent=names[p.level];$('hiker-try').checked=simulation;$('hiker-temporary-box').hidden=!simulation;$('hiker-temporary').value=temporary;$('hiker-temporary-name').textContent=names[temporary];$('hiker-current').textContent=`Analyse : ${getActive().name} · ${names[getActive().level]}${simulation?' (simulation temporaire)':''}`;$('hiker-delete').disabled=state.profiles.length===1;}
$('hiker-select').addEventListener('change',e=>{state.selected=e.target.value;simulation=false;persist();render();refreshVerdict();});
$('hiker-level').addEventListener('input',e=>{active().level=Number(e.target.value);persist();render();refreshVerdict();});
$('hiker-try').addEventListener('change',e=>{simulation=e.target.checked;temporary=active().level;render();refreshVerdict();});
$('hiker-temporary').addEventListener('input',e=>{temporary=Number(e.target.value);render();refreshVerdict();});
$('hiker-add').addEventListener('click',()=>{if(state.profiles.length>=30){alert('Maximum 30 profils.');return;}const name=prompt('Nom du nouveau profil :');if(!name?.trim())return;const id='p'+Date.now()+Math.random().toString(36).slice(2,6);state.profiles.push({id,name:name.trim().slice(0,80),level:1});state.selected=id;simulation=false;persist();render();refreshVerdict();});
$('hiker-rename').addEventListener('click',()=>{const name=prompt('Renommer ce profil :',active().name);if(!name?.trim())return;active().name=name.trim().slice(0,80);persist();render();refreshVerdict();});
$('hiker-delete').addEventListener('click',()=>{if(state.profiles.length<=1)return;if(!confirm(`Supprimer le profil « ${active().name} » ?`))return;state.profiles=state.profiles.filter(p=>p.id!==state.selected);state.selected=state.profiles[0].id;simulation=false;persist();render();refreshVerdict();});
$('hiker-export').addEventListener('click',()=>{const data=JSON.stringify({app:'Pro Rando',type:'hiker-profiles',version:81,...state},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pro-rando-profils.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);});
$('hiker-import').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>100000)throw Error('Fichier trop volumineux');const obj=JSON.parse(await file.text());if(obj.app!=='Pro Rando'||obj.type!=='hiker-profiles'||!valid(obj))throw Error('Format de profils invalide');if(!confirm('Remplacer les profils enregistrés par ceux de cette sauvegarde ?'))return;state={profiles:obj.profiles.map(p=>({id:p.id,name:p.name,level:p.level})),selected:obj.selected};simulation=false;persist();render();refreshVerdict();}catch(err){alert('Import impossible : '+err.message);}finally{e.target.value='';}});
render();
})();
