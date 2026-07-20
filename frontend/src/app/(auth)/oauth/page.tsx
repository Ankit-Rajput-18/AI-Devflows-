'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/slices/authStore';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      router.push('/login');
      return;
    }

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);

      authApi.getProfile()
        .then((res) => {
          setUser(res.data.data);
          toast.success('Google login successful!');
          router.push('/dashboard');
        })
        .catch(() => {
          toast.error('Failed to get profile');
          router.push('/login');
        });
    } else {
      toast.error('OAuth failed - no tokens received');
      router.push('/login');
    }
  }, [searchParams, router, setUser, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <div>
          <p className="text-lg font-medium">Completing Google Sign In...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait</p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}