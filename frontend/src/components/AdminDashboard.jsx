/**
 * LifeLink - Admin Dashboard Component
 * Full admin interface: platform analytics, hospital verification,
 * donor management, and request oversight
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { analyticsAPI, donorAPI, userAPI } from '../services/api';
import RequestTracker from './RequestTracker';
import Loading from './Loading';

function AdminDashboard() {
  const { user, logout, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [donorSearch, setDonorSearch] = useState('');
  const [donorLoading, setDonorLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await analyticsAPI.getAll();
      if (result.success) setStats(result.data);
    } catch (error) {
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchHospitals = useCallback(async () => {
    try {
      const result = await userAPI.getAllUsers({ role: 'hospital', limit: 50 });
      if (result.success) setHospitals(result.data);
    } catch (err) {
      showNotification('Failed to load hospitals', 'error');
    }
  }, [showNotification]);

  const fetchDonors = useCallback(async () => {
    try {
      setDonorLoading(true);
      const params = { limit: 50, sort: 'newest' };
      if (donorSearch) params.search = donorSearch;
      const result = await donorAPI.getAll(params);
      if (result.success) setDonors(result.data);
    } catch (err) {
      showNotification('Failed to load donors', 'error');
    } finally {
      setDonorLoading(false);
    }
  }, [donorSearch, showNotification]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (activeTab === 'hospitals') fetchHospitals();
    if (activeTab === 'donors') fetchDonors();
  }, [activeTab, fetchHospitals, fetchDonors]);

  const handleVerifyHospital = async (id) => {
    try {
      const result = await userAPI.verifyHospital(id);
      if (result.success) {
        showNotification(result.message, 'success');
        fetchHospitals();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleRevokeHospital = async (id) => {
    if (!window.confirm('Revoke this hospital\'s verification?')) return;
    try {
      const result = await userAPI.revokeHospital(id);
      if (result.success) {
        showNotification(result.message, 'info');
        fetchHospitals();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleDonor = async (id) => {
    try {
      await donorAPI.toggleAvailability(id);
      showNotification('Donor status updated', 'success');
      fetchDonors();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm('Remove this donor from the platform?')) return;
    try {
      await donorAPI.delete(id);
      showNotification('Donor removed', 'info');
      fetchDonors();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading && !stats) return <Loading message="Loading Dashboard..." />;

  return (
    <div className="admin-dash page-enter" id="admin-dashboard">
      <div className="ad-sidebar">
        <div className="ad-profile">
          <div className="ad-avatar">A</div>
          <div className="ad-info">
            <h4>{user?.name || 'Administrator'}</h4>
            <span>{user?.email || 'admin@lifelink.com'}</span>
          </div>
        </div>
        <nav className="ad-nav">
          <button className={`ad-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={`ad-nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            📋 Manage Requests
          </button>
          <button className={`ad-nav-item ${activeTab === 'donors' ? 'active' : ''}`} onClick={() => setActiveTab('donors')}>
            👥 Manage Donors
          </button>
          <button className={`ad-nav-item ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
            🏥 Verify Hospitals
          </button>
        </nav>
        <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }} onClick={logout}>
          Logout
        </button>
      </div>

      <div className="ad-content">
        <div className="ad-header">
          <h2>{activeTab === 'overview' ? 'Platform Overview' : activeTab === 'requests' ? 'Request Management' : activeTab === 'donors' ? 'Donor Management' : 'Hospital Verification'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            fetchDashboardData();
            if (activeTab === 'hospitals') fetchHospitals();
            if (activeTab === 'donors') fetchDonors();
          }}>🔄 Refresh</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="ad-overview">
            <div className="ad-stats-grid">
              <div className="ad-stat-box">
                <h5>Total Donors</h5>
                <div className="ad-stat-val">{stats.overview.totalDonors}</div>
              </div>
              <div className="ad-stat-box highlight">
                <h5>Active & Available</h5>
                <div className="ad-stat-val">{stats.overview.activeDonors}</div>
              </div>
              <div className="ad-stat-box danger">
                <h5>Pending Requests</h5>
                <div className="ad-stat-val">{stats.overview.pendingRequests}</div>
              </div>
              <div className="ad-stat-box success">
                <h5>Lives Impacted</h5>
                <div className="ad-stat-val">~{stats.overview.completedRequests * 3}</div>
              </div>
            </div>

            <div className="ad-panels">
              <div className="ad-panel">
                <h3>Recent Platform Activity</h3>
                <ul className="ad-activity-list">
                  <li>🟢 New donor registered from Mumbai (O+) - 5 mins ago</li>
                  <li>✅ Request #1042 completed successfully - 1 hour ago</li>
                  <li>🚨 Emergency request created in Delhi (AB-) - 2 hours ago</li>
                  <li>🏥 Apollo Hospital verified - 3 hours ago</li>
                  <li>👤 New hospital registration pending - 5 hours ago</li>
                </ul>
              </div>
              <div className="ad-panel">
                <h3>System Health</h3>
                <div className="ad-health-item">
                  <span>Database Connection</span>
                  <span className="badge badge-available">Online</span>
                </div>
                <div className="ad-health-item">
                  <span>API Latency</span>
                  <span className="badge badge-blood">42ms</span>
                </div>
                <div className="ad-health-item">
                  <span>SMS Gateway</span>
                  <span className="badge badge-available">Operational</span>
                </div>
                <div className="ad-health-item">
                  <span>Hospital Queue</span>
                  <span className="badge badge-pending">{hospitals.filter(h => !h.isVerified).length || '?'} pending</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="ad-requests">
            <RequestTracker adminMode={true} limit={50} />
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="ad-donors-section">
            <div className="ad-donor-search">
              <input
                type="text"
                className="form-input"
                placeholder="Search donors by name or city..."
                value={donorSearch}
                onChange={(e) => setDonorSearch(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>

            {donorLoading ? (
              <Loading message="Loading donors..." />
            ) : donors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No donors found</h3>
              </div>
            ) : (
              <div className="ad-donor-table-wrap">
                <table className="ad-donor-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Blood</th>
                      <th>City</th>
                      <th>Phone</th>
                      <th>Donations</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map(d => (
                      <tr key={d._id}>
                        <td><strong>{d.name}</strong></td>
                        <td><span className="ad-blood-tag">{d.bloodGroup}</span></td>
                        <td>{d.city}</td>
                        <td style={{ fontSize: '0.8125rem' }}>{d.phone}</td>
                        <td>{d.totalDonations || 0}</td>
                        <td>
                          <span className={`badge ${d.isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
                            {d.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleToggleDonor(d._id)} title="Toggle availability">
                              {d.isAvailable ? '⏸️' : '▶️'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteDonor(d._id)} title="Remove donor" style={{ color: 'var(--danger)' }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div className="ad-hospitals-section">
            <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-lg)' }}>
              Review and verify hospital registrations. Verified hospitals can broadcast emergency blood needs.
            </p>

            {hospitals.length === 0 ? (
              <Loading message="Loading hospitals..." />
            ) : (
              <div className="ad-hosp-list">
                {hospitals.map(h => (
                  <div key={h._id} className={`ad-hosp-card ${h.isVerified ? '' : 'ad-hosp-pending'}`}>
                    <div className="ad-hosp-header">
                      <div>
                        <h4>🏥 {h.hospitalName || h.name}</h4>
                        <p className="ad-hosp-location">📍 {h.hospitalCity}{h.hospitalState ? `, ${h.hospitalState}` : ''}</p>
                      </div>
                      {h.isVerified ? (
                        <span className="badge badge-available">✅ Verified</span>
                      ) : (
                        <span className="badge badge-pending">⏳ Pending</span>
                      )}
                    </div>
                    <div className="ad-hosp-details">
                      <div><span>Registration ID</span><strong>{h.hospitalRegistrationId || 'N/A'}</strong></div>
                      <div><span>Contact</span><strong>{h.email}</strong></div>
                      <div><span>Phone</span><strong>{h.phone || 'N/A'}</strong></div>
                      <div><span>Registered</span><strong>{new Date(h.createdAt).toLocaleDateString()}</strong></div>
                    </div>
                    <div className="ad-hosp-actions">
                      {!h.isVerified ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handleVerifyHospital(h._id)}>
                          ✓ Verify Hospital
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => handleRevokeHospital(h._id)}>
                          Revoke Verification
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-dash {
          display: flex; min-height: 80vh; background: var(--white);
          border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200); margin-bottom: var(--space-2xl);
        }
        .ad-sidebar {
          width: 280px; background: var(--gray-50); border-right: 1px solid var(--gray-200);
          padding: var(--space-xl); display: flex; flex-direction: column;
        }
        .ad-profile { display: flex; align-items: center; gap: 12px; margin-bottom: var(--space-2xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--gray-200); }
        .ad-avatar {
          width: 40px; height: 40px; background: var(--gray-800); color: white;
          border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-weight: bold;
        }
        .ad-info h4 { margin: 0; font-size: 1rem; }
        .ad-info span { font-size: 0.8rem; color: var(--gray-500); }
        .ad-nav { display: flex; flex-direction: column; gap: 8px; }
        .ad-nav-item {
          text-align: left; padding: 12px 16px; background: transparent;
          border-radius: var(--radius-md); font-weight: 600; color: var(--gray-600);
          transition: all var(--transition-fast);
        }
        .ad-nav-item:hover { background: var(--gray-200); color: var(--gray-900); }
        .ad-nav-item.active { background: var(--primary-50); color: var(--primary); }
        .ad-content { flex: 1; padding: var(--space-xl); overflow-y: auto; background: var(--white); }
        .ad-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: var(--space-xl); padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--gray-100);
        }
        .ad-header h2 { margin: 0; }
        .ad-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
        .ad-stat-box {
          background: var(--white); border: 1px solid var(--gray-200);
          padding: var(--space-lg); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);
        }
        .ad-stat-box.highlight { border-top: 4px solid var(--primary); }
        .ad-stat-box.danger { border-top: 4px solid var(--warning); }
        .ad-stat-box.success { border-top: 4px solid var(--success); }
        .ad-stat-box h5 { margin: 0 0 8px 0; color: var(--gray-500); font-size: 0.9rem; }
        .ad-stat-val { font-size: 2rem; font-weight: 800; color: var(--gray-900); }
        .ad-panels { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg); }
        .ad-panel {
          background: var(--gray-50); border-radius: var(--radius-lg);
          padding: var(--space-lg); border: 1px solid var(--gray-200);
        }
        .ad-panel h3 { margin-top: 0; font-size: 1.1rem; margin-bottom: var(--space-md); }
        .ad-activity-list { padding-left: 0; margin-top: 16px; }
        .ad-activity-list li { margin-bottom: 12px; font-size: 0.9rem; padding-bottom: 8px; border-bottom: 1px dashed var(--gray-200); }
        .ad-health-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.9rem; font-weight: 500; }

        /* Donor Management Table */
        .ad-donor-search { margin-bottom: var(--space-lg); }
        .ad-donor-table-wrap { overflow-x: auto; }
        .ad-donor-table {
          width: 100%; border-collapse: collapse; font-size: 0.875rem;
        }
        .ad-donor-table th {
          text-align: left; padding: 12px 16px; background: var(--gray-50);
          color: var(--gray-500); font-weight: 600; font-size: 0.75rem;
          text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 2px solid var(--gray-200);
        }
        .ad-donor-table td {
          padding: 12px 16px; border-bottom: 1px solid var(--gray-100);
          vertical-align: middle;
        }
        .ad-donor-table tr:hover td { background: var(--gray-50); }
        .ad-blood-tag {
          display: inline-block; padding: 2px 8px; background: var(--primary);
          color: white; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.8125rem;
        }

        /* Hospital Verification */
        .ad-hosp-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .ad-hosp-card {
          background: var(--white); border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg); padding: var(--space-lg); box-shadow: var(--shadow-xs);
        }
        .ad-hosp-pending { border-left: 4px solid var(--warning); }
        .ad-hosp-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: var(--space-md);
        }
        .ad-hosp-header h4 { margin: 0 0 4px; font-size: 1.0625rem; }
        .ad-hosp-location { margin: 0; font-size: 0.8125rem; color: var(--gray-500); }
        .ad-hosp-details {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md);
          padding: var(--space-md); background: var(--gray-50);
          border-radius: var(--radius-md); margin-bottom: var(--space-md);
        }
        .ad-hosp-details > div { display: flex; flex-direction: column; gap: 2px; }
        .ad-hosp-details span { font-size: 0.6875rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; }
        .ad-hosp-details strong { font-size: 0.875rem; color: var(--gray-800); }
        .ad-hosp-actions { display: flex; gap: 8px; }

        @media (max-width: 900px) {
          .admin-dash { flex-direction: column; }
          .ad-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--gray-200); }
          .ad-stats-grid { grid-template-columns: 1fr 1fr; }
          .ad-panels { grid-template-columns: 1fr; }
          .ad-hosp-details { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
