import {useState} from 'react';
import {useAuth} from '../context/AuthContext';

// Settings: change the password while signed in. Uses the current session, so
// it works the same on the website and in the app.
const MIN_LENGTH = 6;
const field = {width:'100%',padding:'0.9rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(0,0,0,0.5)',color:'white',fontSize:'1rem'};
const link = {minHeight:'44px',background:'none',border:'none',padding:0,color:'var(--text-secondary)',textDecoration:'underline',cursor:'pointer',fontSize:'0.95rem'};

export default function ChangePassword() {
 const {updatePassword}=useAuth();
 const [open,setOpen]=useState(false),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 function close(){setOpen(false);setPassword('');setConfirm('');setError('');setShow(false)}
 async function save(e){
  e.preventDefault();if(busy)return;
  if(password.length<MIN_LENGTH)return setError(`Make it at least ${MIN_LENGTH} characters.`);
  if(password!==confirm)return setError('The two passwords do not match yet.');
  setBusy(true);setError('');
  try{await updatePassword(password);close();setSaved(true)}catch(err){setError(err.message)}finally{setBusy(false)}
 }
 return <section style={{marginTop:'2rem'}}><h2>Password</h2>
  {!open?<>
   <button type="button" style={link} onClick={()=>{setOpen(true);setSaved(false)}}>Change my password</button>
   {saved&&<p role="status">Saved. Use the new one next time you sign in.</p>}
  </>:<form onSubmit={save} style={{display:'flex',flexDirection:'column',gap:'0.75rem',maxWidth:'400px'}}>
   <label htmlFor="new-password">New password (at least {MIN_LENGTH} characters)</label>
   <input id="new-password" type={show?'text':'password'} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={password} onChange={e=>setPassword(e.target.value)} style={field}/>
   <label htmlFor="confirm-password">Type it again</label>
   <input id="confirm-password" type={show?'text':'password'} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={confirm} onChange={e=>setConfirm(e.target.value)} style={field}/>
   <button type="button" style={{...link,alignSelf:'flex-start'}} aria-pressed={show} onClick={()=>setShow(v=>!v)}>{show?'Hide passwords':'Show passwords'}</button>
   <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
    <button type="submit" className="cta-button" disabled={busy}>{busy?'Saving…':'Save new password'}</button>
    <button type="button" style={link} onClick={close}>Cancel</button>
   </div>
  </form>}
  <p role="alert" style={{color:'#E1A756'}}>{error}</p>
 </section>;
}
