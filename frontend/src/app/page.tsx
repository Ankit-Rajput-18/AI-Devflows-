'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Brain, Code2, GitBranch, MessageSquare, Shield,
  Zap, CheckCircle, ArrowRight, Star, Users,
  BarChart3, Calendar, FolderKanban, Sparkles,
  ChevronRight, Github, Twitter, Globe,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Code Review',
    description: 'Get instant AI-powered code reviews with quality scores, bug detection, and improvement suggestions.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: FolderKanban,
    title: 'Project Management',
    description: 'Create projects, manage sprints, track progress with beautiful Kanban boards.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Team Chat',
    description: 'Real-time messaging with channels, direct messages, and file sharing.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Role Based Access',
    description: 'Admin, Manager, Developer, Viewer roles with granular permissions.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'AI Bug Detection',
    description: 'Automatically detect bugs, security issues, and performance problems in your code.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track sprint velocity, task completion rates, and team productivity.',
    color: 'from-pink-500 to-rose-500',
  },
];

const techStack = [
  'Next.js', 'NestJS', 'TypeScript', 'PostgreSQL',
  'Redis', 'Socket.IO', 'Prisma', 'Tailwind CSS',
  'Google Gemini AI', 'Docker', 'JWT Auth', 'BullMQ',
];

const stats = [
  { label: 'API Endpoints', value: '40+' },
  { label: 'Components', value: '25+' },
  { label: 'Database Models', value: '15+' },
  { label: 'AI Features', value: '4' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                DevFlow AI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
              <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition">Tech Stack</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">About</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-500/25"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 text-sm mb-8">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>AI-Powered Developer Workspace</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            Build Faster with{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI-Powered
            </span>{' '}
            Developer Tools
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            DevFlow AI combines project management, AI code review, real-time chat, and sprint tracking
            into one powerful workspace. Stop switching between tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              Start Building <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold border rounded-xl hover:bg-accent transition flex items-center justify-center gap-2"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground ml-2">DevFlow AI - Dashboard</span>
            </div>
            <div className="p-6 bg-gradient-to-br from-background via-muted/30 to-background">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {['12 Projects', '34 Tasks', '89 AI Reviews', '8 Members'].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-card">
                    <p className="text-2xl font-bold">{item.split(' ')[0]}</p>
                    <p className="text-xs text-muted-foreground">{item.split(' ').slice(1).join(' ')}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].map((col, i) => (
                  <div key={col} className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={'w-2 h-2 rounded-full ' + ['bg-gray-400', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-green-500'][i]} />
                      <span className="text-xs font-medium">{col}</span>
                    </div>
                    {[1, 2].map((j) => (
                      <div key={j} className="p-3 rounded-lg border bg-card">
                        <div className="h-2 w-3/4 rounded bg-muted mb-2" />
                        <div className="h-2 w-1/2 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to build faster</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              One platform that combines all developer tools with AI superpowers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={'w-12 h-12 rounded-xl bg-gradient-to-r ' + feature.color + ' flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Features List */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Full Feature List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Project Management', 'Task Board (Kanban)', 'AI Code Review',
              'AI Bug Detection', 'AI PR Summary', 'AI Documentation Generator',
              'Team Chat (Real-time)', 'File Sharing', 'Calendar & Events',
              'Sprint Dashboard', 'Notification System', 'Role Based Access',
              'Activity Timeline', 'Analytics Dashboard', 'API Key Management',
              'Dark/Light Theme', 'Responsive Design', 'Swagger API Docs',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Built with Modern Tech Stack</h2>
          <p className="text-muted-foreground mb-12">Industry-standard technologies for production-ready applications</p>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full border bg-card text-sm font-medium hover:bg-primary hover:text-primary-foreground transition cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About / How it works */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="space-y-8">
            {[
              { step: '1', title: 'Create Your Account', desc: 'Sign up with email or Google OAuth in seconds', icon: Users },
              { step: '2', title: 'Setup Your Project', desc: 'Create projects, invite team members, setup sprints', icon: FolderKanban },
              { step: '3', title: 'Manage Tasks', desc: 'Create tasks, assign to members, track on Kanban board', icon: CheckCircle },
              { step: '4', title: 'AI Reviews Your Code', desc: 'Paste code, get instant AI review with score and suggestions', icon: Brain },
              { step: '5', title: 'Collaborate in Real-time', desc: 'Chat with team, share files, schedule meetings', icon: MessageSquare },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6 p-6 rounded-2xl border hover:shadow-lg transition group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <item.icon className="w-5 h-5 text-primary" />
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to build faster?</h2>
            <p className="mt-3 text-white/80 text-lg">
              Join DevFlow AI and supercharge your development workflow
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition flex items-center gap-2"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">DevFlow AI</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
              <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition">Tech Stack</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">About</a>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">Login</Link>
            </div>

            <p className="text-sm text-muted-foreground">
              Built with Next.js + NestJS + AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}