// The weekly letter, built only from what she recorded: how many days she
// showed up, her own words quoted back, and one closing line that rotates by week.
// There is no AI here; every word is hers or a fixed line below.
//
// DRAFT WORDING for Naomi to review. Adapted from Glow90's Sunday Letter: the
// closing lines are the general ones (the gendered ones were left out).
export const CLOSING_LINES = [
  "Small actions on ordinary days are the whole trick, and you're doing it.",
  "Nobody is marking this. That's rather the point.",
  "If a day went sideways this week, it still counts as a day you lived.",
  "Keep the bar low and the door open.",
  "You don't have to feel ready. You only have to turn up for the next small thing.",
  "Rest isn't falling behind.",
  "Momentum gets built on the boring days, not the big ones.",
  "You are not behind. There is no behind.",
  "What you did this week was enough. It usually is."
];

export const INVITATIONS = [
  "This coming week, the job isn't to do more. It's to notice where you're already moving.",
  "Next week, watch for one moment where you'd usually make yourself smaller, and don't.",
  "One thing for next week: choose an action that is for you, not for anyone else's list.",
  "Next week, notice one thing you stopped postponing."
];

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const clip = (s, max = 300) => { const t = s.replace(/\s+/g, ' ').trim(); return t.length > max ? `${t.slice(0, max - 1)}…` : t; };

// days: seven entries of { day, done, text } for one programme week.
export function buildWeeklyLetter({ week, days }) {
  const done = days.filter(d => d.done).length;
  const words = days.filter(d => d.text && d.text.trim());
  const total = days.length;
  const closing = CLOSING_LINES[(Math.max(1, week) - 1) % CLOSING_LINES.length];
  if (done === 0 && words.length === 0) {
    return ['Hi,', "A quiet week. Nothing recorded, and nothing lost either: every action you'd already taken still counts. The next one is small, so pick it up whenever you're ready.", 'Naomi'].join('\n\n');
  }
  const parts = ['Hi,'];
  parts.push(done === 0 ? "No actions recorded this week, and that's allowed."
    : done === total ? `You showed up every day this week, ${done} of ${total}.`
    : `You showed up on ${done} of ${total} days this week.`);
  if (words.length) {
    const picks = words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
    parts.push(picks.map(d => `On day ${d.day} you wrote: "${clip(d.text)}"`).join('\n'));
  }
  const proof = [];
  if (done > 0) proof.push(plural(done, 'action day', 'action days'));
  if (words.length > 0) proof.push(plural(words.length, 'reflection', 'reflections') + ' in your own words');
  if (proof.length) parts.push(`What you have to show for this week: ${proof.join(', ')}. That's evidence, not a score.`);
  parts.push(INVITATIONS[(Math.max(1, week) - 1) % INVITATIONS.length]);
  parts.push(closing);
  parts.push('Naomi');
  return parts.join('\n\n');
}
