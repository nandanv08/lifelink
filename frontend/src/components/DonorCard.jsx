/**
 * LifeLink - DonorCard Component
 * Displays individual donor information in a card layout
 * with privacy-masked contact info and availability badge
 */

import React, { useState } from 'react';

function DonorCard({ donor, onRequestBlood, showFullDetails = false }) {
  const [isHovered, setIsHovered] = useState(false);

  // Get blood group color
  const getBloodGroupColor = (bg) => {
    const colors = {
      'O+': '#DC2626', 'O-': '#991B1B',
      'A+': '#2563EB', 'A-': '#1D4ED8',
      'B+': '#059669', 'B-': '#047857',
      'AB+': '#7C3AED', 'AB-': '#6D28D9'
    };
    return colors[bg] || '#DC2626';
  };

  // Calculate days since last donation
  const getDonationStatus = () => {
    if (!donor.lastDonationDate) return { text: 'First-time donor', color: 'var(--info)' };
    const days = Math.floor((Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24));
    if (days >= 90) return { text: `${days}d since last donation`, color: 'var(--success)' };
    return { text: `${days}d since last donation`, color: 'var(--warning)' };
  };

  const donationStatus = getDonationStatus();
  const bgColor = getBloodGroupColor(donor.bloodGroup);

  // Generate initials avatar
  const initials = donor.name ? donor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

  return (
    <div
      className={`donor-card ${isHovered ? 'donor-card-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`donor-card-${donor._id}`}
    >
      {/* Card header with blood group badge */}
      <div className="dc-header">
        <div className="dc-avatar" style={{ background: `${bgColor}15`, color: bgColor }}>
          {initials}
        </div>
        <div className="dc-blood-badge" style={{ background: bgColor }}>
          {donor.bloodGroup}
        </div>
      </div>

      {/* Donor info */}
      <div className="dc-info">
        <h3 className="dc-name">{donor.name}</h3>
        <div className="dc-meta">
          <span className="dc-city">📍 {donor.city}</span>
          {donor.age && <span className="dc-age">• {donor.age} yrs</span>}
        </div>
      </div>

      {/* Status badges */}
      <div className="dc-badges">
        <span className={`badge ${donor.isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
          {donor.isAvailable ? '● Available' : '○ Unavailable'}
        </span>
        {donor.matchScore > 0 && (
          <span className="dc-score">⚡ {donor.matchScore}</span>
        )}
      </div>

      {/* Details */}
      <div className="dc-details">
        <div className="dc-detail-row">
          <span className="dc-detail-label">📞 Phone</span>
          <span className="dc-detail-value">{donor.phone}</span>
        </div>
        <div className="dc-detail-row">
          <span className="dc-detail-label">🩸 Donations</span>
          <span className="dc-detail-value">{donor.totalDonations || 0} times</span>
        </div>
        <div className="dc-detail-row">
          <span className="dc-detail-label" style={{ color: donationStatus.color }}>
            ⏱️ {donationStatus.text}
          </span>
        </div>
      </div>

      {/* Action button */}
      {donor.isAvailable && onRequestBlood && (
        <button
          className="btn btn-primary dc-action"
          onClick={() => onRequestBlood(donor)}
          id={`request-from-${donor._id}`}
        >
          Request Blood
        </button>
      )}

      <style>{`
        .donor-card {
          background: var(--white);
          border-radius: var(--radius-xl);
          border: 1px solid var(--gray-100);
          padding: var(--space-lg);
          transition: all var(--transition-base);
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
        }

        .donor-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary-gradient);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .donor-card-hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
          border-color: var(--gray-200);
        }

        .donor-card-hover::before {
          opacity: 1;
        }

        .dc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dc-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          font-family: var(--font-primary);
        }

        .dc-blood-badge {
          padding: 6px 14px;
          border-radius: var(--radius-md);
          color: var(--white);
          font-size: 0.9375rem;
          font-weight: 800;
          font-family: var(--font-primary);
          letter-spacing: 0.5px;
        }

        .dc-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dc-name {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .dc-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: var(--gray-500);
        }

        .dc-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dc-score {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--warning);
          background: var(--warning-light);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .dc-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: var(--gray-50);
          border-radius: var(--radius-md);
        }

        .dc-detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8125rem;
        }

        .dc-detail-label {
          color: var(--gray-500);
        }

        .dc-detail-value {
          font-weight: 600;
          color: var(--gray-700);
        }

        .dc-action {
          width: 100%;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
}

export default DonorCard;
