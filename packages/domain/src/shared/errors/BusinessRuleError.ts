import { DomainError } from './DomainError';

export class BusinessRuleError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422, details);
  }
}
