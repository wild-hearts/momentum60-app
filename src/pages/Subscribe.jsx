import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import {useAuth} from '../context/AuthContext';
import {supabase} from '../supabaseClient';
import {billingRequest,nativeOffering,purchaseNative,restoreNative,syncNative} from '../lib/billingClient';
export function SubscriptionGate({children}) {
 const {user}=useAuth();const [allowed,setAllowed]=useState(null);
 useEffect(()=>{
  let active=true,running=false;
  async function refresh(){
   if(running)return;running=true;
   try{
    if(Capacitor.isNativePlatform())await syncNative().catch(()=>{});
    const {data,error}=await supabase.rpc('has_momentum_access',{owner_id:user.id});
    if(active)setAllowed(error?'unavailable':data===true);
   }catch{if(active)setAllowed('unavailable')}finally{running=false}
  }
  void refresh();
  const visible=()=>{if(document.visibilityState==='visible')void refresh()};
  const timer=setInterval(visible,60000);document.addEventListener('visibilitychange',visible);
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',visible)};
 },[user.id]);
 if(allowed==='unavailable')return <main className="app-container"><h1>Access check unavailable</h1><p>We could not confirm subscription access. Please retry; your saved history is still available.</p><button onClick={()=>window.location.reload()}>Retry</button><Link to="/summary">Read my history</Link></main>;
 if(allowed===null)return <main className="app-container"><p role="status">Checking access…</p></main>;
 return allowed?children:<Subscribe/>;
}
export default function Subscribe(){
 const {user}=useAuth(),native=Capacitor.isNativePlatform();
 const [price,setPrice]=useState(native?'':'A$4.99 / month'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(!native),[attempt,setAttempt]=useState(0),[loadingPrice,setLoadingPrice]=useState(native);
 useEffect(()=>{if(!native)return;let active=true;
  nativeOffering().then(product=>{if(active){setPrice(`${product.priceString} / month`);setReady(true);setError('')}}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoadingPrice(false)});
  return()=>{active=false};
 },[native,user.id,attempt]);
 async function begin(restore=false){setBusy(true);setError('');try{if(native){await (restore?restoreNative():purchaseNative(user.id));window.location.reload()}else{const requestId=sessionStorage.getItem('m60-checkout') || crypto.randomUUID();sessionStorage.setItem('m60-checkout',requestId);const {url}=await billingRequest('checkout',{requestId});window.location.assign(url)}}catch(e){setError(e.message);setBusy(false)}}
 return <main className="app-container"><h1>You're in the right place.</h1>{loadingPrice&&<p role="status">Loading your store price…</p>}
 <p>Your membership opens the whole of Momentum 60: the 60-day programme, all 60 songs, your private journal, and every season you choose to repeat.</p>
 {price&&<h2>{price}</h2>}
 <p>Your membership renews each month until you cancel. Cancelling is easy: one button inside the app, any time, and you keep full access until the end of the month you've already paid for.</p>
 <button className="cta-button primary" style={{width:'100%'}} disabled={busy||!ready} onClick={()=>begin()}>{busy?'Please wait…':'Start my membership'}</button>
 {native&&<button type="button" style={{width:'100%',marginTop:'0.75rem',padding:'0.9rem 1rem',borderRadius:999,border:'1px solid rgba(225,167,86,0.6)',background:'transparent',color:'var(--text-primary)',fontSize:'1rem'}} disabled={busy} onClick={()=>begin(true)}>Restore purchases</button>}
 {native&&!ready&&!loadingPrice&&<button type="button" style={{width:'100%',marginTop:'0.75rem',padding:'0.9rem 1rem',borderRadius:999,border:'1px solid rgba(225,167,86,0.6)',background:'transparent',color:'var(--text-primary)',fontSize:'1rem'}} onClick={()=>{setLoadingPrice(true);setError('');setAttempt(n=>n+1)}}>Retry store connection</button>}
 <button type="button" style={{width:'100%',marginTop:'0.75rem',padding:'0.9rem 1rem',borderRadius:999,border:'1px solid rgba(225,167,86,0.6)',background:'transparent',color:'var(--text-primary)',fontSize:'1rem'}} onClick={()=>window.location.reload()}>Check access again</button><p role="alert">{error}</p><p><Link to="/summary">Read your saved history</Link> · <Link to="/settings">Settings and billing</Link></p><p><Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p></main>
}
