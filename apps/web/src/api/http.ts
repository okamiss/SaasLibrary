import axios from 'axios';
import { getStoredAuthToken } from './authToken';
import { getApiBaseUrl } from './config';

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
