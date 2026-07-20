'use client';

import { Search, Bell, Moon, Sun, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/slices/authStore';
import { Avatar } from '@/components/shared/Avatar';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
    refetchInterval: 15000,
    enabled: !!user,
  });

  const unreadCount = notifData?.data?.unreadCount || 0;

  const openCmdK = () => {
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
    document.dispatchEvent(event);
  };

  return (
    <header className="h-16 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={openCmdK}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl border-2 border-muted bg-transparent hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition group max-w-md w-full"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition" />
          <span className="flex-1 text-left text-sm text-muted-foreground">Search or type command...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs bg-muted rounded border">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-muted transition"
          >
            {theme === 'dark'
              ? <Sun className="w-5 h-5 text-yellow-500" />
              : <Moon className="w-5 h-5 text-blue-500" />
            }
          </motion.button>
        )}

        <Link href="/notifications" className="relative p-2.5 rounded-xl hover:bg-muted transition">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Link>

        {mounted && user && (
          <Link href="/profile" className="flex items-center gap-3 pl-3 ml-1 border-l hover:opacity-80 transition">
            <Avatar name={user.name} src={user.avatar} size="sm" showStatus status="online" />
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.role}</p>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
