import { Injectable, Logger } from '@nestjs/common';
import { Products } from '../../items/entities/products.entity';
import { Brackets, DataSource } from 'typeorm';
import { GetProductsDto } from '../../items/dto/get-products.dto';

@Injectable()
export class PublicItemsService {
  constructor(private dataSource: DataSource) {}

  private logger: Logger = new Logger(PublicItemsService.name);

  async getItems(getProductsDto: GetProductsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const queryBuilder = queryRunner.manager
        .createQueryBuilder(Products, 'products')
        .leftJoinAndSelect('products.type', 'type')
        .leftJoinAndSelect('products.productAttributeValues', 'productAttributeValues')
        .leftJoinAndSelect('productAttributeValues.productAttributeProperty', 'productAttributeProperty');
      if (getProductsDto.searchString) {
        const searchString = `%${getProductsDto.searchString}%`;
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('products.article ILIKE :searchString', { searchString }).orWhere(
              'products.title ILIKE :searchString',
              {
                searchString
              }
            );
          })
        );
      }
      if (getProductsDto.typeId) {
        queryBuilder.andWhere('products.typeId = :typeId', { typeId: getProductsDto.typeId });
      }
      const findItems = await queryBuilder
        .orderBy('products.id', 'DESC')
        .skip(getProductsDto.offset)
        .take(getProductsDto.limit)
        .getManyAndCount();
      const mappedProducts = GetProductsDto.mapModels(findItems[0]);
      return { count: findItems[1], rows: mappedProducts };
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить публичный список товаров');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
