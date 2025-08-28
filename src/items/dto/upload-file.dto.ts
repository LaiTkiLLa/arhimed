import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @IsUUID('all')
  @ApiProperty({
    example: 'feb2b7c3-7ee5-42a7-8612-e371bd38fb3c',
    description: 'id типа продукта',
    required: true,
    type: String,
    nullable: false
  })
  productTypeId: string;
}
