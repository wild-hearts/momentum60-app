import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Hourly reminder job. Declared in vercel.json as { "path": "/api/remind", "schedule": "0 * * * *" }.
//
// Operating rules this file is built around:
//  1. It sends email to real people, so it must NEVER retry itself and must NEVER
//     be triggerable by a stranger. Both are enforced below by refusing to run.
//  2. It must fail CLOSED. Every missing prerequisite returns an error and sends
//     nothing. A half-configured mailer is worse than a silent one.
//  3. It must leave a body. Every refusal names exactly what was missing, by
//     variable name, never by value.
//
// Prerequisites, all set in the Vercel project environment:
//   CRON_SECRET                 shared secret; Vercel Cron sends it as Bearer
//   VITE_SUPABASE_URL           the Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY   service role, NOT the anon key (see note below)
//   RESEND_API_KEY              Resend key for challenge@themomentumrule.com
//
// Why service role and not anon: this job reads user email addresses via the
// get_email_for_user RPC. That RPC is SECURITY DEFINER and reads auth.users. If
// the anon role can execute it, anyone holding the public anon key can turn a
// user id into that user's email address. The anon key ships in the browser
// bundle, so it is public by definition. This job therefore uses the service
// role key, which frees phase9_migration.sql to revoke anon's access entirely.

const REQUIRED_ENV = [
  'CRON_SECRET',
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
];

export default async function handler(request, response) {
  // 1. Refuse to run at all unless every prerequisite is present.
  //    Names only. Never log or return a value.
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error('[remind] refusing to run, missing env vars:', missing.join(', '));
    return response.status(503).json({
      error: 'Not configured, refusing to run',
      missing,
    });
  }

  // 2. Authorise. This is a bulk email endpoint on a public URL, so the check
  //    fails CLOSED: no matching secret means no run. There is deliberately no
  //    branch where an absent secret means "allow".
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[remind] rejected an unauthorised call');
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = { processed: 0, due: 0, sent: 0, skipped: 0, failed: 0 };

  try {
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, start_date, reminder_enabled, reminder_time, timezone');

    if (profileError) throw profileError;
    result.processed = profiles.length;

    const nowUTC = new Date();

    for (const profile of profiles) {
      // Respect the opt-in flag. phase6_migration.sql defaults it to FALSE, and
      // the original version of this file never checked it, so an enabled
      // reminder_time alone was enough to mail somebody who had not opted in.
      if (!profile.reminder_enabled) continue;
      if (!profile.timezone || !profile.reminder_time || !profile.start_date) continue;

      let localTimeStr;
      try {
        localTimeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: profile.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(nowUTC);
      } catch {
        // An unrecognised IANA zone used to throw and abort the whole run,
        // so one bad row silenced every other user's reminder.
        console.warn('[remind] skipping user with an unusable timezone');
        continue;
      }

      const localHour = localTimeStr.split(':')[0];
      const targetHour = profile.reminder_time.split(':')[0];
      if (localHour !== targetHour) continue;

      // Which day of the challenge is this. Note: signed difference, not
      // Math.abs. The original used Math.abs, so a start_date in the future
      // counted UP instead of staying at day 1.
      const start = new Date(profile.start_date);
      start.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((nowUTC - start) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) continue;
      const activeDay = Math.min(diffDays + 1, 60);

      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('day_number', activeDay)
        .limit(1);

      if (progressError) {
        console.error('[remind] progress lookup failed for one user');
        result.failed += 1;
        continue;
      }
      if (progress && progress.length > 0) continue; // already logged today

      result.due += 1;

      // 3. Claim the send BEFORE sending. reminder_log has a unique constraint
      //    on (user_id, day_number), so a duplicate insert means this reminder
      //    has already gone out and we must not send it again. This is what
      //    makes a re-run of the hour safe. Without it, every retry re-mails
      //    every due user.
      const { error: claimError } = await supabase
        .from('reminder_log')
        .insert({ user_id: profile.user_id, day_number: activeDay });

      if (claimError) {
        // 23505 is unique_violation: already sent, this is the normal skip.
        if (claimError.code === '23505') {
          result.skipped += 1;
          continue;
        }
        // 42P01 is undefined_table: phase9_migration.sql has not been applied.
        // Without the log there is no protection against double sending, so we
        // stop the entire run rather than mail anybody twice.
        if (claimError.code === '42P01' || claimError.code === 'PGRST205') {
          console.error('[remind] reminder_log is missing, refusing to send');
          return response.status(503).json({
            error: 'reminder_log table is missing. Apply phase9_migration.sql before enabling this job.',
            ...result,
          });
        }
        console.error('[remind] could not claim a send, skipping this user');
        result.failed += 1;
        continue;
      }

      const { data: emailAddress, error: emailError } = await supabase.rpc(
        'get_email_for_user',
        { target_user_id: profile.user_id },
      );

      if (emailError || !emailAddress) {
        console.error('[remind] no email address resolved for one user');
        result.failed += 1;
        continue;
      }

      // 4. One send, wrapped on its own. The original awaited every send in a
      //    bare loop, so the first Resend failure threw and every remaining
      //    user got nothing, with a 500 and no record of who had been reached.
      try {
        await resend.emails.send({
          from: 'Momentum 60 <challenge@themomentumrule.com>',
          to: emailAddress,
          subject: 'Your Momentum 60 daily reminder',
          html: `<div style="font-family: sans-serif; text-align: center; color: #111827; padding: 2rem;">
                <h1 style="color: #ec4899;">Keep the chain alive</h1>
                <p style="font-size: 1.2rem;">You have not logged your Momentum 5 tasks today.</p>
                <p>Do not let today be a zero day. Do one small thing.</p>
                <a href="https://challenge.themomentumrule.com" style="display: inline-block; padding: 1rem 2rem; background: #ec4899; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem;">Log my progress</a>
              </div>`,
        });
        result.sent += 1;
      } catch (sendError) {
        console.error('[remind] send failed for one user:', sendError?.message);
        result.failed += 1;
      }
    }

    // 5. Report the shape of the run so absence is detectable from outside.
    //    A watcher reads these counts; it must never have to infer them.
    console.log('[remind] run complete', JSON.stringify(result));
    return response.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[remind] run aborted:', error?.message);
    return response.status(500).json({ error: 'Internal Server Error', ...result });
  }
}
