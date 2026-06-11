import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: Number(configService.get<string>('REDIS_PORT', '6379'))
        }
      })
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.DEFAULT,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500
      }
    })
  ],
  exports: [BullModule]
})
export class QueueModule {}
