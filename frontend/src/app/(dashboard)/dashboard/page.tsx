'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/slices/authStore';
import { projectsApi, tasksApi } from '@/services/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, CheckSquare, Brain, Zap, ArrowRight, Sparkles, TrendingUp, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.getAll().then(r => r.data) });
  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: () => tasksApi.getAll().then(r => r.data) });

  const stats = [
    { label: 'Projects', val: projects?.data?.length || 0, icon: FolderKanban, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Active Tasks', val: tasks?.data?.length || 0, icon: CheckSquare, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'AI Score', val: '84%', icon: Brain, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Velocity', val: '12.4', icon: Zap, gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white shadow-2xl shadow-purple-500/30"
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 backdrop-blur-md">
            <Sparkles className="w-3 h-3 mr-2 fill-white" /> Pro Workspace
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            You have {tasks?.data?.length || 0} tasks in progress. AI has analyzed {projects?.data?.length || 0} recent projects.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/projects">
              <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-xl">
                View Projects <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/ai-review">
              <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
                AI Review
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className={cn('absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br', stat.gradient)} />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <h3 className="text-4xl font-bold mt-2 tracking-tight">{stat.val}</h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% this week</span>
                  </div>
                </div>
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg', stat.gradient)}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CheckSquare className="text-blue-500 w-5 h-5" />
              </div>
              Recent Tasks
            </h2>
            <Link href="/tasks">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold">View all</button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {tasks?.data?.slice(0, 6).map((task: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={cn(
                    'w-3 h-3 rounded-full flex-shrink-0',
                    task.status === 'DONE' ? 'bg-emerald-500' :
                    task.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                    task.status === 'IN_REVIEW' ? 'bg-purple-500' : 'bg-slate-400'
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold group-hover:text-blue-600 transition-colors truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.project?.name || 'No project'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-lg flex-shrink-0">{task.status}</Badge>
              </motion.div>
            )) || (
              <p className="text-center py-8 text-slate-500">No tasks yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/25">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">AI Insights</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              Your team is 23% more productive this week. AI suggests focusing on 3 high-priority tasks.
            </p>
            <button className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">
              View Analysis
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Team Activity
              </h3>
            </div>
            <div className="space-y-3">
              {['Ankit added a task', 'Priya commented', 'John updated status'].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {activity[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity}</p>
                    <p className="text-xs text-slate-500">2 min ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}