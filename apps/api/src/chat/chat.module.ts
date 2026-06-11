import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { CHAT_PROVIDER } from './chat.constants';
import { ChatController } from './chat.controller';
import { createChatProvider } from './chat.providers';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, EmbeddingModule, RepositoriesModule],
  controllers: [ChatController],
  providers: [
    {
      provide: CHAT_PROVIDER,
      inject: [ConfigService],
      useFactory: createChatProvider
    },
    ChatService
  ],
  exports: [ChatService]
})
export class ChatModule {}
