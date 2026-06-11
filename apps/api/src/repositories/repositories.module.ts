import { Module } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { UserRepository } from './user.repository';

@Module({
  providers: [CompanyRepository, UserRepository],
  exports: [CompanyRepository, UserRepository]
})
export class RepositoriesModule {}
