'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/slices/authStore';
import { authApi } from '@/services/api';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(form);
      const { user, accessToken, refreshToken } = response.data.data;

      setTokens(accessToken, refreshToken);
      setUser(user);
      toast.success('Welcome back, ' + user.name + '!');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            <Logo size="lg" showText animated className="mb-4" />

            <h2 className="text-2xl font-bold mt-4">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-blue-500/25"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <a
            href={API_URL + '/api/auth/google'}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-xl hover:bg-accent transition text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Accounts:</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Admin: admin@devflow.ai / Admin@123</p>
              <p className="text-xs text-muted-foreground">Dev: dev@devflow.ai / Dev@12345</p>
              <p className="text-xs text-muted-foreground">Manager: manager@devflow.ai / Manager@123</p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Do not have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 items-center justify-center p-12">
        <div className="text-white text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Logo size="lg" showText={false} className="scale-110" />
          </div>
          <h2 className="text-3xl font-bold">DevFlow AI</h2>
          <p className="mt-3 text-white/80 text-lg">
            AI-Powered Developer Workspace for modern teams
          </p>
          <div className="mt-8 space-y-3">
            {['AI Code Review and Bug Detection', 'Real-time Team Chat', 'Sprint and Task Management', 'Beautiful Analytics Dashboard'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}