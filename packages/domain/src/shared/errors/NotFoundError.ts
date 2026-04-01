import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  constructor(resource: string, identifier: string | number) {
    super(`${resource} with identifier '${identifier}' not found`, 'NOT_FOUND', 404, { resource, identifier });
  }
}
