import React from 'react';
import stage1 from '../assets/mascot/stage1.png';
import stage2 from '../assets/mascot/stage2.png';
import stage3 from '../assets/mascot/stage3.png';
import stage4 from '../assets/mascot/stage4.png';

function Mascot({ unlockedDays, isTodayCompleted }) {
  let currentStageImage = stage1;
  let stageName = "The Ember";
  let description = "Complete a task to build momentum.";

  if (unlockedDays >= 51) {
    currentStageImage = stage4;
    stageName = "The Majestic Phoenix";
    description = "Unstoppable momentum. Do not break the chain.";
  } else if (unlockedDays >= 31) {
    currentStageImage = stage3;
    stageName = "The Firebird";
    description = "Your momentum is burning bright.";
  } else if (unlockedDays >= 11) {
    currentStageImage = stage2;
    stageName = "The Glowing Egg";
    description = "Momentum is building. Keep going.";
  }

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Your Companion</h2>
      
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img 
          src={currentStageImage} 
          alt={stageName} 
          style={{ 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `4px solid ${isTodayCompleted ? '#10b981' : '#ec4899'}`, 
            boxShadow: `0 0 30px ${isTodayCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`,
            transition: 'all 0.5s ease'
          }} 
        />
      </div>
      
      <h3 style={{ fontSize: '1.5rem', color: '#ec4899', marginTop: '1.5rem', fontWeight: 'bold' }}>{stageName}</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>{description}</p>
      
      <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', height: '16px', width: '250px', margin: '1.5rem auto 0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ 
          height: '100%', 
          width: isTodayCompleted ? '100%' : '30%', 
          background: isTodayCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.8s ease-in-out'
        }}></div>
      </div>
      <small style={{ display: 'block', marginTop: '0.5rem', color: isTodayCompleted ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
        {isTodayCompleted ? "Fed today! Maximum Momentum." : "Hungry. Complete a task to feed."}
      </small>
    </div>
  );
}

export default Mascot;
