import { ArrayMinSize, IsArray, IsInt, IsNumber, IsPositive, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ProductsDto {
  @IsUUID('all')
  @ApiProperty({
    example: '6aeb58f9-f756-47e9-825f-67705a8ac60b',
    description: 'id продукта',
    required: true,
    type: String,
    nullable: false
  })
  id: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  @ApiProperty({
    example: 2,
    description: 'Кол-во продуктов',
    required: true,
    type: Number,
    nullable: false
  })
  quantity: number;
}

export class CreateAssemblyDto {
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
