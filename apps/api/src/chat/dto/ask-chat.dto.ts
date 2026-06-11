import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question!: string;
}
