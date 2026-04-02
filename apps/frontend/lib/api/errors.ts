import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BusinessRuleError,
  ValidationError,
} from '@chiliztv/domain';
import { ApiError, ApiErrorCode } from './error';

/**
 * Maps an ApiErrorResponse error code to the corresponding DomainError subclass.
 * Called when a Format B endpoint returns { success: false, error: { code, message } }.
 *
 * Note: NotFoundError(resource, identifier) — we pass message as resource and '' as
 * identifier because the API already formats the full message.
 */
export function mapApiError(code: string, message: string): never {
  switch (code) {
    case 'NOT_FOUND':
      throw new NotFoundError(message, '');
    case 'UNAUTHORIZED':
      throw new UnauthorizedError(message);
    case 'CONFLICT':
      throw new ConflictError(message);
    case 'BUSINESS_RULE_VIOLATION':
      throw new BusinessRuleError(message);
    case 'VALIDATION_ERROR':
      throw new ValidationError(message);
    default:
      throw new ApiError(ApiErrorCode.UNKNOWN, `[${code}] ${message}`);
  }
}
