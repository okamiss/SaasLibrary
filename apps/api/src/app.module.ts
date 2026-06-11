import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { PrismaModule } from './database/prisma.module';
import { OssModule } from './oss/oss.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { UserModule } from './user/user.module';

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
    CompanyModule,
    UserModule,
    OssModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
