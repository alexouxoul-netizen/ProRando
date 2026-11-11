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
 // Experimental physical grade, separate from personalized verdict scores.
 function physical(f){
  const base=f.distanceKm*.07+f.ascent*.0014;
  const steepLoad=Math.min(2.1,f.steep/700)+Math.min(1.1,f.extreme/250);
  const sustainedLoad=Math.min(.7,f.longest/4000);
  const fatigueLoad=f.distanceKm>=14&&f.ascent>=450&&f.steep>=900?1.65+Math.min(.5,(f.distanceKm-14)*.1):0;
  const score=base+steepLoad+sustainedLoad+fatigueLoad;
  let grade=score<1.1?1:score<2.8?2:score<3.5?3:score<4.35?4:5;
  if(f.steep>=500&&f.steep/Math.max(1,f.distanceMeters)>.13)grade=Math.max(grade,3);
  return {score,grade,fatigueLoad,base,steepLoad,sustainedLoad};
 }
 function forProfile(score,level){const index=Number.isInteger(level)?Math.max(0,Math.min(4,level)):1,baseScore=Math.max(0,score+profileOffsets[index]);return {baseScore,level:classify(baseScore)};}
 // A genuine grade 1 is computed by physical(), never by the route name.
 // easy is a refinement of low, preserving stored verdict tiers and calibration.
 const gradeNames=Object.freeze(['Très facile','Modérée','Soutenue','Difficile','Très difficile']);
 function gradeName(grade){return Number.isInteger(grade)&&grade>=1&&grade<=5?gradeNames[grade-1]:'Indisponible';}
 function isEasy(f){return f?.physicalGrade===1&&f.level==='low'&&f.altitudeOk===true&&Number.isFinite(f.coverage)&&f.coverage>=.999999&&!f.incomplete&&!f.coarse&&!f.avoid&&!(f.terrain?.length)&&Number.isFinite(f.steepUp)&&f.steepUp<100&&Number.isFinite(f.steepDown)&&f.steepDown<100&&Number.isFinite(f.verySteepUp)&&f.verySteepUp<50;}
 const api=Object.freeze({version:'v111-pilot',physicalVersion:'v111-physical-test-28',physical,gradeNames,gradeName,isEasy,profileOffsets,intrinsic,forProfile,classify});root.RVVerdictRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
