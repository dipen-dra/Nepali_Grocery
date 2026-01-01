import api from "./api.js"; 


export const registerUserApi = (data) => {
  return api.post("/auth/register", data);
};


export const loginUserApi = (formData) => {
  return api.post("/auth/login", formData);
};