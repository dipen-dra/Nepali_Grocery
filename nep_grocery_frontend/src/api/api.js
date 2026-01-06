import axios from 'axios';


const getBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (window.location.hostname === 'localhost') return 'http://localhost:8081/api';
    return 'http://192.168.1.78:8081/api';
};

const getServerUrl = () => {
    if (window.location.hostname === 'localhost') return 'http://localhost:8081';
    return 'http://192.168.1.78:8081';
};

const API_BASE_URL = getBaseUrl();
export const SERVER_BASE_URL = getServerUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor removed (Using HttpOnly Cookies)

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;