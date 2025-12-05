import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { UserParams } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateAssemblyDto } from './dto/create-assembly.dto';
import { AssembliesService } from './assemblies.service';
import { GetAssemblyInfoResponse } from './responses/get-assembly-info.response';
import { GetAssembliesListResponse } from './responses/get-assemblies-list.response';
import { UpdateAssemblyDto } from './dto/update-assembly.dto';
import { AddProductToAssemblyDto } from './dto/add-product-to-assembly.dto';
import { UpdateProductInAssemblyDto } from './dto/update-product-in-assembly.dto';

@ApiTags('Работа со сборками')
@ApiBearerAuth()
@Controller('assemblies')
export class AssembliesController {
  constructor(private assembliesService: AssembliesService) {}

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
  @ApiBadRequestResponse({
    example: {
      message: 'Невозможно добавить более 1 привода в сборку',
      error: 'Bad Request',
      statusCode: 400
    },
    description: 'Невозможно добавить более 1 привода в сборку'
  })
  @ApiOperation({ summary: 'Создание сборки' })
  @SwaggerResponseDecorator(201, 'Created', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Post()
  async createAssembly(@UserParams() user: JwtPayload, @Body() createAssemblyDto: CreateAssemblyDto) {
    return this.assembliesService.createAssembly(user, createAssemblyDto);
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
      message: 'Товар существует в сборке',
      error: 'Conflict',
      statusCode: 409
    },
    description: 'Товар существует в сборке'
  })
  @ApiBadRequestResponse({
    example: {
      message: 'Невозможно добавить более 1 привода в сборку',
      error: 'Bad Request',
      statusCode: 400
    },
    description: 'Невозможно добавить более 1 привода в сборку'
  })
  @ApiOperation({ summary: 'Добавить товар к сборке' })
  @SwaggerResponseDecorator(201, 'Created', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Post(':assemblyId/products/')
  async addProductToAssembly(
    @UserParams() user: JwtPayload,
    @Param('assemblyId', ParseUUIDPipe) assemblyId: string,
    @Body() addProductToAssemblyDto: AddProductToAssemblyDto
  ) {
    return this.assembliesService.addProductToAssembly(user, assemblyId, addProductToAssemblyDto);
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
      message: 'Товара нет в сборке',
      error: 'Conflict',
      statusCode: 409
    },
    description: 'Товара нет в сборке'
  })
  @ApiOperation({ summary: 'Изменить товар в сборке' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Put(':assemblyId/products/:productId')
  async updateProductInAssembly(
    @UserParams() user: JwtPayload,
    @Param('assemblyId', ParseUUIDPipe) assemblyId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateProductInAssemblyDto: UpdateProductInAssemblyDto
  ) {
    return this.assembliesService.updateProductInAssembly(
      user,
      assemblyId,
      productId,
      updateProductInAssemblyDto
    );
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
  @ApiOperation({ summary: 'Удалить товар из сборки' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Delete(':assemblyId/products/:productId')
  async deleteProductFromAssembly(
    @UserParams() user: JwtPayload,
    @Param('assemblyId', ParseUUIDPipe) assemblyId: string,
    @Param('productId', ParseUUIDPipe) productId: string
  ) {
    return this.assembliesService.deleteProductFromAssembly(user, assemblyId, productId);
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
      message: 'Сборка не найдена',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Сборка не найдена'
  })
  @ApiOperation({ summary: 'Обновление сборки' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Put(':id')
  async updateAssembly(
    @Param('id', ParseUUIDPipe) id: string,
    @UserParams() user: JwtPayload,
    @Body() updateAssemblyDto: UpdateAssemblyDto
  ) {
    return this.assembliesService.updateAssembly(id, user, updateAssemblyDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiOperation({ summary: 'Получение списка сборок' })
  @SwaggerResponseDecorator(200, 'Ok', GetAssembliesListResponse)
  @Get('/list')
  //@TODO ДОБАВИТЬ ПАГИНАЦИЮ
  async getAssembliesList() {
    return this.assembliesService.getAssembliesList();
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
      message: 'Сборка не найдена',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Сборка не найдена'
  })
  @ApiOperation({ summary: 'Получение делатизации сборки' })
  @SwaggerResponseDecorator(200, 'Ok', GetAssemblyInfoResponse)
  @Get(':assemblyId')
  async getAssemblyInfo(@Param('assemblyId', ParseUUIDPipe) assemblyId: string) {
    return this.assembliesService.getAssemblyInfo(assemblyId);
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
      message: 'Сборка не найдена',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Сборка не найдена'
  })
  @ApiOperation({ summary: 'Удаление сборки' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Delete(':assemblyId')
  async deleteAssembly(
    @UserParams() user: JwtPayload,
    @Param('assemblyId', ParseUUIDPipe) assemblyId: string
  ) {
    return this.assembliesService.deleteAssembly(user, assemblyId);
  }
}
