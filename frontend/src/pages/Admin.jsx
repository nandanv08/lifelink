/**
 * LifeLink - Admin Page
 * Admin-only area with login gate
 */

import React, { useState, useEffect } from 'react';
import AdminDashboard from '../components/AdminDashboard';
import { useApp } from '../context/AppContext';
import { Navigate, useNavigate } from 'react-router-dom';

function Admin() {
  const { isAuthenticated, isAdmin, login, isLoading } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@lifelink.com');
  const [password, setPassword] = useState('admin123');

  useEffect(() => {
    document.title = 'Admin | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result?.success && result.role !== 'admin') {
      // Logged in but not admin
      navigate('/');
    }
  };

  // If logged in but not admin, redirect home
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" />;
  }

  // If successfully logged in as admin, show dashboard
  if (isAuthenticated && isAdmin) {
    return (
      <div className="container section">
        <AdminDashboard />
      </div>
    );
  }

  // Otherwise show login form
  return (
    <div className="page-enter">
      <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        
        <div style={{ background: 'var(--white)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
             <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🔐</div>
             <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Admin Login</h2>
             <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Demo credentials: admin@lifelink.com / admin123</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                 type="email" 
                 className="form-input" 
                 value={email} 
                 onChange={e => setEmail(e.target.value)} 
                 required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                 type="password" 
                 className="form-input" 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: 'var(--space-md)' }}
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Admin;
