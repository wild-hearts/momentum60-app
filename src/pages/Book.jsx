import {Link} from 'react-router-dom';
import PhotoHeader from '../gx/PhotoHeader';
import {useAuth} from '../context/AuthContext';
import {currentSeason,dayDone} from '../lib/useSeason';

function tally(userData,today){
 let actionDays=0,run=0,best=0;
 for(let day=1;day<=Math.min(today,60);day++){
  if(dayDone(userData,day)){actionDays++;run++;best=Math.max(best,run);}
  else if(day<today)run=0;
 }
 return {actionDays,streak:run,best};
}

export default function Book(){
 const {userProfile,userData,dailyReflections}=useAuth();
 const today=Math.max(1,currentSeason(userProfile).day);
 const {actionDays,streak,best}=tally(userData,today);
 const entries=Object.entries(dailyReflections).filter(([,text])=>text?.trim()).sort((a,b)=>Number(b[0])-Number(a[0])).slice(0,8);
 return <>
  <PhotoHeader src="/img/scenes/book.jpg" focal="50% 45%" eyebrow="The record" title="Your Momentum Book">
   <p className="gx-lede">Proof, collected daily.</p>
  </PhotoHeader>
  <main className="gx-wrap">
   <section className="gx-card">
    <div className="gx-card-label"><span>Your season</span><span>Day {Math.min(today,60)} of 60</span></div>
    <div className="gx-ring" role="img" aria-label={`${actionDays} action days`}><i style={{width:`${Math.min(100,(actionDays/60)*100)}%`}}/></div>
    <div className="gx-stats">
     <div className="gx-stat"><b>{actionDays}</b><span>Action days</span></div>
     <div className="gx-stat"><b>{streak}</b><span>In a row</span></div>
     <div className="gx-stat"><b>{best}</b><span>Best run</span></div>
    </div>
    <p className="gx-note" style={{marginTop:'1rem'}}>Gaps do not erase what you have done.</p>
   </section>

   <section className="gx-card">
    <div className="gx-card-label"><span>What you wrote</span></div>
    {entries.length===0?<p>Your reflections will collect here. A sentence is enough.</p>:entries.map(([day,text])=><div className="gx-entry" key={day}><b>Day {day}</b><p>{text}</p></div>)}
    <Link className="gx-btn quiet" to="/summary">Full journal and previous seasons</Link>
   </section>

   <section className="gx-card">
    <div className="gx-card-label"><span>More</span></div>
    <Link className="gx-btn quiet" to="/music">The album</Link>
    <Link className="gx-btn quiet" to="/calendar">Season calendar</Link>
    <Link className="gx-btn quiet" to="/settings">Settings and billing</Link>
   </section>
  </main>
 </>;
}
