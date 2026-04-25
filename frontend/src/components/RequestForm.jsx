/**
 * LifeLink - Request Form Component
 * Form to create a new blood request
 */

import React, { useState } from 'react';
import { requestAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

function RequestForm({ onSuccess, initialDonor = null }) {
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    hospital: '',
    city: '',
    bloodGroup: initialDonor ? initialDonor.bloodGroup : '',
    unitsNeeded: '1',
    urgencyLevel: 'normal',
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    notes: '',
    isEmergency: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = { ...formData };
      submitData.patientAge = parseInt(submitData.patientAge);
      submitData.unitsNeeded = parseInt(submitData.unitsNeeded);

      const result = await requestAPI.create(submitData);

      if (result.success) {
        showNotification('Blood request created successfully!', 'success');
        
        // If a specific donor was targeted, try to accept immediately
        if (initialDonor && result.data._id) {
          try {
            await requestAPI.accept(result.data._id, initialDonor._id);
            showNotification(`Request sent directly to ${initialDonor.name}`, 'success');
          } catch (err) {
            console.error("Auto-assign failed:", err);
          }
        }
        
        if (onSuccess) onSuccess(result.data);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="request-form page-enter" onSubmit={handleSubmit} id="request-form">
      {initialDonor && (
        <div className="rf-targeted-donor">
          <span>🎯 Requesting blood from: <strong>{initialDonor.name}</strong> ({initialDonor.bloodGroup})</span>
        </div>
      )}

      <div className="form-section">
        <h4 className="form-section-title">Patient Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input type="text" className="form-input" name="patientName" value={formData.patientName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Patient Age *</label>
            <input type="number" className="form-input" name="patientAge" value={formData.patientAge} onChange={handleChange} min="0" max="120" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hospital Name *</label>
            <input type="text" className="form-input" name="hospital" value={formData.hospital} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <select className="form-select" name="city" value={formData.city} onChange={handleChange} required>
              <option value="">Select city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 className="form-section-title">Blood Requirements</h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Blood Group Needed *</label>
            <select className="form-select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required disabled={!!initialDonor}>
              <option value="">Select group</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Units Needed *</label>
            <input type="number" className="form-input" name="unitsNeeded" value={formData.unitsNeeded} onChange={handleChange} min="1" max="10" required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Urgency Level *</label>
          <select className="form-select" name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange} required>
            <option value="normal">Normal (Within 24-48 hours)</option>
            <option value="urgent">Urgent (Within 12 hours)</option>
            <option value="critical">Critical (Immediate/Emergency)</option>
          </select>
        </div>
        {formData.urgencyLevel === 'critical' && (
          <div className="form-group" style={{ marginTop: '10px' }}>
             <label className="form-checkbox">
              <input type="checkbox" name="isEmergency" checked={formData.isEmergency} onChange={handleChange} />
              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Flag as Emergency (Alerts matched donors immediately)</span>
            </label>
          </div>
        )}
      </div>

      <div className="form-section">
        <h4 className="form-section-title">Your Contact Details (Requester)</h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input type="text" className="form-input" name="requesterName" value={formData.requesterName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input type="tel" className="form-input" name="requesterPhone" value={formData.requesterPhone} onChange={handleChange} pattern="[0-9]{10}" placeholder="10-digit number" required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-textarea" name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Any specific requirements or instructions..."></textarea>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Submitting Request...' : 'Submit Blood Request'}
      </button>

      <style>{`
        .request-form {
          background: var(--white);
          padding: var(--space-xl);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--gray-100);
        }
        .form-section {
          margin-bottom: var(--space-xl);
        }
        .form-section-title {
          font-size: 1.125rem;
          color: var(--gray-800);
          border-bottom: 2px solid var(--gray-100);
          padding-bottom: 8px;
          margin-bottom: var(--space-md);
        }
        .rf-targeted-donor {
          background: var(--primary-50);
          color: var(--primary-dark);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
          border: 1px solid var(--primary-100);
        }
      `}</style>
    </form>
  );
}

export default RequestForm;
