import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import {useAuth} from '../context/AuthContext';
import {supabase} from '../supabaseClient';
import {billingRequest,nativeOffering,purchaseNative,restoreNative} from '../lib/billingClient';
export function SubscriptionGate({children}){
 const {user}=useAuth();const [allowed,setAllowed]=useState(null);
 useEffect(()=>{let active=true;const refresh=Capacitor.isNativePlatform()?billingRequest('native-entitlement').catch(()=>{}):Promise.resolve();refresh.then(()=>supabase.rpc('has_momentum_access',{owner_id:user.id})).then(({data,error})=>{if(active)setAllowed(error?'unavailable':data===true)});return()=>{active=false}},[user.id]);
 if(allowed==='unavailable')return <main className="app-container"><h1>Access check unavailable</h1><p>We could not confirm subscription access. Please retry; your saved history is still available.</p><button onClick={()=>window.location.reload()}>Retry</button><Link to="/summary">Read my history</Link></main>;
 if(allowed===null)return <main className="app-container"><p role="status">Checking access…</p></main>;
 return allowed?children:<Subscribe/>;
}
export default function Subscribe(){
 const {user}=useAuth(),native=Capacitor.isNativePlatform();const [price,setPrice]=useState(native?'Loading store price…':'A$4.99 / month'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(!native);
 useEffect(()=>{if(native)nativeOffering(user.id).then(pkg=>{setPrice(`${pkg.product.priceString} / month`);setReady(true)}).catch(e=>setError(e.message))},[native,user.id]);
 async function begin(restore=false){setBusy(true);setError('');try{if(native){await (restore?restoreNative(user.id):purchaseNative(user.id));window.location.reload()}else{const requestId=sessionStorage.getItem('m60-checkout') || crypto.randomUUID();sessionStorage.setItem('m60-checkout',requestId);const {url}=await billingRequest('checkout',{requestId});window.location.assign(url)}}catch(e){setError(e.message);setBusy(false)}}
 return <main className="app-container"><h1>Make space for your next small action.</h1><h2>{price}</h2><p>Your subscription includes the 60-day programme, music, journal and future seasons.</p><p>Renews monthly until cancelled. A 60-day programme can cross more than two billing dates. Cancel future renewal in billing settings; access continues through the paid period.</p><button className="cta-button" disabled={busy||!ready} onClick={()=>begin()}>{busy?'Please wait…':'Subscribe monthly'}</button>{native&&<button disabled={busy} onClick={()=>begin(true)}>Restore purchases</button>}<button type="button" onClick={()=>window.location.reload()}>Check access again</button><p role="alert">{error}</p><p><Link to="/summary">Read your saved history</Link> · <Link to="/settings">Settings and billing</Link></p><p><a href="https://www.themomentumrule.com/terms">Terms</a> · <a href="https://www.themomentumrule.com/privacy">Privacy</a></p></main>
}
