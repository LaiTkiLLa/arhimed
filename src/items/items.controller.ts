import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserParams } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

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
