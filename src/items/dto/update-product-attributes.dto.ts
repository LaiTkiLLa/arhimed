import { UpdateProductTypeAttributeValues } from './update-product-type-attribute.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateAttributes } from './product-type-attributes.dto';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
