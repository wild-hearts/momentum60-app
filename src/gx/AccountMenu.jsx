import {Capacitor} from '@capacitor/core';
import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

// The links that used to live in the top Menu, kept together so nothing disappears
// (help, privacy and account deletion must always be reachable).
export default function AccountMenu(){
 const {signOut,legacyAccess}=useAuth();const navigate=useNavigate();const [open,setOpen]=useState(false);
 async function leave(){try{if(await signOut()!==false){setOpen(false);navigate('/');}}catch(error){window.alert(error.message||'Sign out could not be completed. Please retry.');}}
 return <>
  <button type="button" className="gx-account" onClick={()=>setOpen(true)} aria-haspopup="dialog">Account</button>
  {open&&<div className="gx-menu-back" onClick={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <div className="gx-menu" role="dialog" aria-label="Account menu" onClick={e=>{if(e.target.closest('a'))setOpen(false)}}>
    <div className="head"><b>Momentum 60</b><button type="button" aria-label="Close menu" onClick={()=>setOpen(false)}>&times;</button></div>
    <Link to="/music">Album</Link>
    <Link to="/calendar">Season calendar</Link>
    <Link to="/summary">Journey and journal</Link>
    <Link to="/settings">Settings and billing</Link>
    {legacyAccess&&<><Link to="/tracker">Earlier tracker and rewards</Link><Link to="/rules">Earlier rules</Link></>}
    <Link to="/faq">Help</Link>
    {!Capacitor.isNativePlatform()&&<><Link to="/books">The books</Link><Link to="/tools">Tools</Link></>}
    <Link to="/privacy">Privacy</Link>
    <Link to="/delete-account">Account deletion</Link>
    <Link to="/">About Momentum 60</Link>
    <button type="button" onClick={leave}>Sign out</button>
   </div>
  </div>}
 </>;
}
