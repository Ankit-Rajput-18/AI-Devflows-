'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Bug, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const languages = [
  'typescript', 'javascript', 'python', 'java', 'go',
  'rust', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin',
];

export default function AIReviewPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [result, setResult] = useState<any>(null);

  const reviewMutation = useMutation({
    mutationFn: () => aiApi.codeReview({ code, language }),
    onSuccess: (res) => {
      setResult(res.data.data);
      toast.success('Code review completed!');
    },
    onError: () => toast.error('Review failed'),
  });

  const bugMutation = useMutation({
    mutationFn: () => aiApi.bugDetection({ code, language }),
    onSuccess: (res) => {
      setResult({ ...result, bugs: res.data.data });
      toast.success('Bug detection completed!');
    },
    onError: () => toast.error('Bug detection failed'),
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const severityColors: Record<string, string> = {
    LOW: 'outline',
    MEDIUM: 'warning',
    HIGH: 'destructive',
    CRITICAL: 'destructive',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-500" /> AI Code Review
        </h1>
        <p className="text-muted-foreground">Paste your code for AI-powered review and bug detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-card text-sm"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-[400px] p-4 rounded-xl border bg-card font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
          />

          <div className="flex gap-3">
            <Button
              onClick={() => reviewMutation.mutate()}
              loading={reviewMutation.isPending}
              disabled={!code.trim()}
            >
              <Brain className="w-4 h-4 mr-2" /> Review Code
            </Button>
            <Button
              variant="outline"
              onClick={() => bugMutation.mutate()}
              loading={bugMutation.isPending}
              disabled={!code.trim()}
            >
              <Bug className="w-4 h-4 mr-2" /> Detect Bugs
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {result && (
            <>
              {result.score !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Code Quality Score
                      <span className={'text-4xl font-bold ' + getScoreColor(result.score)}>
                        {result.score}/100
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </CardContent>
                </Card>
              )}

              {result.issues && result.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Issues ({result.issues.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.issues.map((issue: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Line {issue.line}</span>
                          <Badge variant={severityColors[issue.severity] as any}>{issue.severity}</Badge>
                        </div>
                        <p className="text-sm font-medium">{issue.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" /> Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.goodPractices && result.goodPractices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" /> Good Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.goodPractices.map((g: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!result && (
            <div className="flex items-center justify-center h-[400px] rounded-xl border border-dashed">
              <div className="text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Paste code and click Review</p>
                <p className="text-xs text-muted-foreground mt-1">AI will analyze your code quality</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
