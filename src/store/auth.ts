// src/store/auth.ts
import { writable } from 'svelte/store';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'superadmin';
}

export const auth = writable<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
});

export function login(user: User) {
  auth.set({
    user,
    isAuthenticated: true,
    isLoading: false,
  });
  localStorage.setItem('auth', JSON.stringify({ user, isAuthenticated: true }));
}

export function logout() {
  auth.set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
  localStorage.removeItem('auth');
}

// Load from localStorage on init
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('auth');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      auth.set(data);
    } catch (e) {
      // ignore
    }
  }
}