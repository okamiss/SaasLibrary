import { Module } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { CompanyRepository } from './company.repository';
import { UserRepository } from './user.repository';

@Module({
  providers: [AuthRepository, CompanyRepository, UserRepository],
  exports: [AuthRepository, CompanyRepository, UserRepository]
})
export class RepositoriesModule {}
