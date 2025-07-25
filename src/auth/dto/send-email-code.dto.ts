import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailCodeDto {
  @IsEmail()
  @ApiProperty({
    description: 'Почта пользователя',
    example: 'user@arhimed.tech',
    required: true,
    nullable: false,
    type: String
  })
  email: string;
}
