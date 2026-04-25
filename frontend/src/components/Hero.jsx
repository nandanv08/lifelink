/**
 * LifeLink - Hero Section Component
 * Full-width hero banner with animated blood drops, impactful messaging, and CTA buttons
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  const [currentStat, setCurrentStat] = useState(0);
  const stats = [
    { label: 'Every 2 seconds', desc: 'someone needs blood' },
    { label: '1 donation', desc: 'can save up to 3 lives' },
    { label: '38%', desc: 'of population is eligible to donate' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero" id="hero-section">
      {/* Animated Background */}
      <div className="hero-bg">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
        {/* Floating blood drops */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="hero-drop" style={{
            left: `${15 + i * 15}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${3 + i * 0.5}s`,
            fontSize: `${1.5 + Math.random()}rem`,
            opacity: 0.15 + Math.random() * 0.15
          }}>
            🩸
          </div>
        ))}
      </div>

      <div className="hero-content container">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Saving Lives Since 2024
          </div>

          <h1 className="hero-title">
            Donate <span className="hero-title-accent">Blood</span>,
            <br />Save <span className="hero-title-accent">Lives</span>
          </h1>

          <p className="hero-subtitle">
            LifeLink connects blood donors with those in need through intelligent matching,
            making every donation count. Join thousands of heroes making a difference.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
              <span>❤️</span> Become a Donor
            </Link>
            <Link to="/emergency" className="btn btn-secondary btn-lg" id="hero-emergency-btn">
              <span>🚨</span> Need Blood Urgently
            </Link>
          </div>

          {/* Rotating fact */}
          <div className="hero-fact" key={currentStat}>
            <div className="hero-fact-icon">💡</div>
            <div>
              <strong>{stats[currentStat].label}</strong> {stats[currentStat].desc}
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-visual-card hvc-1">
              <div className="hvc-icon">🩸</div>
              <div className="hvc-label">O+</div>
              <div className="hvc-status">Available</div>
            </div>
            <div className="hero-visual-card hvc-2">
              <div className="hvc-icon">💓</div>
              <div className="hvc-label">A+</div>
              <div className="hvc-status">Matched</div>
            </div>
            <div className="hero-visual-card hvc-3">
              <div className="hvc-icon">✅</div>
              <div className="hvc-label">B+</div>
              <div className="hvc-status">Donated</div>
            </div>
          </div>
          <div className="hero-pulse-ring"></div>
          <div className="hero-pulse-ring hero-pulse-ring-2"></div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          overflow: hidden;
          background: var(--white);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(254, 226, 226, 0.5) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(254, 202, 202, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(254, 242, 242, 0.4) 0%, transparent 50%);
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: radial-gradient(var(--primary) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .hero-drop {
          position: absolute;
          animation: float linear infinite;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3xl);
          align-items: center;
          padding-top: var(--space-2xl);
          padding-bottom: var(--space-2xl);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: var(--primary-50);
          color: var(--primary);
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          margin-bottom: var(--space-xl);
          border: 1px solid var(--primary-100);
        }

        .hero-badge-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse-badge 2s infinite;
        }

        .hero-title {
          font-family: var(--font-primary);
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          color: var(--gray-900);
          margin-bottom: var(--space-lg);
          letter-spacing: -1.5px;
        }

        .hero-title-accent {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.1875rem;
          color: var(--gray-500);
          line-height: 1.7;
          margin-bottom: var(--space-xl);
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
        }

        .hero-fact {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          font-size: 0.9375rem;
          color: var(--gray-600);
          max-width: 420px;
          animation: fadeIn 0.6s ease-out;
          box-shadow: var(--shadow-sm);
        }

        .hero-fact-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .hero-fact strong {
          color: var(--gray-900);
        }

        /* Visual Side */
        .hero-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .hero-card-stack {
          position: relative;
          width: 300px;
          height: 380px;
        }

        .hero-visual-card {
          position: absolute;
          width: 220px;
          padding: 24px;
          background: var(--white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--gray-100);
          text-align: center;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero-visual-card:hover {
          transform: scale(1.05) !important;
          box-shadow: var(--shadow-2xl);
        }

        .hvc-1 {
          top: 0;
          left: 0;
          z-index: 3;
          animation: fadeInUp 0.8s ease-out;
        }

        .hvc-2 {
          top: 60px;
          left: 80px;
          z-index: 2;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hvc-3 {
          top: 120px;
          left: 40px;
          z-index: 1;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .hvc-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .hvc-label {
          font-family: var(--font-primary);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 6px;
        }

        .hvc-status {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--success);
          padding: 4px 12px;
          background: var(--success-light);
          border-radius: var(--radius-full);
          display: inline-block;
        }

        .hvc-2 .hvc-status {
          color: var(--info);
          background: var(--info-light);
        }

        .hvc-3 .hvc-status {
          color: var(--primary);
          background: var(--primary-50);
        }

        .hero-pulse-ring {
          position: absolute;
          width: 350px;
          height: 350px;
          border: 2px solid rgba(220, 38, 38, 0.1);
          border-radius: 50%;
          animation: pulse-ring 3s ease-out infinite;
        }

        .hero-pulse-ring-2 {
          width: 450px;
          height: 450px;
          animation-delay: 1s;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-title {
            font-size: 3rem;
          }

          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-fact {
            margin: 0 auto;
          }

          .hero-visual {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.25rem;
            letter-spacing: -1px;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
