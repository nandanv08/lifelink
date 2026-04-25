/**
 * LifeLink - Request Tracker Component
 * Displays a list of requests with their current status and lifecycle actions
 */

import React, { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import Loading from './Loading';

function RequestTracker({ limit = 10, showFilters = true, adminMode = false }) {
  const { showNotification, isAdmin } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = { limit };
      if (filter !== 'all') params.status = filter;
      
      const result = await requestAPI.getAll(params);
      if (result.success) {
        setRequests(result.data);
      }
    } catch (err) {
      showNotification('Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Auto refresh every 30s
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [filter, limit]);

  const handleAction = async (id, action) => {
    try {
      let result;
      if (action === 'accept') {
        // Simplified accept without specific donor assignment for demo
        result = await requestAPI.accept(id);
      } else if (action === 'complete') {
        result = await requestAPI.complete(id);
      } else if (action === 'cancel') {
        result = await requestAPI.cancel(id, 'Cancelled by user');
      }

      if (result && result.success) {
        showNotification(`Request marked as ${action}ed`, 'success');
        fetchRequests();
      }
    } catch (error) {
       showNotification(error.message, 'error');
    }
  };

  const getStatusBadge = (status, urgency) => {
    if (status === 'completed') return <span className="badge badge-completed">✅ Completed</span>;
    if (status === 'cancelled') return <span className="badge badge-cancelled">❌ Cancelled</span>;
    if (status === 'accepted') return <span className="badge badge-accepted">⏳ Assigned</span>;
    
    // Pending status gets urgency color
    if (urgency === 'critical') return <span className="badge badge-critical">🚨 Critical Need</span>;
    if (urgency === 'urgent') return <span className="badge badge-urgent">⚠️ Urgent Need</span>;
    return <span className="badge badge-pending">🕒 Pending</span>;
  };

  return (
    <div className="request-tracker">
      {showFilters && (
        <div className="rt-filters">
           <div className="rt-filter-tabs">
             {['all', 'pending', 'accepted', 'completed'].map(f => (
               <button 
                key={f} 
                className={`rt-tab ${filter === f ? 'rt-tab-active' : ''}`}
                onClick={() => setFilter(f)}
               >
                 {f.charAt(0).toUpperCase() + f.slice(1)}
               </button>
             ))}
           </div>
        </div>
      )}

      {loading ? (
        <Loading message="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="empty-state">
           <div className="empty-state-icon">📋</div>
           <h3>No requests found</h3>
           <p>There are currently no blood requests matching your criteria.</p>
        </div>
      ) : (
        <div className="rt-list">
          {requests.map(req => (
            <div key={req._id} className={`rt-card ${req.urgencyLevel === 'critical' && req.status === 'pending' ? 'rt-card-critical' : ''}`}>
               <div className="rt-header">
                 <div className="rt-blood-req">
                    <span className="rt-blood-badge">{req.bloodGroup}</span>
                    <span className="rt-units">{req.unitsNeeded} Unit{req.unitsNeeded > 1 ? 's' : ''}</span>
                 </div>
                 {getStatusBadge(req.status, req.urgencyLevel)}
               </div>

               <div className="rt-body">
                 <div className="rt-details">
                    <h4 className="rt-patient">{req.patientName || 'Anonymous Patient'}, {req.patientAge}y</h4>
                    <p className="rt-location">🏥 {req.hospital}, {req.city}</p>
                    <p className="rt-time">Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                    {req.notes && <p className="rt-notes">" {req.notes} "</p>}
                 </div>
                 
                 <div className="rt-actions">
                   {/* Public Actions */}
                   {req.status === 'pending' && !adminMode && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction(req._id, 'accept')}>
                        I can donate
                      </button>
                   )}
                   
                   {/* Admin Actions */}
                   {adminMode && isAdmin && (
                     <>
                      {req.status === 'pending' && (
                         <button className="btn btn-outline btn-sm" onClick={() => handleAction(req._id, 'cancel')}>Cancel</button>
                      )}
                      {req.status === 'accepted' && (
                         <button className="btn btn-success btn-sm" onClick={() => handleAction(req._id, 'complete')}>Mark Completed</button>
                      )}
                     </>
                   )}
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .rt-filters {
          margin-bottom: var(--space-lg);
        }
        .rt-filter-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--gray-200);
          padding-bottom: 8px;
        }
        .rt-tab {
          padding: 8px 16px;
          background: transparent;
          color: var(--gray-500);
          font-weight: 500;
          font-size: 0.875rem;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          transition: all var(--transition-fast);
        }
        .rt-tab:hover {
          color: var(--gray-800);
          background: var(--gray-50);
        }
        .rt-tab-active {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
          background: var(--primary-50);
        }
        .rt-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .rt-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        .rt-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--gray-300);
        }
        .rt-card-critical {
          border-left: 4px solid var(--danger);
        }
        .rt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--gray-100);
        }
        .rt-blood-req {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rt-blood-badge {
          background: var(--primary);
          color: white;
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          font-weight: bold;
          font-size: 1.1rem;
        }
        .rt-units {
          color: var(--gray-600);
          font-weight: 500;
          font-size: 0.9rem;
        }
        .rt-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: var(--space-md);
        }
        .rt-details {
          flex: 1;
        }
        .rt-patient {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
        }
        .rt-location, .rt-time {
          margin: 0 0 2px 0;
          font-size: 0.85rem;
          color: var(--gray-600);
        }
        .rt-notes {
          margin: 8px 0 0 0;
          font-size: 0.85rem;
          font-style: italic;
          color: var(--gray-500);
          background: var(--gray-50);
          padding: 6px;
          border-radius: var(--radius-sm);
        }
        .rt-actions {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 600px) {
           .rt-body {
             flex-direction: column;
             align-items: flex-start;
           }
           .rt-actions {
             width: 100%;
             justify-content: flex-end;
           }
        }
      `}</style>
    </div>
  );
}

export default RequestTracker;
