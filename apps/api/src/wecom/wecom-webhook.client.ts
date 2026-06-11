import { BadGatewayException, Injectable } from '@nestjs/common';
import { WecomWebhookPayload, WecomWebhookResult } from './wecom.types';

@Injectable()
export class WecomWebhookClient {
  async send(webhookUrl: string, payload: WecomWebhookPayload) {
    let response: Response;

    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      throw new BadGatewayException(
        `WeCom webhook request failed: ${this.toErrorMessage(error)}`
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `WeCom webhook request failed: ${response.status} ${response.statusText}`
      );
    }

    const body = (await response.json()) as WecomWebhookResult;
    if (body.errcode !== 0) {
      throw new BadGatewayException(
        `WeCom webhook rejected the message: ${body.errmsg ?? body.errcode}`
      );
    }

    return body;
  }

  private toErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
