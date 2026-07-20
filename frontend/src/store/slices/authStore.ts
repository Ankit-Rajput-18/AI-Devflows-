import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user: User) =>
        set({ user, isAuthenticated: true, isLoading: false }),

      setTokens: (accessToken: string, refreshToken: string) => {
        Cookies.set('accessToken', accessToken, { expires: 7 });
        Cookies.set('refreshToken', refreshToken, { expires: 30 });
      },

      logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'devflow-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);