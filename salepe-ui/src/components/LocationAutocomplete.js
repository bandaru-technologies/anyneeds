import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LocationAutocomplete.css';

async function searchLocations(query, cityContext) {
  const q = cityContext ? `${query} ${cityContext}` : query;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8&countrycodes=in`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  const seen = new Set();
  const results = [];

  for (const item of data) {
    const addr = item.address || {};
    const locality =
      addr.neighbourhood ||
      addr.suburb ||
      addr.residential ||
      addr.quarter ||
      addr.hamlet ||
      '';
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const state = addr.state || '';

    if (!locality) continue;

    const key = `${locality}|${city}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({ locality, city, state });
    if (results.length >= 6) break;
  }

  return results;
}

export default function LocationAutocomplete({ value, onChange, onSelect, cityContext, placeholder, className, hasError }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const results = await searchLocations(query, cityContext);
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [cityContext]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 350);
    return () => clearTimeout(debounceRef.current);
  }, [value, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (s) => {
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="loc-autocomplete" ref={wrapRef}>
      <div className={`loc-input-wrap ${hasError ? 'loc-input-error' : ''}`}>
        <input
          className={`input-field loc-input ${className || ''}`}
          type="text"
          placeholder={placeholder || 'e.g. Kalyan Nagar'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="loc-spinner" />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="loc-dropdown">
          {suggestions.map((s, i) => (
            <li key={i} className="loc-option" onMouseDown={() => handleSelect(s)}>
              <span className="loc-option-pin">📍</span>
              <span>
                <strong>{s.locality}</strong>
                {s.city && <span className="loc-option-city">, {s.city}</span>}
                {s.state && <span className="loc-option-state">, {s.state}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
