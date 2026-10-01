// After login, tell the server to add this person to MailerLite if (and only if) they ticked the
// marketing opt-in at sign-up and have confirmed their email. The server re-checks all of that from
// the login token. We then stamp the user so it only ever happens once.

let inFlight = false;

export async function syncMarketingOptIn(session, supabase, fetchImpl = fetch) {
  const user = session?.user;
  const meta = user?.user_metadata || {};
  if (!user?.email_confirmed_at || !meta.marketing_opt_in || meta.mailerlite_synced_at) return;
  if (inFlight) return;
  inFlight = true;
  try {
    const res = await fetchImpl('/api/mailerlite-sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    const body = await res.json().catch(() => ({}));
    // Only a real "synced" counts. "not_configured" must retry on a later login once the key exists.
    if (res.ok && body.status === 'synced') {
      await supabase.auth.updateUser({ data: { mailerlite_synced_at: new Date().toISOString() } });
    }
  } catch (err) {
    // Never get in the way of someone using the app.
    console.error('Newsletter sync failed', err);
  } finally {
    inFlight = false;
  }
}
