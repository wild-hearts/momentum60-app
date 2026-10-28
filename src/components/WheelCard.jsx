import {useEffect,useState} from 'react';
import {supabase} from '../supabaseClient';
import {CHECKPOINTS,WHEEL,wheelAverage} from '../data/wheel';
import WheelChart from './WheelChart';

// The Wheel, scored at the start, day 30 and day 60. If the table is not there the card hides itself.
export default function WheelCard({userId,seasonStart,day,ended}){
 const [saved,setSaved]=useState({}),[state,setState]=useState('loading'),[scoring,setScoring]=useState(false),[draft,setDraft]=useState({});
 useEffect(()=>{
  if(!seasonStart){setState('off');return;}
  let active=true;
  supabase.from('momentum_wheel_scores').select('checkpoint,scores').eq('user_id',userId).eq('season_start',seasonStart)
   .then(({data,error})=>{if(!active)return;if(error){setState('off');return;}setSaved(Object.fromEntries((data||[]).map(r=>[r.checkpoint,r.scores])));setState('ready');});
  return()=>{active=false};
 },[userId,seasonStart]);
 if(state==='off')return null;
 const reached=CHECKPOINTS.filter(c=>day>=c.day||(ended&&c.day===60));
 const due=[...reached].reverse().find(c=>!saved[c.day]);
 const layers=CHECKPOINTS.map((c,index)=>saved[c.day]?{index,label:c.label,scores:saved[c.day]}:null).filter(Boolean);
 async function save(){
  setState('saving');
  const {error}=await supabase.from('momentum_wheel_scores').upsert({user_id:userId,season_start:seasonStart,checkpoint:due.day,scores:draft,updated_at:new Date().toISOString()},{onConflict:'user_id,season_start,checkpoint'});
  if(error){setState('failed');return;}
  setSaved(s=>({...s,[due.day]:draft}));setDraft({});setScoring(false);setState('ready');
 }
 const complete=WHEEL.every(s=>typeof draft[s.id]==='number');
 const first=saved[1],last=layers.length>1?layers[layers.length-1]:null;
 return <section className="gx-card" aria-label="Your wheel">
  <div className="gx-card-label"><span>Your wheel</span><span>{layers.length?`${layers.length} of 3 scored`:'Not scored yet'}</span></div>
  {!scoring&&<>
   {layers.length>0?<>
    <div style={{marginTop:'.9rem'}}><WheelChart layers={layers}/></div>
    <p className="gx-note" style={{textAlign:'center'}}>{layers.map(l=>`${l.label} ${wheelAverage(l.scores)}`).join(' · ')}</p>
    {last&&first&&<p className="gx-serif" style={{marginTop:'.8rem',color:'#f5f1ec'}}>Since the start, your wheel average has moved from {wheelAverage(first)} to {wheelAverage(last.scores)}. That is your own record, not a grade.</p>}
   </>:<p>Eight areas of an ordinary life, scored one to ten, drawn as a wheel. Almost nobody's is round; seeing the shape is the point. You score it at the start, at day 30 and at day 60.</p>}
   {due?<button type="button" className="gx-btn" onClick={()=>{setDraft({});setScoring(true)}}>{layers.length?`Score your day ${due.day===1?'one':due.day} wheel`:'Score your wheel'}</button>:layers.length>0&&<p className="gx-note" style={{marginTop:'.8rem'}}>{reached.length<3?'Your next wheel opens on its own day.':'All three wheels are scored.'}</p>}
   {state==='failed'&&<p className="gx-alert" role="alert">Not saved. Please try again.</p>}
  </>}
  {scoring&&<div>
   <p className="gx-note" style={{marginTop:'.8rem'}}>Score each area from 1 (struggling) to 10 (thriving), as honestly as you can. Nobody is marking this.</p>
   {WHEEL.map(s=><div key={s.id} style={{marginTop:'1.1rem'}}>
    <b className="gx-serif" style={{fontSize:'1.15rem',fontWeight:500}}>{s.label}</b>
    <p className="gx-note" style={{margin:'.15rem 0 .5rem'}}>{s.prompt}</p>
    <div role="group" aria-label={`${s.label} score`} style={{display:'flex',flexWrap:'wrap',gap:'.35rem'}}>
     {[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} type="button" aria-pressed={draft[s.id]===n} onClick={()=>setDraft(d=>({...d,[s.id]:n}))} className={`gx-chip${draft[s.id]===n?' on':''}`} style={{minWidth:36,padding:'.45rem 0'}}>{n}</button>)}
    </div>
   </div>)}
   <button type="button" className="gx-btn" disabled={!complete||state==='saving'} onClick={save}>{state==='saving'?'Saving…':'Save my wheel'}</button>
   <button type="button" className="gx-btn quiet" onClick={()=>setScoring(false)}>Not now</button>
  </div>}
 </section>;
}
