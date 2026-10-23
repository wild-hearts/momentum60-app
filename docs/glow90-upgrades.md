# Glow90 upgrades brought into Momentum 60 (23 Oct 2026)

Glow90 (wild-hearts/glowup-app, branch `glow90-1.1`) had 27 changes between
2 and 22 October 2026. Momentum 60 is a different codebase (Vite and React,
not Next.js), so each one was rebuilt here rather than copied.

## Brought across on branch `glow90-upgrades`

| Glow90 change | In Momentum 60 |
| --- | --- |
| Sign in: trim the email, stop auto-capitalise, Show password (e7c6c7b) | `src/pages/Auth.jsx`, `src/pages/UpdatePassword.jsx`, `cleanEmail` in `src/lib/passwordMessages.js` |
| Change password while signed in (66fd56c) | `src/components/ChangePassword.jsx`, in Settings |
| Say why a password change was refused (e2204a4) | `passwordChangeMessage` in `src/lib/passwordMessages.js` |
| Stale Apple records cannot undo a refund (f4b05ce) | `shouldApply` in `api/_lib/nativeAccess.js`, column `last_signed_ms` |
| Billing grace keeps a paying member in (f4b05ce, b0325b7) | grace from Apple's renewal info in `api/apple-notifications.js`; `keptExpiry` keeps it when the app sends its own record |
| Sandbox purchases limited to named testers (f4b05ce) | `isSandboxAllowed`, column `environment`, env `ALLOW_SANDBOX_ACCESS` and `SANDBOX_ALLOWED_EMAILS` |
| Log failed Apple signature checks (f4b05ce) | `api/_lib/appleStore.js` |
| Purchases that arrive on their own (Ask to Buy, renewals) (f4b05ce) | `listenForStorePurchases` in `src/lib/billingClient.js` |
| Clear cancel instructions (b0325b7) | `src/components/BillingSettings.jsx` |
| Phone nudges booked on the phone, a different line each day, none once the day is done (04e7014) | `src/lib/reminderPlan.js`, `src/utils/notifications.js`, offer card `src/components/ReminderOffer.jsx` on Today from day 2 |
| Background audio and the song title on the lock screen (7b0a54a) | `ios/App/App/Info.plist`, `AppDelegate.swift`, `src/components/AudioPlayer.jsx` |
| Security updates, Capacitor 8.5.3 and audit fix (42a10db) | `package.json`; npm audit now reports 0 vulnerabilities (there was a critical Capacitor one) |
| Run the server next to the database (bd7a10a) | `vercel.json` regions `hnd1`. Momentum 60's Supabase database is in Tokyo (ap-northeast-1); Glow90's is in Mumbai |

The reminder lines are Momentum 60's own `motivationalQuotes` (`src/data/quotes.js`), rotated by programme day.

## Already in Momentum 60 before this

Direct Apple and Google purchase checks with no RevenueCat; selling only through the
store in the app; staying signed in on the phone; forgot password; signing up
lands on the live site (`emailRedirectTo`); archiving a season and starting again
from day 1; Google Play purchases; each member's timezone saved when a season
starts (a season deliberately keeps that timezone, so Glow90's timezone sync was
not copied).

## Not brought across: these need Naomi's decision or material

- **Price.** Glow90 moved to A$14.99 once for ninety days (4c3d7a2). Momentum 60 stays A$4.99 a month.
- **AI "Shape my day"** on Claude Haiku (df493e0, 85f80d3): running costs, an AI consent screen and legal wording.
- **Naomi's voice notes** in the app (85f80d3): needs recordings made for Momentum 60.
- **The sunrise landing page, the daylight content pages and the new photography** (c1db1a3, 39f7956, 0cd5b0a): Glow90's look, not Momentum 60's.
- **Albums on Apple Music** (b0325b7): needs Momentum 60's own album links, if there are any.
- **Retention features** (Return Path, Proof Letter, For This Moment, Choose Your Need, first-week proof): written for Glow90's programme and its content.
- **Locking the paid programme on the server** (7b0a54a): Momentum 60's daily tasks ship inside the app. Moving them behind the server is a larger change.

## Going live, in this order

1. Apply `supabase/migrations/202610230014_native_purchase_ordering.sql` to the live
   database **before** deploying this code. The new code reads its two columns, so
   store purchases fail to record if the code goes out first.
2. Deploy the website (`challenge.themomentumrule.com`) from this branch.
3. Build and upload a new iPhone build (build 10). It carries Capacitor 8.5.3, background audio and the new nudges.
4. After App Review approves the build, optionally set `ALLOW_SANDBOX_ACCESS=false`
   on Vercel (with `SANDBOX_ALLOWED_EMAILS` listing testers) so TestFlight purchases
   stop unlocking the programme for everyone.
