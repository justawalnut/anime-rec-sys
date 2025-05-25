import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Add a request interceptor to include the auth token
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected routes
      const isProtectedRoute = !error.config.url?.includes('/search') && 
                             !error.config.url?.includes('/genres');
      if (isProtectedRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

export const apiGet = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.get<T>(url, config).then(handleResponse);

export const apiPost = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => api.post<T>(url, data, config).then(handleResponse);

export const apiPut = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => api.put<T>(url, data, config).then(handleResponse);

export const apiDelete = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => api.delete<T>(url, config).then(handleResponse);

export default api;
