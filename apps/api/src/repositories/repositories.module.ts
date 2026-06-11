import { Module } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { ChatRepository } from './chat.repository';
import { CompanyRepository } from './company.repository';
import { DocumentChunkRepository } from './document-chunk.repository';
import { DocumentRepository } from './document.repository';
import { UserRepository } from './user.repository';
import { WecomRepository } from './wecom.repository';

@Module({
  providers: [
    AuthRepository,
    ChatRepository,
    CompanyRepository,
    DocumentChunkRepository,
    DocumentRepository,
    UserRepository,
    WecomRepository
  ],
  exports: [
    AuthRepository,
    ChatRepository,
    CompanyRepository,
    DocumentChunkRepository,
    DocumentRepository,
    UserRepository,
    WecomRepository
  ]
})
export class RepositoriesModule {}
