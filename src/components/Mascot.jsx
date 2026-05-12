import React from 'react';
import { mascotLore } from '../data/mascotLore';
import stage01 from '../assets/mascot/v2/phoenix_v2_stage01.png';
import stage02 from '../assets/mascot/v2/phoenix_v2_stage02.png';
import stage03 from '../assets/mascot/v2/phoenix_v2_stage03.png';
import stage04 from '../assets/mascot/v2/phoenix_v2_stage04.png';
import stage05 from '../assets/mascot/v2/phoenix_v2_stage05.png';
import stage06 from '../assets/mascot/v2/phoenix_v2_stage06.png';
import stage07 from '../assets/mascot/v2/phoenix_v2_stage07.png';
import stage08 from '../assets/mascot/v2/phoenix_v2_stage08.png';
import stage09 from '../assets/mascot/v2/phoenix_v2_stage09.png';
import stage10 from '../assets/mascot/v2/phoenix_v2_stage10.png';
import stage11 from '../assets/mascot/v2/phoenix_v2_stage11.png';
import stage12 from '../assets/mascot/v2/phoenix_v2_stage12.png';
import stage13 from '../assets/mascot/v2/phoenix_v2_stage13.png';
import stage14 from '../assets/mascot/v2/phoenix_v2_stage14.png';
import stage15 from '../assets/mascot/v2/phoenix_v2_stage15.png';
import stage16 from '../assets/mascot/v2/phoenix_v2_stage16.png';
import stage17 from '../assets/mascot/v2/phoenix_v2_stage17.png';
import stage18 from '../assets/mascot/v2/phoenix_v2_stage18.png';
import stage19 from '../assets/mascot/v2/phoenix_v2_stage19.png';
import stage20 from '../assets/mascot/v2/phoenix_v2_stage20.png';

const STAGE_IMAGES = [
  stage01, stage02, stage03, stage04, stage05,
  stage06, stage07, stage08, stage09, stage10,
  stage11, stage12, stage13, stage14, stage15,
  stage16, stage17, stage18, stage19, stage20
];

const STAGE_NAMES = [
  "The Spark", "The Ember", "The Kindle", "The Flame", "The Blaze",
  "Hatching Phoenix", "Neon Chick", "Growing Firebird", "Juvenile Firebird", "First Flight",
  "Neon Trail", "Glowing Perch", "Extended Wings", "Soaring Light", "Majestic Perch",
  "Radiant Heat", "Storm Illuminator", "Fierce Gaze", "Dive Bomb", "The Ultimate Phoenix"
];

function Mascot({ unlockedDays, isTodayCompleted }) {
  // Map unlocked days to a stage.
  // We want growth every 3 days. So Day 1-3 is Stage 1, Day 4-6 is Stage 2, etc.
  // At Day 58-60, it will be Stage 20.
  const stageIndex = Math.min(Math.max(Math.ceil(unlockedDays / 3) - 1, 0), 19);
  
  const currentStageImage = STAGE_IMAGES[stageIndex];
  const stageName = STAGE_NAMES[stageIndex];

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
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem', fontStyle: 'italic', padding: '0 1rem' }}>
        "{mascotLore[stageIndex]}"
      </p>
      
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
