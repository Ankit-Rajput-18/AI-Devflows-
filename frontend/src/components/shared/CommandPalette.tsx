'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, tasksApi, usersApi } from '@/services/api';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Brain,
  MessageSquare, Calendar, BarChart3, Settings,
  Search, ArrowRight, Plus, Users, FileText, Zap,
  Bell, User,
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: projectsData } = useQuery({
    queryKey: ['cmdk-projects'],
    queryFn: () => projectsApi.getAll({ limit: 10 }).then((r) => r.data),
    enabled: open,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['cmdk-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 10 }).then((r) => r.data),
    enabled: open,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', shortcut: 'G D' },
    { icon: FolderKanban, label: 'Projects', href: '/projects', shortcut: 'G P' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks', shortcut: 'G T' },
    { icon: Zap, label: 'Sprints', href: '/sprints', shortcut: 'G S' },
    { icon: Users, label: 'Team', href: '/team', shortcut: 'G M' },
    { icon: Brain, label: 'AI Review', href: '/ai-review', shortcut: 'G A' },
    { icon: FileText, label: 'AI Docs', href: '/ai-docs' },
    { icon: MessageSquare, label: 'Chat', href: '/chat', shortcut: 'G C' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const quickActions = [
    { icon: Plus, label: 'Create New Project', href: '/projects', color: 'text-blue-500' },
    { icon: Plus, label: 'Create New Task', href: '/tasks', color: 'text-green-500' },
    { icon: Plus, label: 'Create New Sprint', href: '/sprints', color: 'text-yellow-500' },
    { icon: Brain, label: 'Start AI Code Review', href: '/ai-review', color: 'text-purple-500' },
  ];

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  const searchLower = search.toLowerCase();
  const filteredNav = navigationItems.filter((i) => i.label.toLowerCase().includes(searchLower));
  const filteredActions = quickActions.filter((i) => i.label.toLowerCase().includes(searchLower));
  const filteredProjects = search ? projects.filter((p: any) => p.name?.toLowerCase().includes(searchLower)) : [];
  const filteredTasks = search ? tasks.filter((t: any) => t.title?.toLowerCase().includes(searchLower)) : [];

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Search or type a command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="px-2 py-0.5 text-xs bg-muted rounded border">ESC</kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredActions.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Quick Actions</p>
              {filteredActions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-left group"
                >
                  <item.icon className={'w-5 h-5 ' + item.color} />
                  <span className="flex-1 text-sm">{item.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          )}

          {filteredNav.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Navigation</p>
              {filteredNav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-left group"
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Projects</p>
              {filteredProjects.slice(0, 5).map((project: any) => (
                <button
                  key={project.id}
                  onClick={() => handleSelect('/projects/' + project.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-left"
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  >
                    {project.name?.[0]}
                  </div>
                  <span className="flex-1 text-sm">{project.name}</span>
                </button>
              ))}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Tasks</p>
              {filteredTasks.slice(0, 5).map((task: any) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect('/tasks/' + task.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-left"
                >
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{task.title}</span>
                  <span className="text-xs text-muted-foreground">{task.status}</span>
                </button>
              ))}
            </div>
          )}

          {search && filteredNav.length === 0 && filteredActions.length === 0 && filteredProjects.length === 0 && filteredTasks.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results found for "{search}"</p>
            </div>
          )}
        </div>

        <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">↓</kbd>
              Navigate
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">⌘K</kbd>
            <span>anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}