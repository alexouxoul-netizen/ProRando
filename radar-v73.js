/* Pro Rando V7.3 — radar synthétique, distinct de la coloration détaillée de la carte. */
(() => {
  const $ = id => document.getElementById(id);
  const strip = $('radar-strip'), sections = $('radar-sections'), axis = $('radar-axis');
  const colors = {up0:'#55A630',up1:'#FF9F43',up2:'#EE5253',up3:'#000000',down0:'#ffafcc',down1:'#00cec9',down2:'#0984e3',down3:'#6c5ce7',unknown:'#888888'};
  const fmt = m => (m/1000).toFixed(2).replace('.',',');
  const name = k => ({up0:'Montée douce',up1:'Montée soutenue',up2:'Montée raide',up3:'Montée très raide',down0:'Descente douce',down1:'Descente soutenue',down2:'Descente raide',down3:'Descente très raide',unknown:'Pente indisponible'})[k];
  const classify = s => !Number.isFinite(s)?'unknown':(s>=0?'up':'down')+(Math.abs(s)<10?0:Math.abs(s)<15?1:Math.abs(s)<25?2:3);
  function elevationAt(points,distances,m){
    let lo=0,hi=distances.length-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(distances[mid]<m)lo=mid+1;else hi=mid;}
    const i=lo;if(i===0)return points[0].elevation;
    const a=points[i-1].elevation,b=points[i].elevation;
    if(!Number.isFinite(a)||!Number.isFinite(b))return null;
    const span=distances[i]-distances[i-1];return span>0?a+(b-a)*(m-distances[i-1])/span:b;
  }
  function showPoint(m,distances){
    let lo=0,hi=distances.length-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(distances[mid]<m)lo=mid+1;else hi=mid;}
    const i=lo>0&&Math.abs(distances[lo-1]-m)<Math.abs(distances[lo]-m)?lo-1:lo;
    window.proRandoUI?.showMapPoint(i);
  }
  window.addEventListener('pr-radar-data',e=>{
    const {points,distances,coarseTrack}=e.detail;
    const total=distances[distances.length-1];
    strip.replaceChildren();sections.replaceChildren();axis.replaceChildren();
    if(!Number.isFinite(total)||total<1){$('radar-quality').textContent='Trace trop courte pour le radar.';return;}
    // Tranches régulières de 50 m : représentation synthétique, sans modifier la carte.
    const step=50, bins=[];
    for(let a=0;a<total;a+=step){
      const b=Math.min(total,a+step), z0=elevationAt(points,distances,a),z1=elevationAt(points,distances,b);
      const slope=RVGPX.intervalKnown(points,distances,a,b)&&Number.isFinite(z0)&&Number.isFinite(z1)?(z1-z0)/(b-a)*100:null;
      bins.push({a,b,key:classify(slope),slope});
    }
    const groups=[];
    for(const bin of bins){const prev=groups[groups.length-1];if(prev&&prev.key===bin.key){prev.b=bin.b;prev.bins.push(bin);}else groups.push({a:bin.a,b:bin.b,key:bin.key,bins:[bin]});}
    for(const g of groups){
      const button=document.createElement('button');button.type='button';button.className='radar-slice';
      button.style.background=colors[g.key];button.style.flexGrow=String(g.b-g.a);
      button.title=`${name(g.key)} · km ${fmt(g.a)}–${fmt(g.b)}`;
      button.setAttribute('aria-label',button.title+' : voir sur la carte');
      button.addEventListener('click',()=>showPoint((g.a+g.b)/2,distances));strip.appendChild(button);
    }
    for(const km of [0,total/3,total*2/3,total]){const span=document.createElement('span');span.textContent=(km/1000).toFixed(1).replace('.',',')+' km';axis.appendChild(span);}
    const quality=$('radar-quality');quality.textContent=(coarseTrack?'⚠ Trace peu détaillée : radar à interpréter avec prudence. ':'')+'Synthèse par tranches de 50 m. Les couleurs de la carte restent calculées indépendamment.';
    // Fusionne les brefs replats (< 100 m) au sein d'une même difficulté, sans inventer une pente moyenne.
    const hard=bins.map((b,i)=>({i,...b,kind:b.key==='up2'||b.key==='up3'?'up':b.key==='down2'||b.key==='down3'?'down':null}));
    const runs=[];let current=null;
    for(const b of hard){
      if(b.kind){if(current&&current.kind===b.kind&&b.a-current.lastHardEnd<=100){current.b=b.b;current.lastHardEnd=b.b;current.hardMeters+=b.b-b.a;current.max=Math.max(current.max,Math.abs(b.slope||0));}
        else {if(current)runs.push(current);current={a:b.a,b:b.b,lastHardEnd:b.b,hardMeters:b.b-b.a,max:Math.abs(b.slope||0),kind:b.kind};}}
    }
    if(current)runs.push(current);
    const notable=runs.filter(r=>r.hardMeters>=100).sort((a,b)=>a.a-b.a);
    const title=document.createElement('h4');title.textContent='Passages exigeants';sections.appendChild(title);
    if(!notable.length){const p=document.createElement('p');p.textContent='Aucun passage raide continu d’au moins 100 m repéré par le radar.';sections.appendChild(p);return;}
    notable.slice(0,12).forEach(r=>{
      const btn=document.createElement('button');btn.type='button';btn.className='radar-jump';
      const dot=document.createElement('i');dot.style.background=colors[r.kind+'2'];dot.setAttribute('aria-hidden','true');
      const label=document.createElement('span');const strong=document.createElement('strong');strong.textContent=(r.kind==='up'?'↗ Montée':'↘ Descente')+' · km '+fmt(r.a)+'–'+fmt(r.b);
      const sub=document.createElement('small');sub.textContent=Math.round(r.hardMeters)+' m raides · pente estimée jusqu’à '+Math.round(r.max)+' % sur 50 m';
      label.append(strong,sub);btn.append(dot,label);btn.addEventListener('click',()=>showPoint((r.a+r.b)/2,distances));sections.appendChild(btn);
    });
    if(notable.length>12){const more=document.createElement('p');more.textContent=`${notable.length-12} autre(s) passage(s) : visibles sur le ruban.`;sections.appendChild(more);}
  });
})();
