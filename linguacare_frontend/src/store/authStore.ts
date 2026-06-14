import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'learner' | 'tutor' | 'supporter' | null;

interface AuthState {
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      login: (role) => set({ role }),
      logout: () => set({ role: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
