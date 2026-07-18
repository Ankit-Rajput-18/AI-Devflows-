'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    {
      role: 'ai',
      content: 'Hi! I am your AI assistant. Ask me anything about your code, help with reviews, or generate documentation!',
    },
  ]);
  const [input, setInput] = useState('');

  const mutation = useMutation({
    mutationFn: () => aiApi.codeReview({ code: input, language: 'text' }),
    onSuccess: (res) => {
      const data = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'Score: ' + data.score + '/100\n\n' + (data.summary || 'Analysis complete'),
        },
      ]);
      setInput('');
    },
    onError: () => toast.error('AI request failed'),
  });

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    mutation.mutate();
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-2xl shadow-purple-500/50 flex items-center justify-center group"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-white/80">Powered by Gemini</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={'flex gap-2 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + (msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white')}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={'max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-wrap ' + (msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm')}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {mutation.isPending && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-muted rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Paste code or ask a question..."
                  className="flex-1 px-4 py-2 rounded-full border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || mutation.isPending}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}