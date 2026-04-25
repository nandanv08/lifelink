/**
 * LifeLink - Unified Login / Sign Up Page
 * Supports Donor, Hospital, and Admin login with role-based redirects
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar', 'Odisha'
];

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, isLoading } = useApp();
  const [mode, setMode] = useState('login'); // login | register-donor | register-hospital
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    hospitalName: '', hospitalAddress: '', hospitalCity: '',
    hospitalState: '', hospitalRegistrationId: ''
  });

  useEffect(() => {
    document.title = 'Login | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const result = await login(formData.email, formData.password);
      if (result?.success) {
        if (result.role === 'admin') navigate('/admin');
        else if (result.role === 'hospital') navigate('/hospital');
        else if (result.role === 'donor') navigate('/dashboard');
        else navigate('/');
      }
    } else {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: mode === 'register-hospital' ? 'hospital' : 'donor'
      };
      if (mode === 'register-hospital') {
        userData.hospitalName = formData.hospitalName;
        userData.hospitalAddress = formData.hospitalAddress;
        userData.hospitalCity = formData.hospitalCity;
        userData.hospitalState = formData.hospitalState;
        userData.hospitalRegistrationId = formData.hospitalRegistrationId;
      }
      const result = await register(userData);
      if (result?.success) {
        if (result.role === 'hospital') navigate('/hospital');
        else navigate('/');
      }
    }
  };

  return (
    <div className="page-enter">
      <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '70vh', paddingTop: '40px' }}>
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">
              {mode === 'login' ? '🔐' : mode === 'register-hospital' ? '🏥' : '❤️'}
            </div>
            <h2>{mode === 'login' ? 'Welcome Back' : mode === 'register-hospital' ? 'Hospital Registration' : 'Create Account'}</h2>
            <p className="login-subtitle">
              {mode === 'login' ? 'Sign in to access your dashboard' :
               mode === 'register-hospital' ? 'Register your hospital to broadcast blood needs' :
               'Join our lifesaving network as a donor'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="login-tabs">
            <button className={`login-tab ${mode === 'login' ? 'login-tab-active' : ''}`} onClick={() => setMode('login')}>
              Sign In
            </button>
            <button className={`login-tab ${mode === 'register-donor' ? 'login-tab-active' : ''}`} onClick={() => setMode('register-donor')}>
              Donor Sign Up
            </button>
            <button className={`login-tab ${mode === 'register-hospital' ? 'login-tab-active' : ''}`} onClick={() => setMode('register-hospital')}>
              Hospital Sign Up
            </button>
          </div>

          {/* Demo Credentials */}
          {mode === 'login' && (
            <div className="login-demo">
              <strong>Demo Credentials:</strong>
              <div className="login-demo-grid">
                <button type="button" className="login-demo-btn" onClick={() => setFormData(p => ({ ...p, email: 'admin@lifelink.com', password: 'admin123' }))}>
                  <span>⚙️</span> Admin
                </button>
                <button type="button" className="login-demo-btn" onClick={() => setFormData(p => ({ ...p, email: 'hospital1@lifelink.com', password: 'hospital123' }))}>
                  <span>🏥</span> Hospital
                </button>
                <button type="button" className="login-demo-btn" onClick={() => setFormData(p => ({ ...p, email: 'donor@lifelink.com', password: 'donor123' }))}>
                  <span>❤️</span> Donor
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode !== 'login' && (
              <div className="form-group">
                <label className="form-label">{mode === 'register-hospital' ? 'Contact Person Name' : 'Full Name'} *</label>
                <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>

            {mode !== 'login' && (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" />
              </div>
            )}

            {/* Hospital-specific fields */}
            {mode === 'register-hospital' && (
              <div className="login-hospital-fields">
                <div className="form-group">
                  <label className="form-label">Hospital / Institution Name *</label>
                  <input type="text" className="form-input" name="hospitalName" value={formData.hospitalName} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input type="text" className="form-input" name="hospitalCity" value={formData.hospitalCity} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select className="form-select" name="hospitalState" value={formData.hospitalState} onChange={handleChange} required>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital Address</label>
                  <input type="text" className="form-input" name="hospitalAddress" value={formData.hospitalAddress} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration / License ID *</label>
                  <input type="text" className="form-input" name="hospitalRegistrationId" value={formData.hospitalRegistrationId} onChange={handleChange} required placeholder="e.g. HOSP-MUM-1234" />
                  <span className="form-helper">This will be verified by our admin team</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-md)' }} disabled={isLoading}>
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'register-hospital' && (
            <div className="login-notice">
              <span>ℹ️</span>
              <p>Hospital accounts require admin verification before you can broadcast emergency blood needs. Verification typically takes 24-48 hours.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .login-card {
          background: var(--white);
          padding: var(--space-2xl);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 520px;
          border: 1px solid var(--gray-100);
        }
        .login-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        .login-icon {
          font-size: 3rem;
          margin-bottom: var(--space-sm);
        }
        .login-header h2 {
          font-size: 1.5rem;
          margin-bottom: 6px;
        }
        .login-subtitle {
          color: var(--gray-500);
          font-size: 0.9rem;
        }
        .login-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: var(--space-lg);
          background: var(--gray-100);
          border-radius: var(--radius-md);
          padding: 4px;
        }
        .login-tab {
          flex: 1;
          padding: 10px 8px;
          background: transparent;
          color: var(--gray-500);
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .login-tab:hover {
          color: var(--gray-700);
        }
        .login-tab-active {
          background: var(--white);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .login-demo {
          background: var(--gray-50);
          padding: 14px;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
          font-size: 0.8125rem;
          color: var(--gray-600);
          text-align: center;
        }
        .login-demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .login-demo-btn {
          padding: 8px;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--gray-700);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .login-demo-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-1px);
        }
        .login-hospital-fields {
          border-top: 1px solid var(--gray-200);
          padding-top: var(--space-md);
          margin-top: var(--space-md);
        }
        .login-notice {
          display: flex;
          gap: 10px;
          padding: 14px;
          background: var(--info-light);
          border-radius: var(--radius-md);
          margin-top: var(--space-lg);
          font-size: 0.8125rem;
          color: var(--gray-700);
          line-height: 1.5;
        }
        .login-notice p { margin: 0; }
        @media (max-width: 600px) {
          .login-card { padding: var(--space-lg); }
          .login-tabs { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

export default Login;
