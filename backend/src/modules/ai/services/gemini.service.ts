import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (apiKey && apiKey !== 'your-gemini-api-key' && apiKey.length > 10) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        });
        this.isConfigured = true;
        this.logger.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        this.logger.error('❌ Failed to initialize Gemini AI:', error.message);
      }
    } else {
      this.logger.warn('⚠️ Gemini API key not configured - AI features will use mock data');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.isConfigured || !this.model) {
      this.logger.warn('Using mock AI response');
      return this.getMockResponse(prompt);
    }

    try {
      this.logger.log('Sending request to Gemini AI...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      this.logger.log('✅ Gemini response received (' + text.length + ' chars)');
      return text;
    } catch (error) {
      this.logger.error('Gemini API error: ' + error.message);
      this.logger.warn('Falling back to mock response');
      return this.getMockResponse(prompt);
    }
  }

  isAIAvailable(): boolean {
    return this.isConfigured;
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes('code reviewer')) {
      return JSON.stringify({
        score: 75,
        summary: 'Code is functional with room for improvement. Add proper error handling and type annotations.',
        issues: [
          {
            line: 1,
            severity: 'MEDIUM',
            message: 'Missing type annotations',
            suggestion: 'Add TypeScript types for better type safety and IDE support',
          },
          {
            line: 5,
            severity: 'LOW',
            message: 'Consider adding JSDoc comments',
            suggestion: 'Document function parameters and return types',
          },
        ],
        goodPractices: [
          'Clean function naming',
          'Proper module structure',
          'Consistent code style',
        ],
        suggestions: [
          'Add error handling with try-catch blocks',
          'Add input validation',
          'Write unit tests for critical functions',
          'Consider using dependency injection',
        ],
      });
    }

    if (prompt.includes('bug detector')) {
      return JSON.stringify({
        totalBugs: 2,
        bugs: [
          {
            line: 1,
            type: 'NULL_REFERENCE',
            severity: 'HIGH',
            message: 'Potential null/undefined reference',
            suggestion: 'Add null check before accessing object properties',
          },
          {
            line: 10,
            type: 'TYPE_ERROR',
            severity: 'MEDIUM',
            message: 'Implicit type coercion detected',
            suggestion: 'Use strict equality operator (===) instead of (==)',
          },
        ],
        securityIssues: [
          'No input sanitization found - potential XSS vulnerability',
        ],
        performanceIssues: [
          'Consider memoization for expensive computations',
          'Avoid unnecessary re-renders in React components',
        ],
      });
    }

    if (prompt.includes('Pull Request')) {
      return JSON.stringify({
        title: 'feat: Add new functionality with improvements',
        description: 'This PR adds new functionality to the application with various improvements and bug fixes.',
        changes: [
          'Added new service layer for business logic',
          'Updated controller with proper validation',
          'Added comprehensive error handling',
          'Improved code structure and readability',
        ],
        testingNotes: [
          'Test the new API endpoint with valid and invalid inputs',
          'Verify error handling works correctly',
          'Check edge cases for null/undefined values',
        ],
        breakingChanges: [],
        labels: ['feature', 'enhancement', 'needs-review'],
      });
    }

    return '# Documentation\n\n## Overview\n\nThis module provides core functionality for the application.\n\n## Functions\n\nAll functions are properly documented and follow best practices.\n\n## Usage\n\nSee examples in the test files.\n\n## Dependencies\n\nCheck package.json for required dependencies.';
  }
}