'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { tasksApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/shared';
import { ArrowLeft, Clock, MessageSquare, Trash2, Edit3, Save, X, AlertTriangle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getInitials, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/slices/authStore';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const PRIORITY_COLORS: Record<string, any> = {
  LOW: 'outline', MEDIUM: 'secondary', HIGH: 'warning', URGENT: 'destructive',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: '', priority: '' });
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await tasksApi.getById(taskId);
      const t = res.data.data;
      setEditForm({ title: t.title, description: t.description || '', status: t.status, priority: t.priority });
      return res.data;
    },
  });

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => tasksApi.getComments(taskId).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => tasksApi.update(taskId, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['task', taskId] }); setEditing(false); toast.success('Task updated!'); },
    onError: () => toast.error('Failed to update task'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => tasksApi.updateStatus(taskId, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['task', taskId] }); toast.success('Status updated!'); },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(taskId),
    onSuccess: () => { toast.success('Task deleted!'); router.push('/tasks'); },
    onError: () => toast.error('Failed to delete task'),
  });

  const commentMutation = useMutation({
    mutationFn: () => tasksApi.addComment(taskId, comment),
    onSuccess: () => { refetchComments(); setComment(''); toast.success('Comment added!'); },
    onError: () => toast.error('Failed to add comment'),
  });

  if (isLoading) return <PageLoading />;

  const task = data?.data;
  if (!task) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertTriangle className="w-12 h-12 text-muted-foreground" />
      <p className="text-lg font-medium">Task not found</p>
      <Link href="/tasks"><Button>Back to Tasks</Button></Link>
    </div>
  );

  const comments = commentsData?.data || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/tasks" className="p-2 rounded-lg hover:bg-accent transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">Projects</Link>
          <span>/</span>
          <Link href={'/projects/' + task.projectId} className="hover:text-foreground">{task.project?.name}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Task Detail</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            {editing ? (
              <div className="space-y-3">
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full text-xl font-bold bg-transparent border-b-2 border-primary outline-none pb-1" />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm min-h-[100px] focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Add description..." />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateMutation.mutate(editForm)} loading={updateMutation.isPending}><Save className="w-3.5 h-3.5 mr-1" /> Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5 mr-1" /> Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold leading-tight">{task.title}</h1>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-accent" title="Edit"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Delete this task?')) deleteMutation.mutate(); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {task.description ? (
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <button onClick={() => setEditing(true)} className="text-sm text-muted-foreground mt-3 hover:text-foreground italic">+ Add description</button>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Created {timeAgo(task.createdAt)}</div>
              {task.dueDate && (
                <div className={'flex items-center gap-1 ' + (new Date(task.dueDate) < new Date() ? 'text-destructive font-medium' : '')}>
                  <Calendar className="w-3.5 h-3.5" /> Due {formatDate(task.dueDate)}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Comments ({comments.length})</h2>
            <div className="space-y-4">
              {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>}
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{getInitials(c.user?.name || 'U')}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.user?.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-1 bg-muted/50 rounded-xl p-3 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2 border-t">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user ? getInitials(user.name) : 'U'}</div>
              <div className="flex-1 space-y-2">
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="w-full px-3 py-2 rounded-xl border bg-background text-sm min-h-[80px] focus:ring-2 focus:ring-primary outline-none resize-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ctrl+Enter to submit</span>
                  <Button size="sm" onClick={() => { if (comment.trim()) commentMutation.mutate(); }} disabled={!comment.trim()} loading={commentMutation.isPending}>Add Comment</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                <select value={task.status} onChange={(e) => updateStatusMutation.mutate(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
                  {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Priority</label>
                <div><Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge></div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
                <div><Badge variant="outline">{task.type}</Badge></div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Assignee</label>
                <div className="flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{getInitials(task.assignee.name)}</div>
                      <span>{task.assignee.name}</span>
                    </>
                  ) : <span className="text-muted-foreground">Unassigned</span>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Created by</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{getInitials(task.creator?.name || 'U')}</div>
                  <span>{task.creator?.name}</span>
                </div>
              </div>
              {task.dueDate && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Due Date</label>
                  <p className={new Date(task.dueDate) < new Date() ? 'text-destructive font-medium' : ''}>{formatDate(task.dueDate)}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Project</label>
                <Link href={'/projects/' + task.projectId} className="text-primary hover:underline block">{task.project?.name}</Link>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Created</label>
                <p>{formatDate(task.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Last Updated</label>
                <p>{timeAgo(task.updatedAt)}</p>
              </div>
            </div>
          </div>

          {task._count && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Comments</span><span className="font-medium">{task._count.comments || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Tasks</span><span className="font-medium">{task._count.subTasks || 0}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}