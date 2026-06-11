import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { WecomBot, WecomBotStatus } from '@prisma/client';
import { WecomRepository } from '../repositories/wecom.repository';
import { CreateWecomBotDto } from './dto/create-wecom-bot.dto';
import { TestSendWecomBotDto } from './dto/test-send-wecom-bot.dto';
import { WecomWebhookClient } from './wecom-webhook.client';
import { WecomBotResponse, WecomWebhookPayload } from './wecom.types';

const DEFAULT_TEST_MESSAGE =
  '**AI Company Assistant** test message from your dashboard.';

@Injectable()
export class WecomService {
  constructor(
    private readonly wecomRepository: WecomRepository,
    private readonly wecomWebhookClient: WecomWebhookClient
  ) {}

  async create(companyId: string, dto: CreateWecomBotDto) {
    const webhookUrl = this.normalizeWebhookUrl(dto.webhookUrl);

    const bot = await this.wecomRepository.create({
      companyId,
      name: dto.name.trim(),
      webhookUrl,
      secret: dto.secret?.trim() || null
    });

    return {
      bot: this.toResponse(bot)
    };
  }

  async findMany(companyId: string) {
    const bots = await this.wecomRepository.findManyByCompany(companyId);

    return {
      bots: bots.map((bot) => this.toResponse(bot))
    };
  }

  async delete(companyId: string, id: string) {
    await this.getOwnedBot(companyId, id);
    await this.wecomRepository.deleteByCompanyAndId(companyId, id);

    return {
      deleted: true,
      id
    };
  }

  async testSend(companyId: string, id: string, dto: TestSendWecomBotDto) {
    const bot = await this.getOwnedBot(companyId, id);
    const payload = this.buildPayload(dto);

    try {
      await this.wecomWebhookClient.send(bot.webhookUrl, payload);
    } catch (error) {
      throw new BadGatewayException(this.toDeliveryFailureMessage(error));
    }

    return {
      sent: true,
      id
    };
  }

  private async getOwnedBot(companyId: string, id: string) {
    const bot = await this.wecomRepository.findByCompanyAndId(companyId, id);
    if (!bot) {
      throw new NotFoundException('WeCom bot not found');
    }

    return bot;
  }

  private buildPayload(dto: TestSendWecomBotDto): WecomWebhookPayload {
    const msgtype = dto.msgtype ?? 'markdown';
    const content = dto.content?.trim() || DEFAULT_TEST_MESSAGE;

    if (msgtype === 'text') {
      return {
        msgtype,
        text: {
          content
        }
      };
    }

    return {
      msgtype: 'markdown',
      markdown: {
        content
      }
    };
  }

  private normalizeWebhookUrl(rawWebhookUrl: string) {
    const webhookUrl = rawWebhookUrl.trim();

    try {
      const parsed = new URL(webhookUrl);
      const isWecomWebhook =
        parsed.protocol === 'https:' &&
        parsed.hostname === 'qyapi.weixin.qq.com' &&
        parsed.pathname === '/cgi-bin/webhook/send' &&
        Boolean(parsed.searchParams.get('key'));

      if (!isWecomWebhook) {
        throw new Error('Invalid WeCom webhook URL');
      }
    } catch {
      throw new BadRequestException(
        'Webhook URL must be an enterprise WeCom bot URL like https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...'
      );
    }

    return webhookUrl;
  }

  private toDeliveryFailureMessage(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return `WeCom test send failed: ${message}`;
  }

  private toResponse(bot: WecomBot): WecomBotResponse {
    return {
      ...bot,
      status: bot.status.toLowerCase() as Lowercase<WecomBotStatus>
    };
  }
}
