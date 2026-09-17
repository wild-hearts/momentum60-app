/**
 * Daily reminders on the device itself.
 *
 * The app has always had a reminder setting, but it only ever drove an email
 * from a Vercel cron, and that cron has been failing since it was written
 * because RESEND_API_KEY was never set on the project. So nobody has ever been
 * reminded of anything.
 *
 * A local notification needs no server, no key and no network: iOS holds the
 * schedule and fires it even with the app closed. It is also the honest
 * answer to Apple's "minimum functionality" rule, which rejects apps that are
 * a website in a wrapper. A streak app that nudges you at 6pm is doing
 * something a web page cannot.
 *
 * Everything here is a no-op on the web, so the same Settings screen works in
 * both places.
 */

import { LocalNotifications } from '@capacitor/local-notifications';

/** One fixed id, so re-scheduling replaces rather than stacks up. */
const DAILY_ID = 1;

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
 * form already stores). Repeats every day at that minute, in whatever
 * timezone the phone is in, which is the behaviour people expect when they
 * travel.
 */
export async function scheduleDailyReminder(time) {
  if (!isNative()) return false;
  const [hour, minute] = String(time || '18:00').split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return false;

  try {
    await cancelDailyReminder();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_ID,
          title: 'Non-zero day',
          body: 'One small thing counts. Open Momentum 60 and log today.',
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    });
    return true;
  } catch (e) {
    console.error('scheduling the daily reminder failed', e);
    return false;
  }
}

export async function cancelDailyReminder() {
  if (!isNative()) return;
  try {
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) => n.id === DAILY_ID);
    if (ours.length) await LocalNotifications.cancel({ notifications: ours });
  } catch (e) {
    console.error('cancelling the daily reminder failed', e);
  }
}

/** For the Settings screen to show what is actually scheduled, not what was asked for. */
export async function pendingReminder() {
  if (!isNative()) return null;
  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications.find((n) => n.id === DAILY_ID) ?? null;
  } catch {
    return null;
  }
}
