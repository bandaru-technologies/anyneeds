import api from './api';

export const getListings = (params) => api.get('/api/listings', { params });

export const getListing = (id) => api.get(`/api/listings/${id}`);

export const createListing = (data) => api.post('/api/listings', data);

export const updateListing = (id, data) => api.put(`/api/listings/${id}`, data);

export const getMyListings = (params) => api.get('/api/listings/my', { params });

export const getMyListingById = (id) => api.get(`/api/listings/my/${id}`);

export const markAsSold = (id) => api.patch(`/api/listings/${id}/sold`);

export const deleteListing = (id) => api.delete(`/api/listings/${id}`);

export const getCategories = () => api.get('/api/categories');

// Wishlist
export const toggleWishlist = (listingId) => api.post(`/api/wishlist/${listingId}`);
export const getWishlist = () => api.get('/api/wishlist');
export const getWishlistIds = () => api.get('/api/wishlist/ids');
