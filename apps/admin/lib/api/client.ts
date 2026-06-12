import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { clearAdminToken, getAdminToken, getGateToken } from './auth';

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = getAdminToken();
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
      const gate = getGateToken();
      if (gate && config.headers) config.headers['X-Admin-Gate'] = gate;
      return config;
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // 403 ACCOUNT_NOT_ADMIN / gate failures must never trigger retries.
        if (error.response?.status === 401) clearAdminToken();
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }
}

export const apiClient = new AdminApiClient();
