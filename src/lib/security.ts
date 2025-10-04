// Security utilities for preventing common attacks

/**
 * Prevent timing attacks by adding consistent delay
 */
export const preventTimingAttack = async <T>(
  operation: () => Promise<T>,
  minDelayMs: number = 100
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await operation();
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDelayMs - elapsed);
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    return result;
  } catch (error) {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDelayMs - elapsed);
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    throw error;
  }
};

/**
 * Generate secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify CSRF token
 */
export const verifyCsrfToken = (token: string | null, expectedToken: string): boolean => {
  if (!token || !expectedToken) return false;
  if (token.length !== expectedToken.length) return false;
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
};

/**
 * Content Security Policy headers
 */
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Consider removing unsafe-* in production
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"]
};

/**
 * Check if user agent is suspicious
 */
export const isSuspiciousUserAgent = (userAgent: string): boolean => {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Sanitize URL to prevent open redirect attacks
 */
export const sanitizeRedirectUrl = (url: string, allowedDomains: string[]): string | null => {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    
    if (allowedDomains.includes(domain)) {
      return url;
    }
    
    return null;
  } catch {
    // Invalid URL
    return null;
  }
};
