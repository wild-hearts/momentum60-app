import React from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyRules } from '../data/rules';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-hero">
        <div className="landing-hero-content">
          <h2 style={{ fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>The Non-Zero Challenge</h2>
          <h1>Momentum 60</h1>
          <p className="landing-subtitle">
            A transformative 60-day program to build courage as a habit, survive the messy middle, and put your soul back in the driver's seat.
          </p>
          <button className="cta-button primary" onClick={() => navigate('/app')}>
            START THE CHALLENGE
          </button>
        </div>
      </header>

      <section className="landing-problem">
        <h2>You are running on empty.</h2>
        <p>
          There's nothing worse than rolling through life waiting for the "perfect time". 
          Waiting until you feel confident. Waiting until you look a certain way. Waiting until the motivation strikes.
          The truth is, confidence was never going to show up first.
        </p>
        <p>
          You try program after program, but when the motivation fades, you're right back at square one.
          The real problem isn't a lack of desire. It's a lack of relentless, forward momentum.
        </p>
      </section>

      <section className="landing-rules">
        <h2>The 5 Rules of Momentum 60</h2>
        <p className="rules-intro">The only rule is forward momentum. A smaller version still counts. Complete at least ONE task a day. If you have a zero day, you start over at Day 1.</p>
        
        <div className="rules-grid">
          {dailyRules.map((rule, idx) => (
            <div key={rule.id} className="rule-card">
              <div className="rule-number">{idx + 1}</div>
              <h3>{rule.title}</h3>
              <p>{rule.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-transformation">
        <h2>Take Complete Control</h2>
        <p>
          This is not your next "internet challenge". This is a permanent shift in how you operate.
          By the end of these 60 days, you will have built the habit of courage, the discipline to continue when it's hard, 
          and the profound realization that your body is not your soul.
        </p>
        <button className="cta-button primary large" onClick={() => navigate('/app')}>
          I'M READY TO START
        </button>
      </section>
    </div>
  );
}

export default Landing;
