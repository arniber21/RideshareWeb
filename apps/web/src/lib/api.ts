import axios from 'axios';

// Create API instance for auth service
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create API instance for rides service
const ridesApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RIDES_API_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create API instance for reviews service
const reviewsApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REVIEWS_API_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for all instances
const addAuthToken = (config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

authApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
ridesApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
reviewsApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Response interceptor to handle auth errors for all instances
const handleAuthError = async (error: any) => {
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
  }
  return Promise.reject(error);
};

authApi.interceptors.response.use((response) => response, handleAuthError);
ridesApi.interceptors.response.use((response) => response, handleAuthError);
reviewsApi.interceptors.response.use((response) => response, handleAuthError);

export { authApi, ridesApi, reviewsApi }; 