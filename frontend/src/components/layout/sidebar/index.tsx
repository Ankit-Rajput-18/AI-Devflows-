'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Brain,
  MessageSquare, Zap, BarChart3, Settings, LogOut,
  ChevronLeft, Bell, Users, User, Calendar, Files,
} from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { authApi } from '@/services/api';
import { Avatar } from '@/components/shared/Avatar';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Sprints', href: '/sprints', icon: Zap },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'AI Review', href: '/ai-review', icon: Brain },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Files', href: '/files', icon: Files },
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
    try { await authApi.logout(); } catch (e) {}
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <aside className={cn(
      'h-screen border-r flex flex-col transition-all duration-500 bg-white dark:bg-slate-950 flex-shrink-0',
      collapsed ? 'w-20' : 'w-72'
    )}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">DevFlow</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform duration-500", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className="block relative">
              <div className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative",
                active
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t space-y-2">
        {!collapsed && mounted && user && (
          <Link href="/profile" className="block">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition cursor-pointer group">
              <Avatar name={user.name} src={user.avatar} size="md" showStatus status="online" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <User className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
