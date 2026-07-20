'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/slices/authStore';
import { authApi } from '@/services/api';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const passwordChecks = [
    { label: 'At least 8 characters', valid: form.password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(form.password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(form.password) },
    { label: 'One number', valid: /[0-9]/.test(form.password) },
    { label: 'One special character', valid: /[!@#$%^&*]/.test(form.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.register(form);
      const { user, accessToken, refreshToken } = response.data.data;

      setTokens(accessToken, refreshToken);
      setUser(user);
      toast.success('Welcome to DevFlow AI, ' + user.name + '!');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Gradient */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 items-center justify-center p-12">
        <div className="text-white text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Code2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Join DevFlow AI</h2>
          <p className="mt-3 text-white/80 text-lg">
            Start building better software with AI assistance
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {['40+ APIs', '15+ Models', '4 AI Features', 'Real-time Chat'].map((item) => (
              <div key={item} className="p-3 rounded-xl bg-white/10 backdrop-blur text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            <Logo size="lg" showText animated className="mb-4" />
            <h2 className="text-2xl font-bold mt-4">Create your account</h2>
            <p className="text-muted-foreground mt-1">Get started with your AI-powered workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition"
                placeholder="John Doe"
                required
                minLength={2}
              />
            </div>

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
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition pr-12"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      <CheckCircle className={'w-3.5 h-3.5 ' + (check.valid ? 'text-green-500' : 'text-muted-foreground')} />
                      <span className={'text-xs ' + (check.valid ? 'text-green-500' : 'text-muted-foreground')}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-blue-500/25"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}