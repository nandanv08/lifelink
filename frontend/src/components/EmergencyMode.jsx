/**
 * LifeLink - Emergency Mode Component
 * Urgent blood need interface with instant donor filtering
 */

import React, { useState, useEffect } from 'react';
import { donorAPI } from '../services/api';
import DonorCard from './DonorCard';
import Loading from './Loading';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala'];

function EmergencyMode() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [compatibleGroups, setCompatibleGroups] = useState([]);

  const handleSearch = async () => {
    if (!selectedBloodGroup) return;

    try {
      setLoading(true);
      setSearched(true);
      const result = await donorAPI.emergency(selectedBloodGroup, city, state);

      if (result.success) {
        setDonors(result.data);
        setCompatibleGroups(result.compatibleGroups || []);
      }
    } catch (error) {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 15 seconds in emergency mode
  useEffect(() => {
    if (!searched || !selectedBloodGroup) return;
    const interval = setInterval(handleSearch, 15000);
    return () => clearInterval(interval);
  }, [searched, selectedBloodGroup, city, state]);

  return (
    <div className="emergency-mode" id="emergency-mode">
      {/* Emergency Header */}
      <div className="em-header">
        <div className="em-pulse"></div>
        <h2 className="em-title">
          <span className="em-siren">🚨</span>
          Urgent Blood Needed
        </h2>
        <p className="em-desc">
          Find available donors instantly. Results are sorted by priority and auto-refresh every 15 seconds.
        </p>
      </div>

      {/* Search Controls */}
      <div className="em-search-box">
        <div className="em-blood-select">
          <label className="form-label" style={{ color: 'var(--white)', marginBottom: '12px', display: 'block' }}>
            Select Blood Group Needed *
          </label>
          <div className="em-blood-grid">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                className={`em-bg-btn ${selectedBloodGroup === bg ? 'em-bg-active' : ''}`}
                onClick={() => setSelectedBloodGroup(bg)}
                id={`em-bg-${bg.replace('+', 'pos').replace('-', 'neg')}`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="em-city-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
          <select
            className="form-select em-city-input"
            value={state}
            onChange={(e) => setState(e.target.value)}
            id="em-state-input"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <option value="" style={{ color: 'var(--gray-900)' }}>Any State</option>
            {STATES.map(s => <option key={s} value={s} style={{ color: 'var(--gray-900)' }}>{s}</option>)}
          </select>
          <input
            type="text"
            className="form-input em-city-input"
            placeholder="Enter city (optional)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            id="em-city-input"
          />
          <button
            className="btn btn-lg em-search-btn"
            onClick={handleSearch}
            disabled={!selectedBloodGroup || loading}
            id="em-search-btn"
          >
            {loading ? '⏳ Searching...' : '🔍 Find Donors Now'}
          </button>
        </div>

        {compatibleGroups.length > 0 && (
          <div className="em-compat">
            Compatible groups: {compatibleGroups.map(g => (
              <span key={g} className="em-compat-badge">{g}</span>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div className="em-results">
          {loading ? (
            <Loading message="Searching for available donors..." />
          ) : donors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">😔</div>
              <h3>No matching donors found</h3>
              <p>Try a different blood group or remove the city filter to expand the search.</p>
            </div>
          ) : (
            <>
              <div className="em-results-header">
                <h3>🎯 {donors.length} Priority Donors Found</h3>
                <span className="em-live-badge">
                  <span className="em-live-dot"></span>
                  LIVE • Auto-refreshing
                </span>
              </div>

              <div className="em-results-grid">
                {donors.map((donor, index) => (
                  <div key={donor._id} className="em-card-wrap" style={{ animationDelay: `${index * 0.08}s` }}>
                    <DonorCard donor={donor} />
                    {donor.isExactMatch && (
                      <div className="em-exact-badge">Exact Match</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .emergency-mode {
          max-width: 1100px;
          margin: 0 auto;
        }

        .em-header {
          text-align: center;
          margin-bottom: var(--space-xl);
          position: relative;
        }

        .em-pulse {
          width: 80px;
          height: 80px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 50%;
          margin: 0 auto var(--space-md);
          animation: pulse-ring 2s ease-out infinite;
        }

        .em-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: var(--space-sm);
        }

        .em-siren {
          animation: heartbeat 1s infinite;
          display: inline-block;
        }

        .em-desc {
          color: var(--gray-500);
          max-width: 500px;
          margin: 0 auto;
        }

        .em-search-box {
          background: var(--primary-gradient);
          border-radius: var(--radius-2xl);
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
          box-shadow: var(--shadow-red-lg);
        }

        .em-blood-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
        }

        .em-bg-btn {
          padding: 14px 8px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.15);
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          font-family: var(--font-primary);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all var(--transition-fast);
        }

        .em-bg-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .em-bg-active {
          background: var(--white) !important;
          color: var(--primary) !important;
          border-color: var(--white) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px) scale(1.05);
        }

        .em-city-row {
          display: flex;
          gap: 12px;
          margin-top: var(--space-lg);
        }

        .em-city-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: transparent !important;
        }

        .em-search-btn {
          background: var(--white) !important;
          color: var(--primary) !important;
          font-weight: 700 !important;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .em-search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .em-compat {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: var(--space-md);
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.8);
          flex-wrap: wrap;
        }

        .em-compat-badge {
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.75rem;
        }

        .em-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
          gap: 12px;
        }

        .em-results-header h3 {
          font-size: 1.25rem;
        }

        .em-live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--success);
          background: var(--success-light);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .em-live-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse-badge 1.5s infinite;
        }

        .em-results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .em-card-wrap {
          position: relative;
          animation: fadeInUp 0.5s ease-out both;
        }

        .em-exact-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: var(--success);
          color: var(--white);
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .em-blood-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .em-city-row {
            flex-direction: column;
          }

          .em-results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default EmergencyMode;
