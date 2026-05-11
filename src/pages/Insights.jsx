import React from 'react';
import { BookOpen, ExternalLink, Headphones } from 'lucide-react';
import './Landing.css';

function Insights() {
  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
        <BookOpen size={64} color="#8b5cf6" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Daily Insights</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '4rem' }}>
          Fuel your momentum. Access articles, chapter chats, and core philosophies directly from The Momentum Series.
        </p>

        <div className="rule-card" style={{ marginBottom: '2rem', textAlign: 'left', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: '#8b5cf6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Article Spotlight</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Why You Don't Feel Ready Yet</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                "Confidence is not a prerequisite for action. It is a byproduct of action. If you sit around waiting for the perfect conditions, the perfect feeling, or the perfect body, you will be waiting forever. The Momentum Rule is simple: move before you are sure."
              </p>
            </div>
          </div>
          <a href="https://www.themomentumrule.com" target="_blank" rel="noopener noreferrer" className="cta-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', textDecoration: 'none', border: '1px solid #8b5cf6', fontSize: '1rem' }}>
            Read Full Post on TheMomentumRule.com <ExternalLink size={16} />
          </a>
        </div>

        <div className="rule-card" style={{ marginBottom: '2rem', textAlign: 'left', borderLeft: '4px solid #ec4899' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: '#ec4899', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Audio / Chapter Chat</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Surviving The Messy Middle</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Listen to the latest Chapter Chat discussing the core concepts of "The But I Will Era". Learn how to execute your daily disciplines even when your motivation has completely vanished.
              </p>
            </div>
            <Headphones size={48} color="rgba(236, 72, 153, 0.2)" />
          </div>
          <a href="https://www.themomentumrule.com" target="_blank" rel="noopener noreferrer" className="cta-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#ec4899', color: 'white', textDecoration: 'none', fontSize: '1rem' }}>
            Listen on TheMomentumRule.com <ExternalLink size={16} />
          </a>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Need More Input?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Rule #4 requires daily input. Find all the resources, epubs, and audio tracks you need at the official hub.</p>
          <a href="https://www.themomentumrule.com" target="_blank" rel="noopener noreferrer" className="cta-button primary">
            VISIT THE OFFICIAL WEBSITE
          </a>
        </div>

      </div>
    </div>
  );
}

export default Insights;
