import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_status?: 'active' | 'past_due' | 'canceled' | 'none';
  plan_type?: 'monthly' | 'yearly' | 'none';
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (userData) => set((state) => ({ 
        user: state.user ? { ...state.user, ...userData } : null 
      })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'talon-auth',
    }
  )
);
