import { Inject, Injectable } from '@nestjs/common';
import { ChatLogSource, Prisma } from '@prisma/client';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { EmbeddingService } from '../embedding/embedding.service';
import { SimilarDocumentChunk } from '../embedding/embedding.types';
import { ChatRepository } from '../repositories/chat.repository';
import {
  CHAT_PROVIDER,
  CHAT_SYSTEM_PROMPT,
  NO_RELEVANT_INFORMATION_ANSWER
} from './chat.constants';
import { AskChatDto } from './dto/ask-chat.dto';
import { ChatProvider, ChatSource } from './chat.types';

const TOP_K = 8;
const SOURCE_SNIPPET_LENGTH = 240;

@Injectable()
export class ChatService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    @Inject(CHAT_PROVIDER)
    private readonly chatProvider: ChatProvider,
    private readonly chatRepository: ChatRepository
  ) {}

  async ask(currentUser: CurrentUser, dto: AskChatDto) {
    const question = dto.question.trim();
    const chunks = await this.embeddingService.searchByText(
      currentUser.companyId,
      question,
      TOP_K
    );
    const effectiveChunks = chunks.filter((chunk) => chunk.similarity > 0);
    const sources = effectiveChunks.map((chunk) => this.toSource(chunk));

    if (sources.length === 0) {
      await this.chatRepository.create({
        companyId: currentUser.companyId,
        userId: currentUser.id,
        source: ChatLogSource.WEB,
        question,
        answer: NO_RELEVANT_INFORMATION_ANSWER,
        sourceChunks: [],
        model: 'retrieval-only',
        promptTokens: 0,
        completionTokens: 0
      });

      return {
        answer: NO_RELEVANT_INFORMATION_ANSWER,
        sources: [],
        usage: {
          model: 'retrieval-only',
          promptTokens: 0,
          completionTokens: 0
        }
      };
    }

    const completion = await this.chatProvider.complete({
      systemPrompt: CHAT_SYSTEM_PROMPT,
      userPrompt: this.buildUserPrompt(question, effectiveChunks)
    });

    await this.chatRepository.create({
      companyId: currentUser.companyId,
      userId: currentUser.id,
      source: ChatLogSource.WEB,
      question,
      answer: completion.answer,
      sourceChunks: sources as unknown as Prisma.InputJsonValue,
      model: completion.model,
      promptTokens: completion.promptTokens,
      completionTokens: completion.completionTokens
    });

    return {
      answer: completion.answer,
      sources,
      usage: {
        model: completion.model,
        promptTokens: completion.promptTokens,
        completionTokens: completion.completionTokens
      }
    };
  }

  async getLogs(companyId: string) {
    const logs = await this.chatRepository.findManyByCompany(companyId);

    return {
      logs
    };
  }

  private buildUserPrompt(question: string, chunks: SimilarDocumentChunk[]) {
    const sourceContent = chunks
      .map((chunk, index) => {
        const documentName = chunk.documentName ?? chunk.documentId;
        return [
          `资料 ${index + 1}`,
          `文档名称：${documentName}`,
          `文档ID：${chunk.documentId}`,
          `片段ID：${chunk.id}`,
          `相似度：${chunk.similarity.toFixed(4)}`,
          `内容：${chunk.content}`
        ].join('\n');
      })
      .join('\n\n');

    return `【资料内容】
${sourceContent}

【用户问题】
${question}

【回答要求】
- 只根据资料内容回答
- 如果资料内容中没有答案，回答“资料中没有找到相关信息。”
- 不要编造
- 尽量简洁
- 返回中文`;
  }

  private toSource(chunk: SimilarDocumentChunk): ChatSource {
    return {
      documentId: chunk.documentId,
      documentName: chunk.documentName ?? chunk.documentId,
      chunkId: chunk.id,
      contentSnippet: this.toSnippet(chunk.content),
      similarityScore: chunk.similarity
    };
  }

  private toSnippet(content: string) {
    if (content.length <= SOURCE_SNIPPET_LENGTH) {
      return content;
    }

    return `${content.slice(0, SOURCE_SNIPPET_LENGTH)}...`;
  }
}
