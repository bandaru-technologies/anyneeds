import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getListing, getListings } from '../services/listingService';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import ListingCard from '../components/ListingCard';
import api from '../services/api';
import './ListingDetailPage.css';

const CONDITION_LABELS = { NEW: 'Brand New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair' };
const CONDITION_COLORS = { NEW: '#22c55e', LIKE_NEW: '#06b6d4', GOOD: '#3b82f6', FAIR: '#f59e0b' };

function formatPrice(price) {
  if (!price) return 'Price on Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const { savedIds, toggle } = useWishlist();
  const isSaved = listing ? savedIds?.has(listing.id) : false;

  useEffect(() => {
    getListing(id)
      .then((r) => {
        setListing(r.data);
        addToRecentlyViewed(r.data);
        api.patch(`/api/listings/${id}/view`).catch(() => {});
        // fetch related
        getListings({ categoryId: r.data.categoryId, size: 6 })
          .then((res) => setRelated((res.data.content || []).filter((l) => l.id !== r.data.id).slice(0, 4)))
          .catch(() => {});
      })
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate, addToRecentlyViewed]);

  const handleChatSeller = useCallback(async () => {
    if (!isLoggedIn) { navigate('/login', { state: { from: `/listings/${id}` } }); return; }
    try {
      const { data } = await api.post('/api/conversations', { listingId: Number(id) });
      navigate(`/messages/${data.id}`);
    } catch (e) {
      console.error(e);
    }
  }, [isLoggedIn, id, navigate]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    const price = listing?.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price on Request';
    const text = `🏷 *${listing?.title}*\n💰 ${price}\n📍 ${listing?.city || 'India'}\n\nCheck it out on SalePe 👇\n${url}`;
    if (navigator.share) {
      navigator.share({ title: listing?.title, text, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }, [listing]);

  const handleReport = async () => {
    if (!reportReason) return;
    try {
      await api.post('/api/reports', { listingId: Number(id), reason: reportReason });
      setReportSubmitted(true);
      setTimeout(() => setShowReport(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!listing) return null;

  const images = listing.imageUrls?.length ? listing.imageUrls : [];

  const ogUrl = `${window.location.origin}/listings/${id}`;
  const ogImage = images[0] || '';
  const ogPrice = listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price on Request';
  const ogDesc = `${ogPrice} · ${listing.city || 'India'} · ${(listing.description || '').slice(0, 150)}`;

  return (
    <div className="detail-page">
      <Helmet>
        <title>{listing.title} — {ogPrice} | SalePe</title>
        <meta name="description" content={ogDesc} />
        <meta property="og:title" content={`${listing.title} — ${ogPrice}`} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="SalePe" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${listing.title} — ${ogPrice}`} />
        <meta name="twitter:description" content={ogDesc} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to={`/listings?categoryId=${listing.categoryId}`}>{listing.categoryName}</Link>
          <span>›</span>
          <span>{listing.title}</span>
        </div>

        <div className="detail-nav">
          <button className="btn btn-ghost detail-nav-back" onClick={() => navigate(-1)}>← Back</button>
          <Link to="/" className="btn btn-ghost detail-nav-home">🏠 Home</Link>
          <Link to="/listings" className="btn btn-ghost detail-nav-browse">Browse All Ads</Link>
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div className="detail-left">
            {images.length > 0 ? (
              <div className="gallery">
                <div className="gallery-main">
                  <img src={images[activeImg]} alt={listing.title} />
                </div>
                {images.length > 1 && (
                  <div className="gallery-thumbs">
                    {images.map((img, i) => (
                      <button key={i} className={`thumb ${i === activeImg ? 'thumb-active' : ''}`} onClick={() => setActiveImg(i)}>
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image">📷 No photos available</div>
            )}

            <div className="detail-card">
              <h2 className="detail-section-title">Description</h2>
              <p className="detail-desc">{listing.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Right */}
          <div className="detail-right">
            <div className="info-card">
              <div className="info-card-header">
                <p className="detail-category">{listing.categoryName}</p>
                <h1 className="detail-title">{listing.title}</h1>
              </div>

              <div className="info-card-body">
                <div className="detail-price-row">
                  <p className="detail-price">{formatPrice(listing.price)}</p>
                  <button
                    className={`detail-save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={(e) => toggle(listing.id, e)}
                    title={isSaved ? 'Remove from saved' : 'Save listing'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                <div className="detail-meta">
                  {listing.location && (
                    <div className="meta-item">
                      <span className="meta-label">🏘 Area</span>
                      <span className="meta-value">{listing.location}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">📍 City</span>
                    <span className="meta-value">{listing.city || '—'}</span>
                  </div>
                  {listing.state && (
                    <div className="meta-item">
                      <span className="meta-label">State</span>
                      <span className="meta-value">{listing.state}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className={`badge badge-${listing.status.toLowerCase()}`}>{listing.status}</span>
                  </div>
                  {listing.condition && (
                    <div className="meta-item">
                      <span className="meta-label">Condition</span>
                      <span className="meta-condition" style={{ color: CONDITION_COLORS[listing.condition] }}>
                        {CONDITION_LABELS[listing.condition] || listing.condition}
                      </span>
                    </div>
                  )}
                  {listing.negotiable && (
                    <div className="meta-item">
                      <span className="meta-label">Price</span>
                      <span className="meta-value" style={{ color: '#22c55e' }}>Negotiable</span>
                    </div>
                  )}
                  {listing.viewCount > 0 && (
                    <div className="meta-item">
                      <span className="meta-label">Views</span>
                      <span className="meta-value">{listing.viewCount}</span>
                    </div>
                  )}
                </div>

                {listing.status === 'ACTIVE' && (
                  <div className="contact-section">
                    <h3>Contact Seller</h3>
                    <Link to={`/seller/${listing.user?.id}`} className="seller-info seller-info-link">
                      <div className="seller-avatar">
                        {(listing.user?.name || listing.user?.phoneNumber || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="seller-name">{listing.user?.name || 'Seller'}</p>
                        <p className="seller-since">Verified Member · View all listings →</p>
                      </div>
                    </Link>

                    {/* CTA Buttons */}
                    <button className="cta-chat-btn" onClick={handleChatSeller}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Chat with Seller
                    </button>

                    <div className="contact-number">
                      <span className="contact-number-label">📞 Contact Number</span>
                      <a href={`tel:+91${listing.user?.phoneNumber}`} className="contact-number-value">
                        +91 {listing.user?.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                {/* Share + Report */}
                <div className="detail-actions-row">
                  <button className="detail-action-btn" onClick={handleShare}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share
                  </button>
                  <button className="detail-action-btn report" onClick={() => setShowReport(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">Similar Listings</h2>
            <div className="listings-grid">
              {related.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="report-modal-title">Report Listing</h3>
            {reportSubmitted ? (
              <p className="report-success">✅ Report submitted. Thank you!</p>
            ) : (
              <>
                <p className="report-modal-sub">Why are you reporting this listing?</p>
                <div className="report-reasons">
                  {['Spam or misleading', 'Wrong category', 'Prohibited item', 'Fraud or scam', 'Duplicate listing', 'Other'].map((r) => (
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
