import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  imports: [QueueModule, RepositoriesModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService]
})
export class DocumentModule {}
