'use client';
import {useState} from 'react';
import {ArrowUp,ArrowDown,GripVertical} from 'lucide-react';
export default function OrderControls({index,count,name,scope,onMove}:{index:number;count:number;name:string;scope:string;onMove:(from:number,to:number)=>void}){
 const [dragging,setDragging]=useState(false),[over,setOver]=useState<number|null>(null);
 function target(x:number,y:number){const el=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-order-index]');return el?.dataset.orderScope===scope?Number(el.dataset.orderIndex):null;}
 return <div className={'order-controls '+(dragging?'dragging':'')}>
 <button type="button" className="icon-button drag-handle" aria-label={name+' húzása másik helyre'} title="Húzd egy másik gyakorlatra" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);setOver(index);}} onPointerMove={e=>{if(dragging)setOver(target(e.clientX,e.clientY));}} onPointerCancel={()=>{setDragging(false);setOver(null);}} onPointerUp={e=>{const to=target(e.clientX,e.clientY);e.currentTarget.releasePointerCapture(e.pointerId);setDragging(false);setOver(null);if(to!==null&&to!==index)onMove(index,to);}}><GripVertical size={18}/></button>
 <button type="button" className="icon-button" aria-label={name+' feljebb'} disabled={index===0} onClick={()=>onMove(index,index-1)}><ArrowUp size={16}/></button><button type="button" className="icon-button" aria-label={name+' lejjebb'} disabled={index===count-1} onClick={()=>onMove(index,index+1)}><ArrowDown size={16}/></button>
 {dragging&&<span className="drag-status" role="status">{over===null?'Húzd egy gyakorlatra':`${over+1}. helyre`}</span>}
 </div>;
}
