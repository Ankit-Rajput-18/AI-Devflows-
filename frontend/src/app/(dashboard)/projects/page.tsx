'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared';
import { FolderKanban, Plus, Users, CheckSquare, Search, Trash2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Project } from '@/types';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => projectsApi.getAll({ search }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setForm({ name: '', description: '', color: '#3b82f6' });
      toast.success('Project created successfully!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted!');
    },
  });

  const projects: Project[] = data?.data || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage all your projects in one place • {projects.length} total</p>
        </div>
        <Button size="lg" onClick={() => setShowCreate(true)}>
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-muted bg-white dark:bg-[#09090b] text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </motion.div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 rounded-3xl border-2 border-dashed border-muted"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/25">
            <FolderKanban className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start your journey by creating your first project. Get instant AI-powered insights.
          </p>
          <Button size="lg" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5 mr-2" /> Create First Project
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <Link href={'/projects/' + project.id}>
                <div className="relative p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-muted hover:border-transparent hover:shadow-2xl transition-all overflow-hidden cursor-pointer">
                  {/* Gradient Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{
                        backgroundColor: project.color || '#3b82f6',
                        boxShadow: '0 8px 20px ' + (project.color || '#3b82f6') + '40',
                      }}
                    >
                      {project.name?.[0].toUpperCase()}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Members</span>
                      </div>
                      <p className="text-lg font-bold">{project._count?.members || 0}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckSquare className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Tasks</span>
                      </div>
                      <p className="text-lg font-bold">{project._count?.tasks || 0}</p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Delete project?')) deleteMutation.mutate(project.id);
                    }}
                    className="absolute top-4 right-14 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-5">
          <Input
            label="Project Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Amazing Project"
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-transparent text-sm min-h-[100px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
              placeholder="What is this project about?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Project Color</label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={'w-12 h-12 rounded-2xl transition-all ' + (form.color === c ? 'scale-110 ring-4 ring-offset-2 ring-blue-500' : 'hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}