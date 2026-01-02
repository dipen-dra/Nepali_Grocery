import axios from 'axios';


const API_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.110:8081/api";

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default adminApi;