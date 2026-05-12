import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Globe } from 'lucide-react';
import './Landing.css';

function Settings() {
  const { userProfile, updateProfileSettings } = useContext(AuthContext);
  
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [timezone, setTimezone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    
    setIsSaving(false);
    if (success) {
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to save settings.');
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
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Receive an email if you haven't completed your daily task.</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
              <input 
                type="checkbox" 
                checked={reminderEnabled} 
                onChange={(e) => setReminderEnabled(e.target.checked)} 
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
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
      </div>
    </div>
  );
}

export default Settings;
