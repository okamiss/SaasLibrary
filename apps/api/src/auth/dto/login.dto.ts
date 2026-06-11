import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  companyId!: string;

  @ApiProperty({ example: 'admin@alpha.example' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin123456', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
