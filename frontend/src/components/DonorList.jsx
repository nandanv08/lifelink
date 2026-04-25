/**
 * LifeLink - DonorList Component
 * Displays a filterable, searchable grid of donor cards
 * with smart sorting and pagination
 */

import React, { useState, useEffect, useCallback } from 'react';
import { donorAPI } from '../services/api';
import DonorCard from './DonorCard';
import Loading from './Loading';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function DonorList({ onRequestBlood, limit = 12, showFilters = true }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [bloodGroup, setBloodGroup] = useState('All');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [search, setSearch] = useState('');
  const [available, setAvailable] = useState('all');
  const [sort, setSort] = useState('smart');

  const STATES = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala'
  ];

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit,
        sort
      };

      if (bloodGroup !== 'All') params.bloodGroup = bloodGroup;
      if (city) params.city = city;
      if (state) params.state = state;
      if (search) params.search = search;
      if (available !== 'all') params.available = available;

      const result = await donorAPI.getAll(params);

      if (result.success) {
        setDonors(result.data);
        setPagination(prev => ({ ...prev, ...result.pagination }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bloodGroup, city, state, search, available, sort, pagination.page, limit]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [bloodGroup, city, state, search, available, sort]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDonors, 30000);
    return () => clearInterval(interval);
  }, [fetchDonors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  return (
    <div className="donor-list" id="donor-list">
      {/* Filters */}
      {showFilters && (
        <div className="dl-filters">
          {/* Search bar */}
          <form className="dl-search" onSubmit={handleSearchSubmit}>
            <span className="dl-search-icon">🔍</span>
            <input
              type="text"
              className="form-input dl-search-input"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="donor-search-input"
            />
          </form>

          <div className="dl-filter-row">
            {/* Blood Group Filter */}
            <div className="dl-blood-filter">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  className={`dl-bg-btn ${bloodGroup === bg ? 'dl-bg-active' : ''}`}
                  onClick={() => setBloodGroup(bg)}
                >
                  {bg}
                </button>
              ))}
            </div>

            <div className="dl-filter-controls">
              {/* State Filter */}
              <select
                className="form-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ maxWidth: '180px' }}
                id="donor-state-filter"
              >
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* City Filter */}
              <input
                type="text"
                className="form-input"
                placeholder="Filter by city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ maxWidth: '180px' }}
                id="donor-city-filter"
              />

              {/* Availability Filter */}
              <select
                className="form-select"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                style={{ maxWidth: '160px' }}
                id="donor-availability-filter"
              >
                <option value="all">All Status</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>

              {/* Sort */}
              <select
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ maxWidth: '160px' }}
                id="donor-sort"
              >
                <option value="smart">Smart Match</option>
                <option value="newest">Newest First</option>
                <option value="name">By Name</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="dl-results-count">
            Showing <strong>{donors.length}</strong> of <strong>{pagination.total}</strong> donors
            {bloodGroup !== 'All' && <span> • Blood Group: <strong>{bloodGroup}</strong></span>}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Loading message="Finding donors..." />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Unable to load donors</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDonors}>Try Again</button>
        </div>
      ) : donors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No donors found</h3>
          <p>Try adjusting your filters or search criteria</p>
          <button className="btn btn-secondary" onClick={() => {
            setBloodGroup('All');
            setCity('');
            setState('');
            setSearch('');
            setAvailable('all');
          }}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="dl-grid">
            {donors.map((donor, index) => (
              <div key={donor._id} className="dl-card-wrapper" style={{ animationDelay: `${index * 0.05}s` }}>
                <DonorCard donor={donor} onRequestBlood={onRequestBlood} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="dl-pagination">
              <button
                className="btn btn-ghost btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ← Previous
              </button>
              <div className="dl-page-info">
                Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .dl-filters {
          margin-bottom: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .dl-search {
          position: relative;
        }

        .dl-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          z-index: 1;
        }

        .dl-search-input {
          padding-left: 44px !important;
          background: var(--white) !important;
        }

        .dl-filter-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .dl-blood-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .dl-bg-btn {
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background: var(--gray-100);
          color: var(--gray-600);
          border: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .dl-bg-btn:hover {
          background: var(--primary-50);
          color: var(--primary);
        }

        .dl-bg-active {
          background: var(--primary) !important;
          color: var(--white) !important;
          box-shadow: var(--shadow-red);
        }

        .dl-filter-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .dl-results-count {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .dl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .dl-card-wrapper {
          animation: fadeInUp 0.5s ease-out both;
        }

        .dl-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-lg);
          margin-top: var(--space-xl);
          padding-top: var(--space-xl);
          border-top: 1px solid var(--gray-200);
        }

        .dl-page-info {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        @media (max-width: 768px) {
          .dl-grid {
            grid-template-columns: 1fr;
          }

          .dl-filter-controls {
            flex-direction: column;
          }

          .dl-filter-controls .form-input,
          .dl-filter-controls .form-select {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

export default DonorList;
