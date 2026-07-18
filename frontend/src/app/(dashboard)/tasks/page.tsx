'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, projectsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Search, Calendar, Flag, Filter, Grid, List } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BACKLOG: { bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-700 dark:text-gray-300', label: 'Backlog' },
  TODO: { bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-700 dark:text-blue-400', label: 'To Do' },
  IN_PROGRESS: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-700 dark:text-yellow-400', label: 'In Progress' },
  IN_REVIEW: { bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-700 dark:text-purple-400', label: 'Review' },
  DONE: { bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-700 dark:text-green-400', label: 'Done' },
};

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  LOW: { bg: 'bg-blue-500/10', color: 'text-blue-600' },
  MEDIUM: { bg: 'bg-yellow-500/10', color: 'text-yellow-600' },
  HIGH: { bg: 'bg-orange-500/10', color: 'text-orange-600' },
  URGENT: { bg: 'bg-red-500/10', color: 'text-red-600' },
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', projectId: '',
    priority: 'MEDIUM', type: 'TASK', dueDate: '',
  });

  const { data: tasksData } = useQuery({
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
      toast.success('Task created!');
    },
  });

  const tasks = tasksData?.data || [];
  const projects = projectsData?.data || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2">{tasks.length} tasks total</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-2xl border-2 border-muted p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={'p-2 rounded-xl transition-all ' + (viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-muted-foreground')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={'p-2 rounded-xl transition-all ' + (viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-muted-foreground')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="lg" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5 mr-2" /> New Task
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-[#09090b] text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-[#09090b] text-sm focus:border-blue-500 outline-none transition-all"
        >
          <option value="">All Status</option>
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Tasks Display */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 rounded-3xl border-2 border-dashed"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-6">Create your first task to get started</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task: any, i: number) => {
            const status = STATUS_STYLES[task.status] || STATUS_STYLES.TODO;
            const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
              >
                <Link href={'/tasks/' + task.id}>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#09090b] border border-muted hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xl transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <span className={'text-xs font-bold px-3 py-1 rounded-lg ' + status.bg + ' ' + status.color}>
                        {status.label}
                      </span>
                      <span className={'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ' + priority.bg + ' ' + priority.color}>
                        <Flag className="w-3 h-3" />
                        {task.priority}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-muted">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(task.dueDate)}
                        </div>
                      ) : <div />}

                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(task.assignee.name)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task: any, i: number) => {
            const status = STATUS_STYLES[task.status] || STATUS_STYLES.TODO;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link href={'/tasks/' + task.id}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-muted hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className={'w-2 h-12 rounded-full ' + status.bg.replace('bg-', 'bg-')} />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors truncate">{task.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{task.project?.name}</span>
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className={'text-xs font-bold px-3 py-1 rounded-lg ' + status.bg + ' ' + status.color}>
                      {status.label}
                    </span>

                    {task.assignee && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(task.assignee.name)}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!form.projectId) { toast.error('Select a project'); return; }
          createMutation.mutate(form);
        }} className="space-y-5">
          <Input
            label="Task Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to be done?"
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-transparent text-sm min-h-[80px] focus:border-blue-500 outline-none resize-none"
              placeholder="Add details..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Project</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-[#09090b] text-sm focus:border-blue-500 outline-none"
              required
            >
              <option value="">Select project</option>
              {projects.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-[#09090b] text-sm focus:border-blue-500 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-[#09090b] text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}