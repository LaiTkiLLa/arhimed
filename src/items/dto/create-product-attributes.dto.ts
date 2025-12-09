import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttributes } from './product-type-attributes.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductAttributesDto {
  @ValidateNested({
    message: 'attributes должен передаваться объектом',
    each: true
  })
  @Type(() => CreateAttributes)
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Свойства типа',
    required: true,
    type: [CreateAttributes],
    nullable: false
  })
  attributes: CreateAttributes[];
}
