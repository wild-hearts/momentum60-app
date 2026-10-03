import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
export default function JourneySummary() {
 const {user,userData,dailyReflections}=useContext(AuthContext);
 const [archives,setArchives]=useState([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;supabase.from('momentum_season_archives').select('id,archived_at,progress,reflections').eq('user_id',user.id).order('archived_at',{ascending:false}).then(({data,error})=>{if(active){if(error)setError('Archived seasons could not be loaded. Your current journal is still available.');else setArchives(data||[])}});return()=>{active=false}},[user.id]);
 const [deviceDrafts]=useState(()=>{try{const prefix=`momentum60:draft:${user.id}:`;return Object.keys(localStorage).filter(key=>key.startsWith(prefix)).map(key=>({key,label:key.slice(prefix.length),text:localStorage.getItem(key)}));}catch{return [];}});
 const days=Object.keys(userData).filter(day=>Object.values(userData[day]).some(Boolean)).length;
 const entries=Object.entries(dailyReflections).filter(([,text])=>text?.trim());
 return <main className="app-container"><h1>Your Journey</h1><p>{days} action days in this season. Reflections are optional.</p><Link to="/app">Back to today</Link><button type="button" className="cta-button" onClick={()=>window.print()}>Print / save as PDF</button><p role="status">{error}</p><section aria-label="Current reflections">{entries.length===0?<p>No reflections yet. Your recorded actions still count.</p>:entries.map(([day,text])=><article key={day}><h2>Day {day}</h2><p style={{whiteSpace:'pre-wrap'}}>{text}</p></article>)}</section><section><h2>Unsaved drafts on this device</h2><p>These copies may belong to an earlier season. Copy any text you want to keep before signing out.</p>{deviceDrafts.map(draft=><article key={draft.key}><h3>Draft {draft.label}</h3><textarea readOnly aria-label="Recovered device draft" value={draft.text} rows={5} style={{width:"100%"}}/></article>)}</section><h2>Previous seasons</h2>{archives.map(season=><details key={season.id}><summary>Season archived {new Date(season.archived_at).toLocaleDateString()} · {new Set(season.progress.map(row=>row.day_number)).size} action days</summary>{season.reflections.filter(row=>row.content?.trim()).map(row=><article key={row.day_number}><h3>Day {row.day_number}</h3><p style={{whiteSpace:'pre-wrap'}}>{row.content}</p></article>)}</details>)}</main>;
}
