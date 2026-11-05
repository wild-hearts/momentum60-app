import {WHEEL} from '../data/wheel';

// Eight areas drawn as a wheel; each saved checkpoint is one shape laid over the others.
const SIZE=300,C=SIZE/2,R=96;
const point=(i,value)=>{const a=-Math.PI/2+i*2*Math.PI/WHEEL.length,r=R*value/10;return [C+r*Math.cos(a),C+r*Math.sin(a)]};
const STYLES=[{fill:'rgba(245,241,236,.10)',stroke:'rgba(245,241,236,.55)',dash:'4 4'},{fill:'rgba(248,186,113,.14)',stroke:'rgba(248,186,113,.7)',dash:''},{fill:'rgba(248,186,113,.30)',stroke:'#f8ba71',dash:''}];
export default function WheelChart({layers}){
 const rings=[2.5,5,7.5,10];
 return <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Your wheel" style={{width:'100%',maxWidth:340,display:'block',margin:'0 auto'}}>
  {rings.map(v=><polygon key={v} points={WHEEL.map((_,i)=>point(i,v).join(',')).join(' ')} fill="none" stroke="rgba(245,241,236,.14)" strokeWidth="1"/>)}
  {WHEEL.map((_,i)=>{const [x,y]=point(i,10);return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgba(245,241,236,.14)" strokeWidth="1"/>})}
  {layers.map((layer,k)=>{const st=STYLES[Math.min(layer.index,2)];return <polygon key={k} points={WHEEL.map((s,i)=>point(i,layer.scores[s.id]||0).join(',')).join(' ')} fill={st.fill} stroke={st.stroke} strokeWidth="2" strokeDasharray={st.dash}/>})}
  {WHEEL.map((s,i)=>{const [x,y]=point(i,12.6);return <text key={s.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fill="#c4bcb3" fontFamily="Outfit Variable, sans-serif">{s.label}</text>})}
 </svg>;
}
