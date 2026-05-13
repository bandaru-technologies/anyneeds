import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!isLoggedIn) { navigate('/login'); return null; }

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaved(false);
    setLoading(true);
    try {
      const { data } = await updateProfile({ name, email });
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Account</h1>
        </div>

        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-sidebar-header">
              <div className="profile-avatar-large">
                {(user?.name || user?.phoneNumber || 'U')[0].toUpperCase()}
              </div>
              <p className="profile-sidebar-name">{user?.name || 'Salepe User'}</p>
              <p className="profile-sidebar-phone">+91 {user?.phoneNumber}</p>
            </div>
            <nav className="profile-sidebar-nav">
              <Link to="/profile" className="sidebar-nav-item active">
                👤 My Profile
              </Link>
              <Link to="/my-ads" className="sidebar-nav-item">
                📋 My Ads
              </Link>
              <hr className="sidebar-divider" />
              <button className="sidebar-nav-item danger" onClick={handleLogout}>
                🚪 Logout
              </button>
            </nav>
          </aside>

          {/* Main */}
          <main className="profile-main">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Edit Profile</h2>
              </div>
              <div className="profile-card-body">
                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="input-field" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={150} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input className="input-field" value={`+91 ${user?.phoneNumber}`} disabled style={{ background: '#f9f9f9', color: '#999' }} />
                  </div>
                  {error && <p className="form-error">{error}</p>}
                  {saved && <p className="form-success">✓ Profile saved successfully!</p>}
                  <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
