import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import api from '../services/api';
import { getListings } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import './SellerProfilePage.css';

function memberSince(dateStr) {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function SellerProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

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
    if (!isLoggedIn) { navigate('/login', { state: { from: `/seller/${userId}` } }); return; }
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/api/follows/${userId}`);
      setFollowing(data.following);
      setFollowersCount(data.followersCount);
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  }, [isLoggedIn, userId, navigate]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!seller) return null;

  const initials = seller.initials || seller.name?.[0]?.toUpperCase() || 'S';

  return (
    <div className="seller-page">
      <div className="container">
        {/* Profile hero */}
        <div className="seller-hero">
          <div className="seller-avatar-lg">{initials}</div>
          <div className="seller-hero-info">
            <h1 className="seller-hero-name">{seller.name}</h1>
            <p className="seller-hero-since">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Member since {memberSince(seller.joinedAt)}
            </p>
            <div className="seller-stats-row">
              <div className="seller-stat">
                <strong>{seller.activeListings}</strong>
                <span>Active Ads</span>
              </div>
              <div className="seller-stat-divider" />
              <div className="seller-stat">
                <strong>{seller.totalListings}</strong>
                <span>Total Ads</span>
              </div>
              <div className="seller-stat-divider" />
              <div className="seller-stat">
                <strong>{followersCount}</strong>
                <span>Followers</span>
              </div>
              {seller.verified ? (
                <div className="seller-trust-badge seller-verified-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  ✓ Verified Seller
                </div>
              ) : (
                <div className="seller-trust-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Member
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <button
                className={`follow-btn ${following ? 'follow-btn-following' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="seller-listings-section">
          <h2 className="seller-listings-title">
            Listings by {seller.name}
            <span className="seller-listings-count">{listings.length}</span>
          </h2>

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
      </div>
    </div>
  );
}
