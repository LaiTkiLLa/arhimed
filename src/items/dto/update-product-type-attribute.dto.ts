import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttributes } from './product-type-attributes.dto';

export class UpdateProductTypeAttributeValues {
  @IsUUID('all')
  @ApiProperty({
    example: 'feb2b7c3-7ee5-42a7-8612-e371bd38fb3c',
    description: 'id атрибута',
    required: true,
    type: String,
    nullable: false
  })
  id: string;

  @IsString()
  @MaxLength(240)
  @ApiProperty({
    example: 'F-15',
    description: 'Значение свойства',
    required: true,
    type: String,
    nullable: false
  })
  value: string;
}

export class UpdateProductTypeAttributeDto extends PartialType(OmitType(CreateAttributes, ['values'])) {
  @ValidateNested({
    message: 'values должен передаваться объектом',
    each: true
  })
  @Type(() => UpdateProductTypeAttributeValues)
  @IsArray()
  @ArrayMinSize(0)
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
