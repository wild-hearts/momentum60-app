import {useState} from 'react';
import {RESET_STEPS,RESET_TITLE} from '../data/reset';

// Shown after a few quiet days. Nothing to catch up on, no count of what was missed:
// three ways back in, and one of them is simply carrying on. Display only.
export default function ComeBack({lastDay,lastReflection,onCarryOn}){
 const [view,setView]=useState('choose');
 const hasLight=Boolean(lastReflection?.trim());
 return <section className="gx-card warm" aria-label="Welcome back">
  <div className="gx-card-label"><span>Welcome back</span></div>
  <p className="gx-quote" style={{marginTop:'.7rem'}}>You didn't fall behind. You lived your life.</p>
  <p className="gx-note" style={{marginTop:'.5rem'}}>Nothing here needs catching up. Choose your way back in.</p>
  {view==='choose'&&<div style={{marginTop:'.6rem'}}>
   <button type="button" className="gx-btn" onClick={onCarryOn}>Carry on with today</button>
   <button type="button" className="gx-btn quiet" onClick={()=>setView('reset')}>A one-minute reset first</button>
   {hasLight&&<button type="button" className="gx-btn quiet" onClick={()=>setView('light')}>Remember your last light</button>}
  </div>}
  {view==='reset'&&<div style={{marginTop:'1rem'}}>
   <p className="gx-eyebrow">{RESET_TITLE}</p>
   {RESET_STEPS.map(s=><p key={s} className="gx-serif" style={{color:'#f5f1ec',marginTop:'.8rem',lineHeight:1.5}}>{s}</p>)}
   <button type="button" className="gx-btn" onClick={onCarryOn}>Done. On to today</button>
  </div>}
  {view==='light'&&<div style={{marginTop:'1rem'}}>
   <p className="gx-eyebrow">Where you left off · day {lastDay}</p>
   <p className="gx-serif" style={{color:'#f5f1ec',marginTop:'.8rem',fontStyle:'italic',lineHeight:1.5}}>&ldquo;{lastReflection}&rdquo;</p>
   <button type="button" className="gx-btn" onClick={onCarryOn}>Carry on with today</button>
  </div>}
 </section>;
}
