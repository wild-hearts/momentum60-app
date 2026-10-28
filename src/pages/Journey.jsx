import {useState} from 'react';
import AccessibleDialog from '../components/AccessibleDialog';
import PhotoHeader from '../gx/PhotoHeader';
import {useAuth} from '../context/AuthContext';
import {currentSeason,dayImage,dayDone} from '../lib/useSeason';
import {dailyPrompts} from '../data/rules';
import {dailySongs} from '../data/songs';

const ACTS=[
 {name:'Spark',from:1,to:14,line:'Begin. Small and certain beats big and someday.'},
 {name:'Flame',from:15,to:30,line:'Keep it going when the newness wears off.'},
 {name:'Fire',from:31,to:45,line:'Your practice is starting to hold weight.'},
 {name:'Flight',from:46,to:60,line:'You carry it now. Finish like someone who stayed.'}
];

export default function Journey(){
 const {userProfile,userData,dailyReflections}=useAuth();
 const [open,setOpen]=useState(null);
 const today=Math.max(1,currentSeason(userProfile).day);
 const done=day=>dayDone(userData,day);
 const count=Array.from({length:60},(_,i)=>i+1).filter(done).length;
 const status=day=>done(day)?'Done':day===today?'Today':day<today?'Missed':`Opens day ${day}`;
 return <>
  <PhotoHeader src="/img/scenes/road.jpg" focal="50% 40%" eyebrow="The programme" title="Sixty days">
   <p className="gx-lede">Four chapters, one small action a day. {count} action {count===1?'day':'days'} so far. Gaps do not erase what you have done.</p>
  </PhotoHeader>
  <main className="gx-wrap">
   {ACTS.map(act=><section key={act.name} aria-label={act.name}>
    <div className="gx-act"><h2>{act.name}</h2><span>Days {act.from} to {act.to}</span></div>
    <p className="gx-actsub">{act.line}</p>
    <div className="gx-days">
     {Array.from({length:act.to-act.from+1},(_,i)=>act.from+i).map(day=>{const locked=day>today;return <button key={day} type="button" className={`gx-day${locked?' locked':''}${day===today?' today':''}`} onClick={()=>setOpen(day)} aria-label={`Day ${day}: ${status(day)}`}>
      <img src={dayImage(day)} alt="" loading="lazy"/>
      <span className="gx-day-body"><span className="gx-day-top"><span>Day {day}</span><span>{status(day)}</span></span>
       <span className="gx-day-text" style={{display:'-webkit-box'}}>{locked?'Opens on its own morning.':dailyPrompts[day-1]}</span></span>
     </button>})}
    </div>
   </section>)}
  </main>
  {open&&<div className="gx-menu-back" style={{alignItems:'flex-end',justifyContent:'center'}} onClick={e=>{if(e.target===e.currentTarget)setOpen(null)}}>
   <AccessibleDialog label={`Day ${open}`} onClose={()=>setOpen(null)} className="gx-sheet" style={{background:'#07222a',color:'#f5f1ec',width:'min(100%,560px)',maxHeight:'85vh',overflowY:'auto',borderRadius:'22px 22px 0 0',padding:'1.4rem 1.4rem calc(1.6rem + env(safe-area-inset-bottom))',border:'1px solid rgba(245,241,236,.14)'}}>
    <p className="gx-eyebrow">Day {open} · {status(open)}</p>
    {open>today?<p className="gx-quote" style={{marginTop:'.8rem'}}>This day opens on its own morning. For now, today is enough.</p>:<>
     <p className="gx-quote" style={{marginTop:'.8rem'}}>{dailyPrompts[open-1]}</p>
     <p className="gx-note" style={{marginTop:'.9rem'}}>Song: {dailySongs[open-1]?.title}</p>
     <p className="gx-note" style={{marginTop:'.9rem',whiteSpace:'pre-wrap'}}>{dailyReflections[open]?.trim()?`Your reflection: ${dailyReflections[open]}`:'No reflection for this day.'}</p>
    </>}
    <button type="button" className="gx-btn quiet" onClick={()=>setOpen(null)}>Close</button>
   </AccessibleDialog>
  </div>}
 </>;
}
