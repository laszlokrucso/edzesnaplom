import {dateInput} from './backup.mjs';
export function monthDays(month){
 const first=new Date(month+'-01T00:00:00Z');
 const offset=(first.getUTCDay()+6)%7;
 const end=new Date(first);end.setUTCMonth(end.getUTCMonth()+1);end.setUTCDate(0);
 const count=end.getUTCDate();
 return Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>i<offset||i>=offset+count?null:`${month}-${String(i-offset+1).padStart(2,'0')}`);
}
export function shiftMonth(month,delta){const d=new Date(month+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+delta);return dateInput(d.getTime()).slice(0,7);}
export function calendarMonth(workouts,month){
 const days=new Map();
 for(const w of workouts){const key=dateInput(w.date);if(key.slice(0,7)!==month)continue;if(!days.has(key))days.set(key,[]);days.get(key).push(w);}
 return {days,trainingDays:days.size,workoutCount:[...days.values()].reduce((n,items)=>n+items.length,0)};
}
