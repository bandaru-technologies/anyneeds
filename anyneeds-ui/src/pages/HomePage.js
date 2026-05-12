import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import ListingCard from '../components/ListingCard';
import { getCategories, getListings } from '../services/listingService';
import { useGeoCity } from '../hooks/useGeoCity';
import './HomePage.css';

const POPULAR = ['Apartments in Hyderabad', 'Used Cars', 'iPhone for Sale', 'Jobs in Bangalore', 'PG in Mumbai'];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [cityDetected, setCityDetected] = useState(false);
  const navigate = useNavigate();
  const { detecting, geoError, detect, autoDetect } = useGeoCity();

  useEffect(() => {
    Promise.all([getCategories(), getListings({ size: 8 })])
      .then(([catRes, listRes]) => {
        setCategories(catRes.data);
        setListings(listRes.data.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Auto-detect if permission already granted (no prompt)
    autoDetect((loc) => { setSearchCity(loc.display); setCityDetected(true); });
  }, [autoDetect]);

  const handleDetectCity = () => {
    detect((loc) => { setSearchCity(loc.display); setCityDetected(true); });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('keyword', searchQuery.trim());
    if (searchCity.trim()) params.set('city', searchCity.trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">India's Most Trusted Classifieds Platform</h1>
          <p className="hero-sub">Buy, sell, and find anything — real estate, cars, jobs and more</p>

          <form className="hero-search-bar" onSubmit={handleSearch}>
            <div className="hero-city-wrap">
              <button
                type="button"
                className={`hero-geo-btn ${detecting ? 'detecting' : ''} ${cityDetected ? 'detected' : ''}`}
                onClick={handleDetectCity}
                title={cityDetected ? `Detected: ${searchCity}` : 'Detect my location'}
              >
                {detecting ? <span className="geo-spin" /> : '📍'}
              </button>
              <input
                className="hero-city-input"
                type="text"
                placeholder="City or area"
                value={searchCity}
                onChange={(e) => { setSearchCity(e.target.value); setCityDetected(false); }}
              />
              {searchCity && (
                <button type="button" className="hero-city-clear" onClick={() => { setSearchCity(''); setCityDetected(false); }}>×</button>
              )}
            </div>
            <input
              className="hero-search-input"
              type="text"
              placeholder="Search for properties, cars, jobs, mobiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="hero-search-btn" type="submit">🔍 Search</button>
          </form>
          {geoError && <p className="geo-error-msg">{geoError}</p>}

          <div className="hero-stats">
            <div className="stat"><strong>10L+</strong><span>Listings</span></div>
            <div className="stat"><strong>50L+</strong><span>Users</span></div>
            <div className="stat"><strong>500+</strong><span>Cities</span></div>
            <div className="stat"><strong>Free</strong><span>to Post</span></div>
          </div>
        </div>
      </section>

      {/* Popular searches */}
      <div className="popular-searches">
        <div className="container">
          <div className="popular-searches-inner">
            <span className="popular-label">Popular:</span>
            {POPULAR.map((p) => (
              <Link
                key={p}
                to={`/listings?keyword=${encodeURIComponent(p)}`}
                className="popular-tag"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <CategoryGrid categories={categories} />

          {/* Recent Listings */}
          <section className="section" style={{ background: '#f5f6f8' }}>
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
                  <Link to="/post-ad" className="btn btn-primary" style={{ marginTop: 16 }}>
                    Post Free Ad
                  </Link>
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

      {/* Why AnyNeeds */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            {[
              { icon: '🆓', title: 'Post for Free', desc: 'Post unlimited ads at no cost. No hidden charges ever.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'OTP-verified users and phone number protection.' },
              { icon: '⚡', title: 'Instant Reach', desc: 'Your ad goes live instantly across India.' },
              { icon: '📱', title: 'Mobile App', desc: 'Available on iOS and Android for on-the-go access.' },
            ].map((w) => (
              <div key={w.title} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Have something to sell?</h2>
              <p>Join millions of buyers and sellers on AnyNeeds.in — post your ad for free today</p>
            </div>
            <button className="cta-btn" onClick={() => navigate('/post-ad')}>
              Post FREE Ad Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
