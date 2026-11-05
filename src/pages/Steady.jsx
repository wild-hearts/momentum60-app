import {Link} from 'react-router-dom';
import PhotoHeader from '../gx/PhotoHeader';
import CrisisSupport from '../components/CrisisSupport';

// A page that works the same for everyone at any hour: a minute of steadying, then real people to call.
// Public on purpose (no login, no paywall). DRAFT WORDING for Naomi to review; taken from Glow90's SOS page.
const STEPS=[
 {title:'Breathe out first',body:'Longer than feels natural. Then in for four, and out for six. Do that three times.'},
 {title:'Find five things',body:'Name five things you can see. Say them out loud if you can.'},
 {title:'Feel your feet',body:'Press them into the floor. Notice what’s holding you up.'},
 {title:'One small next thing',body:'A glass of water. A window open. A text to someone who’d want to know. Just one.'}
];
export default function Steady(){
 return <div className="gx" style={{paddingBottom:'3rem'}}>
  <PhotoHeader menu={false} src="/img/scenes/dew-web.jpg" eyebrow="SOS" title="Steady now.">
   <p className="gx-lede">You don't have to fix anything in the next minute. You only have to get through it.</p>
  </PhotoHeader>
  <main className="gx-wrap">
   {STEPS.map((s,i)=><section className="gx-card" key={s.title}><div className="gx-card-label"><span>Step {i+1}</span></div><h2 style={{fontSize:'1.3rem'}}>{s.title}</h2><p>{s.body}</p></section>)}
   <div style={{marginTop:'1.6rem'}}><CrisisSupport lead="If this is more than a hard moment, please talk to someone now."/></div>
   <p className="gx-note" style={{marginTop:'1.2rem'}}>Momentum 60 is a wellbeing programme, not crisis care, therapy or medical advice.</p>
   <p style={{marginTop:'1.4rem'}}><Link to="/app">Back to today</Link></p>
  </main>
 </div>;
}
