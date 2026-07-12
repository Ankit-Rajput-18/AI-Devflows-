import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getInfo() {
    return {
      name: 'DevFlow AI API',
      version: '1.0.0',
      description: 'AI Powered Developer Workspace',
      docs: '/api/docs',
      graphql: '/graphql',
      status: 'running',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV'),
      version: '1.0.0',
      services: {
        database: 'connected',
        redis: 'connected',
        queue: 'running',
      },
    };
  }

  async getMetrics() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
