'use client';

import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/slices/authStore';
import { getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import Link from 'next/link';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
    refetchInterval: 15000,
    enabled: !!user,
  });

  const unreadCount = notifData?.data?.unreadCount || 0;

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl hover:bg-accent transition"
            title="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun className="w-5 h-5 text-yellow-500" />
              : <Moon className="w-5 h-5 text-blue-500" />
            }
          </button>
        )}

        <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-accent transition">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {mounted && user && (
          <Link href="/profile" className="flex items-center gap-2 pl-3 ml-1 border-l hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.role}</p>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}