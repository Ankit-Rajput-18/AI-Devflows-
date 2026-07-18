'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Brain, Code2, MessageSquare, Shield, Zap, CheckCircle,
  ArrowRight, Star, Users, BarChart3, Calendar, FolderKanban,
  Sparkles, Github, Twitter, Linkedin, Menu, X, ChevronDown,
  Play, Rocket, Target, Layers, Terminal, GitBranch,
  Bell, TrendingUp, Heart, Sun, Moon,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Brain, title: 'AI Code Review', desc: 'Instant AI-powered code reviews with quality scores', color: 'from-purple-500 to-indigo-500' },
    { icon: Zap, title: 'AI Bug Detection', desc: 'Automatically detect bugs and security issues', color: 'from-yellow-500 to-orange-500' },
    { icon: FolderKanban, title: 'Project Management', desc: 'Kanban boards, sprints, task tracking made easy', color: 'from-blue-500 to-cyan-500' },
    { icon: MessageSquare, title: 'Team Chat', desc: 'Real-time messaging with channels and DMs', color: 'from-green-500 to-emerald-500' },
    { icon: Shield, title: 'Role Based Access', desc: 'Admin, Manager, Developer roles with permissions', color: 'from-red-500 to-pink-500' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track velocity, completion rates, productivity', color: 'from-pink-500 to-rose-500' },
  ];

  const testimonials = [
    { name: 'Ankit Sharma', role: 'Senior Developer', image: 'AS', content: 'DevFlow AI transformed how our team collaborates.', color: 'from-blue-500 to-cyan-500' },
    { name: 'Priya Patel', role: 'Engineering Manager', image: 'PP', content: 'Best project management tool we have used.', color: 'from-purple-500 to-pink-500' },
    { name: 'Rahul Kumar', role: 'Full Stack Developer', image: 'RK', content: 'The AI features are absolutely game-changing.', color: 'from-green-500 to-emerald-500' },
    { name: 'Neha Gupta', role: 'CTO at StartupX', image: 'NG', content: 'Consolidated 5 tools into one. Amazing UX.', color: 'from-orange-500 to-red-500' },
  ];

  const pricingPlans = [
    { name: 'Free', price: '0', desc: 'Perfect for individuals', features: ['3 Projects', '5 Team members', 'Basic AI features', 'Community support'], popular: false },
    { name: 'Pro', price: '19', desc: 'For growing teams', features: ['Unlimited projects', 'Unlimited members', 'Advanced AI', 'Priority support', '100GB storage'], popular: true },
    { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Everything in Pro', 'SSO and SAML', 'Dedicated manager', 'Custom AI models'], popular: false },
  ];

  const faqs = [
    { q: 'Is DevFlow AI free to use?', a: 'Yes! Free tier includes 3 projects and 5 team members. No credit card required.' },
    { q: 'How does AI code review work?', a: 'Our AI uses Gemini to analyze your code and provide quality scores, bug detection, and suggestions.' },
    { q: 'Can I invite my team?', a: 'Absolutely! Add unlimited members on Pro with role-based access control.' },
    { q: 'Is my data secure?', a: 'We use industry-standard encryption, JWT authentication, and secure infrastructure.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className={'fixed top-0 w-full z-50 transition-all duration-300 ' + (scrolled ? 'border-b bg-background/80 backdrop-blur-xl shadow-sm' : 'bg-transparent')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                DevFlow AI
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition">Features</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition">Reviews</a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition">FAQ</a>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-xl hover:bg-accent transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
                </button>
              )}
              <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition">Sign In</Link>
              <Link href="/register" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-500/25">
                Get Started Free
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-xl hover:bg-accent"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t space-y-3">
              <a href="#features" className="block px-3 py-2 hover:bg-accent rounded">Features</a>
              <a href="#pricing" className="block px-3 py-2 hover:bg-accent rounded">Pricing</a>
              <a href="#testimonials" className="block px-3 py-2 hover:bg-accent rounded">Reviews</a>
              <div className="flex flex-col gap-2 pt-3 border-t">
                <Link href="/login" className="px-4 py-2 border rounded-lg text-center">Sign In</Link>
                <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-center">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card/50 backdrop-blur text-sm mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">AI-Powered Developer Workspace</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl mx-auto leading-tight">
            The Future of{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Developer
            </span>{' '}
            Workspace
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered code reviews, real-time collaboration, and project management. Ship better software, faster.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/register" className="group w-full sm:w-auto px-8 py-4 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 rounded-xl hover:bg-accent transition flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-yellow-500 to-orange-500'].map((color, i) => (
                <div key={i} className={'w-10 h-10 rounded-full bg-gradient-to-r ' + color + ' border-2 border-background flex items-center justify-center text-white text-xs font-bold shadow-lg'}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
              <span className="text-sm text-muted-foreground ml-2">10,000+ developers worldwide</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Everything you need to build faster</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              One platform combining all developer tools with AI superpowers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative p-8 rounded-2xl border bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={'absolute inset-0 bg-gradient-to-br ' + feature.color + ' opacity-0 group-hover:opacity-5 transition-opacity'} />
                <div className={'w-14 h-14 rounded-2xl bg-gradient-to-r ' + feature.color + ' flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform'}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Loved by developers worldwide</h2>
            <p className="text-muted-foreground mt-4 text-lg">See what our users say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-xl transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={'w-14 h-14 rounded-full bg-gradient-to-br ' + t.color + ' flex items-center justify-center text-white font-bold text-lg shadow-lg'}>
                    {t.image}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Simple Pricing</h2>
            <p className="text-muted-foreground mt-4 text-lg">Start free, upgrade when needed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={'relative p-8 rounded-2xl border-2 bg-card transition ' + (plan.popular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'hover:border-primary/50 hover:shadow-xl')}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <div className="mt-6 mb-6">
                  {plan.price === 'Custom' ? (
                    <p className="text-4xl font-bold">Custom</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  )}
                </div>
                <Link
                  href="/register"
                  className={'block w-full py-3 rounded-xl text-center font-medium transition ' + (plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-lg' : 'border hover:bg-accent')}
                >
                  Get Started
                </Link>
                <div className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group p-6 rounded-2xl border bg-card hover:shadow-md transition">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition" />
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 md:p-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden text-center">
            <h2 className="text-4xl md:text-6xl font-bold">Ready to build faster?</h2>
            <p className="mt-4 text-white/80 text-lg md:text-xl">
              Join 10,000+ developers using DevFlow AI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link href="/register" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition flex items-center gap-2 shadow-xl">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">DevFlow AI</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                The AI-powered developer workspace for modern teams.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg border bg-card flex items-center justify-center hover:bg-accent transition">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg border bg-card flex items-center justify-center hover:bg-accent transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg border bg-card flex items-center justify-center hover:bg-accent transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Docs</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 DevFlow AI. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}