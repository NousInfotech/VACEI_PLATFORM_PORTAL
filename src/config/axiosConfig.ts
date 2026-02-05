import axios from 'axios';
import { endPoints } from './endPoint';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            originalRequest._retry = true;
            try {
              const res = await axios.post(`${baseURL}${endPoints.AUTH.REFRESH}`, { refreshToken });
              
              if (res.data.success && res.data.data.token) {
                const newToken = res.data.data.token;
                const newRefreshToken = res.data.data.refreshToken;
                
                localStorage.setItem('token', newToken);
                if (newRefreshToken) {
                  localStorage.setItem('refreshToken', newRefreshToken);
                }
                
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                
                return axiosInstance(originalRequest);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login?message=' + encodeURIComponent('Session expired. Please log in again.');
            }
          } else {
            localStorage.removeItem('token');
            // Only redirect if we're not already on login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login?message=' + encodeURIComponent('Please log in to continue.');
            }
          }
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network error or server down' });
  }
);

export default axiosInstance;
