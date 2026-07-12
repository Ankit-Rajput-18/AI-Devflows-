import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.configService.get<string>('gemini.model', 'gemini-1.5-flash'),
      });
      this.logger.log('Gemini AI initialized');
    } else {
      this.logger.warn('Gemini API key not configured - AI features will use mock data');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      if (!this.model) {
        return this.getMockResponse(prompt);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.log('Gemini response received');
      return text;
    } catch (error) {
      this.logger.error('Gemini API error: ' + error.message);
      return this.getMockResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes('code reviewer')) {
      return JSON.stringify({
        score: 75,
        summary: 'Code is functional but has room for improvement',
        issues: [
          {
            line: 1,
            severity: 'MEDIUM',
            message: 'Consider adding type annotations',
            suggestion: 'Add TypeScript types for better type safety',
          },
        ],
        goodPractices: ['Clean function naming', 'Proper module structure'],
        suggestions: ['Add error handling', 'Add input validation', 'Add unit tests'],
      });
    }

    if (prompt.includes('bug detector')) {
      return JSON.stringify({
        totalBugs: 1,
        bugs: [
          {
            line: 1,
            type: 'NULL_REFERENCE',
            severity: 'HIGH',
            message: 'Potential null reference error',
            suggestion: 'Add null check before accessing properties',
          },
        ],
        securityIssues: ['No input sanitization found'],
        performanceIssues: ['Consider memoization for expensive operations'],
      });
    }

    if (prompt.includes('Pull Request')) {
      return JSON.stringify({
        title: 'Feature: Add new functionality',
        description: 'This PR adds new functionality to the application',
        changes: ['Added new service', 'Updated controller', 'Added tests'],
        testingNotes: ['Test the new endpoint', 'Verify error handling'],
        breakingChanges: [],
        labels: ['feature', 'enhancement'],
      });
    }

    return '# Documentation\n\nThis code provides functionality as described in the source.';
  }
}
