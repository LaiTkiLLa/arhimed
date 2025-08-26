import { IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssemblyDto {
  products: ProductsDto[];
}

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
