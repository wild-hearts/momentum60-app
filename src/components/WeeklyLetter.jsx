import {buildWeeklyLetter} from '../lib/weeklyLetter';
import {dayDone} from '../lib/useSeason';

// A letter for the last full week of her programme, written from her own record.
export default function WeeklyLetter({today,userData,dailyReflections}){
 const week=Math.floor(Math.min(today,60)/7);
 if(week<1)return <section className="gx-card"><div className="gx-card-label"><span>Your weekly letter</span></div><p>Your first letter arrives once you have finished day 7. It is built from what you did and what you wrote.</p></section>;
 const start=(week-1)*7+1;
 const days=Array.from({length:7},(_,i)=>{const day=start+i;return {day,done:dayDone(userData,day),text:dailyReflections[day]||''};});
 return <section className="gx-card" aria-label="Your weekly letter">
  <div className="gx-card-label"><span>Your weekly letter</span><span>Week {week}</span></div>
  <p className="gx-serif strong" style={{whiteSpace:'pre-wrap',fontSize:'1.12rem',lineHeight:1.6,color:'#f5f1ec'}}>{buildWeeklyLetter({week,days})}</p>
 </section>;
}
