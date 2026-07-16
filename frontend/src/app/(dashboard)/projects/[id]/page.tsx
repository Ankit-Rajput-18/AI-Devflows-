'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { projectsApi, tasksApi, usersApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, PageLoading } from '@/components/shared';
import {
  Users, CheckSquare, ArrowLeft, Plus, Trash2,
  UserPlus, Crown, Shield, Code2, Eye,
} from 'lucide-react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/slices/authStore';

const ROLE_ICONS: Record<string, any> = {
  OWNER: Crown,
  ADMIN: Shield,
  MANAGER: Shield,
  DEVELOPER: Code2,
  VIEWER: Eye,
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'text-yellow-500',
  ADMIN: 'text-red-500',
  MANAGER: 'text-purple-500',
  DEVELOPER: 'text-blue-500',
  VIEWER: 'text-gray-500',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'DEVELOPER' });
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    type: 'TASK', assigneeId: '', dueDate: '',
  });
  const [activeTab, setActiveTab] = useState<'board' | 'members'>('board');

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId).then((r) => r.data),
  });

  const { data: boardData } = useQuery({
    queryKey: ['board', projectId],
    queryFn: () => tasksApi.getBoard(projectId).then((r) => r.data),
  });

  const { data: allUsersData } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => usersApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: any) => projectsApi.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setShowAddMember(false);
      setMemberForm({ userId: '', role: 'DEVELOPER' });
      toast.success('Member added!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to add member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => projectsApi.removeMember(projectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Member removed!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to remove member');
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      setShowCreateTask(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', type: 'TASK', assigneeId: '', dueDate: '' });
      toast.success('Task created!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create task');
    },
  });

  if (isLoading) return <PageLoading />;

  const project = projectData?.data;
  if (!project) return <div className="p-8 text-center">Project not found</div>;

  const board = boardData?.data || {};
  const members = project.members || [];
  const allUsers = allUsersData?.data || [];

  const memberUserIds = members.map((m: any) => m.userId || m.user?.id);
  const availableUsers = allUsers.filter((u: any) => !memberUserIds.includes(u.id));

  const columns = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  const columnLabels: Record<string, string> = {
    BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review', DONE: 'Done',
  };
  const columnColors: Record<string, string> = {
    BACKLOG: '#6b7280', TODO: '#3b82f6', IN_PROGRESS: '#f59e0b',
    IN_REVIEW: '#8b5cf6', DONE: '#22c55e',
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: taskForm.title,
      projectId: projectId,
      priority: taskForm.priority,
      type: taskForm.type,
    };
    if (taskForm.description) payload.description = taskForm.description;
    if (taskForm.assigneeId) payload.assigneeId = taskForm.assigneeId;
    if (taskForm.dueDate) payload.dueDate = taskForm.dueDate;
    createTaskMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/projects" className="p-2 rounded-lg hover:bg-accent transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            {project.name?.[0] || 'P'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddMember(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {members.length} members
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CheckSquare className="w-4 h-4" />
          {project._count?.tasks || 0} tasks
        </div>

        <div className="flex -space-x-2 ml-4">
          {members.slice(0, 6).map((member: any) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-background"
              title={member.user?.name + ' (' + member.role + ')'}
            >
              {getInitials(member.user?.name || 'U')}
            </div>
          ))}
          {members.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-background">
              +{members.length - 6}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('board')}
          className={'px-4 py-2 text-sm font-medium border-b-2 transition ' + (activeTab === 'board' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          <CheckSquare className="w-4 h-4 inline mr-1" /> Task Board
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={'px-4 py-2 text-sm font-medium border-b-2 transition ' + (activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          <Users className="w-4 h-4 inline mr-1" /> Members ({members.length})
        </button>
      </div>

      {activeTab === 'board' && (
        <div className="grid grid-cols-5 gap-3 overflow-x-auto">
          {columns.map((col) => {
            const colTasks = board[col] || [];
            return (
              <div key={col} className="min-w-[220px]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: columnColors[col] }} />
                  <span className="text-sm font-semibold">{columnLabels[col]}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {colTasks.map((task: any) => (
                    <div key={task.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition cursor-pointer group">
                      <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant={task.priority === 'URGENT' ? 'destructive' : task.priority === 'HIGH' ? 'warning' : 'outline'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        {task.assignee && (
                          <div
                            className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                            title={task.assignee.name}
                          >
                            {getInitials(task.assignee.name)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="p-4 text-center rounded-lg border border-dashed">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-3">
          {members.map((member: any) => {
            const RoleIcon = ROLE_ICONS[member.role] || Code2;
            const roleColor = ROLE_COLORS[member.role] || 'text-gray-500';

            return (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {getInitials(member.user?.name || 'U')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={'flex items-center gap-1 text-sm ' + roleColor}>
                    <RoleIcon className="w-4 h-4" />
                    <span>{member.role}</span>
                  </div>
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => {
                        if (confirm('Remove ' + member.user?.name + ' from project?')) {
                          removeMemberMutation.mutate(member.user?.id || member.userId);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <form onSubmit={(e) => { e.preventDefault(); if (!memberForm.userId) { toast.error('Select a user'); return; } addMemberMutation.mutate(memberForm); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Select User *</label>
            <select
              value={memberForm.userId}
              onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              required
            >
              <option value="">Choose a user to add</option>
              {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            {availableUsers.length === 0 && (
              <p className="text-xs text-muted-foreground">All users are already members</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <select
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button type="submit" loading={addMemberMutation.isPending}>Add Member</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title *" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" required />
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm min-h-[70px] focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Task description..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Assign To</label>
            <select value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
              <option value="">Unassigned</option>
              {members.map((m: any) => (
                <option key={m.user?.id || m.id} value={m.user?.id || m.userId}>{m.user?.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              <select value={taskForm.type} onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setShowCreateTask(false)}>Cancel</Button>
            <Button type="submit" loading={createTaskMutation.isPending}>Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}