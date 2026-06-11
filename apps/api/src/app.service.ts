import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'AI Company Assistant API',
      status: 'ok'
    };
  }
}
