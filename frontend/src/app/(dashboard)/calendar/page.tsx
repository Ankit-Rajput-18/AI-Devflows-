'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { EmptyState } from '@/components/shared';

export default function CalendarPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      <EmptyState
        icon={CalendarIcon}
        title="Calendar Coming Soon"
        description="Calendar with meetings and events will be available here"
      />
    </div>
  );
}
