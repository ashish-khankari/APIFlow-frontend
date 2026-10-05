// Client/src/lib/api.ts

import axios, {
    AxiosError,
    AxiosInstance,
} from "axios";
import { toast } from "../components/Toast";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://apiflow-backend.onrender.com"
        : "http://localhost:8080");

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15_000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add common request logic here.
        // Don't manually read an HttpOnly auth cookie here;
        // the browser sends it automatically because of withCredentials.
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        if (error.response?.status === 403) {
            toast.apiError("Session Expired", "Please login again", { statusCode: 403, message: 'Session Expired' });
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;