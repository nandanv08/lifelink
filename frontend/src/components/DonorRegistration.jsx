/**
 * LifeLink - Donor Registration Component
 * Multi-step registration form with validation and eligibility check
 */

import React, { useState } from 'react';
import { donorAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala'];

function DonorRegistration() {
  const { showNotification } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', age: '',
    gender: 'Male', bloodGroup: '', city: '', state: '',
    address: '', lastDonationDate: '', weight: '',
    hasMedicalConditions: false, medicalNotes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Enter a valid 10-digit number';
      if (!formData.age) newErrors.age = 'Age is required';
      else if (formData.age < 18 || formData.age > 65) newErrors.age = 'Age must be between 18-65';
    }

    if (stepNum === 2) {
      if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      const submitData = { ...formData };
      if (submitData.age) submitData.age = parseInt(submitData.age);
      if (submitData.weight) submitData.weight = parseInt(submitData.weight);
      if (!submitData.lastDonationDate) delete submitData.lastDonationDate;
      if (!submitData.email) delete submitData.email;

      const result = await donorAPI.register(submitData);

      if (result.success) {
        setSuccess(true);
        showNotification('Registration successful! Welcome to LifeLink! 🎉', 'success');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reg-success" id="registration-success">
        <div className="reg-success-icon">🎉</div>
        <h2>Welcome to LifeLink!</h2>
        <p>Your donor registration was successful. You're now part of our life-saving network.</p>
        <div className="reg-success-info">
          <div className="reg-info-item">
            <span>🩸</span>
            <span>Blood Group: <strong>{formData.bloodGroup}</strong></span>
          </div>
          <div className="reg-info-item">
            <span>📍</span>
            <span>City: <strong>{formData.city}</strong></span>
          </div>
          <div className="reg-info-item">
            <span>✅</span>
            <span>Status: <strong>Available</strong></span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setSuccess(false); setStep(1); setFormData({
          name: '', email: '', phone: '', age: '', gender: 'Male', bloodGroup: '', city: '', state: '',
          address: '', lastDonationDate: '', weight: '', hasMedicalConditions: false, medicalNotes: ''
        }); }}>
          Register Another Donor
        </button>
      </div>
    );
  }

  return (
    <div className="registration-form" id="registration-form">
      {/* Progress Steps */}
      <div className="reg-progress">
        {[1, 2, 3].map(s => (
          <div key={s} className={`reg-step ${step >= s ? 'reg-step-active' : ''} ${step > s ? 'reg-step-done' : ''}`}>
            <div className="reg-step-circle">
              {step > s ? '✓' : s}
            </div>
            <span className="reg-step-label">
              {s === 1 ? 'Personal Info' : s === 2 ? 'Blood Details' : 'Health Info'}
            </span>
          </div>
        ))}
        <div className="reg-progress-bar">
          <div className="reg-progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="reg-section page-enter">
            <h3 className="reg-section-title">👤 Personal Information</h3>
            <p className="reg-section-desc">Tell us about yourself to get started</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" name="name" value={formData.name}
                  onChange={handleChange} placeholder="Enter your full name" id="reg-name" />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input type="tel" className="form-input" name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="10-digit number" maxLength={10} id="reg-phone" />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input type="email" className="form-input" name="email" value={formData.email}
                  onChange={handleChange} placeholder="your@email.com" id="reg-email" />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input type="number" className="form-input" name="age" value={formData.age}
                  onChange={handleChange} placeholder="18-65" min="18" max="65" id="reg-age" />
                {errors.age && <span className="form-error">{errors.age}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="reg-gender-group">
                {['Male', 'Female', 'Other'].map(g => (
                  <label key={g} className={`reg-gender-option ${formData.gender === g ? 'reg-gender-active' : ''}`}>
                    <input type="radio" name="gender" value={g} checked={formData.gender === g}
                      onChange={handleChange} style={{ display: 'none' }} />
                    <span>{g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'} {g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="reg-actions">
              <div></div>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Blood & Location Details */}
        {step === 2 && (
          <div className="reg-section page-enter">
            <h3 className="reg-section-title">🩸 Blood & Location</h3>
            <p className="reg-section-desc">Help us match you with those in need</p>

            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <div className="reg-blood-grid">
                {BLOOD_GROUPS.map(bg => (
                  <label key={bg} className={`reg-blood-option ${formData.bloodGroup === bg ? 'reg-blood-active' : ''}`}>
                    <input type="radio" name="bloodGroup" value={bg}
                      checked={formData.bloodGroup === bg} onChange={handleChange} style={{ display: 'none' }} />
                    <span className="reg-blood-label">{bg}</span>
                  </label>
                ))}
              </div>
              {errors.bloodGroup && <span className="form-error">{errors.bloodGroup}</span>}
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">City *</label>
                <select className="form-select" name="city" value={formData.city} onChange={handleChange} id="reg-city">
                  <option value="">Select your city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
                {formData.city === 'Other' && (
                  <input type="text" className="form-input" name="city" placeholder="Enter your city"
                    onChange={handleChange} style={{ marginTop: '8px' }} />
                )}
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">State *</label>
                <select className="form-select" name="state" value={formData.state} onChange={handleChange} id="reg-state">
                  <option value="">Select your state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Other">Other</option>
                </select>
                {formData.state === 'Other' && (
                  <input type="text" className="form-input" name="state" placeholder="Enter your state"
                    onChange={handleChange} style={{ marginTop: '8px' }} />
                )}
                {errors.state && <span className="form-error">{errors.state}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address (Optional)</label>
              <input type="text" className="form-input" name="address" value={formData.address}
                onChange={handleChange} placeholder="Locality or area" />
            </div>

            <div className="reg-actions">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: Health & Donation History */}
        {step === 3 && (
          <div className="reg-section page-enter">
            <h3 className="reg-section-title">💊 Health Information</h3>
            <p className="reg-section-desc">Optional details to assess donation eligibility</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="form-input" name="weight" value={formData.weight}
                  onChange={handleChange} placeholder="Min 45 kg" min="30" max="200" id="reg-weight" />
                <span className="form-helper">Minimum 45 kg required for donation</span>
              </div>
              <div className="form-group">
                <label className="form-label">Last Donation Date</label>
                <input type="date" className="form-input" name="lastDonationDate" value={formData.lastDonationDate}
                  onChange={handleChange} max={new Date().toISOString().split('T')[0]} id="reg-lastDonation" />
                <span className="form-helper">Leave empty if first-time donor</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" name="hasMedicalConditions" checked={formData.hasMedicalConditions}
                  onChange={handleChange} />
                <span>I have existing medical conditions</span>
              </label>
            </div>

            {formData.hasMedicalConditions && (
              <div className="form-group">
                <label className="form-label">Medical Notes</label>
                <textarea className="form-textarea" name="medicalNotes" value={formData.medicalNotes}
                  onChange={handleChange} placeholder="Brief description of your conditions..."
                  rows={3} />
              </div>
            )}

            <div className="reg-disclaimer">
              <span>ℹ️</span>
              <p>By registering, you agree to be contacted by LifeLink when a matching blood request is found in your area. Your information is kept confidential and shared only during active requests.</p>
            </div>

            <div className="reg-actions">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>← Back</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="reg-submit">
                {loading ? 'Registering...' : '🩸 Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </form>

      <style>{`
        .registration-form {
          max-width: 700px;
          margin: 0 auto;
          background: var(--white);
          border-radius: var(--radius-2xl);
          padding: var(--space-2xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-100);
        }

        .reg-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
          position: relative;
          padding: 0 var(--space-lg);
        }

        .reg-progress-bar {
          position: absolute;
          top: 18px;
          left: 80px;
          right: 80px;
          height: 3px;
          background: var(--gray-200);
          border-radius: 2px;
          z-index: 0;
        }

        .reg-progress-fill {
          height: 100%;
          background: var(--primary-gradient);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .reg-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 1;
        }

        .reg-step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gray-200);
          color: var(--gray-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          transition: all var(--transition-base);
        }

        .reg-step-active .reg-step-circle {
          background: var(--primary-gradient);
          color: var(--white);
          box-shadow: var(--shadow-red);
        }

        .reg-step-done .reg-step-circle {
          background: var(--success);
          color: var(--white);
        }

        .reg-step-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--gray-400);
          transition: color var(--transition-fast);
        }

        .reg-step-active .reg-step-label {
          color: var(--gray-800);
          font-weight: 600;
        }

        .reg-section-title {
          font-size: 1.375rem;
          margin-bottom: 4px;
        }

        .reg-section-desc {
          color: var(--gray-500);
          margin-bottom: var(--space-xl);
        }

        .reg-gender-group {
          display: flex;
          gap: 10px;
        }

        .reg-gender-option {
          flex: 1;
          padding: 12px;
          text-align: center;
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .reg-gender-option:hover {
          border-color: var(--primary-200);
        }

        .reg-gender-active {
          border-color: var(--primary);
          background: var(--primary-50);
          color: var(--primary);
        }

        .reg-blood-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .reg-blood-option {
          padding: 14px;
          text-align: center;
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .reg-blood-option:hover {
          border-color: var(--primary-200);
          background: var(--primary-50);
        }

        .reg-blood-active {
          border-color: var(--primary) !important;
          background: var(--primary) !important;
          color: var(--white) !important;
          box-shadow: var(--shadow-red);
        }

        .reg-blood-label {
          font-size: 1.125rem;
          font-weight: 700;
          font-family: var(--font-primary);
        }

        .reg-disclaimer {
          display: flex;
          gap: 10px;
          padding: 14px;
          background: var(--gray-50);
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          color: var(--gray-500);
          line-height: 1.5;
          margin-bottom: var(--space-lg);
        }

        .reg-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-xl);
        }

        .reg-success {
          text-align: center;
          padding: var(--space-3xl) var(--space-lg);
          max-width: 500px;
          margin: 0 auto;
        }

        .reg-success-icon {
          font-size: 4rem;
          margin-bottom: var(--space-lg);
          animation: heartbeat 2s infinite;
        }

        .reg-success h2 {
          font-size: 1.75rem;
          margin-bottom: var(--space-sm);
        }

        .reg-success p {
          color: var(--gray-500);
          margin-bottom: var(--space-xl);
        }

        .reg-success-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: var(--space-xl);
          padding: var(--space-lg);
          background: var(--gray-50);
          border-radius: var(--radius-lg);
        }

        .reg-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9375rem;
        }

        @media (max-width: 600px) {
          .registration-form {
            padding: var(--space-lg);
          }

          .reg-blood-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .reg-gender-group {
            flex-direction: column;
          }

          .reg-progress {
            gap: var(--space-lg);
          }

          .reg-step-label {
            font-size: 0.6875rem;
          }
        }
      `}</style>
    </div>
  );
}

export default DonorRegistration;
