import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Alpha Company' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: 'Alpha Admin' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'admin@alpha.example' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin123456', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
