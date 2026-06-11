import { BadRequestException, BadGatewayException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { WecomRepository } from '../repositories/wecom.repository';
import { WecomService } from './wecom.service';
import { WecomWebhookClient } from './wecom-webhook.client';

function createService() {
  const repository = {
    create: vi.fn(),
    findManyByCompany: vi.fn(),
    findByCompanyAndId: vi.fn(),
    deleteByCompanyAndId: vi.fn()
  } as unknown as WecomRepository;
  const webhookClient = {
    send: vi.fn()
  } as unknown as WecomWebhookClient;

  return {
    service: new WecomService(repository, webhookClient),
    repository,
    webhookClient
  };
}

describe('WecomService', () => {
  it('rejects webhook URLs that are not enterprise WeCom bot webhooks', async () => {
    const { service } = createService();

    await expect(
      service.create('company-1', {
        name: 'Ops Bot',
        webhookUrl: 'https://example.com/webhook'
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a bot with the current company id after validating the webhook URL', async () => {
    const { service, repository } = createService();
    vi.mocked(repository.create).mockResolvedValue({
      id: 'bot-1',
      companyId: 'company-1',
      name: 'Ops Bot',
      webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc',
      secret: null,
      status: 'ACTIVE',
      createdAt: new Date('2026-06-11T00:00:00.000Z'),
      updatedAt: new Date('2026-06-11T00:00:00.000Z')
    });

    await service.create('company-1', {
      name: 'Ops Bot',
      webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc'
    });

    expect(repository.create).toHaveBeenCalledWith({
      companyId: 'company-1',
      name: 'Ops Bot',
      webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc',
      secret: null
    });
  });

  it('sends markdown test messages to the owned bot webhook', async () => {
    const { service, repository, webhookClient } = createService();
    vi.mocked(repository.findByCompanyAndId).mockResolvedValue({
      id: 'bot-1',
      companyId: 'company-1',
      name: 'Ops Bot',
      webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc',
      secret: null,
      status: 'ACTIVE',
      createdAt: new Date('2026-06-11T00:00:00.000Z'),
      updatedAt: new Date('2026-06-11T00:00:00.000Z')
    });

    await service.testSend('company-1', 'bot-1', {
      msgtype: 'markdown',
      content: '**AI Company Assistant** test'
    });

    expect(repository.findByCompanyAndId).toHaveBeenCalledWith('company-1', 'bot-1');
    expect(webhookClient.send).toHaveBeenCalledWith(
      'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc',
      {
        msgtype: 'markdown',
        markdown: {
          content: '**AI Company Assistant** test'
        }
      }
    );
  });

  it('converts webhook delivery failures to a clear gateway error', async () => {
    const { service, repository, webhookClient } = createService();
    vi.mocked(repository.findByCompanyAndId).mockResolvedValue({
      id: 'bot-1',
      companyId: 'company-1',
      name: 'Ops Bot',
      webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc',
      secret: null,
      status: 'ACTIVE',
      createdAt: new Date('2026-06-11T00:00:00.000Z'),
      updatedAt: new Date('2026-06-11T00:00:00.000Z')
    });
    vi.mocked(webhookClient.send).mockRejectedValue(new Error('invalid webhook key'));

    await expect(
      service.testSend('company-1', 'bot-1', {
        msgtype: 'text',
        content: 'hello'
      })
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
