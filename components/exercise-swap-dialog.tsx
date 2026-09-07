'use client';
import {useState} from 'react';
import {ArrowLeftRight,Check,Search} from 'lucide-react';
import {EQUIPMENT,exerciseProfile,normalize,previousExercise,recommendAlternatives} from '../lib/exercise-swap.mjs';
type Row=Record<string,any>;
type Props={data:Row;draft:Row;index:number;onClose:()=>void;onReplace:(id:string)=>void;error:string};
const format=(n:number)=>new Intl.NumberFormat('hu-HU',{maximumFractionDigits:1}).format(n);
export default function ExerciseSwapDialog({data,draft,index,onClose,onReplace,error}:Props){
  const [query,setQuery]=useState(''),[equipment,setEquipment]=useState(''),[all,setAll]=useState(false),[selected,setSelected]=useState('');
  const current=draft.exercises[index];
  const recommendations=recommendAlternatives(data,current,draft,{equipment}) as Row[];
  const used=new Set(draft.exercises.map((e:Row)=>e.exerciseId));
  const rows:Row[]=all?data.exercises.filter((e:Row)=>e.id!==current.exerciseId).map((exercise:Row)=>({exercise,profile:exerciseProfile(exercise),history:previousExercise(data,exercise.id,draft.id)})).filter((r:Row)=>!equipment||r.profile.equipment===equipment):recommendations;
  const visible=rows.filter(r=>normalize(r.exercise.name+' '+r.exercise.muscle).includes(normalize(query)));
  const chosen=visible.find(r=>r.exercise.id===selected);
  return <div className="overlay"><section className="modal swap-modal" role="dialog" aria-modal="true" aria-labelledby="swap-title">
    <div className="section-heading"><div><span className="eyebrow">VAN MÁS ÚT IS</span><h2 id="swap-title">Gyakorlatcsere</h2></div><button className="secondary" onClick={onClose}>Bezárás</button></div>
    <div className="swap-current"><ArrowLeftRight size={20}/><div><small>Ezt váltod ki</small><strong>{current.name}</strong></div></div>
    <div className="swap-tabs" role="group" aria-label="Alternatívák listája"><button aria-pressed={!all} className={!all?'active':''} onClick={()=>{setAll(false);setSelected('');}}>Hasonló mozgások</button><button aria-pressed={all} className={all?'active':''} onClick={()=>{setAll(true);setSelected('');}}>Összes gyakorlat</button></div>
    <p className="swap-explainer">{all?'Itt szabadon választhatsz a gyakorlattárból. A lista eltérő célú gyakorlatokat is tartalmaz.':'Azonos izomcsoporthoz tartozó, hasonló mozgású gyakorlatok a saját gyakorlattáradból. A korábban végzetteket előrébb soroljuk a hasonló találatok között.'}</p>
    <div className="swap-filters"><div className="search"><Search size={18}/><input aria-label="Cseregyakorlat keresése" placeholder="Gyakorlat keresése" value={query} onChange={e=>{setQuery(e.target.value);setSelected('');}}/></div><label>Eszköz<select value={equipment} onChange={e=>{setEquipment(e.target.value);setSelected('');}}><option value="">Bármilyen eszköz</option>{Object.entries(EQUIPMENT).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>
    {error&&<div className="banner error" role="alert">{error}</div>}
    <div className="swap-results" aria-label="Cseregyakorlatok">{visible.map(r=>{const e=r.exercise,inUse=used.has(e.id);return <button key={e.id} className={'swap-option '+(selected===e.id?'selected':'')} disabled={inUse} aria-pressed={selected===e.id} onClick={()=>setSelected(e.id)}><div className="swap-option-heading"><strong>{e.name}</strong>{selected===e.id&&<Check size={20}/>}</div><span className="swap-reason">{r.reason||`${e.muscle} · ${r.profile.label}`}</span><span className="swap-tags"><span>{EQUIPMENT[r.profile.equipment as keyof typeof EQUIPMENT]}</span>{r.history&&<span>Korábban végezted</span>}{inUse&&<span>Már az edzésben van</span>}</span>{r.notes?.map((note:string)=><small className="swap-caution" key={note}>{note}</small>)}</button>})}{!visible.length&&<div className="empty"><p>{query||equipment?'Ezzel a kereséssel vagy eszközzel nincs találat.':'Nincs másik felismert, hasonló mozgású gyakorlat, amely még ne szerepelne az edzésben.'}</p><button className="secondary" onClick={()=>{setAll(true);setQuery('');setEquipment('');setSelected('');}}>Teljes gyakorlattár megnyitása</button></div>}</div>
    {chosen&&<section className="swap-preview"><span className="eyebrow">CSERE ELŐNÉZETE</span><h3>{current.name} → {chosen.exercise.name}</h3><p>A jelenlegi gyakorlat {current.sets.length} sorozatát lecseréljük. {chosen.history?'A cseregyakorlat saját, legutóbbi sorozatai töltődnek be:':'Ehhez még nincs előzményed: üres súly- és ismétlésmezővel indul.'}</p>{chosen.history&&<div className="set-chips">{chosen.history.exercise.sets.map((s:Row,i:number)=><span key={i}>{format(s.weight)} kg × {s.reps}</span>)}</div>}<p className="swap-load-note">A régi gyakorlat súlyát nem visszük át. A terhelést igazítsd az új gyakorlathoz és az adott géphez.</p><button className="primary" onClick={()=>onReplace(chosen.exercise.id)}><ArrowLeftRight size={18}/> Csere az edzésben</button><small>A sablonod megmarad. A csere a következő módosításig visszavonható.</small></section>}
    <details className="swap-method"><summary>Hogyan válasszak?</summary><p>Az ajánlás a gyakorlat nevéből felismert mozgás és a naplóban megadott izomcsoport alapján készül. A hasonló mozgás nem jelent azonos terhelést vagy azonos hatást: a testhelyzet, a fogás és a megtámasztás is számít. Ismeretlen nevű gyakorlatnál csak kézi választást kínálunk.</p></details>
  </section></div>;
}
