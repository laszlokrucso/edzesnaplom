export const clone = value => JSON.parse(JSON.stringify(value));
const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
const num = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
const str = x => typeof x === 'string';
const fail = text => { throw new Error(text); };
export function validateBackup(data) {
  if (!object(data) || data.version !== 2) fail('Csak az Edzésnapló 2-es verziójú JSON-mentése tölthető be.');
  for (const key of ['workouts','exercises','templates','bodyweights']) {
    if (!Array.isArray(data[key])) fail('Hiányzó vagy hibás adatlista: ' + key);
    const ids = new Set();
    for (const row of data[key]) {
      if (!object(row) || !str(row.id) || !row.id || ids.has(row.id)) fail('Hibás vagy ismétlődő azonosító: ' + key);
      ids.add(row.id);
    }
  }
  if (!str(data.exported) || !Number.isFinite(Date.parse(data.exported))) fail('Hibás exportálási időpont.');
  if (!object(data.prs) || Object.values(data.prs).some(x => !num(x))) fail('Hibás rekordlista.');
  for (const e of data.exercises) if (!str(e.name) || !str(e.muscle) || (e.muscles !== undefined && (!Array.isArray(e.muscles) || e.muscles.some(x=>!str(x))))) fail('Hibás gyakorlat.');
  for (const w of [...data.workouts,...data.templates]) {
    if (!Array.isArray(w.exercises)) fail('Hiányzó gyakorlatlista.');
    for (const e of w.exercises) {
      if (!object(e) || !str(e.exerciseId) || !str(e.name) || !str(e.muscle)) fail('Hibás edzésgyakorlat.');
      if (data.workouts.includes(w) || e.sets !== undefined) {
        if (!Array.isArray(e.sets) || e.sets.some(s => !object(s) || !num(s.weight) || !num(s.reps) || !Number.isInteger(s.reps))) fail('Hibás súly vagy ismétlésszám.');
      }
    }
  }
  for (const w of data.workouts) {
    if (!num(w.date) || !Number.isFinite(new Date(w.date).getTime()) || !str(w.notes)) fail('Hibás edzésdátum vagy megjegyzés.');
    for (const k of ['startTime','endTime']) if (w[k] !== undefined && w[k] !== null && !num(w[k])) fail('Hibás edzésidő.');
  }
  for (const t of data.templates) if (!str(t.name)) fail('Hibás sablonnév.');
  for (const b of data.bodyweights) if (!num(b.date) || !Number.isFinite(new Date(b.date).getTime()) || !num(b.weight)) fail('Hibás testsúlymérés.');
  return data;
}
export function parseBackup(text) {
  let data; try { data=JSON.parse(text.replace(/^\uFEFF/,'')); } catch { fail('Ez a fájl nem olvasható JSON-mentés.'); }
  return validateBackup(data);
}
export function exportBackup(data, now = new Date()) {
  validateBackup(data);
  return JSON.stringify({...clone(data), exported:now.toISOString()},null,2);
}
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const dateInput = timestamp => new Date(timestamp).toISOString().slice(0,10);
export const ordered = rows => [...rows].sort((a,b)=>b.date-a.date);
export const volume = w => w.exercises.reduce((n,e)=>n+e.sets.reduce((s,x)=>s+x.weight*x.reps,0),0);
export function emptyBackup() { return {version:2,exported:new Date().toISOString(),workouts:[],exercises:[],templates:[],bodyweights:[],prs:{}}; }
/** @param {any} data @param {any} source @param {boolean} fromTemplate */
export function startWorkout(data, source=null, fromTemplate=false) {
  const exercises = source ? clone(source.exercises).map(e=>{
    const last=ordered(data.workouts).flatMap(w=>w.exercises).find(x=>x.exerciseId===e.exerciseId);
    return {...e, sets:clone(fromTemplate ? (last?.sets?.length ? last.sets : [{weight:0,reps:10}]) : e.sets)};
  }) : [];
  return {id:newId(),date:Date.parse(today()+'T00:00:00Z'),notes:source ? (fromTemplate ? source.name : source.notes) : '',exercises,startTime:Date.now()};
}
export function finishWorkout(data,draft) {
  const next=clone(data), workout=clone(draft);
  if (!workout.exercises.length || workout.exercises.some(e=>!e.sets.length || e.sets.some(s=>!num(s.weight) || !Number.isInteger(s.reps) || s.reps < 1))) fail('Minden gyakorlathoz adj meg legalább egy sorozatot, érvényes súllyal és pozitív egész ismétlésszámmal.');
  const index=next.workouts.findIndex(w=>w.id===workout.id);
  if (index<0) {workout.endTime=Date.now();next.workouts.push(workout);} else next.workouts[index]=workout;
  // The supplied PRs match rounded Epley estimates. Keep imported historical records.
  for (const e of workout.exercises) for (const s of e.sets) next.prs[e.exerciseId]=Math.max(next.prs[e.exerciseId]||0,Math.round(s.weight*(1+s.reps/30)*10)/10);
  return validateBackup(next);
}
export function templateFrom(workout,name) {
  if (!name.trim() || !workout.exercises.length) fail('Adj nevet a sablonnak, és válassz legalább egy gyakorlatot.');
  return {id:newId(),name:name.trim(),exercises:workout.exercises.map(e=>{const {sets,...rest}=clone(e);return rest;})};
}
