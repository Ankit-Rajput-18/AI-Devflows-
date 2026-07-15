'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, projectsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { CheckSquare, Plus, Search } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-600',
  TODO: 'bg-blue-100 text-blue-600',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-600',
  IN_REVIEW: 'bg-purple-100 text-purple-600',
  DONE: 'bg-green-100 text-green-600',
};

const PRIORITY_COLORS: Record<string, any> = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'warning',
  URGENT: 'destructive',
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM',
    type: 'TASK',
    dueDate: '',
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', search, statusFilter],
    queryFn: () => tasksApi.getAll({
      search: search || undefined,
      status: statusFilter || undefined,
    }).then((r) => r.data),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectsApi.getAll({}).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreate(false);
      setForm({ title: '', description: '', projectId: '', priority: 'MEDIUM', type: 'TASK', dueDate: '' });
      toast.success('Task created successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create task');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      toast.error('Please select a project');
      return;
    }
    const payload: any = {
      title: form.title,
      projectId: form.projectId,
      priority: form.priority,
      type: form.type,
    };
    if (form.description) payload.description = form.description;
    if (form.dueDate) payload.dueDate = form.dueDate;

    createMutation.mutate(payload);
  };

  const tasks: Task[] = tasksData?.data || [];
  const projects = projectsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">{tasks.length} tasks total</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-card text-sm"
        >
          <option value="">All Status</option>
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create your first task to get started"
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Task
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Task</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Priority</th>
                <th className="text-left p-4 text-sm font-medium">Assignee</th>
                <th className="text-left p-4 text-sm font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-muted/30 transition">
                  <td className="p-4">
                    <p className="font-medium text-sm">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (STATUS_COLORS[task.status] || '')}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                  </td>
                  <td className="p-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {getInitials(task.assignee.name)}
                        </div>
                        <span className="text-sm">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {task.dueDate ? formatDate(task.dueDate) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Task Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter task title"
            required
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm min-h-[80px] focus:ring-2 focus:ring-primary outline-none"
              placeholder="Task description..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Project *</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              required
            >
              <option value="">Select a project</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}