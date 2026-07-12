import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('ai-review')
export class AiReviewProcessor {
  private readonly logger = new Logger(AiReviewProcessor.name);

  @Process('code-review')
  async handleCodeReview(job: Job) {
    this.logger.log('Processing AI review job: ' + job.id);
    const { code, language, userId } = job.data;
    this.logger.log('AI review completed for job: ' + job.id);
    return { success: true };
  }

  @Process('bug-detection')
  async handleBugDetection(job: Job) {
    this.logger.log('Processing bug detection job: ' + job.id);
    return { success: true };
  }
}
