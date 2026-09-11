import api from "./api";
import type { AxiosRequestConfig } from "axios";

export async function request<T>(
    config: AxiosRequestConfig
): Promise<T> {
    try {
        const response = await api.request<T>(config);
        return response.data;
    } catch (error) {
        throw error;
    }
}