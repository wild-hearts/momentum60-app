import {createClient} from '@supabase/supabase-js';
import {Resend} from 'resend';
import {localDate,seasonCalendar,pausedDates} from '../src/lib/seasonCalendar.js';
export default async function handler(req,res){
 if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({error:'Unauthorized'});
 // Sending is deliberately disabled until the operator configures and tests delivery.
 if(process.env.REMINDERS_ENABLED!=='true')return res.json({enabled:false,sent:0});
 try{
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.RESEND_API_KEY)throw Error();
  const db=createClient(process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}),resend=new Resend(process.env.RESEND_API_KEY);
  let sent=0;const now=new Date();
  for(let offset=0;;offset+=200){
   const {data:profiles,error}=await db.from('user_profiles').select('user_id,start_date,reminder_time,timezone,paused_since,paused_dates').eq('reminder_enabled',true).range(offset,offset+199);if(error)throw error;
   for(const p of profiles){
    if(!p.start_date||!p.timezone||!p.reminder_time||p.paused_since)continue;
    let date,calendar,hour;try{date=localDate(now,p.timezone);calendar=seasonCalendar({startDate:localDate(new Date(p.start_date),p.timezone),today:date,pausedDates:pausedDates(p,date)});hour=new Intl.DateTimeFormat('en-GB',{timeZone:p.timezone,hour:'2-digit',hourCycle:'h23'}).format(now);}catch{continue;}
    if(calendar.ended||calendar.day<1||hour!==p.reminder_time.slice(0,2))continue;
    const {data:access,error:ae}=await db.from('momentum_subscriptions').select('legacy_access,status,paid_until,native_paid_until').eq('user_id',p.user_id).maybeSingle();if(ae)throw ae;
    if(!access||!(access.legacy_access||Date.parse(access.native_paid_until)>now.getTime()||(['active','past_due'].includes(access.status)&&Date.parse(access.paid_until)>now.getTime())))continue;
    const {data:progress,error:pe}=await db.from('user_progress').select('id').eq('user_id',p.user_id).eq('season_started_at',p.start_date).eq('day_number',calendar.day).limit(1);if(pe)throw pe;if(progress.length)continue;
    const {data,error:ue}=await db.auth.admin.getUserById(p.user_id);if(ue)throw ue;if(!data.user?.email)continue;
    const result=await resend.emails.send({from:'Momentum 60 <challenge@themomentumrule.com>',to:data.user.email,subject:'A small moment for you',html:'<p>Your practice is here when you are ready. Its smaller version counts too.</p><p><a href="https://challenge.themomentumrule.com/app">Open today</a></p><p><a href="https://challenge.themomentumrule.com/settings">Turn off reminders in Settings</a></p>'},{idempotencyKey:`momentum-reminder/${p.user_id}/${date}`});if(result.error)throw result.error;sent++;
   }
   if(profiles.length<200)break;
  }
  return res.json({sent});
 }catch{return res.status(503).json({error:'Reminder delivery could not be completed'});}
}
