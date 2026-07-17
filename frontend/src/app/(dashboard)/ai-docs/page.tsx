'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, CheckCircle, AlertTriangle, Tag, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDocsPage() {
  const [activeMode, setActiveMode] = useState<'docs' | 'pr'>('docs');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [result, setResult] = useState<any>(null);

  const docsMutation = useMutation({
    mutationFn: () => aiApi.generateDocs({ code, language }),
    onSuccess: (res) => {
      setResult({ type: 'docs', content: res.data.data.documentation });
      toast.success('Documentation generated!');
    },
    onError: () => toast.error('Failed to generate docs'),
  });

  const prMutation = useMutation({
    mutationFn: () => aiApi.prSummary({ code }),
    onSuccess: (res) => {
      setResult({ type: 'pr', ...res.data.data });
      toast.success('PR summary generated!');
    },
    onError: () => toast.error('Failed to generate PR summary'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7 text-cyan-500" /> AI Documentation
        </h1>
        <p className="text-muted-foreground">Generate docs and PR summaries using AI</p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => { setActiveMode('docs'); setResult(null); }}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ' + (activeMode === 'docs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          <FileText className="w-4 h-4" /> Doc Generator
        </button>
        <button
          onClick={() => { setActiveMode('pr'); setResult(null); }}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ' + (activeMode === 'pr' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          <GitBranch className="w-4 h-4" /> PR Summary
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {activeMode === 'docs' && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-card text-sm"
            >
              {['typescript', 'javascript', 'python', 'java', 'go', 'rust'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          )}

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={activeMode === 'docs' ? 'Paste your code to generate documentation...' : 'Paste your code diff/changes for PR summary...'}
            className="w-full h-[420px] p-4 rounded-xl border bg-card font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
          />

          <div className="flex gap-3">
            <Button
              onClick={() => activeMode === 'docs' ? docsMutation.mutate() : prMutation.mutate()}
              loading={docsMutation.isPending || prMutation.isPending}
              disabled={!code.trim()}
              className="flex-1"
            >
              {activeMode === 'docs'
                ? <><FileText className="w-4 h-4 mr-2" /> Generate Docs</>
                : <><GitBranch className="w-4 h-4 mr-2" /> Generate PR Summary</>
              }
            </Button>
            {code && (
              <Button variant="outline" onClick={() => { setCode(''); setResult(null); }}>Clear</Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {result ? (
            <div className="h-full overflow-auto">
              {result.type === 'docs' ? (
                <div className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-500" /> Generated Documentation
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground">
                    {result.content}
                  </pre>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold">{result.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{result.description}</p>
                  </div>

                  {result.changes && result.changes.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Changes Made</h3>
                      <ul className="space-y-1.5">
                        {result.changes.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.testingNotes && result.testingNotes.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Testing Notes</h3>
                      <ul className="space-y-1.5">
                        {result.testingNotes.map((t: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.breakingChanges && result.breakingChanges.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <h3 className="font-semibold text-sm text-destructive mb-2">Breaking Changes</h3>
                      {result.breakingChanges.map((b: string, i: number) => (
                        <p key={i} className="text-sm text-destructive">{b}</p>
                      ))}
                    </div>
                  )}

                  {result.labels && result.labels.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Tag className="w-4 h-4" /> Labels
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.labels.map((l: string, i: number) => (
                          <Badge key={i} variant="outline">{l}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
              <div className="p-4 rounded-full bg-cyan-500/10">
                {activeMode === 'docs'
                  ? <FileText className="w-10 h-10 text-cyan-500" />
                  : <GitBranch className="w-10 h-10 text-cyan-500" />
                }
              </div>
              <div className="text-center">
                <p className="font-medium">
                  {activeMode === 'docs' ? 'Documentation will appear here' : 'PR Summary will appear here'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeMode === 'docs' ? 'Paste code and click Generate Docs' : 'Paste code diff and click Generate PR Summary'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}