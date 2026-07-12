export const APP_NAME = 'DevFlow AI';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  AI_REVIEW: '/ai-review',
  AI_DOCS: '/ai-docs',
  CHAT: '/chat',
  MEETINGS: '/meetings',
  CALENDAR: '/calendar',
  FILES: '/files',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  ADMIN: '/admin',
} as const;

export const TASK_STATUS_CONFIG = {
  BACKLOG: { label: 'Backlog', color: '#6b7280', bg: '#f3f4f6' },
  TODO: { label: 'To Do', color: '#3b82f6', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  IN_REVIEW: { label: 'In Review', color: '#8b5cf6', bg: '#f5f3ff' },
  DONE: { label: 'Done', color: '#22c55e', bg: '#f0fdf4' },
} as const;

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: '#6b7280', icon: 'ArrowDown' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', icon: 'ArrowRight' },
  HIGH: { label: 'High', color: '#ef4444', icon: 'ArrowUp' },
  URGENT: { label: 'Urgent', color: '#dc2626', icon: 'AlertTriangle' },
} as const;

export const SIDEBAR_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Projects', href: '/projects', icon: 'FolderKanban' },
  { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
  { name: 'AI Review', href: '/ai-review', icon: 'Brain' },
  { name: 'AI Docs', href: '/ai-docs', icon: 'FileText' },
  { name: 'Chat', href: '/chat', icon: 'MessageSquare' },
  { name: 'Calendar', href: '/calendar', icon: 'Calendar' },
  { name: 'Files', href: '/files', icon: 'Files' },
  { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
] as const;
