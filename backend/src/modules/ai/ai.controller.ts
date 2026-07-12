import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CodeReviewDto, BugDetectionDto, PRSummaryDto, DocGeneratorDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('review')
  @ApiOperation({ summary: 'AI Code Review' })
  codeReview(@Body() dto: CodeReviewDto, @CurrentUser('id') userId: string) {
    return this.aiService.codeReview(dto, userId);
  }

  @Post('bugs')
  @ApiOperation({ summary: 'AI Bug Detection' })
  bugDetection(@Body() dto: BugDetectionDto, @CurrentUser('id') userId: string) {
    return this.aiService.bugDetection(dto, userId);
  }

  @Post('pr-summary')
  @ApiOperation({ summary: 'AI PR Summary Generator' })
  prSummary(@Body() dto: PRSummaryDto, @CurrentUser('id') userId: string) {
    return this.aiService.prSummary(dto, userId);
  }

  @Post('docs')
  @ApiOperation({ summary: 'AI Documentation Generator' })
  generateDocs(@Body() dto: DocGeneratorDto, @CurrentUser('id') userId: string) {
    return this.aiService.generateDocs(dto, userId);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get AI review history' })
  getReviewHistory(@CurrentUser('id') userId: string) {
    return this.aiService.getReviewHistory(userId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get AI review by ID' })
  getReviewById(@Param('id') id: string) {
    return this.aiService.getReviewById(id);
  }
}
