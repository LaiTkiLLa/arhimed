import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
  @ApiOperation({ summary: 'Получение списка сборок' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @Get('/list')
  async getAssembliesList(
    @UserParams() user: JwtPayload,
    @Param('assemblyId', ParseUUIDPipe) assemblyId: string
  ) {
    return this.assembliesService.deleteAssembly(user, assemblyId);
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
