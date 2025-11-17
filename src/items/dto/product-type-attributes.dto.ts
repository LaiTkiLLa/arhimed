import { ProductFieldTypes } from '../../common/enums/products.enum';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributes {
  @IsString()
  @ApiProperty({
    example: 'Подъемный',
    description: 'Наименование атрибута',
    required: true,
    type: String,
    nullable: false
  })
  title: string;

  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Поле обязательно',
    required: true,
    type: Boolean,
    nullable: false
  })
  isRequired: boolean;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Поле задизейблено',
    required: true,
    type: Boolean,
    nullable: false
  })
  isDisabled: boolean;

  @IsEnum(ProductFieldTypes)
  @ApiProperty({
    example: ProductFieldTypes.select,
    description: 'Тип поля',
    required: true,
    type: String,
    nullable: false,
    enum: ProductFieldTypes
  })
  fieldType: ProductFieldTypes;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @ApiProperty({
    description: 'Значения аттрибута',
    required: true,
    type: [String],
    nullable: false
  })
  values: string[];
}
