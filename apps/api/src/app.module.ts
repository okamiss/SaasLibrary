import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CompanyModule } from './company/company.module';
import { PrismaModule } from './database/prisma.module';
import { DocumentModule } from './document/document.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { OssModule } from './oss/oss.module';
import { ParserModule } from './parser/parser.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { UserModule } from './user/user.module';
import { WecomModule } from './wecom/wecom.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    RepositoriesModule,
    AuthModule,
    ChatModule,
    CompanyModule,
    DocumentModule,
    EmbeddingModule,
    ParserModule,
    UserModule,
    OssModule,
    WecomModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
