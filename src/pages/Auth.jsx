import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

function Auth() {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/tracker');
      } else if (mode === 'signup') {
        await signUp(email, password);
        setMessage('Check your email for the confirmation link to log in.');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage('Check your email for the password reset link.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Momentum 60
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Start your 60-day journey.' : 'Reset your password.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', color: '#10b981', fontSize: '0.9rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="email" 
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
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}
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
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Don't have an account? <span style={{ color: '#ec4899' }}>Sign up</span>
              </button>
              <button onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Forgot your password?
              </button>
            </>
          ) : mode === 'signup' ? (
            <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
              Already have an account? <span style={{ color: '#ec4899' }}>Sign in</span>
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
