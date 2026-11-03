/* Pro Rando V9 : navigation simplifiée et conservation des modules V8.2 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 // Ouvrir Mes randos recharge la bibliothèque, sans fenêtre superposée.
 document.querySelector('[data-tab="randos"]')?.addEventListener('click',()=>{$('library-open')?.click();});
 $('library-close')?.addEventListener('click',()=>window.proRandoUI?.showTab('prepare'));
 // Conserver le graphique dans le panneau de comparaison quand le profil est fermé.
 $('sheet-close')?.addEventListener('click',()=>requestAnimationFrame(()=>window.dispatchEvent(new Event('resize'))));
 // Une randonnée déjà chargée doit rester accessible dans Préparer.
 document.addEventListener('pr:route-loaded',()=>window.proRandoUI?.showTab('prepare'));
})();
