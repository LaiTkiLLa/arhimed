import { ArrayMinSize, IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductAttributesDto } from './product-attributes.dto';

export class CreateItemDto {
  @IsUUID('all')
  @ApiProperty({
    example: '6aeb58f9-f756-47e9-825f-67705a8ac60b',
    description: 'id типа материала',
    required: true,
    type: String,
    nullable: false
  })
  typeId: string;

  @IsString()
  @ApiProperty({
    example: 'Кран затворный ex-20',
    description: 'Наименование товара',
    required: true,
    type: String,
    nullable: false
  })
  title: string;

  @ValidateNested({
    message: 'attributes должен передаваться объектом',
    each: true
  })
  @Type(() => ProductAttributesDto)
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Свойства материлов',
    required: true,
    type: [ProductAttributesDto],
    nullable: false
  })
  attributes: ProductAttributesDto[];
}
