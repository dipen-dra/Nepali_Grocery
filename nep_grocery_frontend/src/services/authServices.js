
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
        if (error.response) {
            // Throw custom object with status and data
            throw { status: error.response.status, ...error.response.data };
        }
        throw { message: "Login has failed." };
    }
};