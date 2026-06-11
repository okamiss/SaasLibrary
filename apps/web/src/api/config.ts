interface ApiEnv {
  readonly [key: string]: unknown;
  VITE_API_BASE_URL?: string;
}

export function getApiBaseUrl(env: ApiEnv = import.meta.env) {
  return env.VITE_API_BASE_URL?.trim() ?? '';
}
