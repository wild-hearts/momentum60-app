import {Outlet} from 'react-router-dom';
import TabBar from './TabBar';

export default function AppShell(){
 return <div className="gx"><Outlet/><TabBar/></div>;
}
