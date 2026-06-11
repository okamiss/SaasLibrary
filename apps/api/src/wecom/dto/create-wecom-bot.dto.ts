import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWecomBotDto {
  @ApiProperty({ example: 'Operations Bot' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({
    example: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...'
  })
  @IsString()
  @MinLength(1)
  webhookUrl!: string;

  @ApiPropertyOptional({ example: 'optional-signing-secret' })
  @IsOptional()
  @IsString()
  secret?: string;
}
