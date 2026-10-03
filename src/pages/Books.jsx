import React from 'react';
import './Landing.css';

const SITE = 'https://www.themomentumrule.com';

// slug matches the book page (/books/<slug>) and the buy redirect (/go/<slug>) on themomentumrule.com
const books = [
  {
    slug: 'the-momentum-rule',
    title: 'The Momentum Rule',
    tagline: 'Confidence was never going to show up first.',
    blurb: 'You don’t need to feel ready. You just need to start. This book is for anyone who’s been waiting for confidence, clarity, or the right moment—and finally suspects none of those are coming. The Momentum Rule is about moving before you’re sure, and discovering that courage is a habit, not a personality type.'
  },
  {
    slug: 'the-but-i-will-era',
    title: 'The But I Will Era',
    tagline: 'Everyone talks about starting. Nobody talks about continuing.',
    blurb: 'You started. Now comes the part no one posts about. The But I Will Era is for the messy middle—the repetition, the boredom, the days when motivation has genuinely left the building. This book won’t tell you to be more disciplined. It’ll show you how to keep going anyway.'
  },
  {
    slug: 'your-body-is-not-your-soul',
    title: 'Your Body Is Not Your Soul',
    tagline: 'The body is the vehicle. The soul is the driver.',
    blurb: 'Your Body Is Not Your Soul is for anyone who’s been organising their life around how they’re seen rather than how they want to live. It’s time to stop waiting until you look or feel different before you start living fully. The soul was always the story.'
  }
];

const primaryLink = { color: '#A36E39', fontWeight: '700', textDecoration: 'none' };
const secondaryLink = { color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' };

function Books() {
  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 3.5rem)', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>The Momentum Series</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Three books. One direction: forward. The foundational texts for the Momentum 60 challenge.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '3rem', textAlign: 'left' }}>
          {books.map((book) => (
            <div className="rule-card" key={book.slug}>
              <h3 style={{ fontSize: '1.5rem', color: '#E1A756', marginBottom: '0.5rem', fontWeight: '700' }}>{book.title}</h3>
              <p style={{ fontWeight: '600', marginBottom: '1rem' }}>{book.tagline}</p>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {book.blurb}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', alignItems: 'center' }}>
                <a href={`${SITE}/go/${book.slug}?src=challenge`} target="_blank" rel="noopener noreferrer" style={primaryLink}>Get the Book →</a>
                <a href={`${SITE}/books/${book.slug}`} target="_blank" rel="noopener noreferrer" style={secondaryLink}>About the book</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Books;
