'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi, tasksApi, sprintsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared';
import {
  BarChart3, TrendingUp, CheckSquare, Bug,
  Clock, Users, Brain, Zap, FolderKanban,
  ArrowUp, ArrowDown, Target,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: projectsData, isLoading: pLoading } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: () => projectsApi.getAll({}).then((r) => r.data),
  });

  const { data: tasksData, isLoading: tLoading } = useQuery({
    queryKey: ['analytics-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const { data: sprintsData } = useQuery({
    queryKey: ['analytics-sprints'],
    queryFn: () => sprintsApi.getAll({}).then((r) => r.data),
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];
  const sprints = sprintsData?.data || [];

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter((t: any) => t.status === 'TODO').length;
  const backlogTasks = tasks.filter((t: any) => t.status === 'BACKLOG').length;
  const reviewTasks = tasks.filter((t: any) => t.status === 'IN_REVIEW').length;
  const urgentTasks = tasks.filter((t: any) => t.priority === 'URGENT').length;
  const highTasks = tasks.filter((t: any) => t.priority === 'HIGH').length;
  const bugTasks = tasks.filter((t: any) => t.type === 'BUG').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const activeSprints = sprints.filter((s: any) => s.status === 'ACTIVE').length;

  const isLoading = pLoading || tLoading;

  const stats = [
    { name: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '+' + projects.length },
    { name: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10', change: doneTasks + ' done' },
    { name: 'Completion Rate', value: completionRate + '%', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10', change: completionRate >= 50 ? 'Good' : 'Needs work' },
    { name: 'Active Sprints', value: activeSprints, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', change: sprints.length + ' total' },
    { name: 'In Progress', value: inProgress, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10', change: 'Active work' },
    { name: 'Bugs', value: bugTasks, icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10', change: urgentTasks + ' urgent' },
  ];

  const taskDistribution = [
    { label: 'Backlog', count: backlogTasks, color: 'bg-gray-500', pct: totalTasks > 0 ? Math.round((backlogTasks / totalTasks) * 100) : 0 },
    { label: 'To Do', count: todoTasks, color: 'bg-blue-500', pct: totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0 },
    { label: 'In Progress', count: inProgress, color: 'bg-yellow-500', pct: totalTasks > 0 ? Math.round((inProgress / totalTasks) * 100) : 0 },
    { label: 'In Review', count: reviewTasks, color: 'bg-purple-500', pct: totalTasks > 0 ? Math.round((reviewTasks / totalTasks) * 100) : 0 },
    { label: 'Done', count: doneTasks, color: 'bg-green-500', pct: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0 },
  ];

  const priorityDistribution = [
    { label: 'Urgent', count: urgentTasks, color: 'bg-red-500' },
    { label: 'High', count: highTasks, color: 'bg-orange-500' },
    { label: 'Medium', count: tasks.filter((t: any) => t.priority === 'MEDIUM').length, color: 'bg-yellow-500' },
    { label: 'Low', count: tasks.filter((t: any) => t.priority === 'LOW').length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-7 h-7" /> Analytics
        </h1>
        <p className="text-muted-foreground">Track your workspace performance</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="hover:shadow-md transition">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className={'p-3 rounded-xl ' + stat.bg}>
                      <stat.icon className={'w-6 h-6 ' + stat.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskDistribution.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={'h-full rounded-full transition-all duration-700 ' + item.color} style={{ width: item.pct + '%' }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priorityDistribution.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={'w-4 h-4 rounded ' + item.color} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.count} tasks</span>
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={'h-full rounded-full ' + item.color} style={{ width: (totalTasks > 0 ? (item.count / totalTasks) * 100 : 0) + '%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-green-500">{completionRate}%</p>
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-orange-500">{urgentTasks + highTasks}</p>
                      <p className="text-xs text-muted-foreground">High Priority</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {sprints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sprint Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sprints.map((sprint: any) => (
                  <div key={sprint.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Zap className={'w-5 h-5 ' + (sprint.status === 'ACTIVE' ? 'text-green-500' : sprint.status === 'COMPLETED' ? 'text-blue-500' : 'text-gray-400')} />
                      <div>
                        <p className="text-sm font-medium">{sprint.name}</p>
                        <p className="text-xs text-muted-foreground">{sprint.project?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{sprint.stats?.progress || 0}%</p>
                      <p className="text-xs text-muted-foreground">{sprint.stats?.doneTasks || 0}/{sprint.stats?.totalTasks || 0}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}