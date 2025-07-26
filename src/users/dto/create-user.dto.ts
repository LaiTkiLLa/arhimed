import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { cleanPhone } from '../../common/helpers/clean-phone.helper';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @Transform(cleanPhone)
  @IsPhoneNumber('RU', {})
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  @ApiProperty({
    description: 'Телефон пользователя',
    example: '+79999999999',
    required: true,
    nullable: false,
    type: String
  })
  phone: string;

  @IsEmail()
  @MaxLength(50)
  @ApiProperty({
    description: 'Почта пользователя',
    example: 'example@mail.ru',
    required: true,
    nullable: false,
    type: String
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
    required: true,
    nullable: false,
    type: String
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    required: true,
    nullable: false,
    type: String
  })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Отчество пользователя',
    example: 'Иванович',
    required: true,
    nullable: false,
    type: String
  })
  middleName: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Роль пользователя',
    example: 'f938b084-7c2c-4e5d-a50a-a3d04a8d7bfc',
    required: true,
    nullable: false,
    type: String
  })
  roleId: string;
}
