import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { QueueModule } from '../queue/queue.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { DocumentProcessor } from './document.processor';
import { ParserService } from './parser.service';

@Module({
  imports: [EmbeddingModule, QueueModule, RepositoriesModule],
  providers: [ParserService, DocumentProcessor],
  exports: [ParserService]
})
export class ParserModule {}
