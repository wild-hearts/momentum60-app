import { createClient } from '@supabase/supabase-js';

// Adds a signed-in, email-confirmed user to MailerLite, but only if they ticked the
// marketing opt-in box at sign-up. Called by the app after login (see src/utils/marketingSync.js).
//
// Needs one env var in Vercel: MAILERLITE_API_KEY. Without it this does nothing and says so.
// MAILERLITE_GROUP_ID can override the default group below if it ever changes.

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const mailerLiteKey = process.env.MAILERLITE_API_KEY;
// "Momentum 60 Challenge" group. Not a secret.
const GROUP_ID = process.env.MAILERLITE_GROUP_ID || '195178270053894038';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Not configured yet: do nothing, and tell the app not to mark anyone as synced.
  if (!mailerLiteKey) {
    return response.status(200).json({ status: 'not_configured' });
  }
  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({ error: 'Missing Supabase environment variables' });
  }

  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  // Trust the login token, never an email address sent by the browser.
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (error || !user?.email) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  if (!user.email_confirmed_at) {
    return response.status(200).json({ status: 'email_not_confirmed' });
  }
  const meta = user.user_metadata || {};
  if (!meta.marketing_opt_in) {
    return response.status(200).json({ status: 'not_opted_in' });
  }
  if (meta.mailerlite_synced_at) {
    return response.status(200).json({ status: 'already_synced' });
  }

  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mailerLiteKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ email: user.email, groups: [GROUP_ID] }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      // Status only. No email addresses or keys in logs.
      console.error('MailerLite sync failed with status', res.status);
      return response.status(502).json({ status: 'mailerlite_error' });
    }
    return response.status(200).json({ status: 'synced' });
  } catch (err) {
    console.error('MailerLite sync request failed:', err?.name || 'error');
    return response.status(502).json({ status: 'mailerlite_unreachable' });
  }
}
