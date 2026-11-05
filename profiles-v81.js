/* Pro Rando V8.1 — profils locaux et simulation temporaire. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='pro-rando-hiker-profiles-v81'; // Compatibilité des profils déjà enregistrés
const names=['Très débutant','Débutant','Bon marcheur','Aguerri','Expert'];
const defaults=()=>({profiles:[{id:'wife',name:'Ma femme',level:1},{id:'me',name:'Moi',level:3}],selected:'wife'});
let state;
try{const parsed=JSON.parse(localStorage.getItem(KEY));state=valid(parsed)?parsed:defaults();}catch(_){state=defaults();}
let simulation=false,temporary=2;
function valid(v){return v&&Array.isArray(v.profiles)&&v.profiles.length>0&&v.profiles.length<=30&&v.profiles.every(p=>typeof p.id==='string'&&p.id.trim().length>0&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=80&&Number.isInteger(p.level)&&p.level>=0&&p.level<=4)&&new Set(v.profiles.map(p=>p.id)).size===v.profiles.length&&typeof v.selected==='string'&&v.profiles.some(p=>p.id===v.selected);}
function active(){return state.profiles.find(p=>p.id===state.selected)||state.profiles[0];}
function getActive(){const p=active();return {name:p.name,level:simulation?temporary:p.level,temporary:simulation,id:p.id};}
window.proRandoProfiles={getActive,validate:valid};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('Profils non enregistrés',e);}}
function notifyProfileChanged(){window.dispatchEvent(new CustomEvent('rv:profile-changed',{detail:getActive()}));}
function render(){const p=active();$('hiker-select').replaceChildren(...state.profiles.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.name;return o;}));$('hiker-select').value=p.id;$('hiker-level').value=p.level;$('hiker-level-name').textContent=names[p.level];$('hiker-try').checked=simulation;$('hiker-temporary-box').hidden=!simulation;$('hiker-temporary').value=temporary;$('hiker-temporary-name').textContent=names[temporary];$('hiker-current').textContent=`Analyse : ${getActive().name} · ${names[getActive().level]}${simulation?' (simulation temporaire)':''}`;$('hiker-delete').disabled=state.profiles.length===1;}
$('hiker-select').addEventListener('change',e=>{state.selected=e.target.value;simulation=false;persist();render();notifyProfileChanged();});
$('hiker-level').addEventListener('input',e=>{active().level=Number(e.target.value);persist();render();notifyProfileChanged();});
$('hiker-try').addEventListener('change',e=>{simulation=e.target.checked;temporary=active().level;render();notifyProfileChanged();});
$('hiker-temporary').addEventListener('input',e=>{temporary=Number(e.target.value);render();notifyProfileChanged();});
$('hiker-add').addEventListener('click',()=>{if(state.profiles.length>=30){alert('Maximum 30 profils.');return;}const name=prompt('Nom du nouveau profil :');if(!name?.trim())return;const id='p'+Date.now()+Math.random().toString(36).slice(2,6);state.profiles.push({id,name:name.trim().slice(0,80),level:1});state.selected=id;simulation=false;persist();render();notifyProfileChanged();});
$('hiker-rename').addEventListener('click',()=>{const name=prompt('Renommer ce profil :',active().name);if(!name?.trim())return;active().name=name.trim().slice(0,80);persist();render();notifyProfileChanged();});
$('hiker-delete').addEventListener('click',()=>{if(state.profiles.length<=1)return;if(!confirm(`Supprimer le profil « ${active().name} » ?`))return;state.profiles=state.profiles.filter(p=>p.id!==state.selected);state.selected=state.profiles[0].id;simulation=false;persist();render();notifyProfileChanged();});
$('hiker-export').addEventListener('click',()=>{const data=JSON.stringify({app:'Pro Rando',type:'hiker-profiles',version:81,...state},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pro-rando-profils.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);});
$('hiker-import').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>100000)throw Error('Fichier trop volumineux');const obj=JSON.parse(await file.text());if(obj.app!=='Pro Rando'||obj.type!=='hiker-profiles'||!valid(obj))throw Error('Format de profils invalide');if(!confirm('Remplacer les profils enregistrés par ceux de cette sauvegarde ?'))return;state={profiles:obj.profiles.map(p=>({id:p.id,name:p.name,level:p.level})),selected:obj.selected};simulation=false;persist();render();notifyProfileChanged();}catch(err){alert('Import impossible : '+err.message);}finally{e.target.value='';}});
window.addEventListener('rv:sync-applied',()=>{const next=JSON.parse(localStorage.getItem(KEY)||'null');state=valid(next)?next:defaults();render();notifyProfileChanged();});
if(localStorage.getItem(KEY)===null)persist();
render();
})();
