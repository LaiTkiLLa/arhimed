import { IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Products } from '../entities/products.entity';
import { GetItemsRows } from '../interfaces/get-items.interface';

export class GetProductsDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @ApiProperty({
    example: 10,
    required: true,
    nullable: false,
    type: String,
    description: 'Количество товаров в ответе. Не более 50.'
  })
  limit: number;

  @Type(() => Number)
  @Min(0)
  @IsInt()
  @ApiProperty({
    required: true,
    description: 'Сколько товаров пропустить от начала',
    example: 0,
    nullable: false,
    type: String
  })
  offset: number;

  @IsString()
  @ApiProperty({
    example: '12548624',
    description: 'Поиск товаров по артикулу или названию',
    type: String,
    required: false,
    nullable: false
  })
  @IsOptional()
  searchString: string;

  @IsString()
  @ApiProperty({
    example: 'b81dc7af-d103-4c86-b4c8-859bf0127865',
    description: 'Фильтрация по типу товара',
    type: String,
    required: false,
    nullable: false
  })
  @IsOptional()
  productTypeId: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    required: false,
    type: Object,
    example: {
      '9f79d308-01db-43ee-9e5b-27feb83fe8d9': 'F07/F10',
      '1970133a-51fc-4d44-af12-64830cbd4ce7': '70',
      '6f748b5a-c459-43cf-b618-9511ecbb8b05': ''
    },
    nullable: false,
    description: 'Фильтрация по атрибутам — значения приходят строками, не массивами'
  })
  attributes?: Record<string, string>;

  static mapModels(models: Products[]): GetItemsRows[] {
    return models.map(model => {
      return {
        id: model.id,
        article: model.article,
        type: model.type.title,
        title: model.title,
        attributes: model.productAttributeValues.map(attributeValue => {
          return {
            id: attributeValue.id,
            value: attributeValue.value,
            property: attributeValue.productAttributeProperty.title
          };
        })
      };
    });
  }
}
