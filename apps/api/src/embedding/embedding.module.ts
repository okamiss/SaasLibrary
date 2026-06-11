import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RepositoriesModule } from '../repositories/repositories.module';
import { EMBEDDING_PROVIDER } from './embedding.constants';
import { createEmbeddingProvider } from './embedding.providers';
import { EmbeddingService } from './embedding.service';

@Module({
  imports: [RepositoriesModule],
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      inject: [ConfigService],
      useFactory: createEmbeddingProvider
    },
    EmbeddingService
  ],
  exports: [EmbeddingService]
})
export class EmbeddingModule {}
