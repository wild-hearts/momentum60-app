import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {LocalNotifications} from '@capacitor/local-notifications';
import {useAuth} from '../context/AuthContext';
import {isNative,requestPermission} from '../utils/notifications';

// The app's offer of a daily nudge, shown on Today from day 2, once, until the
// member turns nudges on or says not now. iOS gives an app one chance at the
// permission dialog, so it is only ever asked from this button. Settings holds
// the switch and the time; Today books the nudges themselves.
const DISMISSED='momentum60:reminder-offer-dismissed';

export default function ReminderOffer({day}) {
 const {userProfile,updateProfileSettings}=useAuth();
 const [visible,setVisible]=useState(false),[state,setState]=useState('idle');
 useEffect(()=>{
  if(!isNative()||day<2||userProfile?.reminder_enabled)return;
  let dismissed=false;try{dismissed=localStorage.getItem(DISMISSED)==='yes'}catch{/* Offer again next time. */}
  if(dismissed)return;let active=true;
  LocalNotifications.checkPermissions().then(p=>{if(active&&p.display!=='denied')setVisible(true)}).catch(()=>{});
  return()=>{active=false};
 },[day,userProfile?.reminder_enabled]);
 function dismiss(){try{localStorage.setItem(DISMISSED,'yes')}catch{/* Hidden for this visit. */}setVisible(false)}
 async function turnOn(){
  setState('asking');
  if(!await requestPermission())return setState('denied');
  const {success}=await updateProfileSettings({reminder_enabled:true,reminder_time:userProfile?.reminder_time||'18:00'});
  setState(success?'on':'failed');
 }
 if(!visible)return null;
 return <section style={{margin:'1.5rem 0',padding:'1.25rem',borderRadius:16,border:'1px solid rgba(225,167,86,0.4)',background:'rgba(225,167,86,0.06)'}}>
  {state==='on'?<p role="status">Done. Your phone will nudge you at {userProfile?.reminder_time||'18:00'} each day. You can change the time in <Link to="/settings">Settings</Link>.</p>
  :state==='denied'?<p role="status">Notifications are turned off for this app, so nothing will appear until you allow them in your phone’s notification settings. <button type="button" style={{minHeight:44}} onClick={dismiss}>OK</button></p>
  :<><h2 style={{marginTop:0}}>Want a daily nudge?</h2>
   <p>A short reminder on this phone at {userProfile?.reminder_time||'18:00'}, with a different line each day. None on days you have already logged.</p>
   <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'center'}}>
    <button type="button" className="cta-button" style={{minHeight:44}} disabled={state==='asking'} onClick={turnOn}>{state==='asking'?'Please wait…':'Turn on daily nudges'}</button>
    <button type="button" style={{minHeight:44,background:'none',border:'none',color:'var(--text-secondary)',textDecoration:'underline',cursor:'pointer'}} onClick={dismiss}>Not now</button>
   </div>
   {state==='failed'&&<p role="alert">That did not save. Please try again, or turn nudges on in Settings.</p>}
  </>}
 </section>;
}
