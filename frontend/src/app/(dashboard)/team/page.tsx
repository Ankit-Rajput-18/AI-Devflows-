'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Crown, Shield, Code2, Eye, Mail } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

const ROLE_CONFIG: Record<string, { icon: any; color: string; badge: any }> = {
  ADMIN: { icon: Crown, color: 'text-yellow-500', badge: 'destructive' },
  MANAGER: { icon: Shield, color: 'text-purple-500', badge: 'warning' },
  DEVELOPER: { icon: Code2, color: 'text-blue-500', badge: 'default' },
  VIEWER: { icon: Eye, color: 'text-gray-500', badge: 'secondary' },
};

const AVATAR_GRADIENTS = [
  'from-blue-500 to-purple-600',
  'from-green-500 to-cyan-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-yellow-500 to-orange-600',
  'from-teal-500 to-blue-600',
];

export default function TeamPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['team-members', search, roleFilter],
    queryFn: () => usersApi.getAll({ search: search || undefined, role: roleFilter || undefined, limit: 100 }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const users = data?.data || [];

  const roleCount = {
    ADMIN: users.filter((u: any) => u.role === 'ADMIN').length,
    MANAGER: users.filter((u: any) => u.role === 'MANAGER').length,
    DEVELOPER: users.filter((u: any) => u.role === 'DEVELOPER').length,
    VIEWER: users.filter((u: any) => u.role === 'VIEWER').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-7 h-7" /> Team Members
        </h1>
        <p className="text-muted-foreground">{users.length} members in workspace</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(roleCount).map(([role, count]) => {
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;
          return (
            <div
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
              className={'p-4 rounded-xl border cursor-pointer transition hover:shadow-md ' + (roleFilter === role ? 'ring-2 ring-primary' : '')}
            >
              <div className="flex items-center gap-2">
                <Icon className={'w-5 h-5 ' + config.color} />
                <span className="text-sm font-medium">{role}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{count as number}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        {roleFilter && (
          <button onClick={() => setRoleFilter('')} className="px-3 py-2 rounded-lg border text-sm hover:bg-accent">
            Clear filter
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="No members match your search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user: any, index: number) => {
            const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.DEVELOPER;
            const RoleIcon = config.icon;
            const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

            return (
              <div key={user.id} className="p-5 rounded-xl border bg-card hover:shadow-md transition group">
                <div className="flex items-start gap-4">
                  <div className={'w-14 h-14 rounded-2xl bg-gradient-to-br ' + gradient + ' flex items-center justify-center text-white text-lg font-bold flex-shrink-0'}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold truncate">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                      <Badge variant={config.badge as any} className="text-xs flex-shrink-0">
                        {user.role}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mt-2">
                      <div className={'w-2 h-2 rounded-full ' + (user.isActive ? 'bg-green-500' : 'bg-gray-400')} />
                      <span className="text-xs text-muted-foreground">{user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">{user._count?.ownedProjects || 0}</span> projects
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{user._count?.assignedTasks || 0}</span> tasks
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}