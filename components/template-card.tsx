'use client';
import {ArrowUpRight} from 'lucide-react';
import OrderControls from './order-controls';
type Row=Record<string,any>;
export default function TemplateCard({template,index,onStart,onRename,onMove}:{template:Row;index:number;onStart:()=>void;onRename:()=>void;onMove:(from:number,to:number)=>void}){
 const scope='template-'+template.id;
 return <section className="card template"><span className="template-number">{String(index+1).padStart(2,'0')}</span><h2>{template.name}</h2><small>{template.exercises.length} gyakorlat · A sorrend automatikusan mentődik.</small><ul>{template.exercises.map((e:Row,i:number)=><li className="template-exercise" key={i} data-order-index={i} data-order-scope={scope}><span>{i+1}. {e.name}</span><OrderControls index={i} count={template.exercises.length} name={template.name+' – '+e.name} scope={scope} onMove={onMove}/></li>)}</ul><button className="primary" onClick={onStart}>Edzés indítása <ArrowUpRight size={18}/></button><button className="text-button" onClick={onRename}>Átnevezés</button></section>;
}
