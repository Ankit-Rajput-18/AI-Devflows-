'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Brain,
  FileText, MessageSquare, Calendar, Files,
  BarChart3, Settings, LogOut, ChevronLeft, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { authApi } from '@/services/api';
import { useState, useEffect } from 'react';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'AI Review', href: '/ai-review', icon: Brain },
  { name: 'AI Docs', href: '/ai-docs', icon: FileText },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Files', href: '/files', icon: Files },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <aside className={cn(
      'h-screen bg-card border-r flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DF</span>
            </div>
            <span className="font-bold text-lg">DevFlow AI</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-accent">
          <ChevronLeft className={cn('w-5 h-5 transition', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t">
        {!collapsed && mounted && user && (
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-muted-foreground hover:bg-destructive hover:text-white transition"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}