import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { getListings, getCategories } from '../services/listingService';
import { useGeoCity } from '../hooks/useGeoCity';
import './ListingsPage.css';

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
  const [cityDetected, setCityDetected] = useState(false);
  const { detecting, geoError, detect } = useGeoCity();

  const fetchListings = useCallback(async (pg = 0, append = false) => {
    setLoading(true);
    try {
      const params = { page: pg, size: 20 };
      if (categoryId) params.categoryId = categoryId;
      if (city) params.city = city;
      if (area) params.area = area;
      if (keyword) params.keyword = keyword;
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
  }, [categoryId, city, area, keyword]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchListings(0); }, [fetchListings]);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (categoryId) params.categoryId = categoryId;
    if (city) params.city = city;
    if (area) params.area = area;
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
    fetchListings(0);
  };

  const clearAll = () => {
    setCategoryId(''); setCity(''); setArea(''); setKeyword('');
    setSearchParams({});
  };

  const activeCategoryName = categories.find((c) => String(c.id) === String(categoryId))?.name;

  return (
    <div className="listings-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>{activeCategoryName || 'All Listings'}</span>
        </div>

        {/* Active filter chips */}
        {(activeCategoryName || city || area || keyword) && (
          <div className="active-filters">
            {activeCategoryName && (
              <div className="filter-chip">
                {activeCategoryName}
                <button onClick={() => { setCategoryId(''); setSearchParams(p => { p.delete('categoryId'); return p; }); }}>×</button>
              </div>
            )}
            {city && (
              <div className="filter-chip">
                📍 {city}
                <button onClick={() => { setCity(''); }}>×</button>
              </div>
            )}
            {area && (
              <div className="filter-chip">
                🏘 {area}
                <button onClick={() => { setArea(''); }}>×</button>
              </div>
            )}
            {keyword && (
              <div className="filter-chip">
                🔍 {keyword}
                <button onClick={() => { setKeyword(''); }}>×</button>
              </div>
            )}
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
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

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

              <div className="filter-group">
                <label className="filter-label">Area / Locality</label>
                <input className="input-field" type="text" placeholder="e.g. Kalyan Nagar" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>

              <div className="filter-group">
                <label className="filter-label">Keyword</label>
                <input className="input-field" type="text" placeholder="Search keyword..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>

              <button className="btn btn-primary filter-btn" type="submit">Apply</button>
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
