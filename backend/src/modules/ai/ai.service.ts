import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GeminiService } from './services/gemini.service';
import { CodeReviewDto, BugDetectionDto, PRSummaryDto, DocGeneratorDto } from './dto';
import {
  CODE_REVIEW_PROMPT,
  BUG_DETECTION_PROMPT,
  PR_SUMMARY_PROMPT,
  DOC_GENERATOR_PROMPT,
} from './prompts';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) return JSON.parse(jsonMatch[1].trim());
      } catch {}

      try {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) return JSON.parse(braceMatch[0]);
      } catch {}

      return null;
    }
  }

  async codeReview(dto: CodeReviewDto, userId: string) {
    this.logger.log('Starting AI code review for ' + dto.language);

    const prompt = CODE_REVIEW_PROMPT
      .replace('{language}', dto.language)
      .replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    const parsed = this.extractJSON(response);

    const result = parsed || {
      score: 70,
      summary: response.substring(0, 500),
      issues: [],
      goodPractices: [],
      suggestions: [],
    };

    const score = typeof result.score === 'number' ? result.score : 70;
    const summary = result.summary || 'Review completed';
    const issues = Array.isArray(result.issues) ? result.issues : [];
    const goodPractices = Array.isArray(result.goodPractices) ? result.goodPractices : [];
    const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];

    const review = await this.prisma.aIReview.create({
      data: {
        code: dto.code,
        language: dto.language,
        review: summary,
        summary: summary,
        bugs: issues,
        suggestions: suggestions,
        score: score,
        status: 'COMPLETED',
        userId,
        projectId: dto.projectId,
        taskId: dto.taskId,
      },
    });

    this.logger.log('Code review completed. Score: ' + score);

    return {
      message: 'Code review completed',
      data: {
        id: review.id,
        score,
        summary,
        issues,
        goodPractices,
        suggestions,
        createdAt: review.createdAt,
      },
    };
  }

  async bugDetection(dto: BugDetectionDto, userId: string) {
    this.logger.log('Starting AI bug detection for ' + dto.language);

    const prompt = BUG_DETECTION_PROMPT
      .replace('{language}', dto.language)
      .replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    const parsed = this.extractJSON(response);

    const result = parsed || {
      totalBugs: 0,
      bugs: [],
      securityIssues: [],
      performanceIssues: [],
    };

    this.logger.log('Bug detection completed. Bugs: ' + (result.totalBugs || result.bugs?.length || 0));

    return {
      message: 'Bug detection completed',
      data: {
        totalBugs: result.totalBugs || result.bugs?.length || 0,
        bugs: Array.isArray(result.bugs) ? result.bugs : [],
        securityIssues: Array.isArray(result.securityIssues) ? result.securityIssues : [],
        performanceIssues: Array.isArray(result.performanceIssues) ? result.performanceIssues : [],
      },
    };
  }

  async prSummary(dto: PRSummaryDto, userId: string) {
    this.logger.log('Generating PR summary');

    const prompt = PR_SUMMARY_PROMPT.replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    const parsed = this.extractJSON(response);

    const result = parsed || {
      title: 'Pull Request',
      description: response.substring(0, 500),
      changes: [],
      testingNotes: [],
      breakingChanges: [],
      labels: [],
    };

    return {
      message: 'PR summary generated',
      data: {
        title: result.title || 'Pull Request',
        description: result.description || '',
        changes: Array.isArray(result.changes) ? result.changes : [],
        testingNotes: Array.isArray(result.testingNotes) ? result.testingNotes : [],
        breakingChanges: Array.isArray(result.breakingChanges) ? result.breakingChanges : [],
        labels: Array.isArray(result.labels) ? result.labels : [],
      },
    };
  }

  async generateDocs(dto: DocGeneratorDto, userId: string) {
    this.logger.log('Generating documentation for ' + dto.language);

    const prompt = DOC_GENERATOR_PROMPT
      .replace('{language}', dto.language)
      .replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    return {
      message: 'Documentation generated',
      data: { documentation: response },
    };
  }

  async getReviewHistory(userId: string) {
    const reviews = await this.prisma.aIReview.findMany({
      where: { userId },
      select: {
        id: true,
        language: true,
        score: true,
        summary: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { data: reviews };
  }

  async getReviewById(id: string) {
    const review = await this.prisma.aIReview.findUnique({
      where: { id },
    });

    if (!review) throw new Error('Review not found');

    return { data: review };
  }
}