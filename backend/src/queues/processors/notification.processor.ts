import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send')
  async handleSendNotification(job: Job) {
    this.logger.log('Processing notification job: ' + job.id);
    const { userId, title, message, type } = job.data;
    this.logger.log('Notification sent to user: ' + userId);
    return { success: true };
  }

  @Process('email')
  async handleEmailNotification(job: Job) {
    this.logger.log('Processing email notification: ' + job.id);
    return { success: true };
  }
}
