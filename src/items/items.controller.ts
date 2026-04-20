import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserParams } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { GetProductTypesResponse } from './responses/get-product-types.response';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { GetProductTypesDto } from './dto/get-product-types.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { GetItemResponse } from './responses/get-item.response';
import { UploadFileDto } from './dto/upload-file.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { GetItemsResponse } from './responses/get-items.response';
import { GetProductTypeInfoResponse } from './responses/get-product-type-info.response';
import { UpdateItemDto } from './dto/update-item.dto';
import { PostProductTypeDto } from './dto/post-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { UpdateProductTypeAttributeDto } from './dto/update-product-type-attribute.dto';
import { GetProductTypePropertiesDto } from './dto/get-product-type-properties.dto';
import { GetProductPropertiesResponse } from './responses/get-product-properties.response';
import { CreateProductAttributesDto } from './dto/create-product-attributes.dto';

@ApiTags('Работа с товарами')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Не удалось найти тип продукта',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Не удалось найти тип продукта'
  })
  @ApiBadRequestResponse({
    example: {
      message: 'Не совпадают атрибуты доступные товару',
      error: 'Bad Request',
      statusCode: 400
    },
    description: 'Не совпадают атрибуты доступные товару'
  })
  @ApiOperation({ summary: 'Создание товара' })
  @SwaggerResponseDecorator(201, 'Created', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Post()
  async createItem(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.createItemFromWeb(createItemDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Не удалось найти тип продукта',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Не удалось найти тип продукта'
  })
  @ApiBadRequestResponse({
    example: {
      message: 'Не совпадают атрибуты доступные товару',
      error: 'Bad Request',
      statusCode: 400
    },
    description: 'Не совпадают атрибуты доступные товару'
  })
  @ApiOperation({ summary: 'Редактирование товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Put(':id')
  async updateItemFromWeb(@Param('id', ParseUUIDPipe) id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.updateItemFromWeb(id, updateItemDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Товар не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Товар не найден'
  })
  @ApiConflictResponse({
    example: {
      message: 'Товар невозможно удалить, он участвует в сборке',
      error: 'Conflict',
      statusCode: 409
    },
    description: 'Товар невозможно удалить, он участвует в сборке'
  })
  @ApiOperation({ summary: 'Удаление товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Delete(':id')
  async deleteItem(@UserParams() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.deleteItem(user, id);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @ApiOperation({ summary: 'Получение данных о типах товаров' })
  @SwaggerResponseDecorator(200, 'Ok', GetProductTypesResponse)
  @Get('product-types')
  async getProductTypes(@Query() getProductTypesDto: GetProductTypesDto) {
    return this.itemsService.getProductTypes(getProductTypesDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @ApiOperation({ summary: 'Создание типа товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Post('product-types')
  async postProductTypes(@Body() postProductTypeDto: PostProductTypeDto) {
    return this.itemsService.postProductTypes(postProductTypeDto);
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
      message: 'Товар не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Товар не найден'
  })
  @ApiOperation({ summary: 'Изменить данные по типу товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Put('product-types/:id')
  async updateProductTypes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductTypeDto: UpdateProductTypeDto
  ) {
    return this.itemsService.updateProductTypes(id, updateProductTypeDto);
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
  @ApiOperation({ summary: 'Удалить тип товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Delete('product-types/:productId')
  async deleteProductTypes(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.itemsService.deleteProductType(productId);
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
  @ApiOperation({ summary: 'Восстановить тип товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Post('product-types/:productId/restore')
  async restoreProductTypes(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.itemsService.restoreProductTypes(productId);
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
  @ApiOperation({ summary: 'Удалить характеристику у типа товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Delete('product-types/:productId/attributes/:attributeId')
  async deleteProductTypeAttribute(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('attributeId', ParseUUIDPipe) attributeId: string
  ) {
    return this.itemsService.deleteProductTypeAttribute(productId, attributeId);
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
  @ApiOperation({ summary: 'Изменить характеристику у типа товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Put('product-types/:productId/attributes/:attributeId')
  async updateProductTypeAttribute(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Body() updateProductTypeAttributeDto: UpdateProductTypeAttributeDto
  ) {
    return this.itemsService.updateProductTypeAttribute(
      productId,
      attributeId,
      updateProductTypeAttributeDto
    );
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
  @ApiOperation({ summary: 'Добавить характеристику к типу товара' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Post('product-types/:productId/attributes/')
  async addProductTypeAttribute(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createProductAttributesDto: CreateProductAttributesDto
  ) {
    return this.itemsService.addProductTypeAttribute(productId, createProductAttributesDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiOperation({ summary: 'Получение списка товаров' })
  @SwaggerResponseDecorator(200, 'Ok', GetItemsResponse)
  @Get('list')
  async getItems(@Query() getProductsDto: GetProductsDto) {
    return this.itemsService.getItems(getProductsDto);
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

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Товар не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Товар не найден'
  })
  @ApiOperation({ summary: 'Получение данных о товаре' })
  @SwaggerResponseDecorator(200, 'Ok', GetItemResponse)
  @Get(':id')
  async getItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.getItem(id);
  }

  @ApiNotFoundResponse({
    example: {
      message: 'Тип товара не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Тип товара не найден'
  })
  @ApiOperation({ summary: 'Загрузка файла с товарами' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      nullable: false,
      required: ['productTypeId', 'file'],
      properties: {
        productTypeId: {
          type: 'string',
          nullable: false,
          description: 'id типа товара',
          example: '6aeb58f9-f756-47e9-825f-67705a8ac60b'
        },
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Прикрепляемый файл. Максимальный размер файла - 10 МБ. Допускается загрузка только одного файла.'
        }
      }
    }
  })
  @SwaggerResponseDecorator(201, 'Created', { success: true })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10_485_760 } }))
  async uploadExcelWithItems(
    @UserParams() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({
          //   maxSize: 10_000
          // }),
          // new FileTypeValidator({
          //   fileType: 'xlsx'
          // })
        ],
        fileIsRequired: true
      })
    )
    file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto
  ) {
    return this.itemsService.uploadExcelWithItems(user, file, uploadFileDto);
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
  @Get('product-types/:id')
  async getProductTypeInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.getProductTypeInfo(id);
  }
}
