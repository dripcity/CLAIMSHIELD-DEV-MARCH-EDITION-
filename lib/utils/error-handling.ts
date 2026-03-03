/**
 * Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

/**
 * Application error types
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  NETWORK = 'NETWORK_ERROR',
  SERVER = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  FILE_UPLOAD = 'FILE_UPLOAD_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
}

/**
 * Application error class
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.SERVER,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error messages to user-friendly versions
    const errorMap: Record<string, string> = {
      'Unauthorized': 'Please sign in to continue',
      'Forbidden': 'You don\'t have permission to perform this action',
      'User not found': 'Your account could not be found. Please sign in again',
      'Appraisal not found': 'The appraisal you\'re looking for doesn\'t exist',
      'Network request failed': 'Unable to connect. Please check your internet connection',
      'Failed to fetch': 'Unable to connect. Please check your internet connection',
    };

    return errorMap[error.message] || 'An unexpected error occurred. Please try again';
  }

  return 'An unexpected error occurred. Please try again';
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') return 401;
    if (error.message === 'Forbidden') return 403;
    if (error.message.includes('not found')) return 404;
  }

  return 500;
}

/**
 * Check if error should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.RATE_LIMIT,
    ].includes(error.type);
  }

  if (error instanceof Error) {
    const retryableMessages = [
      'Network request failed',
      'Failed to fetch',
      'timeout',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ];

    return retryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  return false;
}

/**
 * Log error for monitoring
 */
export function logError(error: unknown, context?: Record<string, any>) {
  // In production, this would send to error tracking service (e.g., Sentry)
  console.error('Application Error:', {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle API route errors
 */
export function handleApiError(error: unknown): Response {
  logError(error);

  const statusCode = getErrorStatusCode(error);
  const message = getUserFriendlyErrorMessage(error);

  return new Response(
    JSON.stringify({ error: message }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Validation error helper
 */
export function createValidationError(
  message: string,
  details?: Record<string, string[]>
): AppError {
  return new AppError(
    message,
    ErrorType.VALIDATION,
    400,
    true,
    details
  );
}

/**
 * Authentication error helper
 */
export function createAuthError(message: string = 'Authentication required'): AppError {
  return new AppError(
    message,
    ErrorType.AUTHENTICATION,
    401,
    true
  );
}

/**
 * Authorization error helper
 */
export function createAuthorizationError(
  message: string = 'You don\'t have permission to perform this action'
): AppError {
  return new AppError(
    message,
    ErrorType.AUTHORIZATION,
    403,
    true
  );
}

/**
 * Not found error helper
 */
export function createNotFoundError(resource: string): AppError {
  return new AppError(
    `${resource} not found`,
    ErrorType.NOT_FOUND,
    404,
    true
  );
}

/**
 * Network error helper
 */
export function createNetworkError(message: string = 'Network error occurred'): AppError {
  return new AppError(
    message,
    ErrorType.NETWORK,
    503,
    true
  );
}

/**
 * Timeout error helper
 */
export function createTimeoutError(operation: string): AppError {
  return new AppError(
    `${operation} timed out. Please try again`,
    ErrorType.TIMEOUT,
    408,
    true
  );
}

/**
 * File upload error helper
 */
export function createFileUploadError(message: string): AppError {
  return new AppError(
    message,
    ErrorType.FILE_UPLOAD,
    400,
    true
  );
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(createTimeoutError(operation));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
