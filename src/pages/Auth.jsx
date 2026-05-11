import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Landing.css';

function Auth() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      login(email, username || email.split('@')[0]);
      navigate('/app');
    }
  };

  return (
    <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="rule-card" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ec4899' }}>{isLogin ? 'Welcome Back' : 'Join Momentum 60'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isLogin ? 'Enter your details to sync your progress.' : 'Create an account to team up with friends.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                placeholder="How should we call you?"
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="cta-button primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            {isLogin ? 'LOG IN' : 'SIGN UP'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up." : "Already have an account? Log in."}
        </p>
      </div>
    </div>
  );
}

export default Auth;
