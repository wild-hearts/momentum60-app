import {motivationalQuotes} from '../data/quotes.js';

// Which nudges the phone should have waiting, worked out from where the member
// is today. Pure, so it is tested directly (tests/reminder-plan.test.mjs);
// utils/notifications.js hands the result to iOS and Android.
// - one nudge a day at her chosen time, with a different line each day;
// - none today once today's action is recorded;
// - none after day 60.
// Booked two weeks ahead and rebooked every time Today opens or an action is
// recorded, so they keep going while she keeps coming back.
export const FIRST_ID = 1001;
export const DAYS_AHEAD = 14;
export const LAST_DAY = 60;

export const reminderLine = day => motivationalQuotes[(Math.max(1, day) - 1) % motivationalQuotes.length];

export function planReminders(now, time, {day, doneToday}) {
  const [hour, minute] = String(time || '18:00').split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return [];
  const out = [];
  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    const programmeDay = day + offset;
    if (programmeDay > LAST_DAY) break;
    if (offset === 0 && doneToday) continue;
    const at = new Date(now);
    at.setDate(at.getDate() + offset);
    at.setHours(hour, minute, 0, 0);
    if (at <= now) continue;
    out.push({id: FIRST_ID + offset, at, body: reminderLine(programmeDay)});
  }
  return out;
}

/** Every id this app ever books, so turning reminders off clears them all. */
export const allReminderIds = () => [1, ...Array.from({length: DAYS_AHEAD}, (_, i) => FIRST_ID + i)];
