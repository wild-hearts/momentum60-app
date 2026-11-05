import {BEYOND_BLUE,EMERGENCY_ANYWHERE,FIND_A_HELPLINE,LIFELINE,RESPECT_1800} from '../data/helplines';

// Crisis lines as tappable links. Used on the Steady page and wherever something she writes trips lib/crisis.js.
export default function CrisisSupport({lead}){
 return <div className="gx-card warm" role="note">
  {lead&&<p className="gx-quote" style={{fontSize:'1.25rem',marginTop:0}}>{lead}</p>}
  <p className="gx-note" style={{color:'#f5f1ec',marginTop:lead?'.8rem':0}}>If you are in immediate danger, call {EMERGENCY_ANYWHERE}. To find a crisis line where you are, go to <a href={FIND_A_HELPLINE.url} target="_blank" rel="noopener noreferrer">{FIND_A_HELPLINE.name}</a>, which lists lines in over 175 countries.</p>
  <p className="gx-note" style={{color:'#f5f1ec',marginTop:'.8rem'}}>In Australia: {LIFELINE.name} <a href={`tel:${LIFELINE.tel}`}>{LIFELINE.number}</a>, any hour. {RESPECT_1800.name} <a href={`tel:${RESPECT_1800.tel}`}>{RESPECT_1800.number}</a> if you are not safe at home. {BEYOND_BLUE.name} <a href={`tel:${BEYOND_BLUE.tel}`}>{BEYOND_BLUE.number}</a> for everyday support.</p>
 </div>;
}
