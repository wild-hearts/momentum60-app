import React from 'react';
import './Landing.css'; // Reuse landing styles

function FAQ() {
  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '4rem' }}>No excuses. Just answers.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', textAlign: 'left' }}>
          
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>What happens if I fail or miss a day?</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              You start over at Day 1. However, to keep the chain alive, you only need to complete <strong>at least one</strong> of the 5 daily rules. Even some progress is better than none. A smaller version still counts. But if you have a true "zero day" where you do absolutely nothing, you hit the Fail button and you start over.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>I don't have the "Momentum Series" books. What do I do for Rule 4?</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Rule 4 is "The Input". If you do not have the books, substitute it with 10 pages of ANY non-fiction book that drives personal growth, or listen to an educational podcast. Audiobooks do not count unless you are actively taking notes. You can purchase the Momentum Series books on our Books page.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>Can I modify the daily discipline in Rule 2?</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Yes, but you must define it on Day 1 and it must remain the same for all 60 days. Whether it is a 45-minute workout, 30 minutes of writing, or 20 minutes of language learning, you commit to it up front and you do not change it.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>What counts as a "When I..." statement (Rule 5)?</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Any thought that delays living until conditions are perfect. "I'll start dating when I lose 10 pounds." "I'll launch the business when I have more time." "I'll feel confident when I get the promotion." You must catch these thoughts, acknowledge them, and rewrite them in the present tense. 
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700' }}>Why are there no physical appearance goals?</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Because your body is the vehicle, your soul is the driver. This challenge is about mental toughness, internal momentum, and building the habit of courage. The physical changes will happen as a byproduct of your discipline, but they are not the focus.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FAQ;
