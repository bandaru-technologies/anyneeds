import api from './api';

export const sendOtp = (phoneNumber) =>
  api.post('/api/auth/send-otp', { phoneNumber });

export const verifyOtp = (phoneNumber, otpCode) =>
  api.post('/api/auth/verify-otp', { phoneNumber, otpCode });

export const getProfile = () => api.get('/api/users/me');

export const updateProfile = (data) => api.put('/api/users/me', data);
