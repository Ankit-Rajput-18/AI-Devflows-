import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private apiKey: string = '';
  private isConfigured = false;
  private workingModel = '';

  private readonly MODELS_TO_TRY = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
  ];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey && apiKey.length > 10) {
      this.apiKey = apiKey;
      this.isConfigured = true;
      this.logger.log('✅ Gemini AI initialized');
    } else {
      this.logger.warn('⚠️ No API key');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.isConfigured) return this.getMockResponse(prompt);

    if (this.workingModel) {
      const result = await this.callAPI(this.workingModel, prompt);
      if (result) return result;
      this.workingModel = '';
    }

    for (const modelName of this.MODELS_TO_TRY) {
      this.logger.log('Trying: ' + modelName);
      const result = await this.callAPI(modelName, prompt);
      if (result) {
        this.workingModel = modelName;
        this.logger.log('✅ SUCCESS with ' + modelName);
        return result;
      }
    }

    this.logger.error('All models failed');
    return this.getMockResponse(prompt);
  }

  private async callAPI(modelName: string, prompt: string): Promise<string | null> {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + this.apiKey;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } else {
        const errText = await response.text();
        this.logger.warn(modelName + ' - ' + response.status + ': ' + errText.substring(0, 150));
      }
    } catch (err: any) {
      this.logger.warn(modelName + ' error: ' + err.message);
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
        issues: [{ line: 1, severity: 'MEDIUM', message: 'Missing types', suggestion: 'Add types' }],
        goodPractices: ['Clean naming'],
        suggestions: ['Add tests'],
      });
    }
    if (prompt.includes('bug detector')) {
      return JSON.stringify({
        totalBugs: 1,
        bugs: [{ line: 2, type: 'NULL_REFERENCE', severity: 'HIGH', message: 'Null ref', suggestion: 'Add check' }],
        securityIssues: [],
        performanceIssues: [],
      });
    }
    return '# Documentation\n\nCore module.';
  }
}