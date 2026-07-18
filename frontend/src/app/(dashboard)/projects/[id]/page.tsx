'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { projectsApi, tasksApi, usersApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/shared';
import {
  ArrowLeft,
  Plus,
  Users,
  CheckSquare,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Code2,
  Eye,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: '#64748b' },
  { id: 'TODO', title: 'To Do', color: '#3b82f6' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
  { id: 'IN_REVIEW', title: 'In Review', color: '#8b5cf6' },
  { id: 'DONE', title: 'Done', color: '#22c55e' },
];

const ROLE_ICONS: Record<string, any> = {
  OWNER: Crown,
  ADMIN: Shield,
  MANAGER: Shield,
  DEVELOPER: Code2,
  VIEWER: Eye,
};

const PRIORITY_VARIANT: Record<string, any> = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'warning',
  URGENT: 'destructive',
};

function DroppableColumn({
  id,
  title,
  color,
  children,
  count,
}: {
  id: string;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="ml-auto text-xs rounded-full bg-muted px-2 py-0.5">
          {count}
        </span>
      </div>

      <div
        className={
          'min-h-[420px] rounded-3xl border-2 border-dashed p-3 space-y-3 transition-all ' +
          (isOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-muted/20')
        }
      >
        {children}
      </div>
    </div>
  );
}

function DraggableTask({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Link href={'/tasks/' + task.id}>
        <div className="group rounded-2xl border bg-card p-4 shadow-sm hover:shadow-xl transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">
              {task.title}
            </p>

            <button
              {...listeners}
              {...attributes}
              onClick={(e) => e.preventDefault()}
              className="p-1 rounded-lg hover:bg-muted cursor-grab active:cursor-grabbing"
              title="Drag task"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {task.description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Badge variant={PRIORITY_VARIANT[task.priority] || 'outline'}>
              {task.priority}
            </Badge>

            {task.assignee ? (
              <div
                title={task.assignee.name}
                className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center"
              >
                {getInitials(task.assignee.name)}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'board' | 'members'>('board');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const [memberForm, setMemberForm] = useState({
    userId: '',
    role: 'DEVELOPER',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'TASK',
    assigneeId: '',
    dueDate: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId).then((r) => r.data),
  });

  const { data: boardData, refetch: refetchBoard } = useQuery({
    queryKey: ['board', projectId],
    queryFn: () => tasksApi.getBoard(projectId).then((r) => r.data),
  });

  const { data: usersData } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => usersApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      tasksApi.updateStatus(taskId, status),
    onSuccess: () => {
      refetchBoard();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task moved successfully');
    },
    onError: () => toast.error('Failed to move task'),
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: any) => projectsApi.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setShowAddMember(false);
      setMemberForm({ userId: '', role: 'DEVELOPER' });
      toast.success('Member added');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to add member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => {
      refetchBoard();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreateTask(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        type: 'TASK',
        assigneeId: '',
        dueDate: '',
      });
      toast.success('Task created');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create task');
    },
  });

  if (isLoading) return <PageLoading />;

  const project = projectData?.data;
  if (!project) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Project not found</p>
        <Link href="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const board = boardData?.data || {};
  const members = project.members || [];
  const allUsers = usersData?.data || [];

  const memberIds = members.map((m: any) => m.user?.id || m.userId);
  const availableUsers = allUsers.filter((u: any) => !memberIds.includes(u.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = active.data.current?.task;
    const newStatus = String(over.id);

    if (!task || task.status === newStatus) return;

    updateTaskStatusMutation.mutate({
      taskId: String(active.id),
      status: newStatus,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      title: taskForm.title,
      projectId,
      priority: taskForm.priority,
      type: taskForm.type,
    };

    if (taskForm.description) payload.description = taskForm.description;
    if (taskForm.assigneeId) payload.assigneeId = taskForm.assigneeId;
    if (taskForm.dueDate) payload.dueDate = taskForm.dueDate;

    createTaskMutation.mutate(payload);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/projects" className="p-2 rounded-xl hover:bg-accent transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
          style={{ backgroundColor: project.color || '#3b82f6' }}
        >
          {project.name?.[0] || 'P'}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">{project.name}</h1>
          <p className="text-muted-foreground truncate">
            {project.description || 'No description'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddMember(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>

          <Button onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {members.length} members
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckSquare className="w-4 h-4" />
          {project._count?.tasks || 0} tasks
        </div>

        <div className="flex -space-x-2">
          {members.slice(0, 6).map((m: any) => (
            <div
              key={m.id}
              title={m.user?.name + ' - ' + m.role}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center border-2 border-background"
            >
              {getInitials(m.user?.name || 'U')}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('board')}
          className={
            'px-4 py-3 text-sm font-semibold border-b-2 transition ' +
            (activeTab === 'board'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground')
          }
        >
          Task Board
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={
            'px-4 py-3 text-sm font-semibold border-b-2 transition ' +
            (activeTab === 'members'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground')
          }
        >
          Members ({members.length})
        </button>
      </div>

      {activeTab === 'board' && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {COLUMNS.map((col) => {
                const tasks = board[col.id] || [];

                return (
                  <DroppableColumn
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    color={col.color}
                    count={tasks.length}
                  >
                    {tasks.map((task: any) => (
                      <DraggableTask key={task.id} task={task} />
                    ))}

                    {tasks.length === 0 && (
                      <div className="text-center text-xs text-muted-foreground p-6">
                        Drop tasks here
                      </div>
                    )}
                  </DroppableColumn>
                );
              })}
            </div>
          </div>
        </DndContext>
      )}

      {activeTab === 'members' && (
        <div className="grid gap-3">
          {members.map((member: any) => {
            const RoleIcon = ROLE_ICONS[member.role] || Code2;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-2xl border bg-card hover:shadow-md transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center">
                    {getInitials(member.user?.name || 'U')}
                  </div>

                  <div>
                    <p className="font-semibold">{member.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1">
                    <RoleIcon className="w-3.5 h-3.5" />
                    {member.role}
                  </Badge>

                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => {
                        if (confirm('Remove member?')) {
                          removeMemberMutation.mutate(member.user?.id || member.userId);
                        }
                      }}
                      className="p-2 rounded-xl text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition"
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!memberForm.userId) return toast.error('Select user');
            addMemberMutation.mutate(memberForm);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold">User</label>
            <select
              value={memberForm.userId}
              onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border bg-background"
            >
              <option value="">Select user</option>
              {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Role</label>
            <select
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border bg-background"
            >
              <option value="VIEWER">Viewer</option>
              <option value="DEVELOPER">Developer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={addMemberMutation.isPending}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border bg-background min-h-[90px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Assignee</label>
            <select
              value={taskForm.assigneeId}
              onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border bg-background"
            >
              <option value="">Unassigned</option>
              {members.map((m: any) => (
                <option key={m.user?.id} value={m.user?.id}>
                  {m.user?.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              className="px-4 py-3 rounded-2xl border bg-background"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <select
              value={taskForm.type}
              onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
              className="px-4 py-3 rounded-2xl border bg-background"
            >
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
              <option value="FEATURE">Feature</option>
              <option value="EPIC">Epic</option>
            </select>
          </div>

          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border bg-background"
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}