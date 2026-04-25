/**
 * LifeLink - Hospital Dashboard Page
 * Allows verified hospitals to broadcast emergency blood needs
 * and manage their blood requests
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { requestAPI } from '../services/api';
import Loading from '../components/Loading';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function HospitalDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isHospital, user, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState('broadcast');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '', patientAge: '', bloodGroup: '', unitsNeeded: '1',
    urgencyLevel: 'urgent', notes: '', isEmergency: false
  });

  useEffect(() => {
    document.title = 'Hospital Dashboard | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isHospital) {
      navigate('/login');
    }
  }, [isAuthenticated, isHospital, navigate]);

  const fetchHospitalRequests = useCallback(async () => {
    try {
      setLoading(true);
      const result = await requestAPI.getAll({ limit: 50 });
      if (result.success) {
        // Filter to show only requests from this hospital
        const hospitalName = user?.hospitalName;
        const filtered = hospitalName
          ? result.data.filter(r => r.hospital === hospitalName)
          : result.data;
        setRequests(filtered.length > 0 ? filtered : result.data.slice(0, 10));
      }
    } catch (err) {
      showNotification('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'manage') fetchHospitalRequests();
  }, [activeTab, fetchHospitalRequests]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const requestData = {
        ...formData,
        patientAge: parseInt(formData.patientAge),
        unitsNeeded: parseInt(formData.unitsNeeded),
        hospital: user?.hospitalName || 'Hospital',
        city: user?.hospitalCity || '',
        requesterName: user?.name || 'Hospital Admin',
        requesterPhone: user?.phone || '0000000000',
        requesterEmail: user?.email || ''
      };

      const result = await requestAPI.create(requestData);
      if (result.success) {
        showNotification(`🚨 Emergency broadcast sent! ${result.matchedDonorsCount || 0} compatible donors notified.`, 'success');
        setFormData({
          patientName: '', patientAge: '', bloodGroup: '', unitsNeeded: '1',
          urgencyLevel: 'urgent', notes: '', isEmergency: false
        });
        setActiveTab('manage');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = user?.isVerified;

  return (
    <div className="page-enter">
      <div className="container section">
        {/* Header */}
        <div className="hd-header">
          <div className="hd-header-info">
            <div className="hd-hospital-icon">🏥</div>
            <div>
              <h1>{user?.hospitalName || 'Hospital Dashboard'}</h1>
              <p className="hd-location">📍 {user?.hospitalCity || 'City'}{user?.hospitalState ? `, ${user.hospitalState}` : ''}</p>
            </div>
          </div>
          <div className="hd-status">
            {isVerified ? (
              <span className="badge badge-available">✅ Verified</span>
            ) : (
              <span className="badge badge-pending">⏳ Verification Pending</span>
            )}
          </div>
        </div>

        {!isVerified && (
          <div className="hd-verification-banner">
            <span>⚠️</span>
            <div>
              <strong>Account Pending Verification</strong>
              <p>Your hospital registration is under review by our admin team. You can still create blood requests, but they will be marked as unverified. Full broadcast capabilities will be enabled once verified.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="hd-tabs">
          <button className={`hd-tab ${activeTab === 'broadcast' ? 'hd-tab-active' : ''}`} onClick={() => setActiveTab('broadcast')}>
            🚨 Broadcast Need
          </button>
          <button className={`hd-tab ${activeTab === 'manage' ? 'hd-tab-active' : ''}`} onClick={() => setActiveTab('manage')}>
            📋 Manage Requests
          </button>
        </div>

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="hd-broadcast">
            <div className="hd-broadcast-header">
              <h2>🚨 Emergency Blood Request</h2>
              <p>Broadcast an urgent blood need to all compatible donors in your area. Matched donors will be notified immediately.</p>
            </div>

            <form className="hd-broadcast-form" onSubmit={handleBroadcast}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Patient Name *</label>
                  <input type="text" className="form-input" name="patientName" value={formData.patientName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Patient Age *</label>
                  <input type="number" className="form-input" name="patientAge" value={formData.patientAge} onChange={handleChange} required min="0" max="120" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group Needed *</label>
                <div className="hd-bg-grid">
                  {BLOOD_GROUPS.map(bg => (
                    <label key={bg} className={`hd-bg-option ${formData.bloodGroup === bg ? 'hd-bg-active' : ''}`}>
                      <input type="radio" name="bloodGroup" value={bg} checked={formData.bloodGroup === bg} onChange={handleChange} style={{ display: 'none' }} />
                      <span>{bg}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Units Needed *</label>
                  <input type="number" className="form-input" name="unitsNeeded" value={formData.unitsNeeded} onChange={handleChange} min="1" max="10" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Urgency Level *</label>
                  <select className="form-select" name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange}>
                    <option value="normal">Normal (24-48 hrs)</option>
                    <option value="urgent">Urgent (12 hrs)</option>
                    <option value="critical">Critical (Immediate)</option>
                  </select>
                </div>
              </div>

              {formData.urgencyLevel === 'critical' && (
                <div className="form-group">
                  <label className="form-checkbox">
                    <input type="checkbox" name="isEmergency" checked={formData.isEmergency} onChange={handleChange} />
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Flag as EMERGENCY — Alert all matched donors immediately</span>
                  </label>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-textarea" name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Surgery details, special requirements..." />
              </div>

              <button type="submit" className="btn btn-danger btn-lg" style={{ width: '100%' }} disabled={submitting || !formData.bloodGroup}>
                {submitting ? 'Broadcasting...' : '🚨 Broadcast Emergency Request'}
              </button>
            </form>
          </div>
        )}

        {/* Manage Requests Tab */}
        {activeTab === 'manage' && (
          <div className="hd-manage">
            <h2>Your Blood Requests</h2>
            {loading ? (
              <Loading message="Loading requests..." />
            ) : requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No requests yet</h3>
                <p>Broadcast your first emergency blood request to get started.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('broadcast')}>Create Request</button>
              </div>
            ) : (
              <div className="hd-req-list">
                {requests.map(req => (
                  <div key={req._id} className={`hd-req-card ${req.urgencyLevel === 'critical' && req.status === 'pending' ? 'hd-req-critical' : ''}`}>
                    <div className="hd-req-header">
                      <div className="hd-req-blood">
                        <span className="hd-req-badge">{req.bloodGroup}</span>
                        <span>{req.unitsNeeded} Unit{req.unitsNeeded > 1 ? 's' : ''}</span>
                      </div>
                      <span className={`badge badge-${req.status}`}>
                        {req.status === 'pending' ? '🕒 Pending' : req.status === 'accepted' ? '⏳ Assigned' : req.status === 'completed' ? '✅ Completed' : '❌ Cancelled'}
                      </span>
                    </div>
                    <div className="hd-req-body">
                      <h4>{req.patientName}, {req.patientAge}y</h4>
                      <p>🏥 {req.hospital}, {req.city}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        Created: {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .hd-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md);
        }
        .hd-header-info { display: flex; align-items: center; gap: var(--space-md); }
        .hd-hospital-icon { font-size: 3rem; }
        .hd-header h1 { margin: 0; font-size: 1.75rem; }
        .hd-location { color: var(--gray-500); font-size: 0.9rem; margin: 4px 0 0; }
        .hd-verification-banner {
          display: flex; gap: 12px; padding: var(--space-lg); background: var(--warning-light);
          border: 1px solid rgba(217,119,6,0.2); border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
        }
        .hd-verification-banner strong { display: block; margin-bottom: 4px; }
        .hd-verification-banner p { margin: 0; font-size: 0.8125rem; color: var(--gray-600); }
        .hd-tabs {
          display: flex; gap: 8px; margin-bottom: var(--space-xl);
          border-bottom: 2px solid var(--gray-200); padding-bottom: 4px;
        }
        .hd-tab {
          padding: 12px 24px; background: transparent; color: var(--gray-500);
          font-weight: 600; font-size: 0.9375rem; border-radius: var(--radius-md) var(--radius-md) 0 0;
          transition: all var(--transition-fast);
        }
        .hd-tab:hover { color: var(--gray-800); background: var(--gray-50); }
        .hd-tab-active { color: var(--primary); border-bottom: 3px solid var(--primary); background: var(--primary-50); }
        .hd-broadcast-header { margin-bottom: var(--space-xl); }
        .hd-broadcast-header h2 { margin-bottom: 8px; }
        .hd-broadcast-header p { color: var(--gray-500); }
        .hd-broadcast-form {
          background: var(--white); padding: var(--space-xl); border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md); border: 1px solid var(--gray-100); max-width: 700px;
        }
        .hd-bg-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .hd-bg-option {
          padding: 14px; text-align: center; border: 2px solid var(--gray-200);
          border-radius: var(--radius-md); cursor: pointer; font-weight: 700;
          font-family: var(--font-primary); font-size: 1rem;
          transition: all var(--transition-fast);
        }
        .hd-bg-option:hover { border-color: var(--primary-200); background: var(--primary-50); }
        .hd-bg-active {
          border-color: var(--primary) !important; background: var(--primary) !important;
          color: var(--white) !important; box-shadow: var(--shadow-red);
        }
        .hd-manage h2 { margin-bottom: var(--space-lg); }
        .hd-req-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .hd-req-card {
          background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);
          padding: var(--space-md); box-shadow: var(--shadow-xs); transition: all var(--transition-fast);
        }
        .hd-req-card:hover { box-shadow: var(--shadow-md); }
        .hd-req-critical { border-left: 4px solid var(--danger); }
        .hd-req-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--gray-100);
        }
        .hd-req-blood { display: flex; align-items: center; gap: 12px; }
        .hd-req-badge {
          background: var(--primary); color: white; padding: 4px 12px;
          border-radius: var(--radius-sm); font-weight: bold; font-size: 1.1rem;
        }
        .hd-req-body h4 { margin: 0 0 4px; }
        .hd-req-body p { margin: 0 0 2px; font-size: 0.85rem; color: var(--gray-600); }
        @media (max-width: 768px) {
          .hd-bg-grid { grid-template-columns: repeat(4, 1fr); }
          .hd-tabs { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

export default HospitalDashboard;
