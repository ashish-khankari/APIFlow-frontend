// app/lib/auth.ts
// Centralized authentication utilities for token handling and persistence.

const TOKEN_KEY = 'authToken';

/**
 * Checks whether a JWT token is expired.
 * Returns true if expired or token is falsy.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds
    if (payload.exp && typeof payload.exp === 'number') {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch (e) {
    return true;
  }
}

/**
 * Persists the auth token to localStorage.
 */
export function setAuth(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clears authentication data from localStorage.
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Retrieves a valid, non‑expired token from localStorage.
 */
export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !isTokenExpired(token)) {
    return token;
  }
  // If token is expired, clean up and return null
  clearAuth();
  return null;
}

/**
 * Returns true if a valid token exists in storage.
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
