import axios from 'axios';

const apiClient = axios.create({
  // Use Vite dev server proxy: requests to /api will be proxied to the backend
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // Send cookies for Sanctum / session authentication in dev
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      // ensure headers object exists
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore localStorage errors
  }
  return config;
});

// Response interceptor: handle 401, 403, and 500
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      alert('Akses ditolak');
    } else if (error.response?.status === 500) {
      alert('Terjadi kesalahan server');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
