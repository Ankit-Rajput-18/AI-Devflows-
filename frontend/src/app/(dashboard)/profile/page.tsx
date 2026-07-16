'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi, authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/shared';
import { User, Lock, Mail, Calendar, Shield, Edit3, Save, X } from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user: authUser, setUser } = useAuthStore();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: authUser?.name || '', avatar: authUser?.avatar || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.getMe().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateMe(data),
    onSuccess: (res) => {
      setUser({ ...authUser!, ...res.data.data });
      setEditingProfile(false);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => authApi.changePassword(data),
    onSuccess: () => {
      setEditingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to change password');
    },
  });

  if (isLoading) return <PageLoading />;

  const profile = data?.data || authUser;

  const passwordChecks = [
    { label: 'At least 8 characters', valid: passwordForm.newPassword.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(passwordForm.newPassword) },
    { label: 'Number', valid: /[0-9]/.test(passwordForm.newPassword) },
    { label: 'Special character', valid: /[!@#$%^&*]/.test(passwordForm.newPassword) },
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'destructive',
    MANAGER: 'warning',
    DEVELOPER: 'default',
    VIEWER: 'secondary',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-7 h-7" /> My Profile
        </h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile ? getInitials(profile.name) : 'U'}
              </div>
              <div>
                {editingProfile ? (
                  <div className="space-y-2">
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your name"
                      className="text-lg font-bold"
                    />
                    <Input
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="Avatar URL (optional)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateMutation.mutate(profileForm)} loading={updateMutation.isPending}>
                        <Save className="w-3.5 h-3.5 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{profile?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={roleColors[profile?.role || 'DEVELOPER'] as any}>
                        {profile?.role}
                      </Badge>
                      {profile?.isVerified && (
                        <Badge variant="success">Verified</Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            {!editingProfile && (
              <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                <Edit3 className="w-4 h-4 mr-1" /> Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">{profile?._count?.ownedProjects || 0}</p>
              <p className="text-xs text-muted-foreground">Projects Owned</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">{profile?._count?.assignedTasks || 0}</p>
              <p className="text-xs text-muted-foreground">Tasks Assigned</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">{profile?._count?.createdTasks || 0}</p>
              <p className="text-xs text-muted-foreground">Tasks Created</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span>{profile?.createdAt ? formatDate(profile.createdAt) : '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last login:</span>
              <span>{profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Change Password
            </CardTitle>
            {!editingPassword && (
              <Button variant="outline" size="sm" onClick={() => setEditingPassword(true)}>
                Change
              </Button>
            )}
          </div>
        </CardHeader>
        {editingPassword && (
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <div className="space-y-1">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                {passwordForm.newPassword && (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-1">
                        <div className={'w-2 h-2 rounded-full ' + (check.valid ? 'bg-green-500' : 'bg-muted-foreground')} />
                        <span className={'text-xs ' + (check.valid ? 'text-green-500' : 'text-muted-foreground')}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''}
                required
              />
              <div className="flex gap-3">
                <Button type="submit" loading={passwordMutation.isPending}>Update Password</Button>
                <Button type="button" variant="outline" onClick={() => setEditingPassword(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}