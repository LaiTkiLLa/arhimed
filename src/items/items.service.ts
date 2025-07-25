import { ForbiddenException, Injectable } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class ItemsService {
  async uploadExcelWithItems(user: JwtPayload, file: Express.Multer.File) {
    try {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Нет доступа');
      }
      const wb = read(file.buffer);
      const itemsData = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      for (const row of itemsData) {
        for (const [column, value] of Object.entries(row)){
          console.log('col', column)
          console.log('val', value)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
