import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// Config
import appConfig from '../config/app.config';
import databaseConfig from '../config/database.config';
import jwtConfig from '../config/jwt.config';
import redisConfig from '../config/redis.config';
import googleConfig from '../config/google.config';
import geminiConfig from '../config/gemini.config';
import cloudinaryConfig from '../config/cloudinary.config';

// Database
import { DatabaseModule } from '../database/database.module';

// Cache
import { CacheModule } from '../cache/cache.module';

// Feature Modules
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { TasksModule } from '../modules/tasks/tasks.module';
import { SprintsModule } from '../modules/sprints/sprints.module';
import { AiModule } from '../modules/ai/ai.module';
import { ChatModule } from '../modules/chat/chat.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { FilesModule } from '../modules/files/files.module';
import { CalendarModule } from '../modules/calendar/calendar.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { TeamModule } from '../modules/team/team.module';
import { ApiKeysModule } from '../modules/api-keys/api-keys.module';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';

// Queue
import { QueueModule } from '../queues/queue.module';

// App Controller and Service
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Config Module - sab jagah use hoga
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        googleConfig,
        geminiConfig,
        cloudinaryConfig,
      ],
      envFilePath: ['.env', '.env.local'],
    }),

    // GraphQL Module
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
        sortSchema: true,
        playground: configService.get('NODE_ENV') !== 'production',
        introspection: configService.get('NODE_ENV') !== 'production',
        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': true,
        },
        context: ({ req, res }) => ({ req, res }),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    // Scheduler (cron jobs)
    ScheduleModule.forRoot(),

    // Database
    DatabaseModule,

    // Cache (Redis)
    CacheModule,

    // Queue (BullMQ)
    QueueModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    SprintsModule,
    AiModule,
    ChatModule,
    NotificationsModule,
    FilesModule,
    CalendarModule,
    AnalyticsModule,
    TeamModule,
    ApiKeysModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
