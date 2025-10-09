import { IsInt, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProductToAssemblyDto {
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
