import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateListing, getMyListingById, getCategories } from '../services/listingService';
import { CITIES, lookupState } from '../data/cityStateMap';
import { useGeoCity } from '../hooks/useGeoCity';
import LocationAutocomplete from '../components/LocationAutocomplete';
import api from '../services/api';
import './PostAdPage.css';

const GRID_SIZE = 5;
const toGrid = (urls) => Array.from({ length: GRID_SIZE }, (_, i) => (urls && urls[i]) ? urls[i] : '');

export default function EditAdPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(Array(GRID_SIZE).fill(false));
  const [form, setForm] = useState(null);
  const { detecting, geoError, detect } = useGeoCity();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    Promise.all([getCategories(), getMyListingById(id)])
      .then(([catRes, listRes]) => {
        const l = listRes.data;
        setCategories(catRes.data);
        setForm({
          title: l.title || '',
          description: l.description || '',
          price: l.price || '',
          categoryId: String(l.categoryId || ''),
          imageUrls: toGrid(l.imageUrls),
          location: l.location || '',
          city: l.city || '',
          state: l.state || '',
        });
      })
      .catch(() => navigate('/my-ads'))
      .finally(() => setPageLoading(false));
  }, [id, isLoggedIn, navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleDetectLocation = () => {
    detect((loc) => {
      const state = lookupState(loc.city) || loc.state;
      setForm((f) => ({
        ...f,
        city: loc.city,
        state,
        location: loc.locality ? loc.locality : f.location,
      }));
      setFieldErrors((fe) => ({ ...fe, city: '', state: '' }));
    });
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    const state = lookupState(city);
    setForm((f) => ({ ...f, city, state: state || f.state }));
    if (fieldErrors.city) setFieldErrors((fe) => ({ ...fe, city: '' }));
  };

  const handleStateChange = (e) => {
    setForm((f) => ({ ...f, state: e.target.value }));
    if (fieldErrors.state) setFieldErrors((fe) => ({ ...fe, state: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.categoryId) errors.category = 'Please select a category';
    if (!form.title.trim()) errors.title = 'Ad title is required';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Price is required';
    if (!form.imageUrls.some((u) => u.trim())) errors.photo = 'At least one photo is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    return errors;
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploading((prev) => { const n = [...prev]; n[index] = true; return n; });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => {
        const urls = [...f.imageUrls];
        urls[index] = data.url;
        return { ...f, imageUrls: urls };
      });
    } catch {
      setError('Failed to upload image. Please try a smaller file.');
    } finally {
      setUploading((prev) => { const n = [...prev]; n[index] = false; return n; });
    }
  };

  const removeImage = (index) => {
    setForm((f) => {
      const urls = [...f.imageUrls];
      urls[index] = '';
      return { ...f, imageUrls: urls };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        categoryId: Number(form.categoryId),
        imageUrls: form.imageUrls.filter((u) => u.trim()),
      };
      await updateListing(id, payload);
      navigate(`/listings/${id}`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const msgs = Object.values(data.errors).join(', ');
        setError(msgs || 'Validation failed. Check your inputs.');
      } else {
        setError(data?.error || 'Failed to update ad. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!form) return null;

  return (
    <div className="post-ad-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Edit Ad</h1>
        </div>

        <div className="post-ad-layout">
          <div className="post-ad-main">
            <form onSubmit={handleSubmit} className="post-form">

              {/* Category */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-num">1</div>
                  <span className="form-section-title">Select Category</span>
                </div>
                <div className="form-section-body">
                  <div className="category-pills">
                    {categories.map((c) => (
                      <button
                        key={c.id} type="button"
                        className={`category-pill ${String(form.categoryId) === String(c.id) ? 'category-pill-active' : ''}`}
                        onClick={() => setForm((f) => ({ ...f, categoryId: String(c.id) }))}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad Details */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-num">2</div>
                  <span className="form-section-title">Ad Details</span>
                </div>
                <div className="form-section-body">
                  <div className="form-group">
                    <label className="form-label">Ad Title *</label>
                    <input className="input-field" type="text" value={form.title} onChange={set('title')} required maxLength={200} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="input-field" rows={5} value={form.description} onChange={set('description')} maxLength={5000} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) <span className="req-star">*</span></label>
                    <input
                      className={`input-field ${fieldErrors.price ? 'input-error' : ''}`}
                      type="number"
                      placeholder="Enter price in ₹"
                      value={form.price}
                      onChange={(e) => { set('price')(e); setFieldErrors((fe) => ({ ...fe, price: '' })); }}
                      min={0}
                    />
                    {fieldErrors.price && <p className="field-error">{fieldErrors.price}</p>}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-num">3</div>
                  <span className="form-section-title">Photos <span className="req-star">*</span></span>
                </div>
                <div className="form-section-body">
                  <p className="form-hint">At least 1 photo required. Upload up to 5 photos (max 5MB each). First photo is the cover image.</p>
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
                            <span style={{ fontSize: 22 }}>📷</span>
                            <small>{i === 0 ? 'Cover Photo' : `Photo ${i + 1}`}</small>
                            <input
                              id={`img-${i}`}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(i, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                  {fieldErrors.photo && <p className="field-error" style={{ marginTop: 8 }}>{fieldErrors.photo}</p>}
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-num">4</div>
                  <span className="form-section-title">Location <span className="req-star">*</span></span>
                  <button type="button" className={`geo-detect-btn ${detecting ? 'detecting' : ''}`} onClick={handleDetectLocation}>
                    {detecting ? <span className="geo-spin-sm" /> : '📍'}
                    {detecting ? ' Detecting...' : ' Detect my location'}
                  </button>
                </div>
                {geoError && <p style={{ fontSize: 11, color: '#c62828', padding: '4px 20px 0' }}>{geoError}</p>}
                <div className="form-section-body">
                  <div className="location-grid">
                    <div className="form-group">
                      <label className="form-label">City <span className="req-star">*</span></label>
                      <input
                        className={`input-field ${fieldErrors.city ? 'input-error' : ''}`}
                        type="text"
                        placeholder="e.g. Bangalore"
                        value={form.city}
                        onChange={handleCityChange}
                        list="city-suggestions-edit"
                        autoComplete="off"
                      />
                      <datalist id="city-suggestions-edit">
                        {CITIES.map((c) => <option key={c} value={c} />)}
                      </datalist>
                      {fieldErrors.city && <p className="field-error">{fieldErrors.city}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">State <span className="req-star">*</span></label>
                      <input
                        className={`input-field ${fieldErrors.state ? 'input-error' : ''}`}
                        type="text"
                        placeholder="Auto-filled from city"
                        value={form.state}
                        onChange={handleStateChange}
                      />
                      {fieldErrors.state && <p className="field-error">{fieldErrors.state}</p>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Locality / Area</label>
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
                      placeholder="e.g. Kalyan Nagar"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary submit-btn" type="submit" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ padding: '14px 20px' }} onClick={() => navigate('/my-ads')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <aside className="post-ad-tips">
            <div className="tips-header">
              <h3>💡 Tips for a Great Ad</h3>
            </div>
            <div className="tips-body">
              {[
                { icon: '📸', text: 'Fresh photos get more responses' },
                { icon: '✏️', text: 'Update your description if details have changed' },
                { icon: '💰', text: 'Revise the price to attract more buyers' },
              ].map((t, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-icon">{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
