import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { getCategories, getListings } from '../services/listingService';
import { CATEGORY_ICONS } from '../data/categoryIcons';
import ListingCard from '../components/ListingCard';
import './CityPage.css';

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export default function CityPage() {
  const { city, category } = useParams();
  const cityLabel = capitalize(decodeURIComponent(city || ''));
  const categoryLabel = category ? capitalize(decodeURIComponent(category.replace(/-/g, ' '))) : '';

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchedCategory, setMatchedCategory] = useState(null);

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (category && categories.length > 0) {
      const normalized = decodeURIComponent(category).replace(/-/g, ' ').toLowerCase();
      const found = categories.find((c) => c.name.toLowerCase() === normalized);
      setMatchedCategory(found || null);
    }
  }, [category, categories]);

  useEffect(() => {
    const params = { city: cityLabel, size: 40 };
    if (matchedCategory) params.categoryId = matchedCategory.id;
    else if (category && categories.length > 0) params.keyword = decodeURIComponent(category).replace(/-/g, ' ');

    setLoading(true);
    getListings(params)
      .then((r) => setListings(r.data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cityLabel, matchedCategory, category, categories]);

  const pageTitle = categoryLabel
    ? `${categoryLabel} in ${cityLabel} — Buy & Sell | SalePe`
    : `Buy & Sell in ${cityLabel} — Free Classifieds | SalePe`;
  const pageDesc = categoryLabel
    ? `Find the best ${categoryLabel} deals in ${cityLabel}. Browse ${listings.length}+ listings. Post your ad for free on SalePe.`
    : `Discover thousands of listings in ${cityLabel}. Buy, sell, and find anything local. Free classifieds on SalePe.`;
  const canonicalUrl = category
    ? `${window.location.origin}/in/${encodeURIComponent(city)}/${category}`
    : `${window.location.origin}/in/${encodeURIComponent(city)}`;

  return (
    <div className="city-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <div className="container">
        <div className="city-breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to={`/listings?city=${encodeURIComponent(cityLabel)}`}>{cityLabel}</Link>
          {categoryLabel && (
            <>
              <span>›</span>
              <span>{categoryLabel}</span>
            </>
          )}
        </div>

        <div className="city-hero">
          <h1 className="city-hero-title">
            {categoryLabel ? `${categoryLabel} in ${cityLabel}` : `Buy & Sell in ${cityLabel}`}
          </h1>
          <p className="city-hero-sub">
            {listings.length > 0
              ? `${listings.length}+ listings found`
              : 'Explore local classifieds'} · Free ads · No registration fees
          </p>
          <div className="city-hero-actions">
            <Link to={`/listings?city=${encodeURIComponent(cityLabel)}${matchedCategory ? `&categoryId=${matchedCategory.id}` : ''}`} className="btn btn-primary">
              Browse All in {cityLabel}
            </Link>
            <Link to="/post-ad" className="btn btn-ghost">+ Post Free Ad</Link>
          </div>
        </div>

        {categories.length > 0 && !categoryLabel && (
          <div className="city-categories">
            <h2 className="city-section-title">Browse by Category in {cityLabel}</h2>
            <div className="city-cat-grid">
              {categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/in/${encodeURIComponent(city)}/${encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="city-cat-chip"
                >
                  <span className="city-cat-icon">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  <span className="city-cat-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="city-listings-section">
          <h2 className="city-section-title">
            {categoryLabel ? `${categoryLabel} Listings` : 'Latest Listings'} in {cityLabel}
          </h2>

          {loading ? (
            <div className="spinner" />
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <p>No listings found in {cityLabel}{categoryLabel ? ` for ${categoryLabel}` : ''}.</p>
              <Link to="/post-ad" className="btn btn-primary" style={{ marginTop: 16 }}>Be the first to post!</Link>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>

        <div className="city-seo-block">
          <h2 className="city-seo-title">
            {categoryLabel ? `About ${categoryLabel} in ${cityLabel}` : `About Classifieds in ${cityLabel}`}
          </h2>
          <p className="city-seo-text">
            SalePe is the trusted free classifieds platform for {cityLabel}.
            {categoryLabel
              ? ` Whether you're buying or selling ${categoryLabel}, you'll find the best deals right here.`
              : ' Post your ads for free and connect with local buyers and sellers.'
            } No hidden fees. No commissions. Just direct buyer–seller connections.
          </p>
        </div>
      </div>
    </div>
  );
}
