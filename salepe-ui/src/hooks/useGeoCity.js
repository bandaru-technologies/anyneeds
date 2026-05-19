import { useState, useCallback } from 'react';
import { normalizeCity } from '../data/cityAliases';

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { 'Accept-Language': 'en-US,en' } }
  );
  if (!res.ok) throw new Error('geocode failed');
  const data = await res.json();
  const addr = data.address || {};

  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    addr.state_district ||
    '';

  const locality =
    addr.neighbourhood ||
    addr.suburb ||
    addr.residential ||
    addr.quarter ||
    addr.hamlet ||
    '';

  const state = addr.state || '';

  const normalizedCity = normalizeCity(city);
  const normalizedDisplay = locality && normalizedCity ? `${locality}, ${normalizedCity}` : normalizedCity;
  return { city: normalizedCity, locality, state, display: normalizedDisplay };
}

export function useGeoCity() {
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState('');

  const detect = useCallback((onLocation) => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = await reverseGeocode(coords.latitude, coords.longitude);
          if (location.city || location.display) onLocation(location);
          else setGeoError('Could not determine your location');
        } catch {
          setGeoError('Could not fetch location name');
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? 'Location access denied. Enable it in browser settings.'
            : 'Could not get your location'
        );
        setDetecting(false);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const autoDetect = useCallback((onLocation) => {
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') detect(onLocation);
    }).catch(() => {});
  }, [detect]);

  return { detecting, geoError, detect, autoDetect };
}
