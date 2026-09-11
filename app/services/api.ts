// Client/src/lib/api.ts

import axios, {
    AxiosError,
    AxiosInstance,
} from "axios";

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
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
        if (error.response?.status === 401) {
            // Handle expired/invalid authentication.
            // Usually redirect to login or trigger a refresh flow.
            console.log("Unauthorized");
        }

        return Promise.reject(error);
    }
);

export default api;