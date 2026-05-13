import React, { useState } from 'react';
import api from '../services/api';
import './BoostModal.css';

const PLANS = [
  {
    key: 'BASIC',
    name: 'Basic Boost',
    price: 99,
    days: 3,
    icon: '🚀',
    color: '#3b82f6',
    features: ['Higher in search results', 'More visibility'],
  },
  {
    key: 'STANDARD',
    name: 'Standard Boost',
    price: 249,
    days: 7,
    icon: '⚡',
    color: '#8b5cf6',
    features: ['Top of search results', 'Homepage placement', 'Highlighted card'],
    popular: true,
  },
  {
    key: 'PREMIUM',
    name: 'Premium Featured',
    price: 499,
    days: 14,
    icon: '👑',
    color: '#f59e0b',
    features: ['Featured/Sponsored section', 'Top search placement', 'Gold badge on card', '2× more enquiries'],
  },
];

export default function BoostModal({ listing, onClose, onSuccess }) {
  const [selected, setSelected] = useState('STANDARD');
  const [step, setStep] = useState('select'); // select | pay | done
  const [processing, setProcessing] = useState(false);

  const plan = PLANS.find((p) => p.key === selected);

  const handlePay = async () => {
    setStep('pay');
    setProcessing(true);
    // Simulate payment processing (Razorpay integration ready)
    await new Promise((r) => setTimeout(r, 1800));
    try {
      await api.post('/api/boosts', { listingId: String(listing.id), plan: selected });
      setStep('done');
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch {
      setStep('select');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="boost-overlay" onClick={onClose}>
      <div className="boost-modal" onClick={(e) => e.stopPropagation()}>
        <button className="boost-close" onClick={onClose}>×</button>

        {step === 'done' ? (
          <div className="boost-done">
            <div className="boost-done-icon">🎉</div>
            <h3>Listing Boosted!</h3>
            <p>Your ad "<strong>{listing.title}</strong>" is now boosted for {plan.days} days.</p>
          </div>
        ) : step === 'pay' ? (
          <div className="boost-done">
            <div className="boost-processing-icon">
              <div className="spinner" />
            </div>
            <h3>Processing Payment…</h3>
            <p>Please wait while we confirm your payment of <strong>₹{plan.price}</strong>.</p>
          </div>
        ) : (
          <>
            <div className="boost-modal-header">
              <h2>Boost Your Listing</h2>
              <p className="boost-modal-sub">"{listing.title}"</p>
            </div>

            <div className="boost-plans">
              {PLANS.map((p) => (
                <button
                  key={p.key}
                  className={`boost-plan-card ${selected === p.key ? 'selected' : ''}`}
                  style={{ '--plan-color': p.color }}
                  onClick={() => setSelected(p.key)}
                >
                  {p.popular && <span className="boost-popular-tag">Most Popular</span>}
                  <div className="boost-plan-icon">{p.icon}</div>
                  <div className="boost-plan-name">{p.name}</div>
                  <div className="boost-plan-price">₹{p.price}</div>
                  <div className="boost-plan-duration">for {p.days} days</div>
                  <ul className="boost-plan-features">
                    {p.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  {selected === p.key && <div className="boost-plan-check">✓</div>}
                </button>
              ))}
            </div>

            <div className="boost-footer">
              <div className="boost-summary">
                <span>Selected: <strong>{plan.name}</strong></span>
                <span className="boost-total">₹{plan.price}</span>
              </div>
              <button className="btn btn-primary boost-pay-btn" onClick={handlePay} disabled={processing}>
                Pay ₹{plan.price} &amp; Boost Now
              </button>
              <p className="boost-disclaimer">Secure payment · Instant activation · Cancel anytime</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
