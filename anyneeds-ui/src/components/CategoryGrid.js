import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CategoryGrid.css';

const CATEGORY_COLORS = {
  'cars':               'linear-gradient(135deg,#1a3a4a,#0d2535)',
  'bikes':              'linear-gradient(135deg,#3a2510,#1e1208)',
  'other-vehicles':     'linear-gradient(135deg,#0e3326,#071c15)',
  'mobiles-electronics':'linear-gradient(135deg,#1e1450,#0d0a2e)',
  'jobs':               'linear-gradient(135deg,#0d3340,#061e27)',
  'real-estate':        'linear-gradient(135deg,#0d2e40,#061820)',
  'hotel-pg':           'linear-gradient(135deg,#2e1040,#180820)',
  'furniture-home':     'linear-gradient(135deg,#0d2040,#061020)',
  'carpool-travel':     'linear-gradient(135deg,#1e0d40,#100620)',
  'animals-pets':       'linear-gradient(135deg,#2e1a0d,#180d06)',
  'fashion-beauty':     'linear-gradient(135deg,#3a0d2e,#200618)',
  'books-education':    'linear-gradient(135deg,#0d3a20,#061e10)',
  'events-promotions':  'linear-gradient(135deg,#3a200d,#201006)',
  'home-services':      'linear-gradient(135deg,#0d2a3a,#061520)',
  'software-it':        'linear-gradient(135deg,#0d1e40,#060f20)',
  'business':           'linear-gradient(135deg,#1e2e0d,#101806)',
  'others':             'linear-gradient(135deg,#1e1e2e,#0d0d18)',
};

const CATEGORY_ICONS = {
  'cars': '🚗', 'bikes': '🏍️', 'other-vehicles': '🚛',
  'mobiles-electronics': '📱', 'jobs': '💼', 'real-estate': '🏢',
  'hotel-pg': '🛏️', 'furniture-home': '🛋️', 'carpool-travel': '🗺️',
  'animals-pets': '🐾', 'fashion-beauty': '👗', 'books-education': '📚',
  'events-promotions': '🏷️', 'home-services': '🔧', 'software-it': '💻',
  'business': '📈', 'others': '📦',
};

export default function CategoryGrid({ categories }) {
  const navigate = useNavigate();

  return (
    <section className="categories-section">
      <div className="container">
        <div className="categories-top">
          <div>
            <h2>Browse Categories</h2>
            <p>Find what you're looking for</p>
          </div>
          <Link to="/listings" className="categories-view-all">View All &rsaquo;</Link>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              style={{ background: CATEGORY_COLORS[cat.slug] || CATEGORY_COLORS['others'] }}
              onClick={() => navigate(`/listings?categoryId=${cat.id}&category=${cat.name}`)}
            >
              <div className="category-icon-wrap">
                <span className="category-icon">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
              </div>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
