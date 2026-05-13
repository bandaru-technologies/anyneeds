import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { getListings, getCategories } from '../services/listingService';
import { useGeoCity } from '../hooks/useGeoCity';
import api from '../services/api';
import './ListingsPage.css';

const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: 'NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

const POSTED_IN_OPTIONS = [
  { value: '', label: 'Any Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [negotiable, setNegotiable] = useState(searchParams.get('negotiable') === 'true');
  const [postedIn, setPostedIn] = useState(searchParams.get('postedIn') || '');
  const [cityDetected, setCityDetected] = useState(false);
  const { detecting, geoError, detect } = useGeoCity();

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('salepe_recent_searches') || '[]'); } catch { return []; }
  });
  const debouncedKeyword = useDebouncedValue(keyword, 300);
  const keywordRef = useRef(null);

  useEffect(() => {
    if (debouncedKeyword.length < 2) { setSuggestions([]); return; }
    api.get('/api/listings/suggestions', { params: { q: debouncedKeyword } })
      .then((r) => setSuggestions(r.data || []))
      .catch(() => setSuggestions([]));
  }, [debouncedKeyword]);

  const saveRecentSearch = (q) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 8);
    setRecentSearches(updated);
    try { localStorage.setItem('salepe_recent_searches', JSON.stringify(updated)); } catch {}
  };

  const buildParams = useCallback(() => {
    const p = {};
    if (categoryId) p.categoryId = categoryId;
    if (city) p.city = city;
    if (area) p.area = area;
    if (keyword) p.keyword = keyword;
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    if (condition) p.condition = condition;
    if (negotiable) p.negotiable = 'true';
    if (postedIn) p.postedIn = postedIn;
    return p;
  }, [categoryId, city, area, keyword, minPrice, maxPrice, condition, negotiable, postedIn]);

  const fetchListings = useCallback(async (pg = 0, append = false) => {
    setLoading(true);
    try {
      const params = { page: pg, size: 20, ...buildParams() };
      const { data } = await getListings(params);
      const items = data.content || [];
      setListings((prev) => (append ? [...prev, ...items] : items));
      setTotal(data.totalElements || 0);
      setHasMore(!data.last);
      setPage(pg);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchListings(0); }, [fetchListings]);

  const handleFilter = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (keyword) saveRecentSearch(keyword);
    setSearchParams(buildParams());
    fetchListings(0);
  };

  const clearAll = () => {
    setCategoryId(''); setCity(''); setArea(''); setKeyword('');
    setMinPrice(''); setMaxPrice(''); setCondition('');
    setNegotiable(false); setPostedIn('');
    setSearchParams({});
  };

  const applyKeyword = (val) => {
    setKeyword(val);
    setShowSuggestions(false);
    saveRecentSearch(val);
  };

  const activeCategoryName = categories.find((c) => String(c.id) === String(categoryId))?.name;

  const hasActiveFilters = !!(activeCategoryName || city || area || keyword || minPrice || maxPrice || condition || negotiable || postedIn);

  return (
    <div className="listings-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>{activeCategoryName || 'All Listings'}</span>
        </div>

        {hasActiveFilters && (
          <div className="active-filters">
            {activeCategoryName && (
              <div className="filter-chip">
                {activeCategoryName}
                <button onClick={() => { setCategoryId(''); setSearchParams(p => { p.delete('categoryId'); return p; }); }}>×</button>
              </div>
            )}
            {city && <div className="filter-chip">📍 {city}<button onClick={() => setCity('')}>×</button></div>}
            {area && <div className="filter-chip">🏘 {area}<button onClick={() => setArea('')}>×</button></div>}
            {keyword && <div className="filter-chip">🔍 {keyword}<button onClick={() => setKeyword('')}>×</button></div>}
            {(minPrice || maxPrice) && (
              <div className="filter-chip">
                ₹{minPrice || '0'} – {maxPrice ? `₹${maxPrice}` : '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}>×</button>
              </div>
            )}
            {condition && <div className="filter-chip">{CONDITIONS.find(c => c.value === condition)?.label}<button onClick={() => setCondition('')}>×</button></div>}
            {negotiable && <div className="filter-chip">Negotiable<button onClick={() => setNegotiable(false)}>×</button></div>}
            {postedIn && <div className="filter-chip">{POSTED_IN_OPTIONS.find(p => p.value === postedIn)?.label}<button onClick={() => setPostedIn('')}>×</button></div>}
          </div>
        )}

        <div className="listings-layout">
          {/* Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="clear-all-btn" onClick={clearAll}>Clear All</button>
            </div>
            <form onSubmit={handleFilter} className="filters-body">
              {/* Keyword + autocomplete */}
              <div className="filter-group">
                <label className="filter-label">Search</label>
                <div className="autocomplete-wrap" ref={keywordRef}>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Keyword..."
                    value={keyword}
                    onChange={(e) => { setKeyword(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                  {showSuggestions && (suggestions.length > 0 || (recentSearches.length > 0 && !keyword)) && (
                    <div className="autocomplete-dropdown">
                      {!keyword && recentSearches.length > 0 && (
                        <>
                          <p className="autocomplete-group-label">Recent</p>
                          {recentSearches.slice(0, 4).map((s) => (
                            <button key={s} type="button" className="autocomplete-item" onMouseDown={() => applyKeyword(s)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                              {s}
                            </button>
                          ))}
                        </>
                      )}
                      {suggestions.length > 0 && (
                        <>
                          {!keyword && recentSearches.length > 0 && <div className="autocomplete-divider" />}
                          {suggestions.map((s) => (
                            <button key={s} type="button" className="autocomplete-item" onMouseDown={() => applyKeyword(s)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                              {s}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="filter-group">
                <label className="filter-label">
                  City
                  {cityDetected && <span className="detected-tag">📍 Detected</span>}
                </label>
                <div className="city-filter-wrap">
                  <input
                    className="input-field city-filter-input"
                    type="text"
                    placeholder="Enter city..."
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setCityDetected(false); }}
                  />
                  <button
                    type="button"
                    className={`city-geo-btn ${detecting ? 'detecting' : ''}`}
                    onClick={() => detect((loc) => { setCity(loc.city); setCityDetected(true); })}
                    title="Detect my location"
                  >
                    {detecting ? <span className="geo-spin-sm" /> : '📍'}
                  </button>
                </div>
                {geoError && <p className="city-geo-error">{geoError}</p>}
              </div>

              {/* Area */}
              <div className="filter-group">
                <label className="filter-label">Area / Locality</label>
                <input className="input-field" type="text" placeholder="e.g. Kalyan Nagar" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">Price Range (₹)</label>
                <div className="price-range-row">
                  <input
                    className="input-field price-input"
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="price-sep">–</span>
                  <input
                    className="input-field price-input"
                    type="number"
                    placeholder="Max"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="filter-group">
                <label className="filter-label">Condition</label>
                <div className="condition-pills">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`condition-pill ${condition === c.value ? 'active' : ''}`}
                      onClick={() => setCondition(c.value)}
                    >{c.label}</button>
                  ))}
                </div>
              </div>

              {/* Posted In */}
              <div className="filter-group">
                <label className="filter-label">Posted</label>
                <div className="posted-pills">
                  {POSTED_IN_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`posted-pill ${postedIn === p.value ? 'active' : ''}`}
                      onClick={() => setPostedIn(p.value)}
                    >{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Negotiable */}
              <div className="filter-group">
                <label className="filter-toggle-row">
                  <span className="filter-label" style={{ marginBottom: 0 }}>Negotiable Only</span>
                  <div
                    className={`toggle-switch ${negotiable ? 'on' : ''}`}
                    onClick={() => setNegotiable((v) => !v)}
                    role="switch"
                    aria-checked={negotiable}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </label>
              </div>

              <button className="btn btn-primary filter-btn" type="submit">Apply Filters</button>
            </form>
          </aside>

          {/* Main */}
          <main className="listings-main">
            <div className="listings-header">
              <div className="listings-title-row">
                <h1>{activeCategoryName || 'All Listings'}</h1>
                {!loading && <p className="results-count">{total.toLocaleString()} results found</p>}
              </div>
            </div>

            {loading && listings.length === 0 ? (
              <div className="spinner" />
            ) : listings.length === 0 ? (
              <div className="empty-state" style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 48 }}>🔍</span>
                <p>No listings found. Try different filters.</p>
              </div>
            ) : (
              <>
                <div className="listings-grid-main">
                  {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
                {hasMore && (
                  <div className="load-more-wrap">
                    <button className="btn btn-outline" onClick={() => fetchListings(page + 1, true)} disabled={loading}>
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
