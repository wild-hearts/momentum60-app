import {useState} from 'react';
import AudioPlayer from './AudioPlayer';

// The signed commitment every new member makes before choosing their practice.
export default function Commitment({onSigned}) {
  const [name, setName] = useState(''), [agreed, setAgreed] = useState(false);
  const ready = agreed && name.trim() !== '';
  return <main className="app-container" style={{justifyContent:'center',alignItems:'center'}}>
    <form onSubmit={event => {event.preventDefault(); if (ready) onSigned(name.trim());}} style={{maxWidth:600,textAlign:'center',background:'var(--card-bg)',padding:'2rem 1.5rem',borderRadius:24,border:'1px solid var(--card-border)'}}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'1rem',color:'var(--gold)'}}>The Commitment</h1>
      <p style={{color:'var(--text-secondary)',fontSize:'1.2rem',marginBottom:'2rem',lineHeight:1.6,textAlign:'left'}}>I agree that perfection is a trap. I agree that doing nothing is no longer acceptable. I commit to the Non-Zero Rule: I will complete at least one small task every single day for the next 60 days to keep my momentum alive.</p>
      <section style={{marginBottom:'2rem',padding:'1rem',borderRadius:16,border:'1px solid rgba(225,167,86,0.45)',background:'rgba(225,167,86,0.08)'}}>
        <p style={{margin:'0 0 0.75rem',color:'var(--gold)',letterSpacing:'0.15em',textTransform:'uppercase',fontSize:'0.8rem'}}>Your commitment song · But I Will</p>
        <AudioPlayer src="/featured/but-i-will.mp3" title="But I Will"/>
      </section>
      <label style={{display:'block',marginBottom:'2rem',textAlign:'left',color:'var(--text-primary)',fontWeight:'bold'}}>Type your full name to sign digitally:
        <input type="text" value={name} onChange={event => setName(event.target.value)} placeholder="First Last" maxLength={120} autoComplete="name" style={{display:'block',width:'100%',marginTop:'0.5rem',padding:'1rem',borderRadius:8,border:'1px solid rgba(225,167,86,0.5)',background:'rgba(0,0,0,0.3)',color:'white',fontSize:'1.2rem',fontFamily:'monospace'}}/>
      </label>
      <label style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'2rem',textAlign:'left',color:'var(--text-primary)',fontSize:'1.1rem',cursor:'pointer'}}>
        <input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} style={{width:28,height:28,minWidth:28,accentColor:'#E1A756'}}/>
        I accept the terms and I am ready to begin.
      </label>
      <button type="submit" disabled={!ready} style={{width:'100%',background:'linear-gradient(90deg, #E1A756, #A36E39)',color:'#081C1F',padding:'1rem',border:'none',borderRadius:8,fontSize:'1.2rem',fontWeight:'bold',cursor:ready?'pointer':'not-allowed',opacity:ready?1:0.5}}>Sign Contract</button>
    </form>
  </main>;
}
