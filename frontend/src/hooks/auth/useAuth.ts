import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/slices/authStore';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token && !user) {
      authApi.getProfile()
        .then((res) => setUser(res.data.data))
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return { user, isAuthenticated, logout };
}
