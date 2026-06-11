import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService]
})
export class CompanyModule {}
