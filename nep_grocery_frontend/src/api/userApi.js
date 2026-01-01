import api from "./api.js";

export const fetchUserProfileApi = () => api.get('/auth/profile');
export const fetchUserOrdersApi = () => api.get('/orders/myorders');
export const placeOrderApi = (orderData) => api.post('/orders', orderData);
export const fetchProductsApi = () => api.get('/products');
export const fetchCategoriesApi = () => api.get('/categories');

export const updateUserProfilePictureApi = (formData) => api.put('/auth/profile/picture', formData);