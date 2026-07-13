'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDocsPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [docs, setDocs] = useState('');

  const docsMutation = useMutation({
    mutationFn: () => aiApi.generateDocs({ code, language }),
    onSuccess: (res) => {
      setDocs(res.data.data.documentation);
      toast.success('Documentation generated!');
    },
    onError: () => toast.error('Failed to generate docs'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7 text-cyan-500" /> AI Doc Generator
        </h1>
        <p className="text-muted-foreground">Generate documentation from your code using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-card text-sm"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-[500px] p-4 rounded-xl border bg-card font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
          />

          <Button
            onClick={() => docsMutation.mutate()}
            loading={docsMutation.isPending}
            disabled={!code.trim()}
          >
            <FileText className="w-4 h-4 mr-2" /> Generate Docs
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 overflow-auto max-h-[600px]">
          {docs ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{docs}</pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Documentation will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
