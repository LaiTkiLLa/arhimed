import { ArrayMinSize, IsArray, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductsDto } from './create-assembly.dto';

export class UpdateAssemblyDto {
  @IsString()
  @ApiProperty({
    example: 'Кран затворный ex-20',
    description: 'Наименование сборки',
    required: true,
    type: String,
    nullable: false
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: 'Кран затворный ex-20',
    description: 'Артикул сборки',
    required: true,
    type: String,
    nullable: false
  })
  article: string;

  @ValidateNested({
    each: true
  })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => ProductsDto)
  @ApiProperty({
    type: [ProductsDto],
    required: true,
    nullable: false
  })
  products: ProductsDto[];
}
