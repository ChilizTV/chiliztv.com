import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, clearAuthToken } from './auth';
import { handleApiError } from './error';

/**
 * @notice Centralized API client with automatic JWT injection and error handling
 * @dev Implements request/response interceptors for auth and rate limiting
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * @notice Configures request and response interceptors
   * @dev Handles JWT injection, 401 refresh, and 429 rate limiting
   */
  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
          _retryCount?: number;
        };

        // Handle 401 Unauthorized - clear token and let auth provider regenerate
        if (error.response?.status === 401) {
          // Prevent infinite retry loops by checking if we've already tried
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            // Clear expired/invalid token
            await clearAuthToken();
          }

          throw handleApiError(error);
        }

        // Handle rate limiting (429)
        if (error.response?.status === 429) {
          return this.handleRateLimit(error, originalRequest);
        }

        throw handleApiError(error);
      }
    );
  }

  /**
   * @notice Handles rate limiting with exponential backoff
   * @param error The Axios error response
   * @param originalRequest The original request config
   * @param maxRetries Maximum number of retry attempts
   * @return Promise resolving to the successful response
   */
  private async handleRateLimit(
    error: AxiosError,
    originalRequest: InternalAxiosRequestConfig & { _retryCount?: number },
    maxRetries = 3
  ): Promise<AxiosResponse> {
    const retryCount = originalRequest._retryCount || 0;

    if (retryCount >= maxRetries) {
      throw handleApiError(error);
    }

    const retryAfter = error.response?.headers['retry-after'];
    const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, retryCount) * 1000;

    await new Promise((resolve) => setTimeout(resolve, delay));

    originalRequest._retryCount = retryCount + 1;
    return this.client(originalRequest);
  }

  /**
   * @notice Performs GET request
   * @param url Request URL
   * @param config Optional Axios config
   * @return Promise resolving to response data
   */
  async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * @notice Performs POST request
   * @param url Request URL
   * @param data Request body data
   * @param config Optional Axios config
   * @return Promise resolving to response data
   */
  async post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * @notice Performs PUT request
   * @param url Request URL
   * @param data Request body data
   * @param config Optional Axios config
   * @return Promise resolving to response data
   */
  async put<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * @notice Performs DELETE request
   * @param url Request URL
   * @param config Optional Axios config
   * @return Promise resolving to response data
   */
  async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
