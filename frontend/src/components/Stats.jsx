/**
 * LifeLink - Stats Component
 * Animated counter statistics with auto-refresh simulation
 */

import React, { useState, useEffect, useRef } from 'react';
import { analyticsAPI } from '../services/api';

function Stats() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    livesSaved: 0,
    completedRequests: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Fetch analytics
  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds for real-time simulation
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const result = await analyticsAPI.getAll();
      if (result.success) {
        setStats(result.data.overview);
      }
    } catch (error) {
      // Use fallback demo data if API is unavailable
      setStats({
        totalDonors: 248,
        activeDonors: 186,
        livesSaved: 542,
        completedRequests: 89
      });
    }
  };

  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setIsVisible(true);
          setAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  const statItems = [
    { value: stats.totalDonors, label: 'Registered Donors', icon: '👥', color: '#DC2626' },
    { value: stats.activeDonors, label: 'Active Donors', icon: '💪', color: '#059669' },
    { value: stats.livesSaved, label: 'Lives Saved', icon: '❤️', color: '#DC2626' },
    { value: stats.completedRequests, label: 'Requests Fulfilled', icon: '✅', color: '#2563EB' }
  ];

  return (
    <section className="stats-section" ref={sectionRef} id="stats-section">
      <div className="container">
        <div className="stats-grid">
          {statItems.map((item, index) => (
            <div
              key={index}
              className={`stat-card ${isVisible ? 'stat-visible' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="stat-icon-wrap" style={{ background: `${item.color}12` }}>
                <span className="stat-icon">{item.icon}</span>
              </div>
              <div className="stat-value" style={{ color: item.color }}>
                <AnimatedNumber value={item.value} isVisible={isVisible} delay={index * 150} />
                <span className="stat-plus">+</span>
              </div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-section {
          padding: var(--space-3xl) 0;
          background: var(--white);
          position: relative;
        }

        .stats-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gray-200), transparent);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
        }

        .stat-card {
          text-align: center;
          padding: var(--space-xl) var(--space-lg);
          border-radius: var(--radius-xl);
          background: var(--gray-50);
          border: 1px solid var(--gray-100);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stat-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--gray-200);
        }

        .stat-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-md);
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-value {
          font-family: var(--font-primary);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-plus {
          font-size: 1.5rem;
          opacity: 0.6;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-500);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-value {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-md);
          }

          .stat-card {
            padding: var(--space-lg) var(--space-md);
          }
        }
      `}</style>
    </section>
  );
}

/**
 * AnimatedNumber - Counts up from 0 to target value
 */
function AnimatedNumber({ value, isVisible, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible || !value) return;

    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        // Easing: fast start, slow end
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.floor(eased * value);
        setDisplayValue(current);

        if (step >= steps) {
          setDisplayValue(value);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default Stats;
