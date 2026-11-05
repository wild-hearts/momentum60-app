import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import AudioPlayer from '../components/AudioPlayer';
import PhotoHeader from '../gx/PhotoHeader';
import {useAuth} from '../context/AuthContext';
import {dailyRules} from '../data/rules';
// Bundled with the app (not streamed) so it plays the moment someone arrives.
const welcomeSong={title:'Do It Scared',src:'/featured/do-it-scared.mp3'};
const price=()=>Capacitor.isNativePlatform()?'Membership is a monthly subscription. You will see the price before you choose.':'A$4.99/month. Renews monthly until cancelled.';
export default function Landing(){
 const {user}=useAuth()||{};
 return <div className="gx" style={{paddingBottom:'2.5rem'}}>
  <PhotoHeader menu={false} src="/img/scenes/mountain-sunrise.jpg" focal="50% 55%" eyebrow="The Non-Zero Challenge" title="Momentum 60">
   <p className="gx-lede">A transformative 60-day program to build courage as a habit, survive the messy middle, and put your soul back in the driver's seat.</p>
  </PhotoHeader>
  <Link className="gx-account" to={user?'/app':'/auth'}>{user?'Open app':'Sign in'}</Link>
  <main className="gx-wrap landing-container">
   <section className="gx-card" aria-labelledby="landing-song-title">
    <div className="gx-card-label"><span>Press play before you begin</span></div>
    <h2 id="landing-song-title">{welcomeSong.title}</h2>
    <AudioPlayer src={welcomeSong.src} title={welcomeSong.title}/>
   </section>
   <Link className="gx-btn" to="/app">START THE CHALLENGE</Link>
   <p className="gx-note" style={{textAlign:'center',marginTop:'.7rem'}}>{price()}</p>

   <div className="gx-rule"/>
   <h2 className="gx-title" style={{fontSize:'1.9rem'}}>You are running on empty.</h2>
   <p className="gx-lede">There's nothing worse than rolling through life waiting for the "perfect time". Waiting until you feel confident. Waiting until you look a certain way. Waiting until the motivation strikes. The truth is, confidence was never going to show up first.</p>
   <p className="gx-lede">You try program after program, but when the motivation fades, you're right back at square one. The real problem isn't a lack of desire. It's a lack of relentless, forward momentum.</p>

   <div className="gx-rule"/>
   <h2 className="gx-title" style={{fontSize:'1.9rem'}}>The 5 Rules of Momentum 60</h2>
   <p className="gx-lede">The only rule is forward momentum. A smaller version still counts. Complete at least ONE task a day, so there is always movement every day.</p>
   {dailyRules.map((rule,i)=><article className="gx-card" key={rule.id}><div className="gx-card-label"><span>Rule {i+1}</span></div><h2>{rule.title}</h2><p>{rule.description}</p></article>)}

   <div className="gx-rule"/>
   <h2 className="gx-title" style={{fontSize:'1.9rem'}}>Take Complete Control</h2>
   <p className="gx-lede">This is not your next "internet challenge". This is a permanent shift in how you operate. By the end of these 60 days, you will have built the habit of courage, the discipline to continue when it's hard, and the profound realization that your body is not your soul.</p>
   <Link className="gx-btn" to="/app">I'M READY TO START</Link>
   <p className="gx-note" style={{textAlign:'center',marginTop:'.7rem'}}>{price()}</p>
   <p className="gx-note" style={{textAlign:'center',marginTop:'1.4rem'}}><Link to="/faq">How it works</Link> · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p>
  </main>
 </div>;
}
