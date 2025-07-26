import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Токен из сообщения на email',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImYuYnVyb3ZAc29sYmVyLnJ1IiwiaWQiOiJlNjM4ZGUxNS0xNTVhLTQzM',
    required: true,
    nullable: false,
    type: String
  })
  token: string;
}
