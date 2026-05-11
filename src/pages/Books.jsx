import React from 'react';
import './Landing.css';

function Books() {
  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>The Momentum Series</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Three books. One direction: forward. The foundational texts for the Momentum 60 challenge.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', textAlign: 'left' }}>
          
          <div className="rule-card">
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>The Momentum Rule</h3>
            <p style={{ fontWeight: '600', marginBottom: '1rem' }}>Confidence was never going to show up first.</p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              You don’t need to feel ready. You just need to start. This book is for anyone who’s been waiting for confidence, clarity, or the right moment — and finally suspects none of those are coming. The Momentum Rule is about moving before you’re sure, and discovering that courage is a habit, not a personality type.
            </p>
            <a href="https://themomentumrule.com" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: '700', textDecoration: 'none' }}>Get the Book →</a>
          </div>

          <div className="rule-card">
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>The But I Will Era</h3>
            <p style={{ fontWeight: '600', marginBottom: '1rem' }}>Everyone talks about starting. Nobody talks about continuing.</p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              You started. Now comes the part no one posts about. The But I Will Era is for the messy middle — the repetition, the boredom, the days when motivation has genuinely left the building. This book won’t tell you to be more disciplined. It’ll show you how to keep going anyway.
            </p>
            <a href="https://themomentumrule.com" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: '700', textDecoration: 'none' }}>Get the Book →</a>
          </div>

          <div className="rule-card">
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>Your Body Is Not Your Soul</h3>
            <p style={{ fontWeight: '600', marginBottom: '1rem' }}>The body is the vehicle. The soul is the driver.</p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your Body Is Not Your Soul is for anyone who’s been organising their life around how they’re seen rather than how they want to live. It’s time to stop waiting until you look or feel different before you start living fully. The soul was always the story.
            </p>
            <a href="https://themomentumrule.com" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: '700', textDecoration: 'none' }}>Get the Book →</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Books;
