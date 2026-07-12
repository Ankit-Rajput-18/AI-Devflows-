'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/slices/authStore';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);

      authApi.getProfile().then((res) => {
        setUser(res.data.data);
        toast.success('Google login successful!');
        router.push('/dashboard');
      }).catch(() => {
        toast.error('Failed to get profile');
        router.push('/login');
      });
    } else {
      toast.error('OAuth failed');
      router.push('/login');
    }
  }, [searchParams, router, setUser, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
