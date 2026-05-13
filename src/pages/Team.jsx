import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Users, Copy, CheckCircle, Flame } from 'lucide-react';
import './Landing.css';

function Team() {
  const { user, inviteCode, teamMember, linkTeamMember, unlinkTeamMember, userData } = useContext(AuthContext);
  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkMessage, setLinkMessage] = useState({ type: '', text: '' });
  const [isLinking, setIsLinking] = useState(false);
  const [partnerProgress, setPartnerProgress] = useState(null);

  // Calculate user's own progress
  let myCompletedCount = 0;
  for (let i = 1; i <= 60; i++) {
    const dayData = userData[i];
    if (dayData && Object.keys(dayData).length > 0) {
      myCompletedCount++;
    }
  }

  useEffect(() => {
    const fetchPartnerProgress = async () => {
      if (teamMember && user) {
        try {
          const { data, error } = await supabase.rpc('get_partner_progress');
          if (!error) {
            setPartnerProgress(data);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchPartnerProgress();
  }, [teamMember, user]);

  if (!user) {
    return (
      <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>You need an account to team up.</h2>
          <a href="/auth" className="cta-button primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Go to Login</a>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLink = async (e) => {
    e.preventDefault();
    setLinkMessage({ type: '', text: '' });
    
    if (friendCode.length === 6) {
      setIsLinking(true);
      const result = await linkTeamMember(friendCode);
      setIsLinking(false);
      
      if (result.success) {
        setLinkMessage({ type: 'success', text: 'Successfully teamed up!' });
        setFriendCode('');
      } else {
        setLinkMessage({ type: 'error', text: result.message });
      }
    } else {
      setLinkMessage({ type: 'error', text: 'Code must be exactly 6 characters.' });
    }
  };

  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
        <Users size={64} color="#ec4899" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Team Up</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '4rem' }}>
          Accountability is everything. Link your dashboard with a friend and never have a zero day again.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
          <div className="rule-card">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Invite Code</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Share this code with your partner.</p>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.2em', color: '#ec4899' }}>{inviteCode}</span>
              <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                {copied ? <CheckCircle color="#10b981" /> : <Copy />}
              </button>
            </div>
          </div>

          <div className="rule-card">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Link a Friend</h3>
            {teamMember ? (
              <div>
                <p style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={20} /> Successfully linked!</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You are now teamed up and holding each other accountable.</p>
                
                {partnerProgress !== null && (
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ec4899' }}><Flame size={20} /> Head-to-Head</h4>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span>You</span>
                        <strong>{myCompletedCount} Days</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(myCompletedCount/60)*100}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span>Partner</span>
                        <strong>{partnerProgress} Days</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(partnerProgress/60)*100}%`, height: '100%', background: '#10b981' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={unlinkTeamMember} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                  Unlink Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleLink}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Enter their 6-character code below.</p>
                <input 
                  type="text" 
                  maxLength={6}
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="e.g., A1B2C3"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.25rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}
                />
                {linkMessage.text && (
                  <div style={{ color: linkMessage.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {linkMessage.text}
                  </div>
                )}
                <button type="submit" disabled={isLinking} className="cta-button primary" style={{ width: '100%', opacity: isLinking ? 0.7 : 1 }}>
                  {isLinking ? 'LINKING...' : 'LINK ACCOUNT'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
