import axios from 'axios';
import authService from './services/AuthService';

// Create an axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:8080', // Update this with your Spring Boot API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor for handling tokens if needed
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const newToken = await authService.refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Only clear tokens and redirect if we're not already on the login page
                // and if the error is specifically an authentication error
                if (window.location.pathname !== '/login' && 
                    (refreshError.response?.status === 401 || refreshError.response?.status === 403)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle other error cases
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;