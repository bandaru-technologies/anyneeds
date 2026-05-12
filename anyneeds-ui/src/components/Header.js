import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">AN</div>
          <span className="logo-text">AnyNeeds<span className="logo-dot">.in</span></span>
        </Link>

        <nav className="nav-links">
          <Link to="/listings" className="nav-link">Browse Ads</Link>
          <Link to="/listings?categoryId=6&category=Real+Estate" className="nav-link">Real Estate</Link>
          <Link to="/listings?categoryId=1&category=Cars" className="nav-link">Cars</Link>
          <Link to="/listings?categoryId=5&category=Jobs" className="nav-link">Jobs</Link>
        </nav>

        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <Link to="/post-ad" className="post-ad-header-btn">+ Post Ad FREE</Link>
              <div className="user-menu">
                <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  <div className="avatar">{(user?.name || user?.phoneNumber || 'U')[0].toUpperCase()}</div>
                  <span className="user-name">{user?.name || user?.phoneNumber}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M5 7L0 2h10z"/>
                  </svg>
                </button>
                {menuOpen && (
                  <div className="dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Profile</Link>
                    <Link to="/my-ads" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Ads</Link>
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/post-ad" className="post-ad-header-btn">+ Post Ad FREE</Link>
              <Link to="/login" className="btn btn-white">Login</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
