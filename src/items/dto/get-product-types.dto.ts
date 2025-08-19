import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetProductTypesDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'withDriverLicense тип данных boolean' })
  @ApiProperty({
    description: 'Вернуть характеристики',
    example: true,
    required: false,
    nullable: false,
    type: Boolean
  })
  withAttributes: boolean;
}
