import React from 'react';
import './Tracker.css'; // Reuse existing styles for cards and layout

function Tools() {
  const toolsList = [
    {
      id: 'cheat-sheets',
      title: 'Cheat Sheets',
      description: 'Quick reference guides to keep you on track when the friction is high. Print these out and stick them somewhere visible.',
      icon: '📝',
      comingSoon: true
    },
    {
      id: 'starter-kit',
      title: 'Starter Kit',
      description: 'Everything you need to set up your environment for the Momentum 60 challenge. Remove the guesswork and start moving.',
      icon: '🚀',
      comingSoon: true
    },
    {
      id: 'self-assessment',
      title: 'Self Assessment',
      description: 'A brutally honest diagnostic tool to identify where you are leaking energy and how to plug the holes.',
      icon: '🔍',
      comingSoon: true
    },
    {
      id: 'printable-calendar',
      title: 'Printable Calendar',
      description: 'A physical 60-day visual tracker. Cross off the days with a red marker to build an unbreakable physical chain.',
      icon: '📅',
      comingSoon: true
    }
  ];

  const handleDownload = (tool) => {
    if (tool.comingSoon) {
      alert(`The ${tool.title} is currently being finalised and will be available to download shortly!`);
    } else {
      // Future: window.open(tool.url, '_blank');
    }
  };

  return (
    <div className="tracker-container" style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3rem', color: '#ec4899', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tools to Keep You Moving
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          You don't have to rely on sheer willpower. Download these official Momentum Series tools to architect an environment where forward motion becomes the default.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
        {toolsList.map(tool => (
          <div 
            key={tool.id} 
            className="day-card" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', 
              backdropFilter: 'blur(10px)', 
              borderRadius: '16px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              cursor: 'default'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{tool.icon}</div>
            <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1rem' }}>{tool.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', flexGrow: 1, marginBottom: '2rem' }}>
              {tool.description}
            </p>
            <button 
              onClick={() => handleDownload(tool)}
              className="cta-button"
              style={{ 
                background: 'transparent', 
                border: '2px solid #8b5cf6', 
                color: '#8b5cf6', 
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {tool.comingSoon ? 'Coming Soon' : 'Download Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tools;
