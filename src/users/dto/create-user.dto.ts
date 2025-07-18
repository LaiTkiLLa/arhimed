import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateUserDto {
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
  lastname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  middleName: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
