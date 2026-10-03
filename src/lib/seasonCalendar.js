const DAY = 86400000;
function ordinal(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Expected an ISO calendar date');
  const value = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(value) || new Date(value).toISOString().slice(0, 10) !== date) throw new Error('Invalid date');
  return value / DAY;
}
export function localDate(instant, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
// Paused and verified outage dates are sets of ISO dates in the season timezone.
export function seasonCalendar({ startDate, today, pausedDates = [], outageDates = [] }) {
  const start = ordinal(startDate), current = ordinal(today);
  if (current < start) return { day: 0, elapsedDays: 0, ended: false, suspended: false };
  const excluded = new Set([...pausedDates, ...outageDates]);
  let skipped = 0;
  for (const date of excluded) { const n = ordinal(date); if (n >= start && n <= current) skipped++; }
  const elapsedDays = current - start + 1;
  const activeDays = elapsedDays - skipped;
  return { day: Math.min(60, Math.max(0, activeDays)), elapsedDays, ended: activeDays > 60, suspended: excluded.has(today) };
}
