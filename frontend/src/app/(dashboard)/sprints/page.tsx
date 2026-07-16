'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintsApi, projectsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Zap, Plus, Play, CheckCircle, Clock, Calendar, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function SprintsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    goal: '',
    projectId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectsApi.getAll({}).then((r) => r.data),
  });

  const { data: sprintsData, isLoading } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => sprintsApi.getAll({}).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => sprintsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setShowCreate(false);
      setForm({
        name: '',
        goal: '',
        projectId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      toast.success('Sprint created!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create sprint');
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => sprintsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint started!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to start sprint');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => sprintsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint completed!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to complete sprint');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sprintsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint deleted!');
    },
  });

  const projects = projectsData?.data || [];
  const sprints = sprintsData?.data || [];

  const statusConfig: Record<string, { color: any; label: string; icon: any }> = {
    PLANNING: { color: 'secondary', label: 'Planning', icon: Clock },
    ACTIVE: { color: 'success', label: 'Active', icon: Play },
    COMPLETED: { color: 'default', label: 'Completed', icon: CheckCircle },
    CANCELLED: { color: 'destructive', label: 'Cancelled', icon: Clock },
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      toast.error('Please select a project');
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-500" /> Sprints
          </h1>
          <p className="text-muted-foreground">Manage your development sprints</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Sprint
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : sprints.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No sprints yet"
          description="Create your first sprint to start tracking work"
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Sprint
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sprints.map((sprint: any) => {
            const config = statusConfig[sprint.status] || statusConfig.PLANNING;
            const Icon = config.icon;
            const progress = sprint.stats?.progress || 0;
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (new Date(sprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              ),
            );

            return (
              <Card key={sprint.id} className="hover:shadow-md transition group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{sprint.name}</span>
                      </CardTitle>
                      {sprint.goal && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {sprint.goal}
                        </p>
                      )}
                    </div>
                    <Badge variant={config.color} className="ml-2 flex-shrink-0">
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                        style={{ width: progress + '%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {sprint.stats?.doneTasks || 0}/{sprint.stats?.totalTasks || 0} tasks done
                      </span>
                      {sprint.project?.name && (
                        <span className="truncate ml-2">{sprint.project.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(sprint.startDate)}
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(sprint.endDate)}
                    </div>
                    {sprint.status === 'ACTIVE' && daysLeft > 0 && (
                      <div className="flex items-center gap-1 text-orange-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft} days left
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {sprint.status === 'PLANNING' && (
                      <Button
                        size="sm"
                        onClick={() => startMutation.mutate(sprint.id)}
                        loading={startMutation.isPending}
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Start Sprint
                      </Button>
                    )}
                    {sprint.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeMutation.mutate(sprint.id)}
                        loading={completeMutation.isPending}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    )}
                    {sprint.status === 'COMPLETED' && (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Delete sprint "' + sprint.name + '"?')) {
                          deleteMutation.mutate(sprint.id);
                        }
                      }}
                      className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100"
                      title="Delete sprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Sprint">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Sprint Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Sprint 1, Sprint 2..."
            required
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Goal</label>
            <textarea
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm min-h-[70px] focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="What do you want to achieve in this sprint?"
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
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}