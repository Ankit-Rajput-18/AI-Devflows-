'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Brain,
  FileText, MessageSquare, Calendar, Files, Zap,
  BarChart3, Settings, LogOut, ChevronLeft, Bell, Users
} from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { useState } from 'react';
import { getInitials } from '@/lib/utils';
import Cookies from 'js-cookie';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Sprints', href: '/sprints', icon: Zap },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'AI Review', href: '/ai-review', icon: Brain },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    logout();
    router.push('/');
  };

  return (
    <aside className={cn(
      'h-screen border-r flex flex-col transition-all duration-500 bg-white dark:bg-[#09090b]',
      collapsed ? 'w-20' : 'w-72'
    )}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">DevFlow</span>
          </motion.div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ChevronLeft className={cn("transition-transform duration-500", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block relative group">
              <div className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
                active ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-muted-foreground hover:bg-muted"
              )}>
                <item.icon className={cn("w-5 h-5", active && "animate-pulse")} />
                {!collapsed && <span className="font-medium">{item.name}</span>}
                {active && !collapsed && (
                  <motion.div layoutId="active" className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t">
        {!collapsed && user && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-4 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}