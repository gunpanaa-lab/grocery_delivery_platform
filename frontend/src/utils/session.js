const STORAGE_KEY = 'grocer_user';

/**
 * Thin wrapper around the localStorage-backed session used by
 * axiosConfig.js's request interceptor and by pages that need to know
 * who is logged in / which role they have.
 */
export function setStoredUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}
