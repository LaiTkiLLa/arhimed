import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { cleanPhone } from '../../common/helpers/clean-phone.helper';

export class CreateUserDto {
  @Transform(cleanPhone)
  @IsPhoneNumber('RU', {})
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  phone: string;

  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  middleName: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
