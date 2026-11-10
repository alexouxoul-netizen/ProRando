/* Shared V11.1 pilot verdict rules. Same thresholds as the validated route sheet. */
(function(root){'use strict';
 const profileOffsets=Object.freeze([3,1,0,-2,-4]);
 const classify=score=>score>=7?'high':score>=3?'moderate':'low';
 function intrinsic(f){let score=0;
  if(f.distanceKm>=20)score+=2;else if(f.distanceKm>=14)score+=1;
  if(f.rise>=1000)score+=3;else if(f.rise>=650)score+=2;else if(f.rise>=350)score+=1;
  if(f.steepUp>=1200)score+=3;else if(f.steepUp>=650)score+=2;else if(f.steepUp>=250)score+=1;
  if(f.verySteepUp>=300)score+=2;else if(f.verySteepUp>=100)score+=1;
  if(f.hardest&&f.hardest.rise>=350&&f.hardest.steep>=250)score+=2;
  else if(f.hardest&&f.hardest.rise>=220&&f.hardest.steep>=120)score+=1;
  if(f.steepDown>=700)score+=2;else if(f.steepDown>=250)score+=1;
  return score;
 }
 function forProfile(score,level){const index=Number.isInteger(level)?Math.max(0,Math.min(4,level)):1,baseScore=Math.max(0,score+profileOffsets[index]);return {baseScore,level:classify(baseScore)};}
 const api=Object.freeze({version:'v111-pilot',profileOffsets,intrinsic,forProfile,classify});root.RVVerdictRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
