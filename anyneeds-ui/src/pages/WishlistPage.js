import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import api from '../services/api';
import './WishlistPage.css';

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/saved' } }); return; }
    api.get('/api/wishlist')
      .then((r) => setListings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <div>
            <h1 className="wishlist-title">Saved Listings</h1>
            <p className="wishlist-sub">{listings.length} item{listings.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link to="/listings" className="btn btn-ghost wishlist-browse-btn">Browse More →</Link>
        </div>

        {loading ? (
          <div className="spinner" style={{ marginTop: 60 }} />
        ) : listings.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">🤍</div>
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any listing to save it here</p>
            <Link to="/listings" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Listings</Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
