import React from 'react';
import './InstallInstructions.css';

function InstallInstructions() {
  return (
    <div className="install-container">
      <h1>How to Install Momentum 60</h1>
      <p className="install-intro">
        Momentum 60 is a Progressive Web App (PWA). This means you can install it directly to your phone or tablet's home screen, just like a regular app from the app store.
      </p>

      <div className="install-grid">
        <div className="install-card">
          <h2>🍏 iOS (iPhone & iPad)</h2>
          <ol>
            <li>Open this page in <strong>Safari</strong>.</li>
            <li>Tap the <strong>Share</strong> button at the bottom of the screen (the square with an arrow pointing up).</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
            <li>Tap <strong>"Add"</strong> in the top right corner.</li>
            <li>The Momentum 60 icon will now appear on your home screen!</li>
          </ol>
        </div>

        <div className="install-card">
          <h2>🤖 Android</h2>
          <ol>
            <li>Open this page in <strong>Chrome</strong>.</li>
            <li>Tap the <strong>Menu</strong> icon (3 dots in the top right corner).</li>
            <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
            <li>Follow the prompt to add it.</li>
            <li>The Momentum 60 icon will now appear on your home screen!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default InstallInstructions;
