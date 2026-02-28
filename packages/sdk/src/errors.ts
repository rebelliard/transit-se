/**
 * Base error for all Transit SE SDK errors.
 */
export class TransitError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
  ) {
    super(message);
    this.name = 'TransitError';
  }
}

/**
 * Thrown when an API key is required but not provided.
 */
export class ApiKeyMissingError extends TransitError {
  constructor() {
    super('API key is required for Trafiklab Realtime APIs. Pass it via the apiKey option.');
    this.name = 'ApiKeyMissingError';
  }
}

/**
 * Thrown when the API returns a non-OK HTTP response.
 */
export class ApiResponseError extends TransitError {
  constructor(statusCode: number, endpoint: string, body?: string) {
    super(
      `API returned ${statusCode} for ${endpoint}${body ? `: ${body}` : ''}`,
      statusCode,
      endpoint,
    );
    this.name = 'ApiResponseError';
  }
}

/**
 * Thrown when `validate: true` is enabled and the API response
 * doesn't match the expected Valibot schema.
 */
export class ValidationError extends TransitError {
  constructor(
    endpoint: string,
    public readonly cause: unknown,
  ) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Response validation failed for ${endpoint}: ${detail}`, undefined, endpoint);
    this.name = 'ValidationError';
  }
}
