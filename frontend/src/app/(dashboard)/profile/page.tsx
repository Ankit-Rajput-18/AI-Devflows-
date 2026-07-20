'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, authApi } from '@/services/api';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/shared';
import { Avatar } from '@/components/shared/Avatar';
import {
  User, Lock, Mail, Calendar, Shield, Edit3, Save, X,
  Camera, Upload, Trash2, CheckCircle, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user: authUser, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.getMe().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateMe(data),
    onSuccess: (res) => {
      setUser({ ...authUser!, ...res.data.data });
      setEditingProfile(false);
      refetch();
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/files/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser({ ...authUser!, avatar: res.data.data.url });
      refetch();
      queryClient.invalidateQueries();
      toast.success('Profile picture updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Remove profile picture?')) return;
    try {
      await usersApi.updateMe({ avatar: '' });
      setUser({ ...authUser!, avatar: '' });
      refetch();
      toast.success('Profile picture removed');
    } catch {
      toast.error('Failed to remove picture');
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />

          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group">
              <div className="relative">
                <Avatar name={profile?.name} src={profile?.avatar} size="2xl" />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-10 h-10 rounded-full bg-white text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-lg transition-all"
                  title="Upload photo"
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>

                {profile?.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center shadow-lg transition-all"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {editingProfile ? (
                <div className="space-y-3 max-w-md">
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white placeholder-white/60 text-2xl font-bold focus:bg-white/30 outline-none"
                    placeholder="Your name"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateMutation.mutate(profileForm)} loading={updateMutation.isPending} className="bg-white text-blue-600 hover:bg-blue-50">
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)} className="border-white/30 text-white hover:bg-white/10">
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold">{profile?.name}</h2>
                  <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span className="text-white/90">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <Shield className="w-3 h-3 mr-1" />
                      {profile?.role}
                    </Badge>
                    {profile?.isVerified && (
                      <Badge className="bg-green-500/30 text-white border-green-400/50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>

            {!editingProfile && (
              <Button
                variant="outline"
                onClick={() => setEditingProfile(true)}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Projects', value: profile?._count?.ownedProjects || 0, color: 'from-blue-500 to-cyan-500' },
          { label: 'Tasks Assigned', value: profile?._count?.assignedTasks || 0, color: 'from-green-500 to-emerald-500' },
          { label: 'Tasks Created', value: profile?._count?.createdTasks || 0, color: 'from-purple-500 to-pink-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all overflow-hidden group">
              <div className={'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ' + stat.color} />
              <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
              <p className="text-4xl font-bold mt-2 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-semibold">{profile?.createdAt ? formatDate(profile.createdAt) : '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="font-semibold">{profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : 'Never'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Password & Security
            </h3>
            {!editingPassword && (
              <Button variant="outline" size="sm" onClick={() => setEditingPassword(true)}>
                Change Password
              </Button>
            )}
          </div>

          {editingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <div>
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                {passwordForm.newPassword && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2">
                        <div className={'w-4 h-4 rounded-full flex items-center justify-center ' + (check.valid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700')}>
                          {check.valid && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={'text-xs ' + (check.valid ? 'text-green-600' : 'text-muted-foreground')}>{check.label}</span>
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
          )}
        </div>
      </motion.div>
    </div>
  );
}
