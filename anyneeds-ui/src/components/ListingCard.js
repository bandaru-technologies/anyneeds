import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

function formatPrice(price) {
  if (!price) return 'Price on Request';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ListingCard({ listing }) {
  const thumbnail = listing.imageUrls?.[0];

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-img">
        {thumbnail ? (
          <img src={thumbnail} alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-img-placeholder">
            <span>📷</span>
          </div>
        )}
        <span className={`listing-status badge badge-${listing.status.toLowerCase()}`}>
          {listing.status}
        </span>
      </div>
      <div className="listing-body">
        <p className="listing-category">{listing.categoryName}</p>
        <div className="listing-title-row">
          <h3 className="listing-title">{listing.title}</h3>
          <span className="listing-price">{formatPrice(listing.price)}</span>
        </div>
        <div className="listing-meta">
          <span className="listing-location">
            {listing.location && listing.city
              ? `${listing.location}, ${listing.city}`
              : listing.city || listing.location || 'India'}
          </span>
          <span className="listing-time">{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
