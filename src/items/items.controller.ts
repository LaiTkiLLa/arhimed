import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserParams } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { GetProductTypesResponse } from './responses/get-product-types.response';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { GetProductTypesDto } from './dto/get-product-types.dto';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Post()
  async createItem() {}

  // @Get(':id')
  // async getItem(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.itemsService.getItem(id);
  // }

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @SwaggerResponseDecorator(200, 'Ok', GetProductTypesResponse)
  @Get('product-types')
  async getProductTypes(@Query() getProductTypesDto: GetProductTypesDto) {
    return this.itemsService.getProductTypes(getProductTypesDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
    file: Express.Multer.File
  ) {
    return this.itemsService.uploadExcelWithItems(user, file);
  }
}
