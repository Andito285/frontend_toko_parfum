// lib/api.js
import axios from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth cookies
            Cookies.remove("auth_token");
            Cookies.remove("user");

            // Redirect to home page
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
