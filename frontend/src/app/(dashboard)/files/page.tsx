'use client';

import { Files } from 'lucide-react';
import { EmptyState } from '@/components/shared';

export default function FilesPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Files</h1>
      <EmptyState
        icon={Files}
        title="File Manager Coming Soon"
        description="Upload and manage files across your projects"
      />
    </div>
  );
}
