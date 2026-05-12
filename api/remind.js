import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const resendKey = process.env.RESEND_API_KEY;

export default async function handler(request, response) {
  // 1. Verify authorization (optional but good practice for cron)
  const authHeader = request.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    return response.status(500).json({ error: 'Missing environment variables' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);

  try {
    // 2. Fetch all users who have reminders enabled
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, start_date, reminder_time, timezone');

    if (profileError) throw profileError;

    const emailsToSend = [];
    const nowUTC = new Date();

    for (const profile of profiles) {
      // Skip if no timezone or reminder time
      if (!profile.timezone || !profile.reminder_time) continue;

      // 3. Calculate local time for this user
      const localTimeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: profile.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(nowUTC); // e.g. "18:30"
      
      const localHour = localTimeStr.split(':')[0];
      const targetHour = profile.reminder_time.split(':')[0];

      // 4. If this is the hour they requested a reminder
      if (localHour === targetHour) {
        
        // Check what day of the challenge they are on
        const start = new Date(profile.start_date);
        start.setHours(0,0,0,0);
        const diffTime = Math.abs(nowUTC - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const activeDay = Math.min(diffDays + 1, 60);

        // Check if they have logged anything for activeDay
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('day_number', activeDay)
          .limit(1);

        if (!progressError && (!progress || progress.length === 0)) {
          // 5. They haven't logged anything today! We need their email address.
          // Since we can't easily get auth.users email from anon client without service_role key,
          // we assume the Vercel API will use a service_role key or we fetch it securely.
          // IMPORTANT: VITE_SUPABASE_ANON_KEY is used here. RLS on auth.users prevents this normally.
          // We need to use service_role key to bypass RLS, OR we have an RPC.
          
          // As a workaround, we will use an RPC to get their email, OR we require SUPABASE_SERVICE_ROLE_KEY.
          // Since we are building an MVP, let's assume we have an RPC `get_email_for_user(uuid)`.
          
          const { data: emailData } = await supabase.rpc('get_email_for_user', { target_user_id: profile.user_id });
          
          if (emailData) {
            emailsToSend.push({
              to: emailData,
              subject: 'Your Momentum 60 Daily Reminder',
              html: `<div style="font-family: sans-serif; text-align: center; color: #111827; padding: 2rem;">
                <h1 style="color: #ec4899;">Keep the Chain Alive!</h1>
                <p style="font-size: 1.2rem;">You haven't logged your Momentum 5 tasks today.</p>
                <p>Don't let today be a zero day. Do one small thing.</p>
                <a href="https://challenge.themomentumrule.com" style="display: inline-block; padding: 1rem 2rem; background: #ec4899; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem;">Log My Progress</a>
              </div>`
            });
          }
        }
      }
    }

    // 6. Send all emails via Resend (max 100 per batch)
    if (emailsToSend.length > 0) {
      for (const email of emailsToSend) {
        await resend.emails.send({
          from: 'Momentum 60 <challenge@themomentumrule.com>',
          to: email.to,
          subject: email.subject,
          html: email.html
        });
      }
    }

    return response.status(200).json({ 
      success: true, 
      processed: profiles.length,
      emailsSent: emailsToSend.length 
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
