import AudioPlayer from '../components/AudioPlayer';
import Commitment from '../components/Commitment';
import ReminderOffer from '../components/ReminderOffer';
import PhotoHeader from '../gx/PhotoHeader';
import {cancelDailyReminder,scheduleDailyReminder} from '../utils/notifications';
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {supabase} from '../supabaseClient';
import {currentSeason,actName,dayImage} from '../lib/useSeason';
import {dailyPrompts} from '../data/rules';
import {dailySongs,SONGS_BASE_URL} from '../data/songs';
import {windDownFor} from '../data/winddown';

const greeting=()=>{const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';};
const STATUS={pending:'Waiting to save…',saving:'Saving…',saved:'Saved.',failed:'Not saved online. Keep this page open and retry.',restored:'Recovered draft. Review and save.'};

export default function Today(){
 const {refreshData,user,userProfile,userData,startChallenge,toggleDayItem,resetProgress,saveError,dailyReflections,saveReflection,journalStatus,retryReflection}=useAuth();
 const [,setClock]=useState(0);
 useEffect(()=>{const timer=setInterval(()=>setClock(n=>n+1),60000);return()=>clearInterval(timer)},[]);
 const [editing,setEditing]=useState(false);
 const [signed,setSigned]=useState(false);
 const [practice,setPractice]=useState(undefined),[ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;supabase.from('momentum_practices').select('*').eq('user_id',user.id).maybeSingle().then(({data,error})=>{if(active){if(error)setError('Your practice could not be loaded. Please retry.');else setPractice(data);setReady(true)}});return()=>{active=false}},[user.id]);
 const calendar=currentSeason(userProfile);
 const day=Math.max(1,calendar.day),done=Boolean(practice&&userData[day]?.[practice.id]),returning=day>1&&!Object.values(userData[day-1]||{}).some(Boolean)&&!done;
 const act=actName(day),song=dailySongs[day-1];
 // The phone's nudges are rebooked from where she is today: none once today is logged, none after day 60.
 const remind=Boolean(userProfile?.reminder_enabled&&!calendar.suspended&&!calendar.invalid&&practice);
 useEffect(()=>{if(remind)void scheduleDailyReminder(userProfile.reminder_time,{day,doneToday:done})},[remind,userProfile?.reminder_time,day,done]);

 async function setup(event){event.preventDefault();setBusy(true);setError('');const fields=new FormData(event.currentTarget);try{const values={user_id:user.id,normal_action:String(fields.get('normal')).trim(),fallback_action:String(fields.get('fallback')).trim(),cue:String(fields.get('cue')).trim()};const {data,error}=await supabase.from('momentum_practices').upsert(values,{onConflict:'user_id'}).select().single();if(error)throw error;setPractice(data);setEditing(false);if(!userProfile){const result=await startChallenge('honor');if(!result?.success)throw Error();}}catch{setError('Your practice was not saved. Please retry.')}finally{setBusy(false)}}
 async function complete(){if(done||busy||calendar.suspended)return;setBusy(true);await toggleDayItem(day,practice.id);setBusy(false)}
 async function togglePause(){setBusy(true);const {error}=await supabase.rpc('set_momentum_pause',{should_pause:!calendar.suspended});if(error)setError('The pause could not be saved.');else{if(!calendar.suspended)await cancelDailyReminder();else if(userProfile.reminder_enabled)await scheduleDailyReminder(userProfile.reminder_time);await refreshData();}setBusy(false)}

 if(calendar.invalid)return <main className="app-container"><h1>Your programme date could not be loaded.</h1><p>Please check your timezone in Settings before recording an action.</p><Link to="/settings">Settings</Link></main>;
 if(!ready)return <main className="app-container"><p role="status">Loading your practice…</p></main>;
 if(practice===undefined)return <main className="app-container"><h1>Your practice could not be loaded.</h1><p role="alert">{error}</p><button onClick={()=>window.location.reload()}>Retry</button><Link to="/summary">Read saved history</Link></main>;
 if(!practice&&!userProfile&&!signed)return <Commitment onSigned={()=>setSigned(true)}/>;

 const choosing=!practice||editing;
 const eyebrow=choosing?'Your practice':calendar.ended?'Your next season':`${act} · Day ${day} of 60`;
 const title=choosing?'Choose one small practice.':calendar.ended?'You finished.':greeting();

 return <>
  <PhotoHeader src={dayImage(calendar.ended?60:day)} eyebrow={eyebrow} title={title}>
   {choosing&&<p className="gx-lede">Make it useful on an ordinary day, and possible on a difficult one.</p>}
  </PhotoHeader>
  <main className="gx-wrap today-page">
   {(error||saveError)&&<p className="gx-alert" role="alert">{error||saveError}</p>}
   {practice&&!userProfile&&<button className="gx-btn" onClick={()=>startChallenge('honor')}>Retry starting my season</button>}
   {practice&&userProfile&&!calendar.suspended&&<ReminderOffer day={day}/>}

   {choosing?<form onSubmit={setup} className="gx-card">
    <label className="gx-field">Your normal action<input name="normal" defaultValue={practice?.normal_action} maxLength={300} required placeholder="Read for ten minutes"/></label>
    <label className="gx-field">A smaller version<input name="fallback" defaultValue={practice?.fallback_action} maxLength={300} required placeholder="Read one paragraph"/></label>
    <label className="gx-field">When will you begin?<input name="cue" defaultValue={practice?.cue} maxLength={300} required placeholder="After my morning coffee"/></label>
    <button className="gx-btn" disabled={busy}>Save my practice</button>
    {editing&&<button type="button" className="gx-btn quiet" onClick={()=>setEditing(false)}>Cancel</button>}
   </form>

   :calendar.ended?<section className="gx-card warm">
    <p className="gx-quote">Keep what helped. Your record remains yours.</p>
    <button className="gx-btn" disabled={busy} onClick={async()=>{setBusy(true);await resetProgress();setBusy(false)}}>Archive and continue this practice</button>
    <p><Link to="/summary">Review your completed season</Link></p>
   </section>

   :<>
    <div className="gx-rule"/>
    {returning&&<p className="gx-quote">You can return today. <span className="gx-note" style={{display:'block',marginTop:'.4rem'}}>No catch-up is needed. Your earlier progress is still here.</span></p>}
    {!returning&&<p className="gx-quote">{dailyPrompts[day-1]}</p>}

    {song&&<section className="gx-card" aria-label="Today's song">
     <div className="gx-card-label"><span>Today's song</span><span>Day {day}</span></div>
     <h2>{song.title}</h2>
     <p className="gx-note">Listening is optional; your action counts without it.</p>
     <AudioPlayer key={song.file} src={`${SONGS_BASE_URL}/${song.file}`} title={song.title}/>
    </section>}

    <section className={`gx-card${done?' warm':''}`}>
     <div className="gx-card-label"><span>{done?'You showed up today':'One action for today'}</span><span>{act}</span></div>
     <h2>{practice.normal_action}</h2>
     <p>After: {practice.cue}</p>
     <p>Smaller version: {practice.fallback_action}</p>
     <button className="gx-btn" disabled={done||busy||calendar.suspended||!userProfile} onClick={complete}>{done?'Action saved':busy?'Saving…':'I did my action or its smaller version'}</button>
     {!Object.values(userData).some(d=>Object.values(d).some(Boolean))&&<button className="gx-link" onClick={()=>setEditing(true)}>Change this season's practice</button>}
    </section>

    <section className="gx-card">
     <div className="gx-card-label"><span>Evening wind-down</span><span>Optional</span></div>
     <label htmlFor="today-reflection" className="gx-serif" style={{display:'block',fontSize:'1.3rem',marginTop:'.7rem'}}>{windDownFor(day)}</label>
     <p className="gx-note" style={{marginTop:'.5rem'}}>One honest sentence is enough. It is kept in your Momentum Book.</p>
     <textarea id="today-reflection" className="gx-textarea" rows={5} style={{marginTop:'.8rem'}} value={dailyReflections[day]||''} onChange={e=>saveReflection(day,e.target.value)}/>
     <p className="gx-note" role="status">{STATUS[journalStatus[day]]||''}</p>
     {['failed','restored'].includes(journalStatus[day])&&<button className="gx-btn quiet" onClick={()=>retryReflection(day)}>Save reflection</button>}
    </section>
   </>}

   {userProfile&&!choosing&&<section className="gx-card">
    <p className="gx-note">{calendar.suspended?'Your programme is paused.':'You can pause your programme when you need to.'} Pausing does not pause subscription billing.</p>
    <button className="gx-btn quiet" disabled={busy} onClick={togglePause}>{calendar.suspended?'Resume programme':'Pause programme'}</button>
   </section>}
  </main>
 </>;
}
