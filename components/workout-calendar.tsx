'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight,ArrowUpRight} from 'lucide-react';
import {today,volume} from '../lib/backup.mjs';
import {monthDays,shiftMonth,calendarMonth} from '../lib/calendar.mjs';
type Row=Record<string,any>;
const label=(day:string,options:Intl.DateTimeFormatOptions)=>new Date(day+'T00:00:00Z').toLocaleDateString('hu-HU',{...options,timeZone:'UTC'});
export default function WorkoutCalendar({workouts,onOpen}:{workouts:Row[];onOpen:(w:Row)=>void}){
 const current=today(),[month,setMonth]=useState(current.slice(0,7)),[selected,setSelected]=useState(current);
 const summary=calendarMonth(workouts,month),cells=monthDays(month),items:Row[]=summary.days.get(selected)||[];
 function changeMonth(next:string){setMonth(next);setSelected(next===current.slice(0,7)?current:next+'-01');}
 return <section className="workout-calendar" aria-label="Edzésnaptár">
  <div className="calendar-toolbar"><div className="calendar-pager"><button className="icon-button" aria-label="Előző hónap" onClick={()=>changeMonth(shiftMonth(month,-1))}><ChevronLeft size={20}/></button><h2 aria-live="polite">{label(month+'-01',{year:'numeric',month:'long'})}</h2><button className="icon-button" aria-label="Következő hónap" onClick={()=>changeMonth(shiftMonth(month,1))}><ChevronRight size={20}/></button></div><button className="secondary" onClick={()=>{setMonth(current.slice(0,7));setSelected(current);}}>Ma</button></div>
  <p className="calendar-summary"><strong>{summary.trainingDays}</strong> edzésnap · <strong>{summary.workoutCount}</strong> edzés ebben a hónapban</p>
  <div className="calendar-grid">{['H','K','Sze','Cs','P','Szo','V'].map(d=><span className="calendar-weekday" key={d} aria-hidden="true">{d}</span>)}{cells.map((day:string|null,i:number)=>{if(!day)return <span key={'blank'+i} aria-hidden="true"/>;const count=summary.days.get(day)?.length||0;return <button key={day} className={'calendar-day'+(count?' has-workout':'')+(day===selected?' is-selected':'')+(day===current?' is-today':'')} aria-label={label(day,{year:'numeric',month:'long',day:'numeric',weekday:'long'})+`, ${count} edzés`} aria-pressed={day===selected} aria-current={day===current?'date':undefined} onClick={()=>setSelected(day)}><span>{Number(day.slice(-2))}</span><small>{count>0?`${count} edzés`:' '}</small></button>;})}</div>
  <p className="calendar-legend"><span/> Edzésnap · A mai nap aláhúzva</p>
  <div className="calendar-day-detail" aria-live="polite"><h3>{label(selected,{month:'long',day:'numeric',weekday:'long'})}</h3>{items.length?<div className="history">{items.map(w=><button className="history-row" key={w.id} onClick={()=>onOpen(w)}><div className="history-title"><h3>{w.notes||'Edzés'}</h3><small>{w.exercises.length} gyakorlat · {w.exercises.reduce((n:number,e:Row)=>n+e.sets.length,0)} sorozat · {new Intl.NumberFormat('hu-HU',{maximumFractionDigits:1}).format(volume(w))} kg</small></div><ArrowUpRight size={20}/></button>)}</div>:<p className="empty">Erre a napra nincs lezárt edzés.</p>}</div>
  <small>A naptár a lezárt edzéseket mutatja. A félbehagyott edzést a Folytatás gombbal érheted el.</small>
 </section>;
}
