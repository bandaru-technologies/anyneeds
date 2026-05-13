import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ReferralPage.css';

export default function ReferralPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/referral' } }); return; }
    api.get('/api/referral/my')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  const handleCopy = useCallback(() => {
    if (!stats?.referralLink) return;
    navigator.clipboard.writeText(stats.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [stats]);

  const handleWhatsApp = useCallback(() => {
    if (!stats?.referralLink) return;
    const text = `Hey! Join me on SalePe — India's fastest growing marketplace. Use my invite link to sign up and get started:\n${stats.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [stats]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!stats) return null;

  return (
    <div className="referral-page">
      <div className="container">
        <div className="referral-hero">
          <div className="referral-hero-icon">🎁</div>
          <h1 className="referral-hero-title">Invite & Earn</h1>
          <p className="referral-hero-sub">
            Invite friends to SalePe. For every friend who joins, you earn a <strong>free boost credit</strong> to spotlight your listings.
          </p>
        </div>

        <div className="referral-code-card">
          <p className="referral-code-label">Your Referral Code</p>
          <div className="referral-code-display">
            <span className="referral-code-text">{stats.referralCode}</span>
          </div>
          <p className="referral-link-text">{stats.referralLink}</p>
          <div className="referral-share-row">
            <button className="referral-copy-btn" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Link
                </>
              )}
            </button>
            <button className="referral-wa-btn" onClick={handleWhatsApp}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.524 5.847L.057 23.882a.5.5 0 0 0 .615.635l6.195-1.62A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.947 0-3.76-.528-5.317-1.443l-.378-.222-3.926 1.028 1.045-3.814-.245-.394A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </div>

        <div className="referral-stats-grid">
          <div className="referral-stat-card">
            <div className="referral-stat-icon">👥</div>
            <div className="referral-stat-value">{stats.total}</div>
            <div className="referral-stat-label">Total Invites</div>
          </div>
          <div className="referral-stat-card">
            <div className="referral-stat-icon">🎁</div>
            <div className="referral-stat-value">{stats.rewarded}</div>
            <div className="referral-stat-label">Boosts Earned</div>
          </div>
          <div className="referral-stat-card">
            <div className="referral-stat-icon">⏳</div>
            <div className="referral-stat-value">{stats.pending}</div>
            <div className="referral-stat-label">Pending</div>
          </div>
        </div>

        <div className="referral-how-card">
          <h2 className="referral-how-title">How it works</h2>
          <div className="referral-steps">
            <div className="referral-step">
              <div className="referral-step-num">1</div>
              <div>
                <strong>Share your link</strong>
                <p>Send your unique referral link to friends via WhatsApp, SMS, or any platform.</p>
              </div>
            </div>
            <div className="referral-step">
              <div className="referral-step-num">2</div>
              <div>
                <strong>Friend signs up</strong>
                <p>Your friend creates an account on SalePe using your referral link.</p>
              </div>
            </div>
            <div className="referral-step">
              <div className="referral-step-num">3</div>
              <div>
                <strong>You earn a boost</strong>
                <p>Once they join, you automatically receive a free 3-day listing boost credit.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="referral-back-row">
          <Link to="/my-ads" className="btn btn-primary">Go to My Ads</Link>
        </div>
      </div>
    </div>
  );
}
