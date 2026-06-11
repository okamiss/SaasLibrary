import { describe, expect, it, vi } from 'vitest';
import { ChatRepository } from './chat.repository';

describe('ChatRepository', () => {
  it('creates chat logs through Prisma', async () => {
    const prisma = {
      chatLog: {
        create: vi.fn().mockResolvedValue({})
      }
    };
    const repository = new ChatRepository(prisma as never);

    await repository.create({
      companyId: 'company-1',
      userId: 'user-1',
      source: 'WEB',
      question: 'question',
      answer: 'answer',
      sourceChunks: [],
      model: 'deepseek-chat',
      promptTokens: 10,
      completionTokens: 5
    });

    expect(prisma.chatLog.create).toHaveBeenCalledWith({
      data: {
        companyId: 'company-1',
        userId: 'user-1',
        source: 'WEB',
        question: 'question',
        answer: 'answer',
        sourceChunks: [],
        model: 'deepseek-chat',
        promptTokens: 10,
        completionTokens: 5
      }
    });
  });

  it('lists chat logs with companyId filter', async () => {
    const prisma = {
      chatLog: {
        findMany: vi.fn().mockResolvedValue([])
      }
    };
    const repository = new ChatRepository(prisma as never);

    await repository.findManyByCompany('company-1');

    expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
      where: {
        companyId: 'company-1'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
  });
});
