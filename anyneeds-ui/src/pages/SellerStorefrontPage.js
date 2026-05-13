import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import api from '../services/api';
import { getListings } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import './SellerStorefrontPage.css';

function memberSince(dateStr) {
  if (!dateStr) return 'Recently';
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function SellerStorefrontPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDone, setReportDone] = useState(false);

  const isOwnProfile = user && String(user.id) === String(userId);

  useEffect(() => {
    Promise.all([
      api.get(`/api/users/${userId}/public`),
      getListings({ sellerId: userId, size: 50 }),
    ])
      .then(([sellerRes, listRes]) => {
        setSeller(sellerRes.data);
        setFollowing(sellerRes.data.following || false);
        setFollowersCount(sellerRes.data.followersCount || 0);
        setListings(listRes.data.content || []);
      })
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  const handleFollowToggle = useCallback(async () => {
    if (!isLoggedIn) { navigate('/login', { state: { from: `/store/${userId}` } }); return; }
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/api/follows/${userId}`);
      setFollowing(data.following);
      setFollowersCount(data.followersCount);
    } catch (e) { console.error(e); }
    finally { setFollowLoading(false); }
  }, [isLoggedIn, userId, navigate]);

  const handleReport = async () => {
    if (!reportReason) return;
    try {
      await api.post('/api/reports', { sellerId: Number(userId), reason: reportReason });
      setReportDone(true);
      setTimeout(() => setShowReport(false), 2000);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!seller) return null;

  const initials = (seller.name || 'S')[0].toUpperCase();
  const ogTitle = `${seller.name}'s Store on SalePe`;
  const ogDesc = `Browse ${listings.length} listings from ${seller.name} on SalePe. Member since ${memberSince(seller.joinedAt)}.`;

  return (
    <div className="storefront-page">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDesc} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
      </Helmet>

      {/* Store Banner */}
      <div className="storefront-banner">
        <div className="storefront-banner-bg" />
        <div className="container storefront-banner-inner">
          <div className="storefront-avatar">{initials}</div>
          <div className="storefront-meta">
            <div className="storefront-name-row">
              <h1 className="storefront-name">{seller.name}</h1>
              {seller.verified && (
                <span className="storefront-verified-badge">✓ Verified Seller</span>
              )}
            </div>
            <p className="storefront-since">Member since {memberSince(seller.joinedAt)}</p>
            <div className="storefront-stats">
              <div className="storefront-stat">
                <strong>{seller.activeListings || listings.length}</strong>
                <span>Active Ads</span>
              </div>
              <div className="storefront-stat-div" />
              <div className="storefront-stat">
                <strong>{seller.totalListings || listings.length}</strong>
                <span>Total Ads</span>
              </div>
              <div className="storefront-stat-div" />
              <div className="storefront-stat">
                <strong>{followersCount}</strong>
                <span>Followers</span>
              </div>
            </div>
          </div>
          <div className="storefront-actions">
            {!isOwnProfile && (
              <>
                <button
                  className={`storefront-follow-btn ${following ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading ? '...' : following ? '✓ Following' : '+ Follow Store'}
                </button>
                <button className="storefront-report-btn" onClick={() => setShowReport(true)} title="Report seller">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  Report
                </button>
              </>
            )}
            {isOwnProfile && (
              <Link to="/my-ads" className="btn btn-primary">Manage Listings</Link>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Contact strip */}
        {seller.phoneNumber && (
          <div className="storefront-contact-strip">
            <span>📞 Contact Seller:</span>
            <a href={`tel:+91${seller.phoneNumber}`} className="storefront-phone">+91 {seller.phoneNumber}</a>
            <a href={`https://wa.me/91${seller.phoneNumber}`} className="storefront-wa-btn" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        )}

        {/* Listings */}
        <div className="storefront-listings-header">
          <h2>Listings <span className="storefront-count">{listings.length}</span></h2>
          <Link to={`/listings?sellerId=${userId}`} className="view-all-link">View All →</Link>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <p>No active listings from this seller.</p>
            <Link to="/listings" className="btn btn-primary" style={{ marginTop: 16 }}>Browse All Ads</Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="report-modal-title">Report Seller</h3>
            {reportDone ? (
              <p className="report-success">✅ Report submitted. Thank you!</p>
            ) : (
              <>
                <p className="report-modal-sub">Why are you reporting this seller?</p>
                <div className="report-reasons">
                  {['Fake listings', 'Scam or fraud', 'Harassment', 'Spam', 'Counterfeit products', 'Other'].map((r) => (
                    <button
                      key={r}
                      className={`report-reason-btn ${reportReason === r ? 'selected' : ''}`}
                      onClick={() => setReportReason(r)}
                    >{r}</button>
                  ))}
                </div>
                <div className="report-modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowReport(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleReport} disabled={!reportReason}>Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
