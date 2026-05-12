import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('anyneeds_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  sendOtp: (phoneNumber: string) =>
    api.post('/api/auth/send-otp', { phoneNumber }),
  verifyOtp: (phoneNumber: string, otpCode: string) =>
    api.post('/api/auth/verify-otp', { phoneNumber, otpCode }),
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data: any) => api.put('/api/users/me', data),
};

export const listingApi = {
  getListings: (params?: any) => api.get('/api/listings', { params }),
  getListing: (id: number) => api.get(`/api/listings/${id}`),
  createListing: (data: any) => api.post('/api/listings', data),
  getMyListings: () => api.get('/api/listings/my'),
  markAsSold: (id: number) => api.patch(`/api/listings/${id}/sold`),
  deleteListing: (id: number) => api.delete(`/api/listings/${id}`),
  getCategories: () => api.get('/api/categories'),
};

export default api;
