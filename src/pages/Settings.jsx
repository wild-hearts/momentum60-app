import { Capacitor } from '@capacitor/core';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Globe, AlertTriangle } from 'lucide-react';
import { billingRequest } from '../lib/billingClient';
import { supabase } from '../supabaseClient';
import {
  isNative,
  requestPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../utils/notifications';
import './Landing.css';

function Settings() {
  const { userProfile, updateProfileSettings } = useContext(AuthContext);

  const [reminderEnabled, setReminderEnabled] = useState(userProfile?.reminder_enabled || false);
  const [reminderTime, setReminderTime] = useState(userProfile?.reminder_time || '18:00');
  const [timezone, setTimezone] = useState(userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const native = isNative();
  const [sounds,setSounds]=useState(()=>{try{return localStorage.getItem('momentum60:sounds')==='on'}catch{return false}});

  const handleSave = async (e) => {
    e.preventDefault();
    try { new Intl.DateTimeFormat('en',{timeZone:timezone}).format(); } catch { setMessage('Enter a valid timezone, such as Australia/Sydney.'); return; }
    setIsSaving(true);
    setMessage('');

    const { success } = await updateProfileSettings({
      reminder_enabled: reminderEnabled,
      reminder_time: reminderTime,
      timezone: timezone
    });

    // On the phone the reminder is a real notification held by iOS, so the
    // save has to schedule or cancel it, not just record a preference.
    let deviceNote = '';
    if (native && success) {
      if (reminderEnabled) {
        const allowed = await requestPermission();
        if (allowed) {
          const ok = await scheduleDailyReminder(reminderTime);
          deviceNote = ok
            ? ` Your phone will nudge you at ${reminderTime}.`
            : ' Saved, but the reminder could not be scheduled on this device.';
        } else {
          deviceNote =
            ' Saved. Notifications are turned off for this app, so nothing will appear until you allow them in your phone’s notification settings.';
        }
      } else {
        await cancelDailyReminder();
        deviceNote = ' Reminders on this device are off.';
      }
    }

    setIsSaving(false);
    if (success) {
      setMessage(`Settings saved.${deviceNote}`);
      setTimeout(() => setMessage(''), 6000);
    } else {
      setMessage('Failed to save settings.');
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await billingRequest('delete-account');
      await cancelDailyReminder();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      console.error('account deletion failed', e);
      setIsDeleting(false);
      setDeleteError(
        'We could not confirm account deletion. Your subscription may already be cancelled. Email info@themomentumrule.com and it will be done by hand.'
      );
    }
  };

  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SettingsIcon size={64} color="#E1A756" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Configure your personalised daily reminders.</p>
        </div>

        <section><h2>Sound effects</h2><label><input type="checkbox" checked={sounds} onChange={e=>{setSounds(e.target.checked);try{localStorage.setItem('momentum60:sounds',e.target.checked?'on':'off')}catch{setMessage('Sound preference could not be saved on this device.')}}}/> Play short confirmation sounds on this device</label><p>Music is controlled separately. All action and save confirmations also appear as text.</p></section>
        <section><h2>Subscription</h2><p>Programme progress and billing are separate. Cancelling renewal does not erase your saved history.</p><button type="button" className="cta-button" onClick={async()=>{try{if(native){window.location.href = Capacitor.getPlatform()==='ios'?'https://apps.apple.com/account/subscriptions':'https://play.google.com/store/account/subscriptions';}else{const {url}=await billingRequest('billing-portal');window.location.assign(url)}}catch(e){setMessage(e.message)}}}>Manage subscription</button></section>
        <form onSubmit={handleSave} className="rule-card" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Bell size={24} color="#E1A756" />
                Daily Reminders
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {native
                  ? 'A nudge on this phone at the time you choose, even when the app is closed.'
                  : "Receive an email if you haven't completed your daily task."}
              </p>
            </div>
            <button type="button" aria-label="Daily reminders"
              role="switch"
              aria-checked={reminderEnabled}
              onClick={() => setReminderEnabled(!reminderEnabled)}
              style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}
            >
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: reminderEnabled ? '#E1A756' : '#4b5563', transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '26px', width: '26px', left: '4px', bottom: '4px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                  transform: reminderEnabled ? 'translateX(26px)' : 'translateX(0)'
                }}></span>
              </span>
            </button>
          </div>

          <div style={{ opacity: reminderEnabled ? 1 : 0.5, pointerEvents: reminderEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="reminder-time" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Reminder Time</label>
              <input
                id="reminder-time" type="time" disabled={!reminderEnabled}
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1.25rem' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="reminder-timezone" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                <Globe size={18} />
                Timezone
              </label>
              <input
                id="reminder-timezone" type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'var(--text-secondary)', fontSize: '1rem' }}
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>We auto-detected your timezone. You can change this if you are traveling.</p>
            </div>
          </div>

          {message && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: message.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={isSaving} className="cta-button primary" style={{ width: '100%', opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
          </button>
        </form>

        {/* Deleting the account. Apple requires this in any app with sign-up,
            and the two-step confirmation is deliberate: sixty days of streak
            should not be destroyable by one mis-tap. */}
        <section
          style={{
            marginTop: '3rem',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.06)',
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: 0,
              marginBottom: '0.75rem',
            }}
          >
            <AlertTriangle size={20} color="#ef4444" />
            Delete my account
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
            This removes your login, your streak, your reflections and your custom
            rules, including archived seasons. It happens immediately and cannot be undone. Web renewals are cancelled first. Apple or Google subscriptions must be cancelled in your store account using Manage subscription above.
          </p>
          <label
            htmlFor="delete-confirm"
            style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}
          >
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              fontSize: '1rem',
              marginBottom: '1rem',
            }}
          />
          {deleteError && (
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{deleteError}</p>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteText !== 'DELETE' || isDeleting}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '999px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: 'white',
              background: deleteText === 'DELETE' ? '#ef4444' : '#7f1d1d',
              opacity: deleteText === 'DELETE' && !isDeleting ? 1 : 0.6,
              cursor: deleteText === 'DELETE' && !isDeleting ? 'pointer' : 'not-allowed',
            }}
          >
            {isDeleting ? 'DELETING...' : 'DELETE MY ACCOUNT PERMANENTLY'}
          </button>
        </section>
      </div>
    </div>
  );
}

export default Settings;
