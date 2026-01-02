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

// Removed interceptor that adds Authorization header from localStorage
// because we are now using HttpOnly cookies.

export default api;