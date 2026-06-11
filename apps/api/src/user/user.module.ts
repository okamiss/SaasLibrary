import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { UserService } from './user.service';

@Module({
  imports: [RepositoriesModule],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
