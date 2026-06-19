import axios from "axios";

const API = "http://localhost/api/auth";

export const register = async (userData) => {
    return await axios.post(`${API}/register`, userData);
};

export const login = async (credentials) => {
    return await axios.post(`${API}/login`, credentials);
};