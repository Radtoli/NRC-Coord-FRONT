// Utility functions for JWT handling in the frontend

interface JWTPayload {
  userId: string;
  email: string;
  exp: number; // Token expiration timestamp
  iat: number; // Token issued timestamp
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT has three parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

    // Decode base64url to string
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  console.log('[DEBUG isTokenExpired] Checking token:', token?.substring(0, 20) + '...');

  const payload = decodeJWT(token);
  console.log('[DEBUG isTokenExpired] Decoded payload:', payload);

  if (!payload || !payload.exp) {
    console.log('[DEBUG isTokenExpired] Invalid payload or no exp field, considering expired');
    return true; // Consider invalid tokens as expired
  }

  // Convert seconds to milliseconds and compare with current time
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  console.log('[DEBUG isTokenExpired] Expiration time:', new Date(expirationTime));
  console.log('[DEBUG isTokenExpired] Current time:', new Date(currentTime));
  console.log('[DEBUG isTokenExpired] Is expired:', currentTime >= expirationTime);

  return currentTime >= expirationTime;
}

/**
 * Get token expiration time as Date object
 */
export function getTokenExpirationDate(token: string): Date | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Get time remaining until token expires (in milliseconds)
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return Math.max(0, expirationTime - currentTime);
}

/**
 * Check if token expires within the specified minutes
 */
export function isTokenExpiringWithin(token: string, minutes: number): boolean {
  const timeRemaining = getTokenTimeRemaining(token);
  const minutesInMs = minutes * 60 * 1000;

  return timeRemaining <= minutesInMs && timeRemaining > 0;
}