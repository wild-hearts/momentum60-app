import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import {supabase} from '../supabaseClient';
import {useAuth} from '../context/AuthContext';
import {billingRequest,manageNativeSubscription} from '../lib/billingClient';

export default function BillingSettings() {
 const {user}=useAuth();
 const [billing,setBilling]=useState(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;
  supabase.from('momentum_subscriptions').select('stripe_customer,native_billing_stores,legacy_access').eq('user_id',user.id).maybeSingle().then(({data,error})=>{
   if(active){if(error)setError('We could not load where you subscribed. Please retry.');else{setBilling(data||{});setError('');}}
  });return()=>{active=false};
 },[user.id,attempt]);
 async function portal(){setBusy(true);try{const {url}=await billingRequest('billing-portal');window.location.assign(url)}catch(e){setError(e.message);setBusy(false)}}
 const native=Capacitor.isNativePlatform();
 async function manage(){setBusy(true);setError('');try{await manageNativeSubscription()}catch{setError('Your subscription settings could not be opened. You can also manage it in your device settings.')}finally{setBusy(false)}}
 return <section><h2>Membership</h2><p>You can cancel any time. You keep full access until the end of the month you've paid for, and your saved history stays yours.</p>
 {native&&<button type="button" className="cta-button" disabled={busy} onClick={manage}>Manage or cancel membership</button>}
 {billing?.native_billing_stores?.includes('app_store')&&<p><a href="https://apps.apple.com/account/subscriptions">Manage your Apple subscription</a></p>}
 {billing?.native_billing_stores?.includes('play_store')&&<p><a href="https://play.google.com/store/account/subscriptions">Manage your Google Play subscription</a></p>}
 {billing?.stripe_customer&&(Capacitor.isNativePlatform()?<p>You subscribed on the Momentum60 website. To manage that subscription, sign in to the website in your browser and open Settings and billing. It will not appear in your Apple or Google subscriptions.</p>:<button type="button" disabled={busy} onClick={portal}>Manage your website subscription</button>)}
 {billing&&!billing.stripe_customer&&!billing.native_billing_stores?.length&&<p>{billing.legacy_access?'Your earlier programme access remains available.':'No billing provider is recorded yet. If you have already paid, use Restore purchases in the subscription screen before buying again.'}</p>}
 {!billing&&!error&&<p role="status">Loading subscription details…</p>}
 <p><Link to="/subscribe">Subscription and restore purchases</Link></p>
 <p>If you have subscriptions with more than one provider, manage each separately. Deleting an account does not cancel an Apple or Google renewal.</p>
 {error&&<p role="alert">{error} <button onClick={()=>setAttempt(n=>n+1)}>Retry</button></p>}
 </section>;
}
