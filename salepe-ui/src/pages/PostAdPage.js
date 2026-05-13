import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createListing, getCategories } from '../services/listingService';
import { CITIES, lookupState } from '../data/cityStateMap';
import { CATEGORY_ICONS } from '../data/categoryIcons';
import LocationAutocomplete from '../components/LocationAutocomplete';
import api from '../services/api';
import './PostAdPage.css';

const GRID_SIZE = 5;
const emptyGrid = () => Array(GRID_SIZE).fill('');

const STEPS = [
  { label: 'Category', icon: '🏷' },
  { label: 'Details',  icon: '📋' },
  { label: 'Photos',   icon: '🖼' },
  { label: 'Preview',  icon: '✓' },
];

export default function PostAdPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(Array(GRID_SIZE).fill(false));
  const [form, setForm] = useState({
    title: '', description: '', price: '', adType: 'For Sale', categoryId: '',
    condition: '', negotiable: false, imageUrls: emptyGrid(), location: '', city: '', state: '',
  });

  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { state: { from: '/post-ad' } });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCityChange = (e) => {
    const city = e.target.value;
    const state = lookupState(city);
    setForm((f) => ({ ...f, city, state: state || f.state }));
    setFieldErrors((fe) => ({ ...fe, city: '' }));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploading((prev) => { const n = [...prev]; n[index] = true; return n; });
    setFieldErrors((fe) => ({ ...fe, photo: '' }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((f) => { const urls = [...f.imageUrls]; urls[index] = data.url; return { ...f, imageUrls: urls }; });
    } catch {
      setError('Failed to upload image. Please try a smaller file.');
    } finally {
      setUploading((prev) => { const n = [...prev]; n[index] = false; return n; });
    }
  };

  const removeImage = (index) => {
    setForm((f) => { const urls = [...f.imageUrls]; urls[index] = ''; return { ...f, imageUrls: urls }; });
  };

  const validateStep = (s) => {
    const errors = {};
    if (s === 0 && !form.categoryId) errors.category = 'Please select a category';
    if (s === 1) {
      if (!form.title.trim()) errors.title = 'Ad title is required';
      if (!form.price || Number(form.price) <= 0) errors.price = 'Price is required';
      if (!form.city.trim()) errors.city = 'City is required';
      if (!form.state.trim()) errors.state = 'State is required';
    }
    if (s === 2 && !form.imageUrls.some((u) => u.trim())) errors.photo = 'At least one photo is required';
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setFieldErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        categoryId: Number(form.categoryId),
        imageUrls: form.imageUrls.filter((u) => u.trim()),
      };
      const { data } = await createListing(payload);
      navigate(`/listings/${data.id}`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setError(Object.values(data.errors).join(', '));
      else setError(data?.error || 'Failed to post ad. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => String(c.id) === String(form.categoryId));

  return (
    <div className="post-ad-page">
      <div className="container">
        <div className="wizard-header">
          <h1 className="wizard-title">Post a Free Ad</h1>
          <p className="wizard-sub">Fill in the details to reach thousands of buyers</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="step-circle">
                  {i < step ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span className="step-icon">{s.icon}</span>
                  )}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="wizard-body">
          {/* Step 0: Category */}
          {step === 0 && (
            <div className="wizard-step">
              <h2 className="step-title">What are you posting?</h2>
              <p className="step-desc">Choose the most relevant category</p>
              <div className="cat-grid">
                {categories.map((c) => (
                  <button
                    key={c.id} type="button"
                    className={`cat-btn ${String(form.categoryId) === String(c.id) ? 'cat-btn-active' : ''}`}
                    onClick={() => { setForm((f) => ({ ...f, categoryId: String(c.id) })); setFieldErrors((fe) => ({ ...fe, category: '' })); }}
                  >
                    <span className="cat-icon-emoji">{CATEGORY_ICONS[c.slug] || '📦'}</span>
                    <span className="cat-btn-name">{c.name}</span>
                    {String(form.categoryId) === String(c.id) && (
                      <svg className="cat-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
              {fieldErrors.category && <p className="field-error">{fieldErrors.category}</p>}
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="wizard-step">
              <h2 className="step-title">Ad Details</h2>
              <p className="step-desc">The more detail you provide, the faster you'll sell</p>

              <div className="wform-group">
                <label className="wform-label">Ad Title <span className="req-star">*</span></label>
                <input
                  className={`input-field ${fieldErrors.title ? 'input-error' : ''}`}
                  type="text"
                  placeholder="e.g. iPhone 13 Pro Max 256GB - Like New"
                  value={form.title}
                  onChange={(e) => { set('title')(e); setFieldErrors((fe) => ({ ...fe, title: '' })); }}
                  maxLength={200}
                />
                {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
              </div>

              <div className="wform-group">
                <label className="wform-label">Description <span className="req-star">*</span></label>
                <textarea
                  className="input-field"
                  rows={5}
                  placeholder="Describe your item in detail — condition, features, reason for selling..."
                  value={form.description}
                  onChange={set('description')}
                  maxLength={5000}
                />
              </div>

              <div className="wform-group">
                <label className="wform-label">Condition</label>
                <div className="condition-selector">
                  {[
                    { val: 'NEW', label: 'Brand New', color: '#22c55e' },
                    { val: 'LIKE_NEW', label: 'Like New', color: '#06b6d4' },
                    { val: 'GOOD', label: 'Good', color: '#3b82f6' },
                    { val: 'FAIR', label: 'Fair', color: '#f59e0b' },
                  ].map(({ val, label, color }) => (
                    <button
                      key={val} type="button"
                      className={`condition-btn ${form.condition === val ? 'condition-btn-active' : ''}`}
                      style={form.condition === val ? { borderColor: color, background: `${color}15`, color } : {}}
                      onClick={() => setForm((f) => ({ ...f, condition: f.condition === val ? '' : val }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wform-group">
                <label className="wform-label">Negotiable</label>
                <label className="negotiable-toggle-row">
                  <div
                    className={`toggle-switch ${form.negotiable ? 'on' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, negotiable: !f.negotiable }))}
                    role="switch"
                    aria-checked={form.negotiable}
                  >
                    <div className="toggle-thumb" />
                  </div>
                  <span className="negotiable-label">{form.negotiable ? 'Price is negotiable' : 'Fixed price'}</span>
                </label>
              </div>

              <div className="wform-row">
                <div className="wform-group">
                  <label className="wform-label">Price (₹) <span className="req-star">*</span></label>
                  <div className="price-input-wrap">
                    <span className="price-symbol">₹</span>
                    <input
                      className={`input-field price-input ${fieldErrors.price ? 'input-error' : ''}`}
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => { set('price')(e); setFieldErrors((fe) => ({ ...fe, price: '' })); }}
                      min={0}
                    />
                  </div>
                  {fieldErrors.price && <p className="field-error">{fieldErrors.price}</p>}
                </div>
                <div className="wform-group">
                  <label className="wform-label">Ad Type <span className="req-star">*</span></label>
                  <select className="input-field" value={form.adType} onChange={set('adType')}>
                    <option>For Sale</option>
                    <option>For Rent</option>
                    <option>Wanted</option>
                    <option>Service</option>
                    <option>Job Offer</option>
                  </select>
                </div>
              </div>

              <div className="wform-row">
                <div className="wform-group">
                  <label className="wform-label">City <span className="req-star">*</span></label>
                  <div className="select-with-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="select-icon">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                    <select
                      className={`input-field select-padded ${fieldErrors.city ? 'input-error' : ''}`}
                      value={form.city}
                      onChange={handleCityChange}
                    >
                      <option value="">Select city</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {fieldErrors.city && <p className="field-error">{fieldErrors.city}</p>}
                </div>
                <div className="wform-group">
                  <label className="wform-label">State <span className="req-star">*</span></label>
                  <select
                    className={`input-field ${fieldErrors.state ? 'input-error' : ''}`}
                    value={form.state}
                    onChange={(e) => { set('state')(e); setFieldErrors((fe) => ({ ...fe, state: '' })); }}
                  >
                    <option value="">Select state</option>
                    {['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {fieldErrors.state && <p className="field-error">{fieldErrors.state}</p>}
                </div>
              </div>

              <div className="wform-group">
                <label className="wform-label">Location / Area <span className="req-star">*</span></label>
                <LocationAutocomplete
                  value={form.location}
                  onChange={(val) => setForm((f) => ({ ...f, location: val }))}
                  onSelect={(s) => setForm((f) => ({
                    ...f,
                    location: s.locality,
                    city: s.city || f.city,
                    state: s.state || lookupState(s.city) || f.state,
                  }))}
                  cityContext={form.city}
                  placeholder="e.g. HSR Layout, Koramangala..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div className="wizard-step">
              <h2 className="step-title">Add Photos</h2>
              <p className="step-desc">Upload up to 5 photos. First photo will be the cover image.</p>

              <div className="image-upload-grid">
                {form.imageUrls.map((url, i) => (
                  <div key={i} className={`image-slot ${i === 0 ? 'image-slot-cover' : ''} ${i === 0 && fieldErrors.photo ? 'image-slot-error' : ''}`}>
                    {url ? (
                      <div className="image-preview">
                        <img src={url} alt={`Ad ${i + 1}`} />
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(i)}>×</button>
                        {i === 0 && <span className="cover-badge">Cover</span>}
                      </div>
                    ) : uploading[i] ? (
                      <div className="image-upload-label">
                        <span className="upload-spinner" />
                        <small>Uploading...</small>
                      </div>
                    ) : (
                      <label className="image-upload-label" htmlFor={`img-${i}`}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.5}}>
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <small>{i === 0 ? 'Cover Photo' : `Photo ${i + 1}`}</small>
                        <input id={`img-${i}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(i, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              {fieldErrors.photo && <p className="field-error" style={{ marginTop: 12 }}>{fieldErrors.photo}</p>}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="wizard-step">
              <h2 className="step-title">Preview Your Ad</h2>
              <p className="step-desc">Review your ad before publishing</p>

              <div className="preview-card">
                {form.imageUrls.filter(u => u).length > 0 && (
                  <img src={form.imageUrls.find(u => u)} alt="Cover" className="preview-cover" />
                )}
                <div className="preview-body">
                  <p className="preview-category">{selectedCategory?.name}</p>
                  <h3 className="preview-title">{form.title}</h3>
                  <p className="preview-price">₹{Number(form.price || 0).toLocaleString('en-IN')}</p>
                  {form.description && <p className="preview-desc">{form.description}</p>}
                  <div className="preview-meta">
                    {form.location && <span>📍 {form.location}{form.city ? `, ${form.city}` : ''}</span>}
                    {!form.location && form.city && <span>📍 {form.city}</span>}
                    {form.state && <span>• {form.state}</span>}
                    <span>• {form.adType}</span>
                  </div>
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="wizard-nav">
            {step > 0 ? (
              <button type="button" className="btn-wizard-back" onClick={handleBack}>
                ‹ Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-wizard-next" onClick={handleNext}>
                Next ›
              </button>
            ) : (
              <button type="button" className="btn-wizard-next" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Posting...' : '🚀 Post Ad for FREE'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
