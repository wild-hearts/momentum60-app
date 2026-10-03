import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function Calendar(){
 const {userData,dailyReflections}=useAuth();const[selected,setSelected]=useState(null);
 const completed=day=>Object.values(userData[day]||{}).some(v=>v===true||v==='true');
 const count=Array.from({length:60},(_,i)=>i+1).filter(completed).length;
 return <main className="app-container" style={{padding:'7rem 1.25rem 3rem',maxWidth:760,margin:'auto'}}><Link to="/app">Back to today</Link><h1>Your season</h1><p>{count} action {count===1?'day':'days'}. Gaps do not erase what you have done.</p><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>{Array.from({length:60},(_,i)=>i+1).map(day=><button key={day} aria-pressed={selected===day} aria-label={`Day ${day}: ${completed(day)?'action recorded':'no action recorded'}`} style={{minHeight:48,border:completed(day)?'2px solid #E1A756':'1px solid #777'}} onClick={()=>setSelected(day)}>{day}{completed(day)?' ✓':''}</button>)}</div>{selected&&<section aria-live="polite"><h2>Day {selected}</h2><p>{completed(selected)?'You recorded an action.':'No action recorded.'}</p><p style={{whiteSpace:'pre-wrap'}}>{dailyReflections[selected]||'No reflection for this day.'}</p></section>}<p><Link to="/summary">Previous seasons and journal</Link></p><details><summary>Previous Momentum 5 tracker</summary><p>Your earlier rules and earned rewards remain available.</p><Link to="/tracker">Open the legacy tracker</Link></details></main>;
}
