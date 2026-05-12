import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { AuthContext } from '../context/AuthContext';
import { dailyPrompts } from '../data/rules';
import { motivationalQuotes } from '../data/quotes';
import { playChime, playClick } from '../utils/audioUtils';
import Mascot from '../components/Mascot';
import './Tracker.css';

function Tracker() {
  const navigate = useNavigate();
  const { customRules, userData, toggleDayItem, resetProgress } = useContext(AuthContext);
  const [selectedDay, setSelectedDay] = useState(null);
  const [quoteModal, setQuoteModal] = useState({ show: false, quote: '' });

  const isDayCompleted = (dayNum) => {
    const dayData = userData[dayNum];
    if (!dayData) return false;
    // The "Smaller Version" rule: at least 1 item must be completed to not be a zero day
    return customRules.some(rule => dayData[rule.id] === true || dayData[rule.id] === 'true'); // Handle supabase booleans/strings
  };

  const getUnlockedDaysCount = () => {
    let unlocked = 1;
    for (let i = 1; i < 60; i++) {
      if (isDayCompleted(i)) {
        unlocked = i + 1;
      } else {
        break;
      }
    }
    return Math.min(unlocked, 60);
  };

  const highestUnlockedDay = getUnlockedDaysCount();
  
  // Calculate Mascot state
  const currentDayData = userData[highestUnlockedDay] || {};
  const isFed = customRules.some(rule => currentDayData[rule.id]);
  
  let completedCount = 0;
  for (let i = 1; i <= 60; i++) {
    if (isDayCompleted(i)) completedCount++;
  }
  const progressPercentage = (completedCount / 60) * 100;

  const handleStartOver = async () => {
    await resetProgress();
    setSelectedDay(null);
  };

  const handleDayClick = (dayNum) => {
    if (dayNum > highestUnlockedDay) return;
    playClick();
    setSelectedDay(dayNum);
  };

  const toggleRule = async (ruleId) => {
    playClick();
    
    const dayData = userData[selectedDay] || {};
    const wasDone = customRules.every(r => dayData[r.id]);
    const wasAnyDone = customRules.some(r => dayData[r.id]);
    
    // Call Supabase update function
    await toggleDayItem(selectedDay, ruleId);
    
    // Determine new visual state for confetti
    const isNowDone = !dayData[ruleId];
    let currentlyDoneCount = 0;
    let anyNowDone = false;
    
    customRules.forEach(r => {
      const done = r.id === ruleId ? isNowDone : !!dayData[r.id];
      if (done) {
        currentlyDoneCount++;
        anyNowDone = true;
      }
    });
    
    const allNowDone = currentlyDoneCount === customRules.length;

    if (anyNowDone && !wasAnyDone) {
      playChime();
    }
    
    if (allNowDone && !wasDone) {
      playChime();
      
      // Select a random quote
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      
      if (selectedDay === 60) {
        var duration = 3000;
        var end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ec4899', '#8b5cf6', '#ffffff'] });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ec4899', '#8b5cf6', '#ffffff'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      } else {
         confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ec4899', '#8b5cf6', '#ffffff'] });
      }
      
      // Delay the quote modal slightly so confetti has time to pop
      setTimeout(() => {
        setQuoteModal({ show: true, quote: randomQuote });
      }, 800);
    }
  };

  const daysArray = Array.from({ length: 60 }, (_, i) => i + 1);

  return (
    <div className="app-container">
      <header className="header">
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Momentum 60</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>The Non-Zero Challenge. Do not break the chain.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="cta-button" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--text-primary)' }} onClick={() => navigate('/')}>Back to Home</button>
          <button className="cta-button primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', background: '#ef4444' }} onClick={handleStartOver}>Fail / Start Over</button>
        </div>
      </header>

      <Mascot unlockedDays={highestUnlockedDay} isTodayCompleted={isFed} />

      <section className="tracker-instructions" style={{ maxWidth: '1000px', margin: '0 auto 3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ec4899', fontWeight: '700' }}>Your Daily Non-Negotiables</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Click on today's tile below to access your unique <strong>Soul Focus Prompt</strong> and your checklist. 
          <br /><br />
          <strong>The Non-Zero Rule:</strong> Even some progress is better than none. A smaller version still counts. To keep the chain alive, you must complete <strong>at least ONE</strong> of these tasks every day. If you have a true "zero day" where you do absolutely nothing, you must hit Fail and start over.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ec4899' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#ec4899', marginBottom: '0.25rem' }}>Make this challenge yours.</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>You can customize these 5 non-negotiable rules at any time to fit your goals.</p>
          </div>
          <button 
            onClick={() => navigate('/rules')} 
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ec4899', color: '#ec4899', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Customize Rules
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {customRules.map(rule => (
            <div key={rule.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{rule.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}></div>
        </div>
        <div className="progress-text">
          {completedCount} of 60 Days Completed
        </div>
      </section>

      <main className="days-grid">
        {daysArray.map((dayNum, index) => {
          const isCompleted = isDayCompleted(dayNum);
          const isLocked = dayNum > highestUnlockedDay;
          
          return (
            <div 
              key={dayNum} 
              className={`day-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => handleDayClick(dayNum)}
              style={{ animationDelay: `${(index % 10) * 0.05}s` }}
            >
              <div className="day-card-inner">
                <div 
                  className="day-card-front"
                  style={{ backgroundImage: `url(https://picsum.photos/seed/momentum60_${dayNum}/400/400)` }}
                >
                  <div className="day-card-overlay"></div>
                  <div className="day-card-content">
                    <div className="day-number">{dayNum}</div>
                    <div className="day-status">
                      {isLocked ? 'Locked' : (isCompleted ? 'Completed' : 'Pending')}
                    </div>
                  </div>
                </div>
                {!isLocked && (
                  <div className="day-card-back" style={{ padding: '0.5rem' }}>
                    <div className="day-card-back-text" style={{ fontSize: '0.8rem', textAlign: 'left', display: 'block' }}>
                      <strong>Daily Rules:</strong>
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                        {customRules.map(rule => (
                          <li key={rule.id} style={{ marginBottom: '0.25rem', color: (userData[dayNum] && userData[dayNum][rule.id]) ? '#10b981' : 'inherit' }}>
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { playClick(); setSelectedDay(null); }}>
              &times;
            </button>
            <div className="modal-day-badge" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: 'white', padding: '0.25rem 1rem', borderRadius: '999px', display: 'inline-block', marginBottom: '1.5rem', fontWeight: 'bold' }}>Day {selectedDay}</div>
            
            <div className="daily-prompt-section" style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ec4899', marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Soul Focus Prompt:</h3>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: '500' }}>{dailyPrompts[selectedDay - 1]}</p>
            </div>

            <h2 className="modal-task-title" style={{ marginBottom: '1.5rem', textAlign: 'left', fontSize: '1.25rem' }}>The Momentum 5 Checklist</h2>
            
            <div className="rules-checklist" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customRules.map(rule => {
                const isRuleDone = userData[selectedDay] && userData[selectedDay][rule.id];
                return (
                  <div 
                    key={rule.id} 
                    className={`rule-check-item ${isRuleDone ? 'done' : ''}`}
                    onClick={() => toggleRule(rule.id)}
                    style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      padding: '1rem', 
                      background: isRuleDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${isRuleDone ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div className="rule-check-box" style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '6px', 
                      border: `2px solid ${isRuleDone ? '#10b981' : 'var(--text-secondary)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {isRuleDone && '✓'}
                    </div>
                    <div className="rule-check-text">
                      <strong style={{ display: 'block', marginBottom: '0.25rem', color: isRuleDone ? '#10b981' : 'inherit' }}>{rule.label}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className={`modal-action-btn ${isDayCompleted(selectedDay) ? 'completed' : ''}`}
              style={{ marginTop: '2rem' }}
              onClick={() => setSelectedDay(null)}
            >
              {isDayCompleted(selectedDay) ? 'All Done! Close Modal' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {quoteModal.show && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setQuoteModal({ show: false, quote: '' })}>
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: '800' }}>
              Day Completed
            </h2>
            <div style={{ fontSize: '1.4rem', color: 'white', fontStyle: 'italic', lineHeight: '1.6', margin: '2rem 0', fontWeight: '500' }}>
              "{quoteModal.quote}"
            </div>
            <button 
              className="cta-button primary"
              style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
              onClick={() => { playClick(); setQuoteModal({ show: false, quote: '' }); }}
            >
              Continue building momentum
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracker;
