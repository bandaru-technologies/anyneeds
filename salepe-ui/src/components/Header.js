import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import './Header.css';

export default function Header() {
  const { user, logout, isLoggedIn } = useAuth();
  const { savedIds } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) { setUnreadMsgs(0); return; }
    const fetchUnread = () => {
      api.get('/api/conversations/unread').then((r) => setUnreadMsgs(r.data.count)).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <img src="/salepe-logo.png" alt="Salepe.in" className="logo-img" />
        </Link>

        <nav className="nav-links">
          <Link to="/listings" className="nav-link">Browse Ads</Link>
          <Link to="/listings?categoryId=6&category=Real+Estate" className="nav-link">Real Estate</Link>
          <Link to="/listings?categoryId=1&category=Cars" className="nav-link">Cars</Link>
          <Link to="/listings?categoryId=5&category=Jobs" className="nav-link">Jobs</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>

        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <Link to="/messages" className="header-saved-btn" title="Messages">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {unreadMsgs > 0 && <span className="saved-count">{unreadMsgs > 9 ? '9+' : unreadMsgs}</span>}
              </Link>
              <Link to="/saved" className="header-saved-btn" title="Saved listings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill={savedIds?.size > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {savedIds?.size > 0 && <span className="saved-count">{savedIds.size}</span>}
              </Link>
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
                    <Link to={`/store/${user?.id}`} className="dropdown-item" onClick={() => setMenuOpen(false)}>🏪 My Storefront</Link>
                    <Link to="/analytics" className="dropdown-item" onClick={() => setMenuOpen(false)}>📊 Analytics</Link>
                    <Link to="/subscription" className="dropdown-item" onClick={() => setMenuOpen(false)}>⭐ Subscription</Link>
                    <Link to="/referral" className="dropdown-item" onClick={() => setMenuOpen(false)}>🎁 Invite & Earn</Link>
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
