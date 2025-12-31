
import { registerUserApi, loginUserApi } from "../api/authApi.js";

export const registerUserService = async (formData) => {
    try {
        const response = await registerUserApi(formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Registration has failed." };
    }
};

export const loginUserService = async (formData) => {
    try {
        const response = await loginUserApi(formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login has failed." };
    }
};