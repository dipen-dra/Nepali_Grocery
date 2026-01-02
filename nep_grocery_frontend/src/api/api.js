import axios from 'axios';


const API_BASE_URL = 'http://192.168.1.110:8081/api';


export const SERVER_BASE_URL = 'http://192.168.1.110:8081';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to attach the token from localStorage
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

export default api;