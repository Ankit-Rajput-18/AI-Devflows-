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

  async codeReview(dto: CodeReviewDto, userId: string) {
    this.logger.log('Starting AI code review');

    const prompt = CODE_REVIEW_PROMPT
      .replace('{language}', dto.language)
      .replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      parsed = {
        score: 70,
        summary: response,
        issues: [],
        goodPractices: [],
        suggestions: [],
      };
    }

    const review = await this.prisma.aIReview.create({
      data: {
        code: dto.code,
        language: dto.language,
        review: parsed.summary || response,
        summary: parsed.summary,
        bugs: parsed.issues || [],
        suggestions: parsed.suggestions || [],
        score: parsed.score || 0,
        status: 'COMPLETED',
        userId,
        projectId: dto.projectId,
        taskId: dto.taskId,
      },
    });

    this.logger.log('Code review completed. Score: ' + parsed.score);

    return {
      message: 'Code review completed',
      data: {
        id: review.id,
        score: parsed.score,
        summary: parsed.summary,
        issues: parsed.issues,
        goodPractices: parsed.goodPractices,
        suggestions: parsed.suggestions,
        createdAt: review.createdAt,
      },
    };
  }

  async bugDetection(dto: BugDetectionDto, userId: string) {
    this.logger.log('Starting AI bug detection');

    const prompt = BUG_DETECTION_PROMPT
      .replace('{language}', dto.language)
      .replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      parsed = {
        totalBugs: 0,
        bugs: [],
        securityIssues: [],
        performanceIssues: [],
      };
    }

    this.logger.log('Bug detection completed. Bugs found: ' + parsed.totalBugs);

    return {
      message: 'Bug detection completed',
      data: parsed,
    };
  }

  async prSummary(dto: PRSummaryDto, userId: string) {
    this.logger.log('Generating PR summary');

    const prompt = PR_SUMMARY_PROMPT.replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      parsed = {
        title: 'Pull Request',
        description: response,
        changes: [],
        testingNotes: [],
        breakingChanges: [],
        labels: [],
      };
    }

    this.logger.log('PR summary generated');

    return {
      message: 'PR summary generated',
      data: parsed,
    };
  }

  async generateDocs(dto: DocGeneratorDto, userId: string) {
    this.logger.log('Generating documentation');

    const prompt = DOC_GENERATOR_PROMPT
      .replace('{language}', dto.language)
      .replace('{code}', dto.code);

    const response = await this.geminiService.generateContent(prompt);

    this.logger.log('Documentation generated');

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

    if (!review) {
      throw new Error('Review not found');
    }

    return { data: review };
  }
}
