import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'username должен быть string' })
  @Length(1, 50, { message: 'username длина строки от 1 до 50' })
  username: string;

  @IsString({ message: 'password должен быть string' })
  @Length(1, 50, { message: 'password длина строки от 1 до 50' })
  password: string;
}
