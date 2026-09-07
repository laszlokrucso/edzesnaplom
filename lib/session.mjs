import {clone,finishWorkout} from './backup.mjs';
import {replaceExercise} from './exercise-swap.mjs';
export const validSet=s=>typeof s.weight==='number'&&Number.isFinite(s.weight)&&s.weight>=0&&Number.isInteger(s.reps)&&s.reps>0;
export function freshChecks(draft,done=false){return draft?draft.exercises.map(e=>e.sets.map(()=>done)):[];}
export function hydrateMeta(data,draft,saved={}){
  const meta={autoRest:true,defaultRest:90,restByExercise:{},dirtyWorkoutIds:[],remindAfter:5,lastExportAt:null,timer:{end:null,remaining:90},...clone(saved||{})};
  const existing=!!draft&&data.workouts.some(w=>w.id===draft.id);
  const same=meta.activity?.draftId===draft?.id;
  meta.activity={draftId:draft?.id||null,checks:draft?draft.exercises.map((e,i)=>e.sets.map((s,j)=>same?meta.activity.checks?.[i]?.[j]===true:existing)):[]};
  return meta;
}
export function withDraft(meta,draft,done=false){return {...clone(meta),activity:{draftId:draft?.id||null,checks:freshChecks(draft,done)}};}
export function moveItem(items,from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=items.length||to>=items.length)throw new Error('Érvénytelen sorrendmódosítás.');
  const result=clone(items),[item]=result.splice(from,1);result.splice(to,0,item);return result;
}
export function moveDraft(draft,meta,from,to){
  return {draft:{...clone(draft),exercises:moveItem(draft.exercises,from,to)},meta:{...clone(meta),activity:{draftId:draft.id,checks:moveItem(meta.activity.checks,from,to)}}};
}
export function removeSet(draft,meta,i,j){
  if(!draft.exercises[i]?.sets[j])throw new Error('A törlendő sorozat nem található.');
  const d=clone(draft),m=clone(meta);d.exercises[i].sets.splice(j,1);m.activity.checks[i].splice(j,1);return {draft:d,meta:m};
}
export function removeExercise(draft,meta,i){
  if(!draft.exercises[i])throw new Error('A törlendő gyakorlat nem található.');
  const d=clone(draft),m=clone(meta);d.exercises.splice(i,1);m.activity.checks.splice(i,1);return {draft:d,meta:m};
}
export function swapSession(data,draft,meta,index,id){
  const result=replaceExercise(data,draft,index,id),m=clone(meta);
  m.activity.checks[index]=result.draft.exercises[index].sets.map(()=>false);
  return {draft:result.draft,meta:m};
}
export function counts(draft,meta){
  let total=0,done=0;
  draft?.exercises.forEach((e,i)=>e.sets.forEach((s,j)=>{total++;if(meta.activity?.draftId===draft.id&&meta.activity.checks?.[i]?.[j])done++;}));
  return {total,done,pending:total-done};
}
export function completedWorkout(data,draft,meta){
  if(meta.activity?.draftId!==draft.id)throw new Error('Az edzés teljesítési állapota nem egyezik.');
  const completed=clone(draft);
  completed.exercises=completed.exercises.map((e,i)=>({...e,sets:e.sets.filter((s,j)=>meta.activity.checks?.[i]?.[j]===true)})).filter(e=>e.sets.length);
  if(!completed.exercises.length)throw new Error('Előbb pipálj ki legalább egy elvégzett sorozatot.');
  const next=finishWorkout(data,completed);
  const nextMeta=withDraft(meta,null);
  const previous=data.workouts.find(w=>w.id===draft.id);
  if(!previous||JSON.stringify(previous)!==JSON.stringify(completed))nextMeta.dirtyWorkoutIds=[...new Set([...nextMeta.dirtyWorkoutIds,draft.id])];
  nextMeta.timer={end:null,remaining:meta.defaultRest};
  return {data:next,meta:nextMeta};
}
export function checkSet(draft,meta,i,j,checked,now=Date.now()){
  const set=draft.exercises[i]?.sets[j];
  if(!set)throw new Error('A sorozat nem található.');
  if(checked&&!validSet(set))throw new Error('A kipipáláshoz adj meg érvényes súlyt és pozitív egész ismétlésszámot.');
  const next=clone(meta);next.activity.checks[i][j]=checked;
  const seconds=next.restByExercise[draft.exercises[i].exerciseId]??next.defaultRest;
  if(checked&&next.autoRest)next.timer=seconds>0?{end:now+seconds*1000,remaining:seconds}:{end:null,remaining:0};
  return next;
}
export function sameExercises(a,b){return JSON.stringify(a.exercises.map(e=>e.exerciseId).sort())===JSON.stringify(b.exercises.map(e=>e.exerciseId).sort());}
export function saveTemplateOrder(data,draft,templateId){
  const next=clone(data),template=next.templates.find(t=>t.id===templateId);
  if(!template||!sameExercises(template,draft))throw new Error('Ehhez a sablonhoz eltérő gyakorlatok tartoznak. Az edzést új sablonként mentheted el.');
  const entries=[...template.exercises];
  template.exercises=draft.exercises.map(e=>entries.splice(entries.findIndex(t=>t.exerciseId===e.exerciseId),1)[0]);
  return next;
}
export const reminderDue=meta=>meta.dirtyWorkoutIds.length>=Math.max(5,meta.remindAfter||5);
export function exportedMeta(meta,now=Date.now()){return {...clone(meta),dirtyWorkoutIds:[],remindAfter:5,lastExportAt:now};}
