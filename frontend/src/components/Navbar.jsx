/**
 * LifeLink - Navbar Component
 * Fixed navigation with glassmorphism effect, mobile menu, and multi-role auth integration
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, isHospital, isDonor, user, logout } = useApp();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/donors', label: 'Find Donors', icon: '🔍' },
    { path: '/register', label: 'Become Donor', icon: '❤️' },
    { path: '/emergency', label: 'Emergency', icon: '🚨', isEmergency: true },
    { path: '/requests', label: 'Requests', icon: '📋' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
  ];

  // Role-based dashboard links
  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin', icon: '⚙️' });
  }
  if (isHospital) {
    navLinks.push({ path: '/hospital', label: 'Hospital', icon: '🏥' });
  }
  if (isDonor && user?.donorProfile) {
    navLinks.push({ path: '/dashboard', label: 'My Profile', icon: '👤' });
  }

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', color: '#7C3AED' };
    if (isHospital) return { label: 'Hospital', color: '#2563EB' };
    if (isDonor) return { label: 'Donor', color: '#059669' };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`} id="main-navbar">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">🩸</span>
          <span className="logo-text">
            <span style={{ color: 'var(--primary)' }}>Life</span>
            <span className="logo-accent" style={{ color: 'var(--gray-900)' }}>Link</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''} ${link.isEmergency ? 'nav-link-emergency' : ''}`}
              id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth / CTA */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user">
              {roleBadge && (
                <span className="nav-role-badge" style={{ background: roleBadge.color }}>
                  {roleBadge.label}
                </span>
              )}
              <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="nav-login-btn">
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`navbar-toggle ${isMobileMenuOpen ? 'toggle-active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          id="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`mobile-link ${location.pathname === link.path ? 'mobile-link-active' : ''} ${link.isEmergency ? 'mobile-link-emergency' : ''}`}
          >
            <span className="mobile-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
        {isAuthenticated ? (
          <button className="btn btn-outline btn-sm" onClick={logout} style={{ marginTop: '12px', width: '100%' }}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop: '12px', width: '100%' }}>
            Login / Sign Up
          </Link>
        )}
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 0;
          transition: all var(--transition-base);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .navbar-scrolled {
          padding: 10px 0;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 1px 20px rgba(0, 0, 0, 0.06);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-primary);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--gray-900);
          z-index: 1001;
        }

        .logo-icon {
          font-size: 1.75rem;
          animation: heartbeat 3s infinite;
        }

        .logo-accent {
          color: var(--primary);
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          position: relative;
        }

        .nav-link:hover {
          color: var(--gray-900);
          background: var(--gray-100);
        }

        .nav-link-active {
          color: var(--primary);
          background: var(--primary-50);
          font-weight: 600;
        }

        .nav-link-emergency {
          color: var(--primary);
          font-weight: 600;
        }

        .nav-link-emergency:hover {
          background: var(--primary-50);
          color: var(--primary-dark);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-greeting {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
        }

        .nav-role-badge {
          padding: 3px 10px;
          border-radius: var(--radius-full);
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Mobile Toggle */
        .navbar-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          background: none;
          z-index: 1001;
        }

        .toggle-bar {
          width: 24px;
          height: 2.5px;
          background: var(--gray-700);
          border-radius: 2px;
          transition: all var(--transition-base);
        }

        .toggle-active .toggle-bar:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .toggle-active .toggle-bar:nth-child(2) {
          opacity: 0;
        }

        .toggle-active .toggle-bar:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* Mobile Menu */
        .navbar-mobile {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          padding: 100px 24px 24px;
          flex-direction: column;
          gap: 4px;
          z-index: 999;
          transform: translateY(-100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-open {
          transform: translateY(0);
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          font-size: 1rem;
          font-weight: 500;
          color: var(--gray-700);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .mobile-link:hover,
        .mobile-link-active {
          background: var(--primary-50);
          color: var(--primary);
        }

        .mobile-link-emergency {
          color: var(--primary);
          font-weight: 600;
        }

        .mobile-link-icon {
          font-size: 1.25rem;
        }

        @media (max-width: 900px) {
          .navbar-links {
            display: none;
          }

          .navbar-actions {
            display: none;
          }

          .navbar-toggle {
            display: flex;
          }

          .navbar-mobile {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
