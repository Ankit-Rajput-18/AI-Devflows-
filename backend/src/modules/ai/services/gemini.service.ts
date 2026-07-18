import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private apiKey: string = '';
  private isConfigured = false;
  private workingModel = '';

  private readonly MODELS_TO_TRY = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  private readonly API_BASE = 'https://generativelanguage.googleapis.com';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (apiKey && apiKey !== 'your-gemini-api-key' && apiKey.length > 10) {
      this.apiKey = apiKey;
      this.isConfigured = true;
      this.logger.log('✅ Gemini AI client initialized');
      this.logger.log('Key format: ' + apiKey.substring(0, 8) + '...');
    } else {
      this.logger.warn('⚠️ Gemini API key not configured - using mock data');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.isConfigured || !this.apiKey) {
      return this.getMockResponse(prompt);
    }

    if (this.workingModel) {
      try {
        const result = await this.callGeminiAPI(this.workingModel, prompt);
        if (result) {
          this.logger.log('✅ Response from cached model ' + this.workingModel + ' (' + result.length + ' chars)');
          return result;
        }
      } catch {
        this.workingModel = '';
      }
    }

    for (const modelName of this.MODELS_TO_TRY) {
      this.logger.log('Trying model: ' + modelName);
      const result = await this.callGeminiAPI(modelName, prompt);
      if (result !== null) {
        this.workingModel = modelName;
        this.logger.log('✅ Working model found: ' + modelName + ' (' + result.length + ' chars)');
        return result;
      }
    }

    this.logger.error('All models failed - using mock response');
    return this.getMockResponse(prompt);
  }

  private async callGeminiAPI(modelName: string, prompt: string): Promise<string | null> {
    const isNewKeyFormat = this.apiKey.startsWith('AQ.');

    let urls: string[];
    let headers: Record<string, string>;
    let bodyStr: string;

    if (isNewKeyFormat) {
      urls = [
        this.API_BASE + '/v1beta/models/' + modelName + ':generateContent',
        this.API_BASE + '/v1/models/' + modelName + ':generateContent',
      ];
      headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      };
      bodyStr = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      });
    } else {
      urls = [
        this.API_BASE + '/v1beta/models/' + modelName + ':generateContent?key=' + this.apiKey,
        this.API_BASE + '/v1/models/' + modelName + ':generateContent?key=' + this.apiKey,
      ];
      headers = { 'Content-Type': 'application/json' };
      bodyStr = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      });
    }

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: bodyStr,
        });

        if (response.ok) {
          const data = await response.json() as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errorText = await response.text();
          if (errorText.length < 200) {
            this.logger.warn(modelName + ' - ' + response.status + ': ' + errorText.substring(0, 100));
          }
        }
      } catch (err) {
        continue;
      }
    }
    return null;
  }

  isAIAvailable(): boolean {
    return this.isConfigured;
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes('code reviewer')) {
      return JSON.stringify({
        score: 72,
        summary: 'Code needs improvement.',
        issues: [
          { line: 1, severity: 'MEDIUM', message: 'Missing types', suggestion: 'Add types' },
          { line: 3, severity: 'HIGH', message: 'No error handling', suggestion: 'Add try-catch' },
        ],
        goodPractices: ['Clean naming'],
        suggestions: ['Add tests', 'Add validation'],
      });
    }
    if (prompt.includes('bug detector')) {
      return JSON.stringify({
        totalBugs: 2,
        bugs: [
          { line: 2, type: 'NULL_REFERENCE', severity: 'HIGH', message: 'Null reference', suggestion: 'Add null check' },
        ],
        securityIssues: ['No sanitization'],
        performanceIssues: ['Consider memoization'],
      });
    }
    if (prompt.includes('Pull Request')) {
      return JSON.stringify({
        title: 'feat: improvements',
        description: 'Various improvements',
        changes: ['Added features'],
        testingNotes: ['Test endpoints'],
        breakingChanges: [],
        labels: ['feature'],
      });
    }
    return '# Documentation\n\nCore module functionality.';
  }
}