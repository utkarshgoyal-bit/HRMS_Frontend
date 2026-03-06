import axios from 'axios';

// Point to your running Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const API = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Interceptor: Attach Token & Slug to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  const slug = localStorage.getItem('slug');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  if (slug) {
    req.headers['x-tenant-slug'] = slug;
  }

  return req;
});

export default API;
