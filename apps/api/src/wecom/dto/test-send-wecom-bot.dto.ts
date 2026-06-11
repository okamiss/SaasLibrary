import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export type WecomMessageType = 'text' | 'markdown';

export class TestSendWecomBotDto {
  @ApiPropertyOptional({ enum: ['text', 'markdown'], default: 'markdown' })
  @IsOptional()
  @IsIn(['text', 'markdown'])
  msgtype?: WecomMessageType;

  @ApiPropertyOptional({
    example: '**AI Company Assistant** test message from your dashboard.'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
