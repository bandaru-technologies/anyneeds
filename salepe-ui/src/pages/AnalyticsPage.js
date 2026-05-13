import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AnalyticsPage.css';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value.toLocaleString('en-IN')}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function MiniBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mini-bar-track">
      <div className="mini-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/analytics' } }); return; }
    api.get('/api/analytics/dashboard')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!data) return null;

  const maxViews = Math.max(...(data.listings || []).map((l) => l.views), 1);
  const maxSaves = Math.max(...(data.listings || []).map((l) => l.saves), 1);
  const maxChats = Math.max(...(data.listings || []).map((l) => l.chats), 1);

  return (
    <div className="analytics-page">
      <div className="container">
        <div className="analytics-header">
          <div>
            <h1 className="page-title">Seller Analytics</h1>
            <p className="analytics-sub">How your listings are performing</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/my-ads" className="btn btn-ghost">← My Ads</Link>
            <Link to="/subscription" className="btn btn-primary">⭐ Upgrade Plan</Link>
          </div>
        </div>

        {/* Summary stats */}
        <div className="stats-grid">
          <StatCard label="Total Views" value={data.totalViews} icon="👁" color="#3b82f6" sub="Across all listings" />
          <StatCard label="Total Saves" value={data.totalSaves} icon="❤️" color="#ef4444" sub="Wishlisted by buyers" />
          <StatCard label="Chat Enquiries" value={data.totalChats} icon="💬" color="#8b5cf6" sub="Direct messages" />
          <StatCard label="Active Listings" value={data.activeListings} icon="📋" color="#22c55e" sub="Currently live" />
        </div>

        {/* Listings table */}
        <div className="analytics-table-wrap">
          <div className="analytics-table-header">
            <h2>Listing Performance</h2>
            <Link to="/post-ad" className="btn btn-ghost" style={{ fontSize: 13 }}>+ Post New Ad</Link>
          </div>

          {data.listings?.length === 0 ? (
            <div className="empty-state">
              <p>No listings yet. <Link to="/post-ad">Post your first ad</Link> to see analytics.</p>
            </div>
          ) : (
            <div className="analytics-table">
              <div className="analytics-table-head">
                <div className="atc atc-listing">Listing</div>
                <div className="atc atc-views">Views</div>
                <div className="atc atc-saves">Saves</div>
                <div className="atc atc-chats">Chats</div>
                <div className="atc atc-status">Status</div>
                <div className="atc atc-action">Action</div>
              </div>

              {data.listings.map((l) => (
                <div key={l.listingId} className="analytics-row">
                  <div className="atc atc-listing">
                    <div className="ar-img">
                      {l.thumbnail
                        ? <img src={l.thumbnail} alt={l.title} />
                        : <span>📷</span>
                      }
                    </div>
                    <div className="ar-info">
                      <Link to={`/listings/${l.listingId}`} className="ar-title">{l.title}</Link>
                      <span className="ar-city">{l.city || '—'}</span>
                      {l.boosted && <span className="ar-boosted-tag">⚡ Boosted</span>}
                    </div>
                  </div>

                  <div className="atc atc-views">
                    <span className="ar-metric">{l.views.toLocaleString()}</span>
                    <MiniBar value={l.views} max={maxViews} />
                  </div>

                  <div className="atc atc-saves">
                    <span className="ar-metric">{l.saves}</span>
                    <MiniBar value={l.saves} max={maxSaves} />
                  </div>

                  <div className="atc atc-chats">
                    <span className="ar-metric">{l.chats}</span>
                    <MiniBar value={l.chats} max={maxChats} />
                  </div>

                  <div className="atc atc-status">
                    <span className={`badge badge-${l.status.toLowerCase()}`}>{l.status}</span>
                  </div>

                  <div className="atc atc-action">
                    {l.status === 'ACTIVE' && !l.boosted && (
                      <Link to="/my-ads" className="ar-boost-link">⚡ Boost</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade nudge */}
        <div className="analytics-upgrade-banner">
          <div className="analytics-upgrade-text">
            <strong>📈 Want more visibility?</strong>
            <span>Boost your listings to appear at the top of search results and on the homepage.</span>
          </div>
          <Link to="/subscription" className="btn btn-primary">View Plans</Link>
        </div>
      </div>
    </div>
  );
}
