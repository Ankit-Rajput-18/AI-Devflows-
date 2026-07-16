import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          404
        </div>
        <div>
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground mt-2">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}