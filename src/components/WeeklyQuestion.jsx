import {useEffect,useState} from 'react';
import {supabase} from '../supabaseClient';
import {WEEKLY_ANSWER_MAX,weeklyQuestionFor} from '../data/weeklyQuestions';

// One bigger question a week. If the table is not available yet the card hides itself.
export default function WeeklyQuestion({week,seasonStart,userId}){
 const [text,setText]=useState(''),[saved,setSaved]=useState(''),[state,setState]=useState('loading');
 useEffect(()=>{
  if(!seasonStart){setState('off');return;}
  let active=true;setState('loading');
  supabase.from('momentum_weekly_answers').select('content').eq('user_id',userId).eq('season_start',seasonStart).eq('week',week).maybeSingle()
   .then(({data,error})=>{if(!active)return;if(error){setState('off');return;}setText(data?.content||'');setSaved(data?.content||'');setState('ready');});
  return()=>{active=false};
 },[userId,seasonStart,week]);
 async function save(){
  setState('saving');
  const {error}=await supabase.from('momentum_weekly_answers').upsert({user_id:userId,season_start:seasonStart,week,content:text.trim(),updated_at:new Date().toISOString()},{onConflict:'user_id,season_start,week'});
  if(error){setState('failed');return;}
  setSaved(text.trim());setState('ready');
 }
 if(state==='off')return null;
 const changed=text.trim()!==saved;
 return <section className="gx-card warm" aria-label="This week's question">
  <div className="gx-card-label"><span>This week's question</span><span>Week {week}</span></div>
  <h2>{weeklyQuestionFor(week)}</h2>
  <p className="gx-note">Take your time. A sentence is enough; a page is fine too.</p>
  <textarea className="gx-textarea" rows={5} maxLength={WEEKLY_ANSWER_MAX} style={{marginTop:'.8rem'}} aria-label="Your answer" value={text} onChange={e=>setText(e.target.value)} disabled={state==='loading'}/>
  <button className="gx-btn" disabled={!changed||!text.trim()||state==='saving'||state==='loading'} onClick={save}>{state==='saving'?'Saving…':'Save my answer'}</button>
  <p className="gx-note" role="status">{state==='failed'?'Not saved. Please try again.':(!changed&&saved)?'Saved.':''}</p>
 </section>;
}
