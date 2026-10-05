import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { staySignedIn, setStaySignedIn } from '../supabaseClient';

function Auth() {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(staySignedIn);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode !== 'forgot') setStaySignedIn(keepSignedIn);
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/app', {replace:true});
      } else if (mode === 'signup') {
        if (!acceptedTerms) {
          setError('Please accept the Terms and Privacy Policy to create your account.');
          return;
        }
        const result = await signUp(email, password, { marketingOptIn });
        if (result.session) navigate('/app', {replace:true});
        else setMessage('Check your email to confirm your account, then return here and sign in.');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage('Check your email for the password reset link. After choosing a new password in your browser, return here and sign in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem 2rem' }}>

      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>

        <img
          src="/momentum60-logo.webp"
            fetchPriority="high"
            decoding="async"
          alt=""
          width="112"
          height="112"
          style={{ display: 'block', width: '112px', height: '112px', margin: '0 auto 1rem', borderRadius: '22%', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}
        />
        <h1 className="visually-hidden">
          Momentum 60
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Start your 60-day journey.' : 'Reset your password.'}
        </p>

        {error && (
          <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {message && (
          <div role="status" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', color: '#10b981', fontSize: '0.9rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="email" name="email" aria-label="Email address" autoComplete={mode === 'login' ? 'username' : 'email'}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
            />
          </div>

          {mode !== 'forgot' && (
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password" name="password" aria-label="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                style={{ accentColor: '#E1A756', width: '1.15rem', height: '1.15rem', flexShrink: 0 }}
              />
              <span>Keep me signed in on this device</span>
            </label>
          )}

          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                  style={{ marginTop: '0.2rem', accentColor: '#E1A756', width: '1.05rem', height: '1.05rem', flexShrink: 0 }}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#E1A756' }}>Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: '#E1A756' }}>Privacy Policy</Link>.
                </span>
              </label>
              <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: '#E1A756', width: '1.05rem', height: '1.05rem', flexShrink: 0 }}
                />
                <span>Email me news, new books and music from Naomi Shiels. Optional, and you can unsubscribe any time.</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(90deg, #E1A756, #A36E39)', color: '#081C1F', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : (
              <>
                {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          {mode === 'login' ? (
            <>
              <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Don't have an account? <span style={{ color: '#E1A756' }}>Sign up</span>
              </button>
              <button onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Forgot your password?
              </button>
            </>
          ) : mode === 'signup' ? (
            <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
              Already have an account? <span style={{ color: '#E1A756' }}>Sign in</span>
            </button>
          ) : (
            <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
