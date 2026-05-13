import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getListing } from '../services/listingService';
import './ListingDetailPage.css';

function formatPrice(price) {
  if (!price) return 'Price on Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getListing(id)
      .then((r) => setListing(r.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!listing) return null;

  const images = listing.imageUrls?.length ? listing.imageUrls : [];

  return (
    <div className="detail-page">
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
                <p className="detail-price">{formatPrice(listing.price)}</p>

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
                </div>

                {listing.status === 'ACTIVE' && (
                  <div className="contact-section">
                    <h3>Contact Seller</h3>
                    <div className="seller-info">
                      <div className="seller-avatar">
                        {(listing.user?.name || listing.user?.phoneNumber || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="seller-name">{listing.user?.name || 'Seller'}</p>
                        <p className="seller-since">Verified Member</p>
                      </div>
                    </div>
                    <div className="contact-number">
                      <span className="contact-number-label">📞 Contact Number</span>
                      <a href={`tel:+91${listing.user?.phoneNumber}`} className="contact-number-value">
                        +91 {listing.user?.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
