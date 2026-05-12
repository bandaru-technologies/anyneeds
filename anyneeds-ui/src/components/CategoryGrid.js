import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryGrid.css';

const CATEGORY_ICONS = {
  'cars': '🚗',
  'bikes': '🏍️',
  'other-vehicles': '🚛',
  'mobiles-electronics': '📱',
  'jobs': '💼',
  'real-estate': '🏢',
  'hotel-pg': '🛏️',
  'furniture-home': '🛋️',
  'carpool-travel': '🗺️',
  'animals-pets': '🐾',
  'fashion-beauty': '👗',
  'books-education': '📚',
  'events-promotions': '🏷️',
  'home-services': '🔧',
  'software-it': '💻',
  'business': '📈',
  'others': '📦',
};

export default function CategoryGrid({ categories }) {
  const navigate = useNavigate();

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">Browse Categories</h2>
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
