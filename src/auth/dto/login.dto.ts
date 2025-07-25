import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'Почта пользователя',
    example: 'user@arhimed.tech',
    required: true,
    nullable: false,
    type: String
  })
  email: string;

  @Length(5, 5)
  @ApiProperty({
    description: 'Код из почты',
    example: '54102',
    required: true,
    nullable: false,
    type: String,
    maxLength: 5,
    minLength: 5
  })
  code: string;
}
