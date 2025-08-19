import { IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductAttributesDto {
  @IsUUID('all')
  @ApiProperty({
    example: 'feb2b7c3-7ee5-42a7-8612-e371bd38fb3c',
    description: 'id атрибута',
    required: true,
    type: String,
    nullable: false
  })
  attributeId: string;

  @IsString()
  @MaxLength(240)
  @ApiProperty({
    example: 'F-15',
    description: 'Значение свойства',
    required: true,
    type: String,
    nullable: false
  })
  value: string;
}
