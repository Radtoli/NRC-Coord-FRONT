import { isTokenExpired, decodeJWT } from './jwt-utils';

/**
 * Debug function to check authentication state
 */
export function debugAuthState(): void {
  console.log('=== DEBUG AUTH STATE ===');

  const authData = localStorage.getItem('auth');
  console.log('Raw auth data:', authData);

  if (!authData) {
    console.log('No auth data found in localStorage');
    return;
  }

  try {
    const user = JSON.parse(authData);
    console.log('Parsed user data:', user);
    console.log('User has token?', !!user.token);

    if (user.token) {
      console.log('Token:', user.token);

      const decoded = decodeJWT(user.token);
      console.log('Decoded token:', decoded);

      if (decoded) {
        console.log('Token expiration:', new Date(decoded.exp * 1000));
        console.log('Current time:', new Date());
        console.log('Is token expired?', isTokenExpired(user.token));
      }
    }
  } catch (error) {
    console.error('Error parsing auth data:', error);
  }

  console.log('=== END DEBUG ===');
}

/**
 * Add this function to window for browser console access
 */
if (typeof window !== 'undefined') {
  (globalThis as { debugAuth?: () => void }).debugAuth = debugAuthState;
}