import { useState, useEffect, useCallback } from 'react';

const KEY = 'salepe_recently_viewed';
const MAX = 20;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      setRecentlyViewed(stored);
    } catch {}
  }, []);

  const addToRecentlyViewed = useCallback((listing) => {
    if (!listing?.id) return;
    const item = {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      city: listing.city,
      categoryName: listing.categoryName,
      imageUrls: listing.imageUrls,
      condition: listing.condition,
      status: listing.status,
      createdAt: listing.createdAt,
    };
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((l) => l.id !== listing.id);
      const updated = [item, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  return { recentlyViewed, addToRecentlyViewed };
}
