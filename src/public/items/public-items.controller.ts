import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../../common/decorators/swagger-response.decorator';
import { PublicItemsService } from './public-items.service';
import { GetProductsDto } from './dto/get-products.dto';
import { GetItemsResponse } from './responses/get-items.response';
import { GetProductTypeInfoResponse } from '../../items/responses/get-product-type-info.response';
import { GetProductTypesResponse } from './responses/get-product-types.response';
import { GetProductPropertiesResponse } from '../../items/responses/get-product-properties.response';
import { GetProductTypePropertiesDto } from '../../items/dto/get-product-type-properties.dto';

@ApiTags('Работа с товарами (публичное)')
@ApiBearerAuth()
@Controller('public/items')
export class PublicItemsController {
  constructor(private itemsService: PublicItemsService) {}

  @ApiOperation({ summary: 'Получение списка товаров' })
  @SwaggerResponseDecorator(200, 'Ok', GetItemsResponse)
  @Get('list')
  async getItems(@Query() getProductsDto: GetProductsDto) {
    return this.itemsService.getItems(getProductsDto);
  }

  @ApiOperation({ summary: 'Получение данных о типах товаров' })
  @SwaggerResponseDecorator(200, 'Ok', GetProductTypesResponse)
  @Get('product-types')
  async getProductTypes() {
    return this.itemsService.getProductTypes();
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Тип товара не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Тип товара не найден'
  })
  @ApiOperation({ summary: 'Получение данных о типе товара' })
  @SwaggerResponseDecorator(200, 'Ok', GetProductTypeInfoResponse)
  @Get('product-type/:id')
  async getProductTypeInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.getProductTypeInfo(id);
  }

  @ApiOperation({ summary: 'Получение списка свойств товаров по уже выбранным' })
  @SwaggerResponseDecorator(200, 'Ok', GetProductPropertiesResponse)
  @ApiNotFoundResponse({
    example: {
      message: 'Тип товара не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Тип товара не найден'
  })
  @Get('product-type/:productTypeId/properties')
  async getMaterialPropertiesV2(
    @Param('productTypeId', ParseUUIDPipe) productTypeId: string,
    @Query() getMaterialPropertiesDto: GetProductTypePropertiesDto
  ) {
    return this.itemsService.getProductPropertiesWeb(productTypeId, getMaterialPropertiesDto);
  }
}
