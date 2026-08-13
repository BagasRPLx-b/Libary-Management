import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('access_token') : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('access_token');
        window.sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      if (import.meta.env.DEV) {
        console.error('Akses ditolak:', error.response.data);
      }
    } else if (error.response?.status === 500) {
      if (import.meta.env.DEV) {
        console.error('Server error:', error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;