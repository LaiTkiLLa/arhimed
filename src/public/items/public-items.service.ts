import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Products } from '../../items/entities/products.entity';
import { Brackets, DataSource, IsNull } from 'typeorm';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductTypes } from '../../items/entities/product-types.entity';
import { GetProductTypeDto } from './dto/get-product-type.dto';
import { GetProductTypePropertiesDto } from '../../items/dto/get-product-type-properties.dto';
import { GetProductProperties } from '../../items/interfaces/get-product-properties.interface';
import { ProductAttributes } from '../../items/entities/product-attributes.entity';
import { ProductFieldTypes } from '../../common/enums/products.enum';

@Injectable()
export class PublicItemsService {
  constructor(private dataSource: DataSource) {}

  private logger: Logger = new Logger(PublicItemsService.name);

  async getItems(getProductsDto: GetProductsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      if (getProductsDto.productTypeId) {
        const findProductType = await queryRunner.manager.findOne(ProductTypes, {
          where: { id: getProductsDto.productTypeId, deletedAt: IsNull(), deletedByAdminAt: IsNull() }
        });
        if (!findProductType) {
          throw new NotFoundException('Тип товара не найден');
        }
      }
      const filteredIdsQuery = queryRunner.manager
        .createQueryBuilder(Products, 'products')
        .select('products.id')
        .leftJoin('products.type', 'type', 'type.deletedByAdminAt IS NULL')
        .leftJoin('products.productAttributeValues', 'pav', 'pav.deletedAt IS NULL')
        .leftJoin('pav.productAttributeProperty', 'pap', 'pap.deletedAt IS NULL')
        .where('1 = 1')
        .andWhere('products.deletedAt IS NULL');

      if (getProductsDto.attributes && getProductsDto.attributes.length > 0) {
        const attributes = getProductsDto.attributes;

        const groupedAttrs = attributes.reduce(
          (acc, attr) => {
            if (!acc[attr.title]) acc[attr.title] = [];
            acc[attr.title].push(attr.value);
            return acc;
          },
          {} as Record<string, string[]>
        );

        const uniqueTitleCount = Object.keys(groupedAttrs).length;
        const allParams: Record<string, string> = {};

        const orClauses = Object.entries(groupedAttrs).map(([title, values], titleIndex) => {
          const titleKey = `title${titleIndex}`;
          allParams[titleKey] = title;

          const valueClauses = values.map((value, valueIndex) => {
            const key = `val${titleIndex}_${valueIndex}`;
            allParams[key] = value;
            return `pav.value = :${key}`;
          });

          return `(pap.title = :${titleKey} AND (${valueClauses.join(' OR ')}))`;
        });

        filteredIdsQuery.andWhere(`(${orClauses.join(' OR ')})`, allParams);

        filteredIdsQuery.groupBy('products.id');
        filteredIdsQuery.having('COUNT(DISTINCT pap.title) = :attrCount', {
          attrCount: uniqueTitleCount
        });
      }

      if (getProductsDto.productTypeId) {
        filteredIdsQuery.andWhere('products.typeId = :typeId', { typeId: getProductsDto.productTypeId });
      }

      if (getProductsDto.searchString) {
        const searchString = `%${getProductsDto.searchString}%`;
        filteredIdsQuery.andWhere(
          new Brackets(qb => {
            qb.where('products.title ILIKE :searchString', { searchString }).orWhere(
              'products.article ILIKE :searchString',
              { searchString }
            );
          })
        );
      }

      const filteredIds = await filteredIdsQuery.getRawMany();
      const productIds = filteredIds.map(f => f.products_id);
      const findItems = await queryRunner.manager
        .createQueryBuilder(Products, 'products')
        .innerJoinAndSelect(
          'products.type',
          'type',
          'type.deletedAt IS NULL AND type.deletedByAdminAt IS NULL'
        )
        .innerJoinAndSelect(
          'products.productAttributeValues',
          'productAttributeValues',
          'productAttributeValues.deletedAt IS NULL'
        )
        .innerJoinAndSelect(
          'productAttributeValues.productAttributeProperty',
          'productAttributeProperty',
          'productAttributeProperty.deletedAt IS NULL'
        )
        .whereInIds(productIds)
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

  async getProductPropertiesWeb(
    productTypeId: string,
    getMaterialPropertiesDto: GetProductTypePropertiesDto
  ): Promise<GetProductProperties[]> {
    let { attributes } = getMaterialPropertiesDto;
    if (!attributes) attributes = [];
    attributes = attributes.filter(prop => prop.title && prop.value);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const getItems = await queryRunner.manager
        .createQueryBuilder(Products, 'products')
        .leftJoinAndSelect('products.type', 'type')
        .leftJoinAndSelect(
          'products.productAttributeValues',
          'productAttributeValues',
          'productAttributeValues.deletedAt IS NULL'
        )
        .leftJoinAndSelect(
          'productAttributeValues.productAttributeProperty',
          'productAttributeProperty',
          'productAttributeProperty.deletedAt IS NULL'
        )
        .where('type.id = :productTypeId', { productTypeId: productTypeId })
        .andWhere('products.deletedAt IS NULL')
        .andWhere('type.deletedByAdminAt IS NULL')
        .getMany();

      // тут мы фильтруем материалы по полям
      const filteredProducts = getItems.filter(item =>
        attributes.every(prop => {
          return item.productAttributeValues.find(
            pav => prop.value == pav.value && pav.productAttributeProperty.title == prop.title
          );
        })
      );

      const findProductTypeProps = await queryRunner.manager
        .createQueryBuilder(ProductAttributes, 'productAttributes')
        .andWhere('productAttributes.typeId = :productTypeId', { productTypeId })
        .orderBy('productAttributes.rank', 'ASC')
        .getMany();
      //
      const res = [];
      findProductTypeProps.forEach(productAttr => {
        // Сценарий если поле уже заполнено
        let uniqueValues: string[];

        const isPropertyGetted: boolean = attributes.some(ifProp => {
          if (ifProp.title == productAttr.title) return true;
          return false;
        });

        if (!isPropertyGetted) {
          uniqueValues = Array.from(
            new Set(
              filteredProducts.flatMap(product =>
                product.productAttributeValues
                  .filter(pav => pav.productAttributePropertyId === productAttr.id)
                  .sort((a, b) => a.productAttributeProperty.rank - b.productAttributeProperty.rank)
                  .map(mtpv => mtpv.value)
                  .filter(value => value !== '')
              )
            )
          ).sort(this.smartComparator);

          res.push({
            id: productAttr.id,
            title: productAttr.title,
            isRequired: productAttr.isRequired,
            isDisabled: productAttr.isDisabled,
            fieldType: ProductFieldTypes.select,
            properties: uniqueValues.map(value => ({
              value,
              label: value
            })),
            value: null
          });
        }
      });
      return res;
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не удалось получить свойства товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  smartComparator(a, b) {
    const partsA = a.match(/([^\d]+|\d+)/g) || [];
    const partsB = b.match(/([^\d]+|\d+)/g) || [];

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || '';
      const partB = partsB[i] || '';

      if (!isNaN(partA) && !isNaN(partB)) {
        const numA = parseInt(partA, 10);
        const numB = parseInt(partB, 10);
        if (numA !== numB) return numA - numB;
      } else if (partA !== partB) {
        return partA.localeCompare(partB, 'ru', { sensitivity: 'base' });
      }
    }

    return 0;
  }

  async getProductTypes() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findProductTypes = await queryRunner.manager
        .createQueryBuilder(ProductTypes, 'productTypes')
        .where('productTypes.deletedAt IS NULL')
        .getMany();
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
