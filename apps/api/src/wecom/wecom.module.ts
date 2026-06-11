import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { WecomController } from './wecom.controller';
import { WecomService } from './wecom.service';
import { WecomWebhookClient } from './wecom-webhook.client';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [WecomController],
  providers: [WecomService, WecomWebhookClient],
  exports: [WecomService]
})
export class WecomModule {}
