'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function BeautifulEmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration = 'default',
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
  illustration?: 'default' | 'search' | 'error' | 'success';
}) {
  const colors = {
    default: 'from-blue-500 to-purple-500',
    search: 'from-cyan-500 to-blue-500',
    error: 'from-red-500 to-pink-500',
    success: 'from-green-500 to-emerald-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className={'relative w-24 h-24 rounded-3xl bg-gradient-to-br ' + colors[illustration] + ' flex items-center justify-center mb-6 shadow-xl'}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className={'absolute inset-0 rounded-3xl bg-gradient-to-br ' + colors[illustration] + ' blur-xl -z-10'}
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}