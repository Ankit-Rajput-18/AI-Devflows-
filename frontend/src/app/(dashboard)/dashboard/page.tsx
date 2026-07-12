'use client';

import { useAuthStore } from '@/store/slices/authStore';
import {
  FolderKanban, CheckSquare, Brain, Users,
  TrendingUp, Clock, AlertTriangle, Zap,
} from 'lucide-react';

const stats = [
  { name: 'Total Projects', value: '12', icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Active Tasks', value: '34', icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
  { name: 'AI Reviews', value: '89', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Team Members', value: '8', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const recentActivity = [
  { action: 'Task completed', detail: 'Setup NestJS Backend', time: '2 hours ago', icon: CheckSquare },
  { action: 'AI Review', detail: 'Code score: 85/100', time: '3 hours ago', icon: Brain },
  { action: 'New sprint', detail: 'Sprint 2 started', time: '5 hours ago', icon: TrendingUp },
  { action: 'Bug detected', detail: 'Null reference in auth.ts', time: '1 day ago', icon: AlertTriangle },
  { action: 'PR merged', detail: 'Feature: Dashboard UI', time: '1 day ago', icon: Zap },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user ? ', ' + user.name.split(' ')[0] : ''} !
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is what is happening in your workspace today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-6 rounded-xl border bg-card hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={'p-3 rounded-lg ' + stat.bg}>
                <stat.icon className={'w-6 h-6 ' + stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-lg border hover:bg-accent transition text-left">
              <FolderKanban className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-sm font-medium">New Project</p>
              <p className="text-xs text-muted-foreground">Create a project</p>
            </button>
            <button className="p-4 rounded-lg border hover:bg-accent transition text-left">
              <CheckSquare className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-sm font-medium">New Task</p>
              <p className="text-xs text-muted-foreground">Add a task</p>
            </button>
            <button className="p-4 rounded-lg border hover:bg-accent transition text-left">
              <Brain className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-sm font-medium">AI Review</p>
              <p className="text-xs text-muted-foreground">Review code</p>
            </button>
            <button className="p-4 rounded-lg border hover:bg-accent transition text-left">
              <Zap className="w-5 h-5 text-yellow-500 mb-2" />
              <p className="text-sm font-medium">Bug Scan</p>
              <p className="text-xs text-muted-foreground">Detect bugs</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
