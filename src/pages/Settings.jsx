import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Globe, AlertTriangle } from 'lucide-react';
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
  
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [timezone, setTimezone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const native = isNative();

  useEffect(() => {
    if (userProfile) {
      setReminderEnabled(userProfile.reminder_enabled || false);
      setReminderTime(userProfile.reminder_time || '18:00');
      setTimezone(userProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
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
    if (native) {
      if (reminderEnabled) {
        const allowed = await requestPermission();
        if (allowed) {
          const ok = await scheduleDailyReminder(reminderTime);
          deviceNote = ok
            ? ` Your phone will nudge you at ${reminderTime}.`
            : ' Saved, but the reminder could not be scheduled on this device.';
        } else {
          deviceNote =
            ' Saved. Notifications are turned off for this app, so nothing will appear until you allow them in iOS Settings.';
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

  /**
   * Deleting the account. Apple requires this inside any app that lets people
   * create one, and it is the right thing to offer regardless.
   *
   * The work happens in one Postgres function, delete_own_account, which runs
   * as its owner and removes this user's rows from all four tables and then
   * the login itself. Doing it that way means no service key has to exist
   * anywhere near the app.
   */
  const handleDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;
      await cancelDailyReminder();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      console.error('account deletion failed', e);
      setIsDeleting(false);
      setDeleteError(
        'That did not work. Nothing has been deleted. Email info@themomentumrule.com and it will be done by hand.'
      );
    }
  };

  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SettingsIcon size={64} color="#ec4899" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Configure your personalised daily reminders.</p>
        </div>

        <form onSubmit={handleSave} className="rule-card" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Bell size={24} color="#ec4899" />
                Daily Reminders
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {native
                  ? 'A nudge on this phone at the time you choose, even when the app is closed.'
                  : "Receive an email if you haven't completed your daily task."}
              </p>
            </div>
            <label
              role="switch"
              aria-checked={reminderEnabled}
              onClick={() => setReminderEnabled(!reminderEnabled)}
              style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}
            >
              <span style={{ 
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: reminderEnabled ? '#ec4899' : '#4b5563', transition: '.4s', borderRadius: '34px' 
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '26px', width: '26px', left: '4px', bottom: '4px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                  transform: reminderEnabled ? 'translateX(26px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>

          <div style={{ opacity: reminderEnabled ? 1 : 0.5, pointerEvents: reminderEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Reminder Time</label>
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1.25rem' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                <Globe size={18} />
                Timezone
              </label>
              <input 
                type="text" 
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
            rules. It happens immediately and cannot be undone.
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
