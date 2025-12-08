import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateAttributes } from './product-type-attributes.dto';

export class UpdateProductTypeDto {
  @IsString()
  @ApiProperty({
    example: 'Кран подъемный',
    description: 'Наименование типа',
    required: true,
    type: String,
    nullable: false
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Тип номер 2',
    description: 'Описание типа',
    required: false,
    type: String,
    nullable: true
  })
  description: string;

  // @ValidateNested({
  //   message: 'attributes должен передаваться объектом',
  //   each: true
  // })
  // @Type(() => CreateAttributes)
  // @IsArray()
  // @ArrayMinSize(0)
  // @ApiProperty({
  //   description: 'Свойства типа',
  //   required: true,
  //   type: [CreateAttributes],
  //   nullable: false
  // })
  // attributes: CreateAttributes[];
}
