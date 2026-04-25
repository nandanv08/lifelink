/**
 * LifeLink - Eligibility Checker Component
 * Interactive form to check if a user is eligible to donate blood
 */

import React, { useState } from 'react';
import { donorAPI } from '../services/api';

function EligibilityChecker() {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    lastDonationDate: '',
    hasMedicalConditions: false
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setResult(null);
  };

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!formData.age) return;

    try {
      setLoading(true);
      const checkData = {
        age: parseInt(formData.age),
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        lastDonationDate: formData.lastDonationDate || undefined,
        hasMedicalConditions: formData.hasMedicalConditions
      };

      const response = await donorAPI.checkEligibility(checkData);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      // Fallback client-side check
      const issues = [];
      let isEligible = true;
      const age = parseInt(formData.age);
      const weight = parseInt(formData.weight);

      if (age < 18 || age > 65) { issues.push('Age must be between 18-65'); isEligible = false; }
      if (weight && weight < 45) { issues.push('Minimum weight is 45 kg'); isEligible = false; }
      if (formData.hasMedicalConditions) { issues.push('Consult a doctor first'); isEligible = false; }
      if (formData.lastDonationDate) {
        const days = Math.floor((Date.now() - new Date(formData.lastDonationDate)) / (1000 * 60 * 60 * 24));
        if (days < 90) { issues.push(`Wait ${90 - days} more days since last donation`); isEligible = false; }
      }

      setResult({
        isEligible,
        issues,
        message: isEligible
          ? '✅ You are eligible to donate blood!'
          : '❌ You may not be eligible at this time.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eligibility-checker" id="eligibility-checker">
      <div className="ec-header">
        <span className="ec-icon">🏥</span>
        <h3>Donation Eligibility Checker</h3>
        <p>Check if you're eligible to donate blood</p>
      </div>

      <form onSubmit={handleCheck} className="ec-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age *</label>
            <input type="number" className="form-input" name="age" value={formData.age}
              onChange={handleChange} placeholder="Your age" min="1" max="100" required id="ec-age" />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input type="number" className="form-input" name="weight" value={formData.weight}
              onChange={handleChange} placeholder="Your weight" min="20" max="250" id="ec-weight" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Last Donation Date</label>
          <input type="date" className="form-input" name="lastDonationDate" value={formData.lastDonationDate}
            onChange={handleChange} max={new Date().toISOString().split('T')[0]} id="ec-lastDonation" />
          <span className="form-helper">Leave empty if you've never donated</span>
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input type="checkbox" name="hasMedicalConditions" checked={formData.hasMedicalConditions}
              onChange={handleChange} />
            <span>I have existing medical conditions (diabetes, heart disease, etc.)</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !formData.age} id="ec-check-btn"
          style={{ width: '100%' }}>
          {loading ? 'Checking...' : '🔍 Check Eligibility'}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className={`ec-result ${result.isEligible ? 'ec-eligible' : 'ec-ineligible'}`} id="ec-result">
          <div className="ec-result-icon">
            {result.isEligible ? '✅' : '⚠️'}
          </div>
          <p className="ec-result-message">{result.message}</p>

          {result.issues && result.issues.length > 0 && (
            <ul className="ec-issues">
              {result.issues.map((issue, i) => (
                <li key={i}>⚠️ {issue}</li>
              ))}
            </ul>
          )}

          {result.isEligible && (
            <a href="/register" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Register as Donor →
            </a>
          )}
        </div>
      )}

      <style>{`
        .eligibility-checker {
          background: var(--white);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          border: 1px solid var(--gray-100);
          box-shadow: var(--shadow-md);
        }

        .ec-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .ec-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: var(--space-sm);
        }

        .ec-header h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .ec-header p {
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .ec-result {
          margin-top: var(--space-lg);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          text-align: center;
          animation: fadeInUp 0.4s ease-out;
        }

        .ec-eligible {
          background: var(--success-light);
          border: 1px solid rgba(5, 150, 105, 0.2);
        }

        .ec-ineligible {
          background: var(--warning-light);
          border: 1px solid rgba(217, 119, 6, 0.2);
        }

        .ec-result-icon {
          font-size: 2rem;
          margin-bottom: var(--space-sm);
        }

        .ec-result-message {
          font-weight: 600;
          font-size: 1rem;
          color: var(--gray-800);
          margin-bottom: var(--space-sm);
        }

        .ec-issues {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: var(--space-md);
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--gray-700);
        }
      `}</style>
    </div>
  );
}

export default EligibilityChecker;
