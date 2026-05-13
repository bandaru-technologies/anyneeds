import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import './ListingCard.css';

function formatPrice(price) {
  if (!price) return 'Price on Request';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
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
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const CONDITION_LABELS = {
  NEW: 'Brand New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export default function ListingCard({ listing }) {
  const thumbnail = listing.imageUrls?.[0];
  const { savedIds, toggle } = useWishlist();
  const isSaved = savedIds?.has(listing.id);
  const condition = listing.condition;

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-img">
        {thumbnail ? (
          <img src={thumbnail} alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-img-placeholder">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Boost / Sponsored badge */}
        {listing.boosted && (
          <span className="listing-sponsored-badge">⚡ Sponsored</span>
        )}

        {/* Condition badge */}
        {condition && !listing.boosted && (
          <span className={`condition-badge condition-${condition.toLowerCase()}`}>
            {CONDITION_LABELS[condition] || condition}
          </span>
        )}

        {/* Heart / save button */}
        <button
          className={`card-save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => toggle(listing.id, e)}
          aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Price badge overlay */}
        <div className="listing-price-badge">
          {formatPrice(listing.price)}
          {listing.negotiable && <span className="listing-negotiable-tag">Nego</span>}
        </div>

        {listing.status === 'SOLD' && (
          <div className="listing-sold-overlay">SOLD</div>
        )}
      </div>

      <div className="listing-body">
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-footer">
          <span className="listing-location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
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
