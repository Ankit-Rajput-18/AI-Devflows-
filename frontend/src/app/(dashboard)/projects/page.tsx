'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { FolderKanban, Plus, Users, CheckSquare, Search, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => projectsApi.getAll({ search: search || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setForm({ name: '', description: '', color: '#3b82f6' });
      toast.success('Project created!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted!');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const projects: Project[] = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">{projects.length} projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to get started"
          action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Create Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="p-6 hover:shadow-md transition group relative">
              <Link href={'/projects/' + project.id} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    >
                      {project.name?.[0] || 'P'}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">{project.owner?.name}</p>
                    </div>
                  </div>
                  <Badge variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project._count?.members || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{project._count?.tasks || 0} tasks</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm('Delete project "' + project.name + '"?')) {
                    deleteMutation.mutate(project.id);
                  }
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="My Awesome Project"
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm min-h-[80px] focus:ring-2 focus:ring-primary outline-none"
              placeholder="Project description..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {['#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={'w-8 h-8 rounded-full border-2 transition ' + (form.color === c ? 'border-foreground scale-110' : 'border-transparent')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}