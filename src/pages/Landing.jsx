import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import './Landing.css';
const steps=[
 ['Choose one practice','Something that matters to you, with a smaller version for difficult days.'],
 ['Give it a place','Choose a moment you already recognise: after coffee, before lunch, or when you arrive home.'],
 ['Return tomorrow','Record what you did. A gap leaves your earlier progress intact. There is no catch-up requirement.']
];
export default function Landing(){return <main className="landing-container">
 <header className="landing-hero"><div className="landing-hero-content"><img src="/momentum60-logo.webp" fetchPriority="high" alt="" className="landing-logo" width="320" height="320"/><h1 className="visually-hidden">Momentum 60</h1><h2 className="landing-eyebrow">One small action. A place to begin again.</h2><p className="landing-subtitle">A 60-day practice with music, a private journal and room for ordinary life.</p><p>{Capacitor.isNativePlatform()?'Monthly subscription required. Your store price is shown before you buy.':'A$4.99/month. Renews monthly until cancelled.'}</p><Link className="cta-button primary" to="/app">Begin your practice</Link></div></header>
 <section className="landing-rules"><h2>Make it possible today.</h2><div className="rules-grid">{steps.map(([title,text],i)=><article className="rule-card" key={title}><div className="rule-number">{i+1}</div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
 <section className="landing-transformation"><h2>Keep a record of showing up.</h2><p>Your subscription includes the 60-day programme, album, optional journal and repeat seasons. Listening is optional. Your own smaller action counts.</p><p>After day 60, review your season and begin another with your existing practice. Repeat seasons use the same programme and album. Your earlier journal stays available when you cancel.</p><p>Programme pauses do not pause monthly billing. A 60-day programme can cross more than two billing dates.</p><Link className="cta-button primary" to="/app">Choose your first action</Link><p><Link to="/faq">How it works</Link> · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p></section>
 </main>}
