'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => {
              const html = document.documentElement;
              html.classList.toggle('dark');
            }}
            className="p-2 rounded-lg hover:bg-accent transition"
          >
            {document.documentElement.classList.contains('dark') ? '☀️' : '🌙'}
          </button>
        )}

        <button className="p-2 rounded-lg hover:bg-accent transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {mounted && user && (
          <div className="flex items-center gap-2 pl-3 border-l">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}