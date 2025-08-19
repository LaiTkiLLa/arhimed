import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { DataSource } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductTypes } from './entities/product-types.entity';
import { GetProductTypesDto } from './dto/get-product-types.dto';

@Injectable()
export class ItemsService {
  constructor(private dataSource: DataSource) {}

  private logger: Logger = new Logger(ItemsService.name);

  async getProductTypes(getProductTypesDto: GetProductTypesDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const productTypesQueryBuilder = queryRunner.manager.createQueryBuilder(ProductTypes, 'productTypes');
      if (getProductTypesDto.withAttributes) {
        productTypesQueryBuilder.leftJoinAndSelect('productTypes.attributes', 'attributes');
      }
      const findProductTypes = await productTypesQueryBuilder.getMany();
      return findProductTypes.map(el => {
        return {
          id: el.id,
          title: el.title,
          attributes: getProductTypesDto.withAttributes
            ? el.attributes.map(i => {
                return {
                  id: i.id,
                  title: i.title
                };
              })
            : undefined
        };
      });
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог получить товар');
    } finally {
      await queryRunner.release();
    }
  }

  async getItem(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.manager.findOne(Products, {
        where: {
          id
        },
        relations: {
          type: true,
          productTypeAttributeValues: true
        }
      });
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог получить товар');
    } finally {
      await queryRunner.release();
    }
  }

  async createItem() {}

  async uploadExcelWithItems(user: JwtPayload, file: Express.Multer.File) {
    try {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Нет доступа');
      }
      const wb = read(file.buffer);
      const itemsData = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      for (const row of itemsData) {
        for (const [column, value] of Object.entries(row)) {
          console.log('col', column);
          console.log('val', value);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
