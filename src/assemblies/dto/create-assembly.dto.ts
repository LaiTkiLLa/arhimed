import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductsDto {
  @IsUUID('all')
  @ApiProperty({
    example: '6aeb58f9-f756-47e9-825f-67705a8ac60b',
    description: 'id продукта',
    required: true,
    type: String,
    nullable: false
  })
  id: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  @ApiProperty({
    example: 2,
    description: 'Кол-во продуктов',
    required: true,
    type: Number,
    nullable: false
  })
  quantity: number;
}

export class CreateAssemblyDto {
  @IsString()
  @ApiProperty({
    example: 'Кран затворный ex-20',
    description: 'Наименование сборки',
    required: true,
    type: String,
    nullable: false
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: 'Кран затворный ex-20',
    description: 'Артикул сборки',
    required: true,
    type: String,
    nullable: false
  })
  article: string;

  @IsString()
  @ApiProperty({
    example: 'Лучшая сборка',
    description: 'Описание сборки',
    required: true,
    type: String,
    nullable: false
  })
  description: string;

  @ValidateNested({
    each: true
  })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => ProductsDto)
  @ApiProperty({
    type: [ProductsDto],
    required: true,
    nullable: false
  })
  products: ProductsDto[];
}
