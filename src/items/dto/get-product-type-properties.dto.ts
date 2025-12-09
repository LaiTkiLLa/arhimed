import { ArrayMinSize, IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Properties } from './get-products.dto';

export class GetProductTypePropertiesDto {
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  @IsArray({ message: 'attributes должен быть массивом объектов' })
  @ArrayMinSize(1, { message: 'Массив attributes не может быть пустым' })
  @ApiProperty({
    example: '[{"title":"color","value":"red"},{"title":"size","value":"M"}]',
    description: 'Сериализованный в JSON массив объектов Properties',
    required: false,
    nullable: false,
    type: [Properties]
  })
  @IsOptional()
  attributes: Properties[];
}
