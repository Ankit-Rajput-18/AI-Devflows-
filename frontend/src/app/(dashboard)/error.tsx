'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="p-4 rounded-full bg-destructive/10">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground mt-1 max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <Button onClick={reset}>
        <RefreshCw className="w-4 h-4 mr-2" /> Try again
      </Button>
    </div>
  );
}