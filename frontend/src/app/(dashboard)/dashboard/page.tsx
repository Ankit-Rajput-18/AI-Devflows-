'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/slices/authStore';
import { projectsApi, tasksApi, sprintsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared';
import {
  FolderKanban, CheckSquare, Brain, Users,
  TrendingUp, Clock, Plus, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, getInitials, timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: projectsData, isLoading: pLoading } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: () => projectsApi.getAll({ limit: 5 }).then((r) => r.data),
  });

  const { data: tasksData, isLoading: tLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 10 }).then((r) => r.data),
  });

  const { data: sprintsData } = useQuery({
    queryKey: ['dashboard-sprints'],
    queryFn: () => sprintsApi.getAll({}).then((r) => r.data),
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];
  const sprints = sprintsData?.data || [];

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const urgentTasks = tasks.filter((t: any) => t.priority === 'URGENT' || t.priority === 'HIGH').length;

  const stats = [
    { name: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'In Progress', value: inProgressTasks, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Completed', value: doneTasks, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const isLoading = pLoading || tLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{user ? ', ' + user.name.split(' ')[0] : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is what is happening in your workspace today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Project
            </Button>
          </Link>
          <Link href="/tasks">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Task
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={'p-3 rounded-lg ' + stat.bg}>
                      <stat.icon className={'w-6 h-6 ' + stat.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Tasks</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks yet. Create your first task!</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 6).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={'w-2 h-2 rounded-full flex-shrink-0 ' + (task.status === 'DONE' ? 'bg-green-500' : task.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-400')} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{task.status.replace('_', ' ')}</span>
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === 'URGENT' ? 'destructive' : task.priority === 'HIGH' ? 'warning' : 'outline'} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.assignee && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold" title={task.assignee.name}>
                              {getInitials(task.assignee.name)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Projects</CardTitle>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
                  ) : (
                    <div className="space-y-3">
                      {projects.slice(0, 4).map((project: any) => (
                        <Link key={project.id} href={'/projects/' + project.id}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition cursor-pointer">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: project.color || '#3b82f6' }}
                            >
                              {project.name?.[0] || 'P'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{project.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {project._count?.tasks || 0} tasks | {project._count?.members || 0} members
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/projects">
                      <button className="w-full p-3 rounded-lg border hover:bg-accent transition text-left flex items-center gap-3">
                        <FolderKanban className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">New Project</p>
                          <p className="text-xs text-muted-foreground">Create project</p>
                        </div>
                      </button>
                    </Link>
                    <Link href="/tasks">
                      <button className="w-full p-3 rounded-lg border hover:bg-accent transition text-left flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">New Task</p>
                          <p className="text-xs text-muted-foreground">Add task</p>
                        </div>
                      </button>
                    </Link>
                    <Link href="/ai-review">
                      <button className="w-full p-3 rounded-lg border hover:bg-accent transition text-left flex items-center gap-3">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">AI Review</p>
                          <p className="text-xs text-muted-foreground">Review code</p>
                        </div>
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {urgentTasks > 0 && (
                <Card className="border-destructive/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <Clock className="w-5 h-5" />
                      <p className="text-sm font-medium">{urgentTasks} urgent/high priority tasks</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {sprints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sprint Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sprints.slice(0, 3).map((sprint: any) => (
                  <div key={sprint.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{sprint.name}</span>
                      <span className="text-muted-foreground">
                        {sprint.stats?.doneTasks || 0}/{sprint.stats?.totalTasks || 0} tasks
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: (sprint.stats?.progress || 0) + '%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <Badge variant={sprint.status === 'ACTIVE' ? 'success' : 'outline'} className="text-xs">
                        {sprint.status}
                      </Badge>
                      <span>{sprint.stats?.progress || 0}% complete</span>
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