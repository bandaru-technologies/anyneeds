import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const CATEGORIES = [
  { name: 'Cars', slug: 'cars' }, { name: 'Bikes', slug: 'bikes' },
  { name: 'Mobiles', slug: 'mobiles-electronics' }, { name: 'Real Estate', slug: 'real-estate' },
  { name: 'Jobs', slug: 'jobs' }, { name: 'Furniture', slug: 'furniture-home' },
  { name: 'Fashion', slug: 'fashion-beauty' }, { name: 'Electronics', slug: 'mobiles-electronics' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <img src="/salepe-logo.png" alt="SalePe" className="footer-logo" />
            <p className="footer-tagline">
              India's hyperlocal marketplace. Buy, sell and discover nearby deals across 500+ cities.
            </p>
            <div className="footer-social">
              <a href="https://wa.me/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.524 5.847L.057 23.882a.5.5 0 0 0 .615.635l6.195-1.62A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.947 0-3.76-.528-5.317-1.443l-.378-.222-3.926 1.028 1.045-3.814-.245-.394A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </a>
              <a href="https://instagram.com/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://twitter.com/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About SalePe</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/referral">Invite & Earn</Link></li>
              <li><Link to="/subscription">Seller Plans</Link></li>
            </ul>
          </div>

          {/* Browse */}
          <div className="footer-col">
            <h4 className="footer-heading">Browse</h4>
            <ul className="footer-links">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug + c.name}>
                  <Link to={`/listings?category=${encodeURIComponent(c.name)}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Cities</h4>
            <ul className="footer-links">
              {CITIES.map((city) => (
                <li key={city}>
                  <Link to={`/in/${encodeURIComponent(city.toLowerCase())}`}>{city}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div className="footer-col">
            <h4 className="footer-heading">Sell on SalePe</h4>
            <ul className="footer-links">
              <li><Link to="/post-ad">Post Free Ad</Link></li>
              <li><Link to="/subscription">Subscription Plans</Link></li>
              <li><Link to="/analytics">Seller Analytics</Link></li>
              <li><Link to="/my-ads">Manage Listings</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} SalePe. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/about">Terms of Service</Link>
            <Link to="/about">Privacy Policy</Link>
            <Link to="/contact">Report Issue</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
