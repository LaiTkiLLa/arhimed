import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../../common/decorators/swagger-response.decorator';
import { GetItemsResponse } from '../../items/responses/get-items.response';
import { GetProductsDto } from '../../items/dto/get-products.dto';
import { PublicItemsService } from './public-items.service';

@ApiTags('Работа с товарами публичное')
@ApiBearerAuth()
@Controller('items')
export class PublicItemsController {
  constructor(private itemsService: PublicItemsService) {}

  @ApiOperation({ summary: 'Получение списка товаров' })
  @SwaggerResponseDecorator(200, 'Ok', GetItemsResponse)
  @Get('list')
  async getItems(@Query() getProductsDto: GetProductsDto) {
    return this.itemsService.getItems(getProductsDto);
  }
}
