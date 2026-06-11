import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Updated Company' })
  @IsOptional()
  @IsString()
  name?: string;
}
