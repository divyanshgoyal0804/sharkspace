// client/src/services/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

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