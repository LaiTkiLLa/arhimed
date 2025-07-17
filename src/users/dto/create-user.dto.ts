import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  phone: string;

  @IsString()
  @IsNotEmpty()
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

  @IsNumber()
  @Min(1)
  @IsInt()
  roleId: number;

  @IsNumber()
  @Min(1)
  @IsInt()
  @IsOptional()
  curatorId?: number;
}
