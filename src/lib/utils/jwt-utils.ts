interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

export function getTokenExpirationDate(token: string): Date | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return Math.max(0, expirationTime - currentTime);
}

export function isTokenExpiringWithin(token: string, minutes: number): boolean {
  const timeRemaining = getTokenTimeRemaining(token);
  const minutesInMs = minutes * 60 * 1000;

  return timeRemaining <= minutesInMs && timeRemaining > 0;
}