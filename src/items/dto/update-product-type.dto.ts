import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  //   message: 'newAttributes должен передаваться объектом',
  //   each: true
  // })
  // @IsOptional()
  // @Type(() => CreateAttributes)
  // @IsArray()
  // @ArrayMinSize(0)
  // @ApiProperty({
  //   description: 'Новые свойства типа',
  //   required: true,
  //   type: [CreateAttributes],
  //   nullable: false
  // })
  // newAttributes: CreateAttributes[];
  //
  // @ValidateNested({
  //   message: 'newAttributes должен передаваться объектом',
  //   each: true
  // })
  // @Type(() => UpdateAttributes)
  // @IsArray()
  // @ArrayMinSize(0)
  // @ApiProperty({
  //   description: 'Старые свойства типа',
  //   required: true,
  //   type: [UpdateAttributes],
  //   nullable: false
  // })
  // oldAttributes: UpdateAttributes[];
}
