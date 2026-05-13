import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyListings, markAsSold, deleteListing } from '../services/listingService';
import BoostModal from '../components/BoostModal';
import './MyAdsPage.css';

function formatPrice(price) {
  if (!price) return 'Price on Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function MyAdsPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostTarget, setBoostTarget] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  const fetchMyAds = () => {
    setLoading(true);
    getMyListings()
      .then((r) => setListings(r.data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMyAds(); }, []);

  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this listing as sold?')) return;
    await markAsSold(id);
    fetchMyAds();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    await deleteListing(id);
    fetchMyAds();
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;

  return (
    <div className="my-ads-page">
      <div className="container">
        <div className="my-ads-header">
          <h1 className="page-title">My Ads</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/analytics" className="btn btn-ghost">📊 Analytics</Link>
            <Link to="/post-ad" className="btn btn-primary">+ Post New Ad</Link>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>📋</span>
            <p>You haven't posted any ads yet.</p>
            <Link to="/post-ad" className="btn btn-primary" style={{ marginTop: 16 }}>
              Post Your First Ad
            </Link>
          </div>
        ) : (
          <div className="my-ads-list">
            {listings.map((l) => (
              <div key={l.id} className={`my-ad-card ${l.boosted ? 'my-ad-card-boosted' : ''}`}>
                {l.boosted && <span className="my-ad-boost-badge">⚡ Boosted</span>}
                <div className="my-ad-img">
                  {l.imageUrls?.[0] ? (
                    <img src={l.imageUrls[0]} alt={l.title} />
                  ) : (
                    <div className="my-ad-img-placeholder">📷</div>
                  )}
                </div>
                <div className="my-ad-info">
                  <span className="my-ad-category">{l.categoryName}</span>
                  <Link to={`/listings/${l.id}`} className="my-ad-title">{l.title}</Link>
                  <p className="my-ad-price">{formatPrice(l.price)}</p>
                  <p className="my-ad-location">{l.city || l.location || 'India'}</p>
                  <div className="my-ad-stats">
                    <span title="Views">👁 {l.viewCount || 0}</span>
                  </div>
                </div>
                <div className="my-ad-actions">
                  <span className={`badge badge-${l.status.toLowerCase()}`}>{l.status}</span>
                  {l.status === 'ACTIVE' && (
                    <>
                      <button
                        className="btn btn-boost action-btn"
                        onClick={() => setBoostTarget(l)}
                        title="Boost this listing"
                      >
                        ⚡ Boost
                      </button>
                      <Link to={`/edit-ad/${l.id}`} className="btn btn-ghost action-btn">Edit</Link>
                      <button className="btn btn-ghost action-btn" onClick={() => handleMarkSold(l.id)}>Mark Sold</button>
                    </>
                  )}
                  <button className="btn btn-danger action-btn" onClick={() => handleDelete(l.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {boostTarget && (
        <BoostModal
          listing={boostTarget}
          onClose={() => setBoostTarget(null)}
          onSuccess={fetchMyAds}
        />
      )}
    </div>
  );
}
