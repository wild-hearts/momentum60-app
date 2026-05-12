import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function JourneySummary() {
  const navigate = useNavigate();
  const { userProfile, dailyReflections } = useContext(AuthContext);

  const handlePrint = () => {
    window.print();
  };

  if (userProfile?.accountability_mode !== 'journal') {
    return (
      <div className="app-container" style={{ textAlign: 'center', paddingTop: '10rem' }}>
        <h2>Journal Mode is not active.</h2>
        <p>You selected the Honor System for your challenge.</p>
        <button className="cta-button primary" onClick={() => navigate('/app')} style={{ marginTop: '2rem' }}>Back to Tracker</button>
      </div>
    );
  }

  const daysArray = Array.from({ length: 60 }, (_, i) => i + 1);

  const getCalendarDate = (dayNum) => {
    if (!userProfile?.start_date) return '';
    const date = new Date(userProfile.start_date);
    date.setDate(date.getDate() + (dayNum - 1));
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="app-container summary-page">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .summary-card { break-inside: avoid; border: 1px solid #ccc !important; background: white !important; color: black !important; box-shadow: none !important; }
          .summary-text { color: black !important; }
          .header h1 { background: none !important; color: black !important; -webkit-text-fill-color: black !important; }
          * { text-shadow: none !important; }
        }
      `}</style>

      <header className="header no-print">
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Your Journey</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>The complete chronicle of your Momentum 60 challenge.</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="cta-button" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--text-primary)' }} onClick={() => navigate('/app')}>Back to Tracker</button>
          <button className="cta-button primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }} onClick={handlePrint}>Print / Save as PDF</button>
        </div>
      </header>

      <div className="print-header" style={{ display: 'none' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Momentum 60: Journey Summary</h1>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {daysArray.map((dayNum) => {
          const content = dailyReflections[dayNum];
          const hasContent = content && content.trim().length > 0;
          const dateStr = getCalendarDate(dayNum);

          return (
            <div key={dayNum} className="summary-card" style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '16px', 
              padding: '2rem',
              textAlign: 'left',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#ec4899', margin: 0 }}>Day {dayNum}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{dateStr}</span>
              </div>
              
              {hasContent ? (
                <div className="summary-text" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {content}
                </div>
              ) : (
                <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', opacity: 0.5 }}>
                  No reflection recorded for this day.
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="no-print" style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>End of Document</p>
      </div>
    </div>
  );
}

export default JourneySummary;
