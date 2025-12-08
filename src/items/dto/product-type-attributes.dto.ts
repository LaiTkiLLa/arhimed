import { ProductFieldTypes } from '../../common/enums/products.enum';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UpdateProductTypeAttributeValues } from './update-product-type-attribute.dto';

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

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  @ApiProperty({
    description: 'Значения аттрибута',
    required: true,
    type: [String],
    nullable: false
  })
  values: string[];
}

export class UpdateAttributes extends OmitType(CreateAttributes, ['values']) {
  @IsUUID('all')
  @ApiProperty({
    example: 'feb2b7c3-7ee5-42a7-8612-e371bd38fb3c',
    description: 'id атрибута',
    required: true,
    type: String,
    nullable: false
  })
  id: string;

  @ValidateNested({
    message: 'values должен передаваться объектом',
    each: true
  })
  @Type(() => UpdateProductTypeAttributeValues)
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Старые свойства атрибута',
    required: true,
    type: [UpdateProductTypeAttributeValues],
    nullable: false
  })
  oldValues: UpdateProductTypeAttributeValues[];

  @IsArray()
  @ArrayMinSize(0)
  @ApiProperty({
    description: 'Новые свойства атрибута',
    required: false,
    type: [String],
    nullable: false,
    example: ['F-12', 'F-15', 'F-20']
  })
  newValues: string[];
}
