import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWecomBotDto } from './dto/create-wecom-bot.dto';
import { TestSendWecomBotDto } from './dto/test-send-wecom-bot.dto';
import { WecomService } from './wecom.service';

@ApiTags('WeCom')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wecom/bots')
export class WecomController {
  constructor(private readonly wecomService: WecomService) {}

  @Post()
  @ApiOkResponse({ description: 'Creates an enterprise WeCom bot webhook.' })
  create(
    @CurrentCompanyId() companyId: string,
    @Body() dto: CreateWecomBotDto
  ) {
    return this.wecomService.create(companyId, dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lists WeCom bot webhooks for the current company.' })
  findMany(@CurrentCompanyId() companyId: string) {
    return this.wecomService.findMany(companyId);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Deletes a WeCom bot webhook.' })
  delete(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.wecomService.delete(companyId, id);
  }

  @Post(':id/test-send')
  @ApiOkResponse({ description: 'Sends a test message through a WeCom bot webhook.' })
  testSend(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: TestSendWecomBotDto
  ) {
    return this.wecomService.testSend(companyId, id, dto);
  }
}
