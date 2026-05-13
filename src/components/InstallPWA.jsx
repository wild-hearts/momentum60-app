import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if it's already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i);
    
    if (isIOSDevice && isSafari) {
      setIsIOS(true);
    }

    // Detect Chrome/Android PWA prompt
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClickInstall = async () => {
    if (!promptInstall) return;
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
  };

  if (isStandalone || !showBanner) return null;
  if (!supportsPWA && !isIOS) return null;

  return (
    <div style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', position: 'sticky', top: 0, zIndex: 9999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'white', color: '#ec4899', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
          <Download size={20} />
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '0.9rem' }}>Install Momentum 60</strong>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            {isIOS ? "Tap Share then 'Add to Home Screen'" : "Add to your home screen"}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {supportsPWA && (
          <button 
            onClick={onClickInstall}
            style={{ background: 'white', color: '#ec4899', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Install
          </button>
        )}
        <button onClick={() => setShowBanner(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default InstallPWA;
