import {clone,validateBackup} from './backup.mjs';
import {hydrateMeta} from './session.mjs';
export function readSnapshot(value){
 const s=typeof value==='string'?JSON.parse(value.replace(/^\uFEFF/,'')):clone(value);
 validateBackup(s.data);
 const d=s.draft??null;
 if(d){
  // Validate a copy with empty inputs normalized; keep the actual unfinished inputs intact.
  const check=clone(d);
  if(!Array.isArray(check.exercises))throw new Error('Hibás folyamatban lévő edzés.');
  for(const e of check.exercises){if(!Array.isArray(e.sets))throw new Error('Hibás sorozatlista.');for(const set of e.sets){for(const field of ['weight','reps']){if(set[field]===''||(typeof set[field]==='number'&&Number.isFinite(set[field])))set[field]=0;}}}
  validateBackup({...s.data,workouts:[check]});
 }
 const m=s.meta;
 if(m){for(const key of ['restByExercise','exerciseNotes','timer','dirtyWorkoutIds'])if(m[key]===null)delete m[key];}
 if(m!=null){
  if(typeof m!=='object'||Array.isArray(m))throw new Error('Hibás alkalmazásbeállítások.');
  for(const key of ['restByExercise','exerciseNotes'])if(m[key]!=null&&(typeof m[key]!=='object'||Array.isArray(m[key])))throw new Error('Hibás gyakorlatbeállítások.');
  if(m.exerciseNotes&&Object.values(m.exerciseNotes).some(x=>typeof x!=='string'))throw new Error('Hibás gyakorlatmegjegyzés.');
  if(m.dirtyWorkoutIds!=null&&!Array.isArray(m.dirtyWorkoutIds))throw new Error('Hibás mentési állapot.');
  if(m.timer!=null&&(typeof m.timer!=='object'||Array.isArray(m.timer)))throw new Error('Hibás időzítő.');
 }
 return {data:s.data,draft:d,meta:hydrateMeta(s.data,d,m)};
}
export function exportSnapshot(data,draft,meta){return JSON.stringify({format:'edzesnaplom-full',version:1,exported:new Date().toISOString(),...readSnapshot({data,draft,meta})},null,2);}
export function importSnapshot(text){const s=JSON.parse(text.replace(/^\uFEFF/,''));if(s.format==='edzesnaplom-full'){if(s.version!==1)throw new Error('Ismeretlen teljes mentés verzió.');return readSnapshot(s);}return {data:validateBackup(s),draft:null,meta:null};}
export function writeSnapshot(storage,key,expected,data,draft,meta,now=Date.now()){
 if(storage.getItem(key)!==expected)throw new Error('Egy másik böngészőlap módosította a naplót. Töltsd újra ezt az oldalt.');
 const savedMeta={...clone(meta),savedAt:now};
 const value=JSON.stringify({data,draft,meta:savedMeta});
 try{storage.setItem(key,value);if(storage.getItem(key)!==value)throw new Error();}catch{throw new Error('Nem sikerült a helyi mentés. A tárhely megtelt vagy nem elérhető. Az utolsó módosítás nem mentődött el; tölts le teljes mentést.');}
 return {value,meta:savedMeta};
}
