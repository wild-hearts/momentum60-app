import {useState} from 'react';
import {NEEDS,NEED_NOTES} from '../data/needs';

// Remembered for the day on this device only.
const key=day=>`momentum60:need:${day}`;
const read=day=>{try{return localStorage.getItem(key(day))||''}catch{return ''}};
export default function NeedPicker({day}){
 const [need,setNeed]=useState(()=>read(day));
 function pick(id){const next=need===id?'':id;setNeed(next);try{next?localStorage.setItem(key(day),next):localStorage.removeItem(key(day))}catch{/* private mode */}}
 return <section className="gx-card" aria-label="What do you need today">
  <div className="gx-card-label"><span>What do you need today?</span><span>Optional</span></div>
  <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem',marginTop:'.9rem'}}>
   {NEEDS.map(n=><button key={n.id} type="button" aria-pressed={need===n.id} onClick={()=>pick(n.id)} className={`gx-chip${need===n.id?' on':''}`}>{n.label}</button>)}
  </div>
  {need&&NEED_NOTES[need]&&<p className="gx-serif" style={{marginTop:'1rem',fontSize:'1.1rem',lineHeight:1.5}}>{NEED_NOTES[need]}</p>}
 </section>;
}
