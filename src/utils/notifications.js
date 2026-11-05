import { LocalNotifications } from '@capacitor/local-notifications';
import { planReminders, allReminderIds } from '../lib/reminderPlan';

/** One fixed id, so re-scheduling replaces rather than stacks up. */
const DAILY_ID = 1;
const TITLE = 'Non-zero day';

export function isNative() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

/**
 * Ask for permission, but only ever from a user action: iOS gives an app one
 * chance at this dialog, and an app that burns it on launch gets denied by
 * people who have not yet seen why they would want it.
 */
export async function requestPermission() {
  if (!isNative()) return false;
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    const asked = await LocalNotifications.requestPermissions();
    return asked.display === 'granted';
  } catch (e) {
    console.error('notification permission failed', e);
    return false;
  }
}

/**
 * Schedule the daily nudge at `time` ("HH:MM", the same string the Settings
 * form already stores), in whatever timezone the phone is in, which is the
 * behaviour people expect when they travel.
 *
 * With `today` ({day, doneToday}) it books the next two weeks one by one, each
 * with its own line, skipping today once today is recorded and stopping after
 * day 60 (lib/reminderPlan.js). Today rebooks them each time it opens. Without
 * it (Settings, which does not know the day) it books one repeating nudge.
 */
export async function scheduleDailyReminder(time, today) {
  if (!isNative()) return false;
  const [hour, minute] = String(time || '18:00').split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return false;

  try {
    await cancelDailyReminder();
    const notifications = today
      ? planReminders(new Date(), time, today).map(({ id, at, body }) => ({ id, title: TITLE, body, schedule: { at, allowWhileIdle: true } }))
      : [{ id: DAILY_ID, title: TITLE, body: 'One small thing counts. Open Momentum 60 and log today.', schedule: { on: { hour, minute }, allowWhileIdle: true } }];
    if (notifications.length) await LocalNotifications.schedule({ notifications });
    return true;
  } catch (e) {
    console.error('scheduling the daily reminder failed', e);
    return false;
  }
}

export async function cancelDailyReminder() {
  if (!isNative()) return;
  try {
    const ids = new Set(allReminderIds());
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) => ids.has(n.id));
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map(({ id }) => ({ id })) });
  } catch (e) {
    console.error('cancelling the daily reminder failed', e);
  }
}

/** For the Settings screen to show what is actually scheduled, not what was asked for. */
export async function pendingReminder() {
  if (!isNative()) return null;
  try {
    const pending = await LocalNotifications.getPending();
    const ids = new Set(allReminderIds());
    return pending.notifications.filter((n) => ids.has(n.id)).sort((a, b) => a.id - b.id)[0] ?? null;
  } catch {
    return null;
  }
}
