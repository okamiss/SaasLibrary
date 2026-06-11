import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordService } from './password.service';

@Module({
  imports: [
    RepositoriesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d') as
          | NonNullable<JwtModuleOptions['signOptions']>['expiresIn']
          | undefined;

        return {
          secret: configService.get<string>(
            'JWT_SECRET',
            'dev-only-change-me'
          ),
          signOptions: {
            expiresIn
          }
        };
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PasswordService],
  exports: [AuthService, JwtAuthGuard, JwtModule]
})
export class AuthModule {}
