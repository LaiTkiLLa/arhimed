import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Products } from '../../items/entities/products.entity';
import { Brackets, DataSource } from 'typeorm';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductTypes } from '../../items/entities/product-types.entity';
import { GetProductTypeDto } from './dto/get-product-type.dto';

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

  async getProductTypes() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const productTypesQueryBuilder = queryRunner.manager.createQueryBuilder(ProductTypes, 'productTypes');
      const findProductTypes = await productTypesQueryBuilder.getMany();
      return findProductTypes.map(el => {
        return {
          id: el.id,
          title: el.title
        };
      });
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить публичный тип товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductTypeInfo(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findProductType = await queryRunner.manager
        .createQueryBuilder(ProductTypes, 'productTypes')
        .leftJoinAndSelect('productTypes.attributes', 'attributes')
        .leftJoinAndSelect('attributes.attributeValues', 'attributeValues')
        .orderBy('attributes.rank', 'ASC')
        .where('productTypes.id = :id', { id })
        .getOne();
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      return GetProductTypeDto.mapModel(findProductType);
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить публичное инфо о типе товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
