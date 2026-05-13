import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './SubscriptionPage.css';

const PLANS = [
  {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    color: '#64748b',
    icon: '🆓',
    features: [
      '5 listings',
      'Basic search visibility',
      'Standard support',
    ],
    missing: ['Verified badge', 'Analytics', 'Boost credits', 'Storefront'],
  },
  {
    tier: 'STARTER',
    name: 'Starter',
    price: 299,
    color: '#3b82f6',
    icon: '⭐',
    features: [
      '15 listings',
      'Verified seller badge',
      'Basic analytics',
      '1 boost credit/month',
    ],
    missing: ['Unlimited listings', 'Storefront', 'Priority support'],
  },
  {
    tier: 'DEALER',
    name: 'Dealer',
    price: 999,
    color: '#8b5cf6',
    icon: '🏪',
    popular: true,
    features: [
      'Unlimited listings',
      'Verified seller badge',
      'Full analytics dashboard',
      '2 boost credits/month',
      'Dealer storefront page',
      'Priority support',
    ],
    missing: ['5 boost credits'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: 1999,
    color: '#f59e0b',
    icon: '👑',
    features: [
      'Unlimited listings',
      'Verified seller badge',
      'Full analytics dashboard',
      '5 boost credits/month',
      'Pro storefront page',
      'Priority + phone support',
      'Early access to new features',
    ],
    missing: [],
  },
];

export default function SubscriptionPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/subscription' } }); return; }
    api.get('/api/subscriptions/my')
      .then((r) => setCurrent(r.data))
      .catch(() => setCurrent({ tier: 'FREE', active: false }))
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  const handleSubscribe = async (tier) => {
    if (tier === 'FREE') return;
    setSubscribing(tier);
    // Simulate payment (Razorpay integration ready)
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const res = await api.post('/api/subscriptions', { tier });
      setCurrent(res.data);
      setSuccess(`You're now on the ${tier} plan!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch {}
    setSubscribing(null);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription?')) return;
    await api.delete('/api/subscriptions');
    setCurrent({ tier: 'FREE', active: false });
    setSuccess('Subscription cancelled.');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;

  const currentTier = current?.tier || 'FREE';

  return (
    <div className="sub-page">
      <div className="container">
        <div className="sub-hero">
          <h1 className="sub-title">Choose Your Plan</h1>
          <p className="sub-sub">Scale your business on SalePe. Upgrade anytime, cancel anytime.</p>
          {current?.active && (
            <div className="sub-current-banner">
              ✅ You're on the <strong>{currentTier}</strong> plan
              {current.expiresAt && ` · Renews ${new Date(current.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              <button className="sub-cancel-link" onClick={handleCancel}>Cancel</button>
            </div>
          )}
          {success && <div className="sub-success-banner">{success}</div>}
        </div>

        <div className="sub-grid">
          {PLANS.map((plan) => {
            const isActive = currentTier === plan.tier && (plan.tier === 'FREE' || current?.active);
            const isLoading = subscribing === plan.tier;
            return (
              <div
                key={plan.tier}
                className={`sub-card ${plan.popular ? 'sub-card-popular' : ''} ${isActive ? 'sub-card-active' : ''}`}
                style={{ '--plan-color': plan.color }}
              >
                {plan.popular && <div className="sub-popular-tag">Most Popular</div>}
                {isActive && <div className="sub-current-tag">Current Plan</div>}

                <div className="sub-card-icon">{plan.icon}</div>
                <h3 className="sub-card-name">{plan.name}</h3>
                <div className="sub-card-price">
                  {plan.price === 0 ? (
                    <span className="sub-price-free">Free</span>
                  ) : (
                    <>
                      <span className="sub-price-amount">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="sub-price-period">/month</span>
                    </>
                  )}
                </div>

                <ul className="sub-features">
                  {plan.features.map((f) => (
                    <li key={f} className="sub-feature-yes">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="sub-feature-no">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`sub-cta-btn ${isActive ? 'sub-cta-current' : ''}`}
                  onClick={() => !isActive && handleSubscribe(plan.tier)}
                  disabled={isActive || isLoading || plan.tier === 'FREE'}
                >
                  {isLoading ? (
                    <><span className="sub-spinner" /> Processing…</>
                  ) : isActive ? (
                    'Current Plan'
                  ) : plan.tier === 'FREE' ? (
                    'Default Plan'
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="sub-guarantee">
          <div className="sub-guarantee-items">
            <div className="sub-guarantee-item">
              <span>🔒</span>
              <div><strong>Secure Payment</strong><p>256-bit SSL encryption</p></div>
            </div>
            <div className="sub-guarantee-item">
              <span>🔄</span>
              <div><strong>Cancel Anytime</strong><p>No lock-in contracts</p></div>
            </div>
            <div className="sub-guarantee-item">
              <span>📞</span>
              <div><strong>Dedicated Support</strong><p>We're here to help</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
