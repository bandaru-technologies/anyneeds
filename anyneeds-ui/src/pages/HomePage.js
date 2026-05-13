import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import ListingCard from '../components/ListingCard';
import { getCategories, getListings } from '../services/listingService';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './HomePage.css';

const POPULAR = ['iPhone', 'Honda City', '2BHK Flat', 'Sofa', 'Laptop'];

function toTickerMsg(listing) {
  const city = listing.city || listing.location || 'India';
  return `Someone from ${city} just posted ${listing.title}`;
}

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
  const [activityMsgs, setActivityMsgs] = useState([]);
  const [activityIdx, setActivityIdx] = useState(0);
  const [activityVisible, setActivityVisible] = useState(true);
  const latestIdRef = React.useRef(null);
  const navigate = useNavigate();
  const { recentlyViewed } = useRecentlyViewed();
  const { isLoggedIn } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);

  const fetchRecentActivity = React.useCallback((prepend = false) => {
    getListings({ size: 10, sort: 'createdAt,desc' })
      .then((res) => {
        const items = res.data.content || [];
        if (!items.length) return;
        const msgs = items.map(toTickerMsg);
        if (prepend) {
          const newId = items[0].id;
          if (newId !== latestIdRef.current) {
            latestIdRef.current = newId;
            setActivityMsgs((prev) => [msgs[0], ...prev.filter((m) => m !== msgs[0])]);
            setActivityVisible(false);
            setTimeout(() => { setActivityIdx(0); setActivityVisible(true); }, 400);
          }
        } else {
          latestIdRef.current = items[0].id;
          setActivityMsgs(msgs);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRecentActivity(false);
    const poll = setInterval(() => fetchRecentActivity(true), 30000);
    return () => clearInterval(poll);
  }, [fetchRecentActivity]);

  useEffect(() => {
    if (!activityMsgs.length) return;
    const interval = setInterval(() => {
      setActivityVisible(false);
      setTimeout(() => {
        setActivityIdx((i) => (i + 1) % activityMsgs.length);
        setActivityVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [activityMsgs]);

  useEffect(() => {
    Promise.all([
      getCategories(),
      getListings({ size: 50 }),
      api.get('/api/listings/featured').catch(() => ({ data: [] })),
    ])
      .then(([catRes, listRes, featuredRes]) => {
        setCategories(catRes.data);
        setListings(listRes.data.content || []);
        setFeatured(featuredRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get('/api/follows/feed/preview')
      .then((r) => setFollowingFeed(r.data || []))
      .catch(() => {});
  }, [isLoggedIn]);

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
            Everything On Sale, <span className="hero-accent">Near You</span>
          </h1>
          <p className="hero-sub">
            Discover nearby deals, connect with trusted buyers and sellers, and buy or sell new &amp; used products across India with SalePe.
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

          {activityMsgs.length > 0 && (
            <div className={`activity-ticker${activityVisible ? ' activity-ticker-show' : ''}`}>
              <span className="activity-dot" />
              {activityMsgs[activityIdx % activityMsgs.length]}
            </div>
          )}

        </div>
      </section>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <CategoryGrid categories={categories} />

          {featured.length > 0 && (
            <section className="section">
              <div className="container">
                <div className="section-header">
                  <div className="section-title-line">
                    <span className="sponsored-label">Sponsored</span>
                    <h2 className="section-title">Featured Products</h2>
                  </div>
                  <Link to="/listings" className="view-all-link">View All →</Link>
                </div>
                <div className="listings-grid featured-grid">
                  {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            </section>
          )}

          {followingFeed.length > 0 && (
            <section className="section">
              <div className="container">
                <div className="section-header">
                  <div className="section-title-line">
                    <h2 className="section-title">From Sellers You Follow</h2>
                  </div>
                  <Link to="/listings" className="view-all-link">View All →</Link>
                </div>
                <div className="listings-grid">
                  {followingFeed.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            </section>
          )}

          {recentlyViewed.length > 0 && (
            <section className="section">
              <div className="container">
                <div className="section-header">
                  <div className="section-title-line">
                    <h2 className="section-title">Recently Viewed</h2>
                  </div>
                </div>
                <div className="recently-viewed-scroll">
                  {recentlyViewed.slice(0, 10).map((l) => (
                    <div key={l.id} className="rv-card" onClick={() => navigate(`/listings/${l.id}`)}>
                      <div className="rv-img">
                        {l.imageUrls?.[0]
                          ? <img src={l.imageUrls[0]} alt={l.title} />
                          : <span className="rv-no-img">📷</span>
                        }
                      </div>
                      <div className="rv-body">
                        <p className="rv-title">{l.title}</p>
                        <p className="rv-price">{l.price ? `₹${Number(l.price).toLocaleString('en-IN')}` : 'Price on Request'}</p>
                        <p className="rv-city">{l.city || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

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

    </div>
  );
}
