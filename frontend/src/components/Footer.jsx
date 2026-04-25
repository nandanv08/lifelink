/**
 * LifeLink - Footer Component
 * Professional footer with links, contact info, and branding
 */

import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🩸</span>
              <span className="logo-text">Life<span className="logo-accent">Link</span></span>
            </div>
            <p className="footer-desc">
              Connecting blood donors with those in need through intelligent matching technology.
              Every drop counts, every donor matters.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="social-link" aria-label="Facebook">f</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="LinkedIn">in</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/donors" className="footer-link">Find Donors</Link>
            <Link to="/register" className="footer-link">Register as Donor</Link>
            <Link to="/emergency" className="footer-link">Emergency</Link>
            <Link to="/requests" className="footer-link">Blood Requests</Link>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h4 className="footer-heading">Resources</h4>
            <Link to="/about" className="footer-link">About Us</Link>
            <a href="#" className="footer-link">Blood Types Guide</a>
            <a href="#" className="footer-link">Donation FAQs</a>
            <a href="#" className="footer-link">Eligibility Criteria</a>
            <a href="#" className="footer-link">Privacy Policy</a>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-contact">
              <span>📍</span>
              <span>Mumbai, Maharashtra, India</span>
            </div>
            <div className="footer-contact">
              <span>📞</span>
              <span>+91 1800-XXX-XXXX</span>
            </div>
            <div className="footer-contact">
              <span>✉️</span>
              <span>help@lifelink.org</span>
            </div>
            <div className="footer-contact">
              <span>🕐</span>
              <span>24/7 Helpline Available</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LifeLink. All rights reserved. Made with ❤️ for saving lives.</p>
          <div className="footer-bottom-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--gray-900);
          color: var(--gray-400);
          padding: var(--space-3xl) 0 0;
          margin-top: var(--space-3xl);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: var(--space-2xl);
          padding-bottom: var(--space-2xl);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-primary);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--white);
          margin-bottom: var(--space-md);
        }

        .footer-logo .logo-icon {
          font-size: 1.5rem;
        }

        .footer-logo .logo-accent {
          color: var(--primary);
        }

        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: var(--space-lg);
          color: var(--gray-400);
        }

        .footer-social {
          display: flex;
          gap: 10px;
        }

        .social-link {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--gray-800);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-400);
          transition: all var(--transition-fast);
        }

        .social-link:hover {
          background: var(--primary);
          color: var(--white);
          transform: translateY(-2px);
        }

        .footer-heading {
          font-family: var(--font-primary);
          font-size: 1rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: var(--space-lg);
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link {
          font-size: 0.875rem;
          color: var(--gray-400);
          transition: all var(--transition-fast);
          padding: 2px 0;
        }

        .footer-link:hover {
          color: var(--white);
          transform: translateX(4px);
        }

        .footer-contact {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.875rem;
          padding: 4px 0;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg) 0;
          border-top: 1px solid var(--gray-800);
          font-size: 0.8125rem;
        }

        .footer-bottom-links {
          display: flex;
          gap: 20px;
        }

        .footer-bottom-links a {
          color: var(--gray-500);
          transition: color var(--transition-fast);
        }

        .footer-bottom-links a:hover {
          color: var(--white);
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
