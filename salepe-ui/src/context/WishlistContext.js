import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchSavedIds = useCallback(() => {
    if (!isLoggedIn) { setSavedIds(new Set()); return; }
    setLoading(true);
    api.get('/api/wishlist/ids')
      .then((r) => setSavedIds(new Set(r.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => { fetchSavedIds(); }, [fetchSavedIds]);

  const toggle = useCallback(async (listingId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isLoggedIn) { window.location.href = '/login'; return; }

    // optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    try {
      await api.post(`/api/wishlist/${listingId}`);
    } catch {
      // revert on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(listingId)) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
    }
  }, [isLoggedIn]);

  return (
    <WishlistContext.Provider value={{ savedIds, toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
