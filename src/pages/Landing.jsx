import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import AudioPlayer from '../components/AudioPlayer';
import {dailyRules} from '../data/rules';
import './Landing.css';
// Bundled with the app (not streamed) so it plays the moment someone arrives.
const welcomeSong={title:'Do It Scared',src:'/featured/do-it-scared.mp3'};
const price=()=>Capacitor.isNativePlatform()?'Monthly subscription required. Your store price is shown before you buy.':'A$4.99/month. Renews monthly until cancelled.';
export default function Landing(){return <main className="landing-container">
 <header className="landing-hero"><div className="landing-hero-content">
  <img src="/momentum60-logo.webp" fetchPriority="high" decoding="async" alt="" className="landing-logo" width="320" height="320"/>
  <h1 className="visually-hidden">Momentum 60</h1>
  <h2 className="landing-eyebrow">The Non-Zero Challenge</h2>
  <p className="landing-subtitle">A transformative 60-day program to build courage as a habit, survive the messy middle, and put your soul back in the driver's seat.</p>
  <section className="landing-song" aria-labelledby="landing-song-title"><p className="landing-song-label">Press play before you begin</p><h3 id="landing-song-title">{welcomeSong.title}</h3><AudioPlayer src={welcomeSong.src} title={welcomeSong.title}/></section>
  <Link className="cta-button primary" to="/app">START THE CHALLENGE</Link>
  <p className="landing-price">{price()}</p>
 </div></header>
 <section className="landing-problem"><h2>You are running on empty.</h2>
  <p>There's nothing worse than rolling through life waiting for the "perfect time". Waiting until you feel confident. Waiting until you look a certain way. Waiting until the motivation strikes. The truth is, confidence was never going to show up first.</p>
  <p>You try program after program, but when the motivation fades, you're right back at square one. The real problem isn't a lack of desire. It's a lack of relentless, forward momentum.</p>
 </section>
 <section className="landing-rules"><h2>The 5 Rules of Momentum 60</h2>
  <p className="rules-intro">The only rule is forward momentum. A smaller version still counts. Complete at least ONE task a day. If you have a zero day, you start over at Day 1.</p>
  <div className="rules-grid">{dailyRules.map((rule,i)=><article className="rule-card" key={rule.id}><div className="rule-number">{i+1}</div><h3>{rule.title}</h3><p>{rule.description}</p></article>)}</div>
 </section>
 <section className="landing-transformation"><h2>Take Complete Control</h2>
  <p>This is not your next "internet challenge". This is a permanent shift in how you operate. By the end of these 60 days, you will have built the habit of courage, the discipline to continue when it's hard, and the profound realization that your body is not your soul.</p>
  <Link className="cta-button primary large" to="/app">I'M READY TO START</Link>
  <p className="landing-price">{price()}</p>
  <p><Link to="/faq">How it works</Link> · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p>
 </section>
 </main>}
