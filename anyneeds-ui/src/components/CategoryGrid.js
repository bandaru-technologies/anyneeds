import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS } from '../data/categoryIcons';
import './CategoryGrid.css';

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
              onClick={() => navigate(`/listings?categoryId=${cat.id}&category=${cat.name}`)}
            >
              <span className="category-icon">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
