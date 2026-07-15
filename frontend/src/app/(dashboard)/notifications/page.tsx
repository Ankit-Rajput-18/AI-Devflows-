'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { toast } from 'sonner';

const TYPE_ICONS: Record<string, any> = {
  TASK_ASSIGNED: CheckCircle,
  TASK_UPDATED: Info,
  PR_REVIEW: AlertTriangle,
  MENTION: Bell,
  COMMENT: Bell,
  SPRINT_UPDATE: Info,
  AI_REVIEW_COMPLETE: CheckCircle,
  SYSTEM: Info,
};

const TYPE_COLORS: Record<string, string> = {
  TASK_ASSIGNED: 'text-green-500 bg-green-500/10',
  TASK_UPDATED: 'text-blue-500 bg-blue-500/10',
  PR_REVIEW: 'text-purple-500 bg-purple-500/10',
  MENTION: 'text-orange-500 bg-orange-500/10',
  COMMENT: 'text-cyan-500 bg-cyan-500/10',
  AI_REVIEW_COMPLETE: 'text-green-500 bg-green-500/10',
  SYSTEM: 'text-gray-500 bg-gray-500/10',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
  });

  const allNotifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  const notifications = filter === 'unread'
    ? allNotifications.filter((n: any) => !n.isRead)
    : allNotifications;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? unreadCount + ' unread notifications' : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition ' + (filter === 'all' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent')}
        >
          All ({allNotifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition ' + (filter === 'unread' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description="You will see notifications here when something happens"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const colorClass = TYPE_COLORS[notif.type] || 'text-gray-500 bg-gray-500/10';

            return (
              <div
                key={notif.id}
                className={'p-4 rounded-xl border flex items-start gap-3 transition group ' + (!notif.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/30')}
              >
                <div className={'p-2 rounded-lg flex-shrink-0 ' + colorClass}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={'text-sm font-medium ' + (!notif.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  {!notif.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-accent"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}