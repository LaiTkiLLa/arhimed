import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
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
}
