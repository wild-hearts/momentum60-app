import {Capacitor} from '@capacitor/core';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import './Navbar.css';
export default function Navbar(){
 const{user,signOut,legacyAccess}=useAuth();const navigate=useNavigate();
 async function leave(){try{if(await signOut()!==false)navigate('/');}catch(error){window.alert(error.message || 'Sign out could not be completed. Please retry.');}}
 return <nav className="navbar" aria-label="Main navigation"><div className="navbar-brand"><Link to={user?'/app':'/'}>Momentum 60</Link></div><ul className="navbar-links"><li><Link className="nav-cta" to={user?'/app':'/auth'}>{user?'Today':'Sign in'}</Link></li><li><details className="nav-menu"><summary>Menu</summary><div className="nav-menu-panel" onClick={event=>{if(event.target.closest('a'))event.currentTarget.parentElement.open=false}}>{user&&<><Link to="/calendar">Season calendar</Link><Link to="/music">Album</Link><Link to="/summary">Journey and journal</Link><Link to="/settings">Settings and billing</Link>{legacyAccess&&<><Link to="/tracker">Earlier tracker and rewards</Link><Link to="/rules">Earlier rules</Link></>}</>}<Link to="/faq">Help</Link>{!Capacitor.isNativePlatform()&&<><Link to="/books">The books</Link><Link to="/tools">Tools</Link></>}<Link to="/privacy">Privacy</Link><Link to="/delete-account">Account deletion</Link><Link to="/">About Momentum 60</Link>{user&&<button type="button" onClick={leave}>Sign out</button>}</div></details></li></ul></nav>;
}
