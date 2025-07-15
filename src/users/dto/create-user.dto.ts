import {
  IsInt,
  IsNotEmpty,
  IsNumber, IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  surname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  patronymic: string;

  @IsNumber()
  @Min(1)
  @IsInt()
  roleId: number;

  @IsNumber()
  @Min(1)
  @IsInt()
  @IsOptional()
  curatorId?: number
}
