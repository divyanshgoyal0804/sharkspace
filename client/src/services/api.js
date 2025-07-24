// client/src/services/api.js
import axios from 'axios';

const API_BASE = 'https://booking-app-backend-zlal.onrender.com/api';
export const api = axios.create({
  baseURL: API_BASE,
});

// Add Firebase token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};