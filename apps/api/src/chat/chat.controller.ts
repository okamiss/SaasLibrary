import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';
import { CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { AskChatDto } from './dto/ask-chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  @ApiOkResponse({ description: 'Asks the company knowledge base.' })
  ask(
    @CurrentUserDecorator() currentUser: CurrentUser,
    @Body() dto: AskChatDto
  ) {
    return this.chatService.ask(currentUser, dto);
  }

  @Get('logs')
  @ApiOkResponse({ description: 'Lists chat logs for the current company.' })
  getLogs(@CurrentCompanyId() companyId: string) {
    return this.chatService.getLogs(companyId);
  }
}
