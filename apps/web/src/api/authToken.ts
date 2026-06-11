export const AUTH_TOKEN_STORAGE_KEY = 'ai-company-assistant.access-token';

export interface TokenStorage {
  getItem(key: string): string | null;
  setItem?(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function getStoredAuthToken(storage: TokenStorage | undefined = localStorage) {
  return storage?.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim() ?? '';
}

export function setStoredAuthToken(token: string, storage: TokenStorage = localStorage) {
  storage.setItem?.(AUTH_TOKEN_STORAGE_KEY, token.trim());
}

export function clearStoredAuthToken(storage: TokenStorage = localStorage) {
  storage.removeItem?.(AUTH_TOKEN_STORAGE_KEY);
}
