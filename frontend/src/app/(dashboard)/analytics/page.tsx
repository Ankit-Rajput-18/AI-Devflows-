'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3, TrendingUp, CheckSquare, Bug,
  Clock, Users, Brain, Zap,
} from 'lucide-react';

const stats = [
  { label: 'Total Tasks', value: '156', change: '+12%', icon: CheckSquare, color: 'text-blue-500' },
  { label: 'Completed', value: '98', change: '+8%', icon: TrendingUp, color: 'text-green-500' },
  { label: 'Bugs Found', value: '23', change: '-5%', icon: Bug, color: 'text-red-500' },
  { label: 'AI Reviews', value: '45', change: '+20%', icon: Brain, color: 'text-purple-500' },
  { label: 'Avg Time', value: '2.3d', change: '-15%', icon: Clock, color: 'text-orange-500' },
  { label: 'Team Size', value: '8', change: '+2', icon: Users, color: 'text-cyan-500' },
];

const sprintData = [
  { name: 'Sprint 1', completed: 18, total: 20, progress: 90 },
  { name: 'Sprint 2', completed: 12, total: 15, progress: 80 },
  { name: 'Sprint 3', completed: 5, total: 18, progress: 28 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-7 h-7" /> Analytics
        </h1>
        <p className="text-muted-foreground">Track your team performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className={'text-xs mt-1 ' + (stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500')}>
                    {stat.change} from last sprint
                  </p>
                </div>
                <stat.icon className={'w-8 h-8 ' + stat.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sprint Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sprintData.map((sprint) => (
            <div key={sprint.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{sprint.name}</span>
                <span className="text-muted-foreground">{sprint.completed}/{sprint.total} tasks</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: sprint.progress + '%' }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
