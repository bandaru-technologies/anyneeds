import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './ContactPage.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact Us — SalePe</title>
        <meta name="description" content="Get in touch with the SalePe team. We're here to help with any questions about buying, selling, or your account." />
      </Helmet>

      <div className="container">
        <div className="contact-layout">
          {/* Left info */}
          <div className="contact-info">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-sub">Have a question or need help? We'd love to hear from you. Our team typically responds within 24 hours.</p>

            <div className="contact-cards">
              <div className="contact-info-card">
                <span className="contact-info-icon">📧</span>
                <div>
                  <strong>Email Support</strong>
                  <p>support@salepe.in</p>
                </div>
              </div>
              <div className="contact-info-card">
                <span className="contact-info-icon">💬</span>
                <div>
                  <strong>WhatsApp</strong>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="contact-info-card">
                <span className="contact-info-icon">🕐</span>
                <div>
                  <strong>Response Time</strong>
                  <p>Within 24 hours</p>
                </div>
              </div>
              <div className="contact-info-card">
                <span className="contact-info-icon">📍</span>
                <div>
                  <strong>Office</strong>
                  <p>Hyderabad, Telangana, India</p>
                </div>
              </div>
            </div>

            <div className="contact-topics">
              <h3>Common Topics</h3>
              <ul>
                <li>Account or login issues</li>
                <li>Listing removed or rejected</li>
                <li>Report a scam or fraud</li>
                <li>Subscription & billing queries</li>
                <li>Boost listing support</li>
                <li>Partnership opportunities</li>
              </ul>
            </div>
          </div>

          {/* Right form */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">✅</div>
                <h2>Message Sent!</h2>
                <p>Thanks for reaching out. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 className="contact-form-title">Send a Message</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-row">
                    <div className="contact-field">
                      <label>Your Name</label>
                      <input
                        name="name" value={form.name} onChange={handleChange}
                        placeholder="Rahul Sharma" required
                        className="input-field"
                      />
                    </div>
                    <div className="contact-field">
                      <label>Email Address</label>
                      <input
                        name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="rahul@email.com" required
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="contact-field">
                    <label>Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange} required className="input-field">
                      <option value="">Select a topic</option>
                      <option value="account">Account / Login Issue</option>
                      <option value="listing">Listing Problem</option>
                      <option value="report">Report Fraud / Scam</option>
                      <option value="billing">Subscription / Billing</option>
                      <option value="boost">Boost Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="contact-field">
                    <label>Message</label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange}
                      placeholder="Describe your issue or question in detail..."
                      required rows={5}
                      className="input-field contact-textarea"
                    />
                  </div>
                  <button className="btn btn-primary contact-submit-btn" type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
