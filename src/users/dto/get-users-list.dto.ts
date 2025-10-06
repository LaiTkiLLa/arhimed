import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetUsersListDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @ApiProperty({
    example: 10,
    required: true,
    nullable: false,
    type: Number,
    description: 'Количество пользователей в ответе. Не более 50.'
  })
  limit: number;

  @Type(() => Number)
  @Min(0)
  @IsInt()
  @ApiProperty({
    required: true,
    description: 'Сколько пользователей пропустить от начала',
    example: 0,
    nullable: false,
    type: Number
  })
  offset: number;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'Фильтр по ролям',
    example: '5843f898-45e7-47a4-90b7-b3ecdf993de1',
    required: false,
    nullable: false,
    type: String
  })
  roleId: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Фильтр по статусу пользователя',
    example: true,
    required: false,
    nullable: false,
    type: Boolean
  })
  isActive: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Поиск по имени, email',
    example: 'Иванов',
    required: false,
    nullable: false,
    type: String
  })
  searchString: string;
}
