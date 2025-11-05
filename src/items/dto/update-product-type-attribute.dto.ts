import { CreateAttributes } from './product-type-attributes.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ProductAttributesDto } from './product-attributes.dto';
import { Type } from 'class-transformer';

export class UpdateProductTypeAttributeDto extends OmitType(CreateAttributes, ['values']) {
  @ValidateNested({
    message: 'values должен передаваться объектом',
    each: true
  })
  @Type(() => ProductAttributesDto)
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Свойства атрибута',
    required: true,
    type: [ProductAttributesDto],
    nullable: false
  })
  values: ProductAttributesDto[];
}
