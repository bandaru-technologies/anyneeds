import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './AboutPage.css';

const STEPS = [
  { icon: '📸', title: 'Post Your Ad', desc: 'Upload photos, set your price, and publish your listing in under 2 minutes. Completely free.' },
  { icon: '🔍', title: 'Buyers Discover You', desc: 'Your listing appears in search results, category pages, and nearby feeds for buyers in your city.' },
  { icon: '💬', title: 'Chat & Connect', desc: 'Buyers chat directly with you. No middlemen, no commissions. You set your own terms.' },
  { icon: '🤝', title: 'Close the Deal', desc: 'Meet safely, exchange the product, and complete the transaction on your own terms.' },
];

const VALUES = [
  { icon: '🏘', title: 'Hyperlocal First', desc: 'We connect buyers and sellers within the same city, neighbourhood, and community.' },
  { icon: '🆓', title: 'Free to Use', desc: 'Posting ads is always free. We only charge for optional promotional features.' },
  { icon: '🔒', title: 'Safe & Trusted', desc: 'Every seller is phone-verified. Listings are moderated for quality and safety.' },
  { icon: '⚡', title: 'Built for India', desc: 'Designed for Indian users — supports all major cities, regional categories, and UPI payments.' },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <Helmet>
        <title>About SalePe — India's Hyperlocal Marketplace</title>
        <meta name="description" content="SalePe is India's fastest growing hyperlocal marketplace. Buy, sell and discover nearby deals across 500+ cities. Free to post, trusted sellers, direct connections." />
      </Helmet>

      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <h1 className="about-hero-title">Everything On Sale, <span>Near You</span></h1>
          <p className="about-hero-sub">
            SalePe is India's hyperlocal marketplace connecting millions of buyers and sellers across 500+ cities.
            Post free ads, discover nearby deals, and transact with confidence.
          </p>
          <div className="about-hero-actions">
            <Link to="/post-ad" className="btn btn-primary">Post Free Ad</Link>
            <Link to="/listings" className="btn btn-ghost">Browse Listings</Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-section">
        <div className="container">
          <div className="about-mission-card">
            <div className="about-mission-icon">🎯</div>
            <div>
              <h2>Our Mission</h2>
              <p>
                To make buying and selling simple, safe, and accessible for every Indian — whether you're a homeowner
                clearing out old furniture, a student selling a textbook, or a dealer running a full storefront.
                SalePe removes the friction so deals happen faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="about-section about-section-alt">
        <div className="container">
          <h2 className="about-section-title">How SalePe Works</h2>
          <div className="about-steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="about-step-card">
                <div className="about-step-icon">{s.icon}</div>
                <div className="about-step-num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section">
        <div className="container">
          <h2 className="about-section-title">Why SalePe</h2>
          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-section about-section-alt">
        <div className="container">
          <div className="about-stats-row">
            <div className="about-stat"><strong>500+</strong><span>Cities</span></div>
            <div className="about-stat"><strong>50+</strong><span>Categories</span></div>
            <div className="about-stat"><strong>Free</strong><span>To Post</span></div>
            <div className="about-stat"><strong>24/7</strong><span>Support</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="container">
          <h2>Ready to buy or sell?</h2>
          <p>Join SalePe today — it's free and takes less than a minute.</p>
          <div className="about-hero-actions">
            <Link to="/login" className="btn btn-primary">Get Started Free</Link>
            <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
