import { describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_STORAGE_KEY, getStoredAuthToken } from './authToken';
import { getApiBaseUrl } from './config';

describe('api client configuration', () => {
  it('uses the Vite API base URL without hardcoding an address', () => {
    expect(getApiBaseUrl({ VITE_API_BASE_URL: 'http://localhost:3000' })).toBe(
      'http://localhost:3000'
    );
    expect(getApiBaseUrl({})).toBe('');
  });

  it('reads the bearer token from browser storage', () => {
    const getItem = vi.fn((key: string) =>
      key === AUTH_TOKEN_STORAGE_KEY ? 'sample-token' : null
    );

    expect(getStoredAuthToken({ getItem })).toBe('sample-token');
  });
});
