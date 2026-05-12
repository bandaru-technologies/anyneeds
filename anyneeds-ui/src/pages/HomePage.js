import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import ListingCard from '../components/ListingCard';
import { getCategories, getListings } from '../services/listingService';
import './HomePage.css';

const POPULAR = ['iPhone', 'Honda City', '2BHK Flat', 'Sofa', 'Laptop'];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Coimbatore', 'Kochi',
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getCategories(), getListings({ size: 8 })])
      .then(([catRes, listRes]) => {
        setCategories(catRes.data);
        setListings(listRes.data.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('keyword', searchQuery.trim());
    if (searchCity) params.set('city', searchCity);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-icon">⚡</span>
            India's fastest growing marketplace
          </div>

          <h1 className="hero-title">
            Buy, Sell &amp; <span className="hero-accent">Find Anything</span>
            <br />Near You
          </h1>
          <p className="hero-sub">
            AnyNeeds connects millions of buyers and sellers across India.<br />
            Post your ad for free and start selling today.
          </p>

          <form className="hero-search-bar" onSubmit={handleSearch}>
            <div className="hero-search-keyword">
              <svg className="hero-search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="hero-keyword-input"
                type="text"
                placeholder="Search for properties, cars, jobs, mobiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hero-city-select-wrap">
              <svg className="hero-city-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <select
                className="hero-city-select"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="hero-search-btn" type="submit">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          </form>

          <div className="hero-popular">
            <span className="popular-label">Popular:</span>
            {POPULAR.map((p) => (
              <Link key={p} to={`/listings?keyword=${encodeURIComponent(p)}`} className="popular-tag">{p}</Link>
            ))}
          </div>

          <div className="hero-stats">
            <div className="stat"><strong>2.5M+</strong><span>Active Listings</span></div>
            <div className="stat"><strong>8M+</strong><span>Happy Users</span></div>
            <div className="stat"><strong>500+</strong><span>Cities Covered</span></div>
            <div className="stat"><strong>50K+</strong><span>Daily Deals</span></div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <CategoryGrid categories={categories} />

          <section className="section">
            <div className="container">
              <div className="section-header">
                <div className="section-title-line">
                  <h2 className="section-title">Fresh Listings</h2>
                </div>
                <Link to="/listings" className="view-all-link">View All →</Link>
              </div>

              {listings.length === 0 ? (
                <div className="empty-state">
                  <p>No listings yet. Be the first to post an ad!</p>
                  <Link to="/post-ad" className="btn btn-primary" style={{ marginTop: 16 }}>Post Free Ad</Link>
                </div>
              ) : (
                <div className="listings-grid">
                  {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Have something to sell?</h2>
              <p>Join millions of buyers and sellers — post your ad for free today</p>
            </div>
            <button className="cta-btn" onClick={() => navigate('/post-ad')}>+ Post Ad FREE</button>
          </div>
        </div>
      </section>
    </div>
  );
}
