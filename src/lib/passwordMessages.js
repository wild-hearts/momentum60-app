// Small sign-in rules shared by the sign-in form, the reset page and the
// Settings "Change password" section, so all three say the same thing.

// An iPhone keyboard suggestion can leave a trailing space on an email, which
// Supabase answers with "Invalid login credentials" and no hint why.
// Never trim a password.
export const cleanEmail = email => String(email || '').trim();

// What Supabase says when a password change is refused, turned into one plain
// sentence. The raw messages hid the usual reasons: the same password again,
// a password on a known-weak list, or a sign-in too old to change it.
export function passwordChangeMessage(error) {
  const code = error?.code || '';
  const text = String(error?.message || '').toLowerCase();
  if (code === 'same_password' || text.includes('different from the old')) return 'That is the same as your current password. Choose a different one.';
  if (code === 'weak_password' || text.includes('weak') || text.includes('easy to guess')) return 'That password is too easy to guess. Try a longer one, or a less common one.';
  if (code === 'reauthentication_needed' || text.includes('reauthentication')) return 'For your security, sign out, sign back in, then change it.';
  if (code === 'session_not_found' || code === 'session_expired' || text.includes('session missing')) return 'Your sign-in has run out. Sign out, sign back in, then try again.';
  return `That did not save${error?.message ? ` (${error.message})` : ''}. Please try again.`;
}
