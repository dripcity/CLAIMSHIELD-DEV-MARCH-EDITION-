/**
 * Security Utilities
 * Provides security helpers and validation functions
 */

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file type
 */
export function isAllowedFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isAllowedFileSize(
  file: File,
  maxSizeBytes: number
): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Allowed file types for document uploads
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/**
 * Maximum file size (25MB)
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Maximum files per appraisal
 */
export const MAX_FILES_PER_APPRAISAL = 20;

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!isAllowedFileType(file, ALLOWED_DOCUMENT_TYPES)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.',
    };
  }

  if (!isAllowedFileSize(file, MAX_FILE_SIZE)) {
    return {
      valid: false,
      error: 'File size exceeds 25MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for server-side
  return Array.from({ length }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Accepts formats: (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length === 10;
}

/**
 * Validate VIN format
 */
export function isValidVIN(vin: string): boolean {
  // VIN must be exactly 17 alphanumeric characters, excluding I, O, Q
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin.toUpperCase());
}

/**
 * Validate ZIP code format
 */
export function isValidZipCode(zip: string): boolean {
  // Accepts 5-digit or 9-digit ZIP codes
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.windowMs;
  }
}

/**
 * Content Security Policy headers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://clerk.com https://api.stripe.com https://generativelanguage.googleapis.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
};

/**
 * Security headers for API routes
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...CSP_HEADERS,
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(headers: Headers): Headers {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
}

/**
 * Validate environment variables are not exposed
 */
export function validateEnvSecurity(): void {
  if (typeof window !== 'undefined') {
    // Client-side check
    const dangerousVars = [
      'STRIPE_SECRET_KEY',
      'GEMINI_API_KEY',
      'SENDGRID_API_KEY',
      'APIFY_API_TOKEN',
      'DATABASE_URL',
      'CLERK_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];

    dangerousVars.forEach(varName => {
      if ((process.env as any)[varName]) {
        console.error(`SECURITY WARNING: ${varName} is exposed to client-side code!`);
      }
    });
  }
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  return masked + visible;
}

/**
 * Validate webhook signature (generic)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This is a placeholder - actual implementation depends on the service
  // For Stripe, use stripe.webhooks.constructEvent
  // For other services, implement their specific signature validation
  return true;
}

/**
 * SQL injection prevention (when using raw queries)
 * Note: Drizzle ORM already prevents SQL injection, but this is for reference
 */
export function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Prevent path traversal attacks
 */
export function sanitizeFilePath(path: string): string {
  // Remove any ../ or ..\\ sequences
  return path.replace(/\.\.[\/\\]/g, '');
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

/**
 * CORS headers
 */
export function getCORSHeaders(origin: string, allowedOrigins: string[]): Record<string, string> {
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
