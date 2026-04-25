/**
 * LifeLink - Loading Component
 * Animated loading spinner with blood drop pulse
 */

import React from 'react';

function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-container" id="loading-indicator">
      <div className="loading-blood-drop">
        <span>🩸</span>
      </div>
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>

      <style>{`
        .loading-blood-drop {
          font-size: 2.5rem;
          animation: heartbeat 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

export default Loading;
