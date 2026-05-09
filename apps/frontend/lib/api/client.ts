import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiSuccessResponse, ApiErrorResponse } from '@chiliztv/shared/types/ApiResponse';
import { getAuthToken, clearAuthToken } from './auth';
import { handleApiError } from './error';
import { mapApiError } from './errors';

/**
 * Unwraps Format B responses: { success: true, data: T, timestamp: string }
 * For any other shape (Format A, plain objects) the raw value is returned as-is
 * so existing callers are not affected.
 */
export function normalizeFormatB<T>(raw: unknown): T {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'success' in raw &&
    (raw as Record<string, unknown>).success === true &&
    'data' in raw
  ) {
    return (raw as ApiSuccessResponse<T>).data;
  }
  return raw as T;
}

/**
 * Surfaces a Format B error body as a typed DomainError.
 * In practice the backend always uses non-200 status for errors, so this is a
 * defensive guard for any future 200+success:false edge case.
 */
/**
 * Extracts a named payload key from Format A responses: { success, [payloadKey]: T, count? }
 * Falls back to normalizeFormatB if the key is not present (future-proof if an endpoint
 * upgrades to Format B).
 */
export function normalizeFormatA<T>(raw: unknown, payloadKey: string): T {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    payloadKey in raw
  ) {
    return (raw as Record<string, T>)[payloadKey];
  }
  return normalizeFormatB<T>(raw);
}

export function handleFormatBError(raw: unknown): never {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'success' in raw &&
    (raw as Record<string, unknown>).success === false &&
    'error' in raw
  ) {
    const err = raw as ApiErrorResponse;
    mapApiError(err.error.code, err.error.message);
  }
  throw new Error('Unknown API error');
}

/**
 * @notice Centralized API client with automatic JWT injection and error handling
 * @dev Implements request/response interceptors for auth and rate limiting
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
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
        // FormData bodies need the boundary-aware multipart Content-Type axios
        // would set — but our global JSON default blocks that override. Drop it.
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Defensive: the backend always uses non-200 for errors, but guard
        // against any future 200+success:false body on Format B endpoints.
        const data = response.data;
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data &&
          data.success === false &&
          'error' in data
        ) {
          handleFormatBError(data);
        }
        return response;
      },
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

/**
 * Standalone helpers for Format B endpoints.
 * These layer normalizeFormatB on top of apiClient so Format B endpoint files
 * don't have to call normalizeFormatB manually.
 * Format A endpoint files continue using apiClient.get/post directly — untouched.
 */
export async function apiGet<T>(path: string, config?: InternalAxiosRequestConfig): Promise<T> {
  const raw = await apiClient.get<unknown>(path, config);
  return normalizeFormatB<T>(raw);
}

export async function apiPost<T>(path: string, body?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
  const raw = await apiClient.post<unknown>(path, body, config);
  return normalizeFormatB<T>(raw);
}

export async function apiPut<T>(path: string, body?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
  const raw = await apiClient.put<unknown>(path, body, config);
  return normalizeFormatB<T>(raw);
}

export async function apiDelete(path: string, config?: InternalAxiosRequestConfig): Promise<void> {
  await apiClient.delete<unknown>(path, config);
}
