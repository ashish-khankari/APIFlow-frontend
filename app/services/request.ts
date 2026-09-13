import api from "./api";
import type { AxiosRequestConfig } from "axios";

export async function request<T>(
    config: AxiosRequestConfig
): Promise<T> {
    const token = localStorage.getItem("authToken");

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.request<T>(config);
    return response.data;
}