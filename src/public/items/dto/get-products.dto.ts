import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Products } from '../../../items/entities/products.entity';
import { GetItemsRows } from '../interfaces/get-items.interface';

export class PublicProperties {
  @ApiProperty({
    required: true,
    description: 'Наименование фильтра',
    example: 'T окружающей среды min',
    nullable: false,
    type: String
  })
  title: string;

  @ApiProperty({
    required: true,
    description: 'Значение',
    example: '-160°C',
    nullable: false,
    type: String
  })
  value: string;
}

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
    description: 'Фильтрация по типу материала',
    type: String,
    required: false,
    nullable: false
  })
  @IsOptional()
  productTypeId: string;

  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  @IsArray({ message: 'attributes должен быть массивом объектов' })
  @ArrayMinSize(1, { message: 'Массив attributes не может быть пустым' })
  @ApiProperty({
    example: '[{"title":"color","value":"red"},{"title":"size","value":"M"}]',
    description: 'Сериализованный в JSON массив объектов PublicProperties',
    required: false,
    nullable: false,
    type: [PublicProperties]
  })
  @IsOptional()
  attributes: PublicProperties[];

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
