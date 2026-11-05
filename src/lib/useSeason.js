import {localDate,seasonCalendar,pausedDates} from './seasonCalendar';

// Where she is in the 60 days, from her saved start date and timezone.
export function currentSeason(userProfile){
 const zone=userProfile?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone;
 try{return userProfile?.start_date?seasonCalendar({startDate:localDate(new Date(userProfile.start_date),zone),today:localDate(new Date(),zone),pausedDates:pausedDates(userProfile,localDate(new Date(),zone))}):{day:1,ended:false};}catch{return {day:1,ended:false,invalid:true};}
}
export const actName=day=>day<=14?'Spark':day<=30?'Flame':day<=45?'Fire':'Flight';
export const dayImage=day=>`/img/days/d${String(day).padStart(2,'0')}.jpg`;
export const dayDone=(userData,day)=>Object.values(userData?.[day]||{}).some(v=>v===true||v==='true');
