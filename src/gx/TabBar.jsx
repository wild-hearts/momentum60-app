import {NavLink} from 'react-router-dom';

const icon={fill:'none',stroke:'currentColor',strokeWidth:1.5,viewBox:'0 0 24 24'};
const Home=()=><svg {...icon} aria-hidden="true"><path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>;
const Leaf=()=><svg {...icon} aria-hidden="true"><path d="M4 19c4-8 8-12 16-14-1 8-5 13-13 15l-3-1z"/></svg>;
const Book=()=><svg {...icon} aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17V4M9 8h6"/></svg>;
const tabs=[{to:'/app',label:'Today',Icon:Home},{to:'/journey',label:'60 Days',Icon:Leaf},{to:'/book',label:'Momentum Book',Icon:Book}];

export default function TabBar(){
 return <nav className="gx-tabs" aria-label="Main">
  {tabs.map(({to,label,Icon})=><NavLink key={to} to={to} end className={({isActive})=>isActive?'active':''}><Icon/>{label}</NavLink>)}
 </nav>;
}
