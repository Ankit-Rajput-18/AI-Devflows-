'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain, Bug, Lightbulb, CheckCircle,
  AlertTriangle, Zap, FileCode, History,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

const LANGUAGES = [
  'typescript', 'javascript', 'python', 'java', 'go',
  'rust', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift',
];

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AIReviewPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'bugs' | 'history'>('review');

  const { data: statusData } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiApi.getStatus().then((r) => r.data),
  });

  const { data: historyData } = useQuery({
    queryKey: ['ai-reviews'],
    queryFn: () => aiApi.getReviews().then((r) => r.data),
    enabled: activeTab === 'history',
  });

  const reviewMutation = useMutation({
    mutationFn: () => aiApi.codeReview({ code, language }),
    onSuccess: (res) => {
      setResult({ type: 'review', ...res.data.data });
      toast.success('Code review completed!');
    },
    onError: () => toast.error('Review failed. Please try again.'),
  });

  const bugMutation = useMutation({
    mutationFn: () => aiApi.bugDetection({ code, language }),
    onSuccess: (res) => {
      setResult({ type: 'bugs', ...res.data.data });
      toast.success('Bug detection completed!');
    },
    onError: () => toast.error('Bug detection failed.'),
  });

  const aiStatus = statusData?.data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const SAMPLE_CODE = `function fetchUserData(userId) {
  const user = database.find(userId);
  return user.profile.name;
}

const result = null;
console.log(result.toString());`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-500" /> AI Code Review
          </h1>
          <p className="text-muted-foreground">AI-powered code analysis and bug detection</p>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus && (
            <div className={'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ' + (aiStatus.aiAvailable ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20')}>
              <div className={'w-2 h-2 rounded-full ' + (aiStatus.aiAvailable ? 'bg-green-500 animate-pulse' : 'bg-yellow-500')} />
              {aiStatus.status}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {[
          { id: 'review', icon: Brain, label: 'Code Review' },
          { id: 'bugs', icon: Bug, label: 'Bug Detection' },
          { id: 'history', icon: History, label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ' + (activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-card text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <button
                onClick={() => setCode(SAMPLE_CODE)}
                className="text-xs text-primary hover:underline"
              >
                Use sample code
              </button>
            </div>

            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-[380px] p-4 rounded-xl border bg-card font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              />
              {code && (
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {code.length} chars
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {activeTab === 'review' ? (
                <Button
                  onClick={() => reviewMutation.mutate()}
                  loading={reviewMutation.isPending}
                  disabled={!code.trim()}
                  className="flex-1"
                >
                  <Brain className="w-4 h-4 mr-2" /> Review Code
                </Button>
              ) : (
                <Button
                  onClick={() => bugMutation.mutate()}
                  loading={bugMutation.isPending}
                  disabled={!code.trim()}
                  className="flex-1"
                  variant="outline"
                >
                  <Bug className="w-4 h-4 mr-2" /> Detect Bugs
                </Button>
              )}
              {code && (
                <Button variant="outline" onClick={() => { setCode(''); setResult(null); }}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                {result.type === 'review' && result.score !== undefined && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Code Quality Score</p>
                          <p className={'text-5xl font-bold mt-1 ' + getScoreColor(result.score)}>
                            {result.score}
                            <span className="text-2xl text-muted-foreground">/100</span>
                          </p>
                        </div>
                        <div className={'p-4 rounded-full ' + (result.score >= 80 ? 'bg-green-500/10' : result.score >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10')}>
                          <Zap className={'w-8 h-8 ' + getScoreColor(result.score)} />
                        </div>
                      </div>
                      {result.summary && (
                        <p className="text-sm text-muted-foreground mt-3 border-t pt-3">{result.summary}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {result.issues && result.issues.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Issues Found ({result.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.issues.map((issue: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Line {issue.line}</span>
                            <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (SEVERITY_COLORS[issue.severity] || '')}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{issue.message}</p>
                          <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {result.bugs && result.bugs.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bug className="w-4 h-4 text-red-500" />
                        Bugs Found ({result.totalBugs || result.bugs.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.bugs.map((bug: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">{bug.type}</span>
                            <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (SEVERITY_COLORS[bug.severity] || '')}>
                              {bug.severity}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{bug.message}</p>
                          <p className="text-xs text-muted-foreground">{bug.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.suggestions.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.goodPractices && result.goodPractices.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Good Practices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.goodPractices.map((g: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.securityIssues && result.securityIssues.length > 0 && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        Security Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.securityIssues.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-destructive">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] rounded-xl border border-dashed gap-4">
                <div className="p-4 rounded-full bg-purple-500/10">
                  <Brain className="w-10 h-10 text-purple-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Ready to analyze your code</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === 'review' ? 'Paste code and click Review Code' : 'Paste code and click Detect Bugs'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {!historyData?.data || historyData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <History className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground">No review history yet</p>
            </div>
          ) : (
            historyData.data.map((review: any) => (
              <div key={review.id} className="p-4 rounded-xl border hover:bg-muted/30 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileCode className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{review.language} Code Review</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={'text-lg font-bold ' + getScoreColor(review.score)}>
                    {review.score}/100
                  </div>
                  <Badge variant={review.status === 'COMPLETED' ? 'success' : 'secondary'}>
                    {review.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}