import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const currentUser = {
    id: 'user-1',
    companyId: 'company-1',
    email: 'admin@example.com',
    role: 'ADMIN'
  };
  const sources = [
    {
      id: 'chunk-1',
      companyId: 'company-1',
      documentId: 'document-1',
      documentName: '员工手册.pdf',
      chunkIndex: 0,
      content: '请假必须提前提交申请，并由部门负责人审批。',
      tokenCount: 22,
      metadata: {},
      similarity: 0.91
    }
  ];
  const embeddingService = {
    searchByText: vi.fn()
  };
  const chatProvider = {
    getModel: vi.fn(),
    complete: vi.fn()
  };
  const chatRepository = {
    create: vi.fn(),
    findManyByCompany: vi.fn()
  };
  let service: ChatService;

  beforeEach(() => {
    vi.clearAllMocks();
    embeddingService.searchByText.mockResolvedValue(sources);
    chatProvider.getModel.mockReturnValue('deepseek-chat');
    chatProvider.complete.mockResolvedValue({
      answer: '请假流程如下：\n1. 提交申请\n2. 部门审批',
      model: 'deepseek-chat',
      promptTokens: 120,
      completionTokens: 32
    });
    chatRepository.create.mockResolvedValue({});
    service = new ChatService(
      embeddingService as never,
      chatProvider as never,
      chatRepository as never
    );
  });

  it('retrieves company chunks, asks the provider with a grounded prompt, saves chat log, and returns sources', async () => {
    const result = await service.ask(currentUser, {
      question: '请假流程是什么？'
    });

    expect(embeddingService.searchByText).toHaveBeenCalledWith(
      currentUser.companyId,
      '请假流程是什么？',
      8
    );
    expect(chatProvider.complete).toHaveBeenCalledWith({
      systemPrompt: expect.stringContaining('你是企业内部知识库助手。'),
      userPrompt: expect.stringContaining('【资料内容】')
    });
    expect(chatProvider.complete.mock.calls[0][0].userPrompt).toContain(
      '员工手册.pdf'
    );
    expect(chatRepository.create).toHaveBeenCalledWith({
      companyId: currentUser.companyId,
      userId: currentUser.id,
      source: 'WEB',
      question: '请假流程是什么？',
      answer: '请假流程如下：\n1. 提交申请\n2. 部门审批',
      sourceChunks: [
        {
          documentId: 'document-1',
          documentName: '员工手册.pdf',
          chunkId: 'chunk-1',
          contentSnippet: '请假必须提前提交申请，并由部门负责人审批。',
          similarityScore: 0.91
        }
      ],
      model: 'deepseek-chat',
      promptTokens: 120,
      completionTokens: 32
    });
    expect(result).toEqual({
      answer: '请假流程如下：\n1. 提交申请\n2. 部门审批',
      sources: [
        {
          documentId: 'document-1',
          documentName: '员工手册.pdf',
          chunkId: 'chunk-1',
          contentSnippet: '请假必须提前提交申请，并由部门负责人审批。',
          similarityScore: 0.91
        }
      ],
      usage: {
        model: 'deepseek-chat',
        promptTokens: 120,
        completionTokens: 32
      }
    });
  });

  it('does not call the provider when no effective chunks are retrieved', async () => {
    embeddingService.searchByText.mockResolvedValue([]);

    const result = await service.ask(currentUser, {
      question: '公司年假有几天？'
    });

    expect(chatProvider.complete).not.toHaveBeenCalled();
    expect(chatRepository.create).toHaveBeenCalledWith({
      companyId: currentUser.companyId,
      userId: currentUser.id,
      source: 'WEB',
      question: '公司年假有几天？',
      answer: '资料中没有找到相关信息。',
      sourceChunks: [],
      model: 'retrieval-only',
      promptTokens: 0,
      completionTokens: 0
    });
    expect(result).toEqual({
      answer: '资料中没有找到相关信息。',
      sources: [],
      usage: {
        model: 'retrieval-only',
        promptTokens: 0,
        completionTokens: 0
      }
    });
  });

  it('lists chat logs only for the current company', async () => {
    chatRepository.findManyByCompany.mockResolvedValue([
      {
        id: 'chat-log-1',
        companyId: currentUser.companyId,
        userId: currentUser.id,
        source: 'WEB',
        question: 'Q',
        answer: 'A',
        sourceChunks: [],
        model: 'deepseek-chat',
        promptTokens: 10,
        completionTokens: 5,
        createdAt: new Date('2026-06-11T00:00:00.000Z')
      }
    ]);

    const result = await service.getLogs(currentUser.companyId);

    expect(chatRepository.findManyByCompany).toHaveBeenCalledWith(
      currentUser.companyId
    );
    expect(result.logs).toHaveLength(1);
  });
});
