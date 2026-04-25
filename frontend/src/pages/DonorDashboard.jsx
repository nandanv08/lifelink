/**
 * LifeLink - Donor Dashboard Page
 * Dedicated dashboard for donors to manage health records,
 * last donation dates, and toggle Active Availability
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { donorAPI } from '../services/api';
import Loading from '../components/Loading';

function DonorDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isDonor, user, showNotification } = useApp();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [healthForm, setHealthForm] = useState({
    hemoglobin: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
    pulseRate: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Donor Dashboard | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  const fetchDonorProfile = useCallback(async () => {
    if (!user?.donorProfile) return;
    try {
      setLoading(true);
      const result = await donorAPI.getProfile(user.donorProfile);
      if (result.success) setDonor(result.data);
    } catch (err) {
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !isDonor) {
      navigate('/login');
      return;
    }
    if (!user?.donorProfile) {
      setLoading(false);
      return;
    }
    fetchDonorProfile();
  }, [isAuthenticated, isDonor, user, navigate, fetchDonorProfile]);

  const toggleAvailability = async () => {
    if (!donor) return;
    try {
      await donorAPI.toggleAvailability(donor._id);
      showNotification(`Availability ${donor.isAvailable ? 'disabled' : 'enabled'}`, 'success');
      fetchDonorProfile();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleHealthSubmit = async (e) => {
    e.preventDefault();
    if (!donor) return;
    try {
      setSubmitting(true);
      await donorAPI.addHealthRecord(donor._id, {
        hemoglobin: healthForm.hemoglobin ? parseFloat(healthForm.hemoglobin) : undefined,
        bloodPressureSystolic: healthForm.bloodPressureSystolic ? parseInt(healthForm.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: healthForm.bloodPressureDiastolic ? parseInt(healthForm.bloodPressureDiastolic) : undefined,
        pulseRate: healthForm.pulseRate ? parseInt(healthForm.pulseRate) : undefined,
        notes: healthForm.notes
      });
      showNotification('Health record added!', 'success');
      setHealthForm({ hemoglobin: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', pulseRate: '', notes: '' });
      fetchDonorProfile();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading your dashboard..." />;

  if (!user?.donorProfile) {
    return (
      <div className="page-enter">
        <div className="container section">
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>No Donor Profile Linked</h3>
            <p>Register as a donor first, then link your profile to access the dashboard.</p>
            <a href="/register" className="btn btn-primary">Register as Donor</a>
          </div>
        </div>
      </div>
    );
  }

  const getDaysUntilEligible = () => {
    if (!donor?.lastDonationDate) return 0;
    const days = Math.floor((Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - days);
  };

  const daysRemaining = getDaysUntilEligible();
  const isEligible = daysRemaining === 0;

  return (
    <div className="page-enter">
      <div className="container section">
        <div className="dd-layout">
          {/* Sidebar */}
          <div className="dd-sidebar">
            <div className="dd-profile-card">
              <div className="dd-avatar" style={{ background: donor?.isAvailable ? 'var(--success)' : 'var(--gray-400)' }}>
                {donor?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <h3>{donor?.name}</h3>
              <span className="badge badge-blood">{donor?.bloodGroup}</span>
              <div className="dd-meta">
                <span>📍 {donor?.city}{donor?.state ? `, ${donor.state}` : ''}</span>
                <span>📞 {donor?.phone}</span>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="dd-avail-card">
              <h4>Active Availability</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '12px' }}>
                When enabled, hospitals can find you for blood requests.
              </p>
              <button
                className={`dd-toggle ${donor?.isAvailable ? 'dd-toggle-on' : 'dd-toggle-off'}`}
                onClick={toggleAvailability}
              >
                <span className="dd-toggle-circle"></span>
                <span>{donor?.isAvailable ? 'Available' : 'Unavailable'}</span>
              </button>
            </div>

            <nav className="dd-nav">
              <button className={`dd-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
              <button className={`dd-nav-item ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>💊 Health Records</button>
              <button className={`dd-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📋 Donation History</button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="dd-content">
            {activeTab === 'overview' && (
              <div className="dd-overview">
                <h2>Dashboard Overview</h2>
                <div className="dd-stats-grid">
                  <div className="dd-stat-card">
                    <div className="dd-stat-icon">🩸</div>
                    <div className="dd-stat-val">{donor?.totalDonations || 0}</div>
                    <div className="dd-stat-label">Total Donations</div>
                  </div>
                  <div className="dd-stat-card">
                    <div className="dd-stat-icon">{isEligible ? '✅' : '⏳'}</div>
                    <div className="dd-stat-val" style={{ color: isEligible ? 'var(--success)' : 'var(--warning)' }}>
                      {isEligible ? 'Eligible' : `${daysRemaining}d`}
                    </div>
                    <div className="dd-stat-label">{isEligible ? 'Ready to Donate' : 'Days Until Eligible'}</div>
                  </div>
                  <div className="dd-stat-card">
                    <div className="dd-stat-icon">⚡</div>
                    <div className="dd-stat-val">{donor?.responseRate || 100}%</div>
                    <div className="dd-stat-label">Response Rate</div>
                  </div>
                  <div className="dd-stat-card">
                    <div className="dd-stat-icon">💪</div>
                    <div className="dd-stat-val">{donor?.weight || '--'} kg</div>
                    <div className="dd-stat-label">Weight</div>
                  </div>
                </div>

                {/* Eligibility status */}
                <div className={`dd-elig-banner ${isEligible ? 'dd-elig-yes' : 'dd-elig-no'}`}>
                  <div className="dd-elig-icon">{isEligible ? '🎉' : '📅'}</div>
                  <div>
                    <strong>{isEligible ? 'You are eligible to donate blood!' : `${daysRemaining} days until your next donation window`}</strong>
                    <p>{isEligible 
                      ? 'Your last donation was more than 90 days ago. Thank you for being available!' 
                      : `Last donation: ${donor?.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}. You must wait 90 days between donations.`
                    }</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="dd-info-grid">
                  <div className="dd-info-item"><span>Age</span><strong>{donor?.age} years</strong></div>
                  <div className="dd-info-item"><span>Gender</span><strong>{donor?.gender}</strong></div>
                  <div className="dd-info-item"><span>Verified</span><strong>{donor?.isVerified ? '✅ Yes' : '❌ Pending'}</strong></div>
                  <div className="dd-info-item"><span>Last Active</span><strong>{donor?.lastActive ? new Date(donor.lastActive).toLocaleDateString() : 'N/A'}</strong></div>
                </div>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="dd-health">
                <h2>Health Records</h2>
                <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-lg)' }}>Track your health metrics to ensure donation eligibility.</p>

                {/* Add Health Record Form */}
                <form className="dd-health-form" onSubmit={handleHealthSubmit}>
                  <h4>Add New Record</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Hemoglobin (g/dL)</label>
                      <input type="number" step="0.1" className="form-input" value={healthForm.hemoglobin}
                        onChange={e => setHealthForm(p => ({ ...p, hemoglobin: e.target.value }))} placeholder="12.5 - 17.0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pulse Rate (bpm)</label>
                      <input type="number" className="form-input" value={healthForm.pulseRate}
                        onChange={e => setHealthForm(p => ({ ...p, pulseRate: e.target.value }))} placeholder="60 - 100" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">BP Systolic (mmHg)</label>
                      <input type="number" className="form-input" value={healthForm.bloodPressureSystolic}
                        onChange={e => setHealthForm(p => ({ ...p, bloodPressureSystolic: e.target.value }))} placeholder="100 - 140" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">BP Diastolic (mmHg)</label>
                      <input type="number" className="form-input" value={healthForm.bloodPressureDiastolic}
                        onChange={e => setHealthForm(p => ({ ...p, bloodPressureDiastolic: e.target.value }))} placeholder="60 - 90" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input type="text" className="form-input" value={healthForm.notes}
                      onChange={e => setHealthForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : '+ Add Health Record'}
                  </button>
                </form>

                {/* Records Table */}
                {donor?.healthRecords?.length > 0 ? (
                  <div className="dd-records-list">
                    <h4>Previous Records</h4>
                    {[...donor.healthRecords].reverse().map((rec, i) => (
                      <div key={i} className="dd-record-card">
                        <div className="dd-record-date">{new Date(rec.date).toLocaleDateString()}</div>
                        <div className="dd-record-grid">
                          {rec.hemoglobin && <div><span>Hemoglobin</span><strong>{rec.hemoglobin} g/dL</strong></div>}
                          {rec.bloodPressureSystolic && <div><span>Blood Pressure</span><strong>{rec.bloodPressureSystolic}/{rec.bloodPressureDiastolic} mmHg</strong></div>}
                          {rec.pulseRate && <div><span>Pulse</span><strong>{rec.pulseRate} bpm</strong></div>}
                        </div>
                        {rec.notes && <div className="dd-record-notes">{rec.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                    <div className="empty-state-icon">📋</div>
                    <h3>No health records yet</h3>
                    <p>Add your first health record above to start tracking.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="dd-history">
                <h2>Donation History</h2>
                {donor?.donationHistory?.length > 0 ? (
                  <div className="dd-records-list">
                    {donor.donationHistory.map((d, i) => (
                      <div key={i} className="dd-record-card">
                        <div className="dd-record-date">{new Date(d.date).toLocaleDateString()}</div>
                        <div className="dd-record-grid">
                          <div><span>Hospital</span><strong>{d.hospital || 'N/A'}</strong></div>
                          <div><span>City</span><strong>{d.city || 'N/A'}</strong></div>
                          <div><span>Units</span><strong>{d.unitsdonated || 1}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                    <div className="empty-state-icon">🩸</div>
                    <h3>No donation history yet</h3>
                    <p>Your completed donations will appear here. Total donations: <strong>{donor?.totalDonations || 0}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dd-layout { display: flex; gap: var(--space-xl); min-height: 70vh; }
        .dd-sidebar { width: 300px; display: flex; flex-direction: column; gap: var(--space-md); flex-shrink: 0; }
        .dd-content { flex: 1; }
        .dd-profile-card {
          background: var(--white); border-radius: var(--radius-xl); padding: var(--space-xl);
          text-align: center; box-shadow: var(--shadow-md); border: 1px solid var(--gray-100);
        }
        .dd-avatar {
          width: 72px; height: 72px; border-radius: 50%; margin: 0 auto var(--space-md);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1.25rem; font-weight: 800; font-family: var(--font-primary);
        }
        .dd-profile-card h3 { margin-bottom: 8px; font-size: 1.125rem; }
        .dd-meta { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; font-size: 0.8125rem; color: var(--gray-500); }
        .dd-avail-card {
          background: var(--white); border-radius: var(--radius-lg); padding: var(--space-lg);
          box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100);
        }
        .dd-avail-card h4 { margin: 0 0 4px; font-size: 0.9375rem; }
        .dd-toggle {
          display: flex; align-items: center; gap: 12px; padding: 8px 16px;
          border-radius: var(--radius-full); font-weight: 600; font-size: 0.875rem;
          transition: all var(--transition-base); width: 100%; justify-content: center;
        }
        .dd-toggle-on { background: var(--success-light); color: var(--success); }
        .dd-toggle-off { background: var(--gray-100); color: var(--gray-500); }
        .dd-toggle-circle {
          width: 12px; height: 12px; border-radius: 50%;
        }
        .dd-toggle-on .dd-toggle-circle { background: var(--success); animation: pulse-badge 2s infinite; }
        .dd-toggle-off .dd-toggle-circle { background: var(--gray-400); }

        .dd-nav { display: flex; flex-direction: column; gap: 4px; }
        .dd-nav-item {
          text-align: left; padding: 12px 16px; background: var(--white); border: 1px solid var(--gray-100);
          border-radius: var(--radius-md); font-weight: 600; color: var(--gray-600);
          transition: all var(--transition-fast); font-size: 0.875rem;
        }
        .dd-nav-item:hover { border-color: var(--gray-300); color: var(--gray-900); }
        .dd-nav-item.active { border-color: var(--primary); color: var(--primary); background: var(--primary-50); }

        .dd-overview h2, .dd-health h2, .dd-history h2 { margin-bottom: var(--space-lg); }
        .dd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
        .dd-stat-card {
          background: var(--white); border: 1px solid var(--gray-100); border-radius: var(--radius-lg);
          padding: var(--space-lg); text-align: center; box-shadow: var(--shadow-xs);
          transition: all var(--transition-fast);
        }
        .dd-stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .dd-stat-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .dd-stat-val { font-size: 1.75rem; font-weight: 800; font-family: var(--font-primary); color: var(--gray-900); }
        .dd-stat-label { font-size: 0.75rem; color: var(--gray-500); margin-top: 4px; }

        .dd-elig-banner {
          display: flex; align-items: flex-start; gap: 16px; padding: var(--space-lg);
          border-radius: var(--radius-lg); margin-bottom: var(--space-xl);
        }
        .dd-elig-yes { background: var(--success-light); border: 1px solid rgba(5,150,105,0.2); }
        .dd-elig-no { background: var(--warning-light); border: 1px solid rgba(217,119,6,0.2); }
        .dd-elig-icon { font-size: 1.75rem; flex-shrink: 0; }
        .dd-elig-banner strong { display: block; margin-bottom: 4px; color: var(--gray-800); }
        .dd-elig-banner p { margin: 0; font-size: 0.875rem; color: var(--gray-600); }

        .dd-info-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md);
          background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-lg);
        }
        .dd-info-item { display: flex; flex-direction: column; gap: 4px; }
        .dd-info-item span { font-size: 0.75rem; color: var(--gray-500); }
        .dd-info-item strong { font-size: 0.9375rem; color: var(--gray-800); }

        .dd-health-form {
          background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);
          padding: var(--space-lg); margin-bottom: var(--space-xl);
        }
        .dd-health-form h4 { margin: 0 0 var(--space-md); }
        .dd-records-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .dd-records-list h4 { margin-bottom: var(--space-sm); }
        .dd-record-card {
          background: var(--white); border: 1px solid var(--gray-100); border-radius: var(--radius-md);
          padding: var(--space-md); box-shadow: var(--shadow-xs);
        }
        .dd-record-date { font-size: 0.75rem; color: var(--gray-500); font-weight: 600; margin-bottom: 8px; }
        .dd-record-grid { display: flex; gap: var(--space-xl); flex-wrap: wrap; }
        .dd-record-grid > div { display: flex; flex-direction: column; gap: 2px; }
        .dd-record-grid span { font-size: 0.6875rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; }
        .dd-record-grid strong { font-size: 0.9375rem; color: var(--gray-800); }
        .dd-record-notes { margin-top: 8px; font-size: 0.8125rem; color: var(--gray-500); font-style: italic; }

        @media (max-width: 900px) {
          .dd-layout { flex-direction: column; }
          .dd-sidebar { width: 100%; }
          .dd-stats-grid, .dd-info-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .dd-stats-grid { grid-template-columns: 1fr 1fr; }
          .dd-info-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

export default DonorDashboard;
