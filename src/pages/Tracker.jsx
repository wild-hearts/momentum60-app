import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { AuthContext } from '../context/AuthContext';
import { dailyPrompts } from '../data/rules';
import { motivationalQuotes } from '../data/quotes';
import { dailySongs } from '../data/songs';
import { playChime, playClick } from '../utils/audioUtils';
import Mascot from '../components/Mascot';
import './Tracker.css';

function Tracker() {
  const navigate = useNavigate();
  const { user, customRules, userData, userProfile, dailyReflections, toggleDayItem, resetProgress, startChallenge, saveReflection } = useContext(AuthContext);
  const [selectedDay, setSelectedDay] = useState(null);
  const [quoteModal, setQuoteModal] = useState({ show: false, quote: '' });
  const [rewardModal, setRewardModal] = useState(false);
  const [songType, setSongType] = useState('');
  const [songTopic, setSongTopic] = useState('');
  const [hasFailed, setHasFailed] = useState(false);
  const [failedDay, setFailedDay] = useState(null);

  const isDayCompleted = (dayNum) => {
    const dayData = userData[dayNum];
    if (!dayData) return false;
    // The "Smaller Version" rule: at least 1 item must be completed to not be a zero day
    return customRules.some(rule => dayData[rule.id] === true || dayData[rule.id] === 'true'); // Handle supabase booleans/strings
  };

  const isDayPerfect = (dayNum) => {
    const dayData = userData[dayNum];
    if (!dayData) return false;
    // Perfect day means all 5 rules are checked
    return customRules.every(rule => dayData[rule.id] === true || dayData[rule.id] === 'true');
  };

  const getActiveDay = () => {
    if (!userProfile?.start_date) return 1;
    const start = new Date(userProfile.start_date);
    start.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays + 1, 60);
  };

  const activeCalendarDay = getActiveDay();
  
  // Calculate Mascot state based on active calendar day
  const currentDayData = userData[activeCalendarDay] || {};
  const isFed = customRules.some(rule => currentDayData[rule.id]);

  let completedCount = 0;
  let currentPerfectStreak = 0;
  let longestPerfectStreak = 0;
  let passesAvailable = 0;
  const passUsedDays = {};
  let hasFailedCalc = false;
  let failedDayCalc = null;

  for (let i = 1; i <= Math.min(activeCalendarDay, 60); i++) {
    const perfect = isDayPerfect(i);
    const completed = isDayCompleted(i);

    if (perfect) {
      completedCount++;
      currentPerfectStreak++;
      longestPerfectStreak = Math.max(longestPerfectStreak, currentPerfectStreak);
      // Earn a pass for every 10 consecutive perfect days
      if (currentPerfectStreak > 0 && currentPerfectStreak % 10 === 0) {
        passesAvailable++;
      }
    } else if (completed) {
      completedCount++;
      currentPerfectStreak = 0;
    } else {
      // ZERO DAY logic
      currentPerfectStreak = 0;
      if (i < activeCalendarDay) {
        // Past day!
        if (passesAvailable > 0) {
          passesAvailable--;
          passUsedDays[i] = true;
          completedCount++; // Counts as survived!
        } else {
          hasFailedCalc = true;
          failedDayCalc = i;
          break; // Chain broken
        }
      }
    }
  }

  React.useEffect(() => {
    if (!userProfile) return;
    if (hasFailedCalc && !hasFailed) {
      setHasFailed(true);
      setFailedDay(failedDayCalc);
    }
  }, [userProfile, hasFailedCalc, failedDayCalc, hasFailed]);
  
  const progressPercentage = (completedCount / 60) * 100;

  const handleRewardSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("40-Day Perfect Streak Reward: Custom Song Request");
    const body = encodeURIComponent(`User Email: ${user?.email || 'N/A'}\n\nType of Song requested:\n${songType}\n\nWhat should it be about:\n${songTopic}`);
    window.location.href = `mailto:info@wildheartspublishing.com.au?subject=${subject}&body=${body}`;
    setRewardModal(false);
  };

  const handleStartOver = async () => {
    await resetProgress();
    setSelectedDay(null);
    setHasFailed(false);
    setFailedDay(null);
  };

  const handleDayClick = (dayNum) => {
    if (dayNum > activeCalendarDay) return;
    playClick();
    setSelectedDay(dayNum);
  };

  const toggleRule = async (ruleId) => {
    if (selectedDay !== activeCalendarDay) return; // Cannot edit past days
    
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

  if (!userProfile) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '600px', textAlign: 'center', background: 'var(--card-bg)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Momentum 60</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Before we lock in your starting clock, choose your accountability mode. This decides how you prove your daily progress.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <button 
              onClick={() => startChallenge('honor')}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>🛡️ The Honor System</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No extra steps. Just check the boxes every day. You're only cheating yourself if you lie.</p>
            </button>
            <button 
              onClick={() => startChallenge('journal')}
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid #ec4899', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <h3 style={{ color: '#ec4899', fontSize: '1.25rem', marginBottom: '0.5rem' }}>📖 Journal Mode (Recommended)</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>A daily text reflection is required. At the end of the 60 days, you get a chronological document of your entire mental journey.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      <Mascot unlockedDays={activeCalendarDay} isTodayCompleted={isFed} />

      <section className="tracker-instructions" style={{ maxWidth: '1000px', margin: '0 auto 3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ec4899', fontWeight: '700' }}>Your Daily Non-Negotiables</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          <strong>The Clock is Ticking:</strong> This challenge operates on a strict 24-hour calendar. You cannot skip ahead, and you cannot edit yesterday's progress. Click on today's tile below to access your daily tasks.
          <br /><br />
          <strong>The Non-Zero Rule:</strong> Even some progress is better than none. To keep the chain alive, you must complete <strong>at least ONE</strong> of these tasks every day. If you have a true "zero day", the system will detect it and force you to start over.
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

      <section className="progress-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}></div>
          </div>
          <div className="progress-text" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>{completedCount} of 60 Days Completed</span>
            <span style={{ color: '#ec4899', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🔥 Perfect Streak: {currentPerfectStreak} (Best: {longestPerfectStreak})
              <span style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.3)' }}>|</span>
              🎟️ Free Passes: {passesAvailable}
            </span>
          </div>
        </div>

        <div className="milestone-roadmap" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ec4899', marginBottom: '1rem' }}>Your Journey Milestones</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ opacity: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎟️</span> <strong>10-Day Perfect Streak:</strong> Earns 1 Free Pass (consumed automatically on Zero Days).
            </li>
            <li style={{ opacity: completedCount >= 15 ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{completedCount >= 15 ? '✅' : '🔒'}</span> <strong>15 Days of Momentum:</strong> Unlocks the Sprout Mascot.
            </li>
            <li style={{ opacity: completedCount >= 30 ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{completedCount >= 30 ? '✅' : '🔒'}</span> <strong>30 Days of Momentum:</strong> Unlocks the Sapling Mascot.
            </li>
            <li style={{ opacity: longestPerfectStreak >= 40 ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem', color: longestPerfectStreak >= 40 ? '#10b981' : 'inherit' }}>
              <span>{longestPerfectStreak >= 40 ? '🔥' : '🔒'}</span> <strong>40-Day Perfect Streak:</strong> 5/5 tasks daily unlocks a personal song by The Winks!
            </li>
            <li style={{ opacity: completedCount >= 60 ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem', color: completedCount >= 60 ? '#10b981' : 'inherit' }}>
              <span>{completedCount >= 60 ? '🦅' : '🔒'}</span> <strong>60 Days of Momentum:</strong> Complete the challenge for the Phoenix Mascot AND a personal song!
            </li>
          </ul>
        </div>

        {userProfile?.accountability_mode === 'journal' && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/summary')}
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
            >
              📖 View Ongoing Journal
            </button>
          </div>
        )}

        {(longestPerfectStreak >= 40 || completedCount >= 60) && (
          <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ec4899', textAlign: 'center', animation: 'pulse 2s infinite' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(236,72,153,0.5)' }}>🎉 YOU UNLOCKED THE ULTIMATE REWARD! 🎉</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem' }}>You earned a personal song written by The Winks.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setRewardModal(true)}
                style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', color: 'white', padding: '0.75rem 2rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }}
              >
                Claim Your Song
              </button>
              
              {userProfile?.accountability_mode === 'journal' && (
                <button 
                  onClick={() => navigate('/summary')}
                  style={{ background: 'transparent', color: '#ec4899', padding: '0.75rem 2rem', border: '2px solid #ec4899', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Read Your Final Summary
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <main className="days-grid">
        {daysArray.map((dayNum, index) => {
          const isCompleted = isDayCompleted(dayNum);
          const isPassUsed = passUsedDays[dayNum];
          const isLocked = dayNum > activeCalendarDay;
          const isPast = dayNum < activeCalendarDay;
          
          return (
            <div 
              key={dayNum} 
              className={`day-card ${isCompleted || isPassUsed ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${dayNum === activeCalendarDay ? 'active' : ''}`}
              onClick={() => handleDayClick(dayNum)}
              style={{ 
                animationDelay: `${(index % 10) * 0.05}s`,
                boxShadow: dayNum === activeCalendarDay ? '0 0 20px rgba(236, 72, 153, 0.5)' : 'none',
                border: dayNum === activeCalendarDay ? '2px solid #ec4899' : 'none'
              }}
            >
              <div className="day-card-inner">
                <div 
                  className="day-card-front"
                  style={{ backgroundImage: `url(https://picsum.photos/seed/momentum60_${dayNum}/400/400)` }}
                >
                  <div className="day-card-overlay"></div>
                  <div className="day-card-content">
                    <div className="day-number">{dayNum}</div>
                    <div className="day-status" style={{ color: isPassUsed ? '#fcd34d' : '', fontWeight: isPassUsed ? 'bold' : 'normal' }}>
                      {isLocked ? 'Locked' : (isPassUsed ? 'Pass Used' : (isPast ? (isCompleted ? 'Completed' : 'Missed') : (isCompleted ? 'Completed' : 'Pending')))}
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
            
            <div className="daily-prompt-section" style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ec4899', marginBottom: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ec4899', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Soul Focus Prompt:</h3>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: '500' }}>{dailyPrompts[selectedDay - 1]}</p>
            </div>

            <div className="daily-anthem-section" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#8b5cf6', marginBottom: '0.5rem', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Anthem:</h3>
              <iframe 
                style={{ borderRadius: '12px' }} 
                src={`https://open.spotify.com/embed/track/${dailySongs[selectedDay - 1]}?utm_source=generator&theme=0`} 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowFullScreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              ></iframe>
            </div>

            <h2 className="modal-task-title" style={{ marginBottom: '1.5rem', textAlign: 'left', fontSize: '1.25rem' }}>
              {selectedDay === activeCalendarDay ? 'The Momentum 5 Checklist' : 'Past Progress'}
            </h2>
            
            <div className="rules-checklist" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
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
                      cursor: selectedDay === activeCalendarDay ? 'pointer' : 'not-allowed',
                      opacity: selectedDay === activeCalendarDay ? 1 : 0.7,
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

            {userProfile?.accountability_mode === 'journal' && (
              <div className="reflection-section" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ec4899', fontWeight: 'bold' }}>
                  Daily Reflection (Required for Journal Mode)
                </label>
                <textarea
                  value={dailyReflections[selectedDay] || ''}
                  onChange={(e) => saveReflection(selectedDay, e.target.value)}
                  disabled={selectedDay !== activeCalendarDay}
                  placeholder={selectedDay === activeCalendarDay ? "Write your thoughts, struggles, or wins for today..." : "No reflection recorded for this day."}
                  rows="5"
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>
            )}

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

      {/* Fail Modal */}
      {hasFailed && (
        <div className="modal-overlay" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.95)' }}>
          <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'center', background: '#111827', border: '2px solid #ef4444', boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)' }}>
            <h2 style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem', fontWeight: '900', textTransform: 'uppercase' }}>Chain Broken</h2>
            <p style={{ fontSize: '1.2rem', color: 'white', marginBottom: '2rem', lineHeight: '1.6' }}>
              You had a zero-day on <strong>Day {failedDay}</strong>, and you had <strong>0 Free Passes</strong> left to save you. The universe doesn't pause, and neither does the calendar.
            </p>
            <button 
              onClick={handleStartOver}
              style={{ background: '#ef4444', color: 'white', padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}
            >
              Accept Failure & Start Over
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

      {/* Reward Claim Modal */}
      {rewardModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setRewardModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'left', background: '#111827', border: '1px solid #ec4899', boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.3)' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRewardModal(false)}>&times;</button>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: '800' }}>
              Claim Your Personal Song
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              You've conquered the challenge. As promised, The Winks are going to write a song specifically for you. Fill out the details below to send your request directly to the band!
            </p>

            <form onSubmit={handleRewardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 'bold' }}>What type of song do you want? (Genre/Vibe)</label>
                <input 
                  type="text" 
                  value={songType}
                  onChange={(e) => setSongType(e.target.value)}
                  placeholder="e.g. Acoustic, Rock, Upbeat Pop, Moody Indie..."
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 'bold' }}>What do you want the song to be about?</label>
                <textarea 
                  value={songTopic}
                  onChange={(e) => setSongTopic(e.target.value)}
                  placeholder="Tell The Winks the story or message you want captured in your song..."
                  required
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit"
                style={{ width: '100%', marginTop: '1rem', padding: '1rem', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Send Request to The Winks
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracker;
