/* Notes explicitement déclarées : données de référence séparées des calculs GPX.
 * Aucune écriture dans les profils, le carnet ou la bibliothèque. */
(()=>{'use strict';
const declared=Object.freeze({"b7ad5f2ca9d91162251bfc06d3b596ca37fb8a8ebb78c8974210b4fd558981d0":Object.freeze({grade:1,label:'Lac de Gaube',source:'Retour utilisateur'})});
const memo=new Map();
function get(xml){
 if(typeof xml!=='string'||!globalThis.crypto?.subtle)return Promise.resolve(null);
 const normalized=xml.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
 if(memo.has(normalized))return memo.get(normalized);
 const promise=crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalized)).then(bytes=>declared[Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('')]||null).catch(()=>null);
 if(memo.size>=64)memo.delete(memo.keys().next().value);memo.set(normalized,promise);return promise;
}
function paragraph(note){const p=document.createElement('p');p.className='rv-declared-note';p.textContent='Note déclarée : '+note.grade+'/5 — '+note.label+' ('+note.source.toLocaleLowerCase('fr')+'). Ce repère vécu est distinct de la note physique GPX et du verdict du profil.';return p;}
async function attach(host,xml){const note=await get(xml);if(note&&!host.querySelector('.rv-declared-note'))host.append(paragraph(note));}
let seq=0;
async function activeNote(){const token=++seq,route=window.RandoVistaRoutes?.active,host=document.getElementById('rv-active-declared-note');if(!host)return;host.replaceChildren();host.hidden=true;if(!route)return;const note=await get(route.xml);if(token!==seq||!note)return;host.append(paragraph(note));host.hidden=false;}
window.RVDeclaredNotes={get,attach};document.addEventListener('rv:route-state',activeNote);activeNote();
})();
