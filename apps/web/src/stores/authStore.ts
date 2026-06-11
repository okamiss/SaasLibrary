import { create } from 'zustand';
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken
} from '../api/authToken';

interface AuthState {
  token: string;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredAuthToken(),
  setToken: (token) => {
    setStoredAuthToken(token);
    set({ token: token.trim() });
  },
  clearToken: () => {
    clearStoredAuthToken();
    set({ token: '' });
  }
}));

window.addEventListener('storage', (event) => {
  if (event.key === AUTH_TOKEN_STORAGE_KEY) {
    useAuthStore.setState({ token: event.newValue ?? '' });
  }
});
