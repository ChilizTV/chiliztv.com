import { AxiosError } from 'axios';

/**
 * @notice API error codes for standardized error handling
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * @notice Custom error class for API errors with structured data
 * @dev Extends Error with code, statusCode, and details fields
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * @notice Maps Axios errors to ApiError instances with appropriate codes
 * @param error The Axios error to handle
 * @return ApiError instance with structured error data
 */
export function handleApiError(error: AxiosError): ApiError {
  if (!error.response) {
    return new ApiError(
      ApiErrorCode.NETWORK_ERROR,
      'Network error occurred. Please check your connection.',
      undefined,
      error
    );
  }

  const status = error.response.status;
  const responseData = error.response.data as { message?: string; error?: string };
  const message = responseData?.message || responseData?.error || error.message;

  switch (status) {
    case 401:
      return new ApiError(ApiErrorCode.UNAUTHORIZED, message, status, responseData);
    case 403:
      return new ApiError(ApiErrorCode.FORBIDDEN, message, status, responseData);
    case 404:
      return new ApiError(ApiErrorCode.NOT_FOUND, message, status, responseData);
    case 429:
      return new ApiError(ApiErrorCode.RATE_LIMIT, 'Too many requests. Please try again later.', status, responseData);
    case 422:
    case 400:
      return new ApiError(ApiErrorCode.VALIDATION_ERROR, message, status, responseData);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ApiError(ApiErrorCode.SERVER_ERROR, 'Server error occurred. Please try again later.', status, responseData);
    default:
      return new ApiError(ApiErrorCode.UNKNOWN, message, status, responseData);
  }
}
