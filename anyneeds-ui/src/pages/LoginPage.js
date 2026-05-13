import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../services/authService';
import './LoginPage.css';

export default function LoginPage() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await verifyOtp(phone, otp);
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(phone);
      startResendTimer();
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/salepe-logo.png" alt="Salepe.in" className="login-logo-img" />
        </div>

        {step === 'phone' ? (
          <>
            <h1 className="login-title">Login / Sign up</h1>
            <p className="login-sub">We'll send an OTP to your mobile number</p>
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="phone-input-group">
                <span className="phone-prefix">🇮🇳 +91</span>
                <input
                  className="input-field phone-input"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  autoFocus
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Get OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="login-title">Enter OTP</h1>
            <p className="login-sub">Sent to +91 {phone}</p>
            <form onSubmit={handleVerifyOtp} className="login-form">
              <input
                className="input-field otp-input"
                type="tel"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
              />
              {error && <p className="login-error">{error}</p>}
              <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="resend-row">
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
                <button type="button" className="change-btn" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
                  Change number
                </button>
              </div>
            </form>
          </>
        )}

        <p className="login-terms">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
