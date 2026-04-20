import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { read, utils } from 'xlsx';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Brackets, DataSource, IsNull, QueryRunner } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductTypes } from './entities/product-types.entity';
import { GetProductTypesDto } from './dto/get-product-types.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { ProductAttributesValues } from './entities/product-attributes-values.entity';
import { GetProductDto } from './dto/get-product.dto';
import { LoggerService } from '../logger/logger.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { CheckAttributesByTitle } from './interfaces/check-attributes-by-title.interface';
import { GetProductsDto } from './dto/get-products.dto';
import { GetProductTypeDto } from './dto/get-product-type.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PostProductTypeDto } from './dto/post-product-type.dto';
import { ProductAttributes } from './entities/product-attributes.entity';
import { AttributeValues } from './entities/attribute-values.entity';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { UpdateProductTypeAttributeDto } from './dto/update-product-type-attribute.dto';
import { ProductFieldTypes } from '../common/enums/products.enum';
import { ProductsAssemblies } from '../assemblies/entities/products-assemblies.entity';
import { GetProductTypePropertiesDto } from './dto/get-product-type-properties.dto';
import { GetProductProperties } from './interfaces/get-product-properties.interface';
import { CreateProductAttributesDto } from './dto/create-product-attributes.dto';

@Injectable()
export class ItemsService {
  constructor(
    private dataSource: DataSource,
    private loggerService: LoggerService
  ) {}

  private logger: Logger = new Logger(ItemsService.name);

  async getProductTypes(getProductTypesDto: GetProductTypesDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const productTypesQueryBuilder = queryRunner.manager.createQueryBuilder(ProductTypes, 'productTypes');
      if (getProductTypesDto.withAttributes) {
        productTypesQueryBuilder.leftJoinAndSelect(
          'productTypes.attributes',
          'attributes',
          'attributes.deletedAt IS NULL'
        );
      }
      const findProductTypes = await productTypesQueryBuilder
        .where('productTypes.deletedAt IS NULL')
        .getMany();
      return findProductTypes.map(el => {
        return {
          id: el.id,
          title: el.title,
          markedForDeletion: el.deletedByAdminAt ? true : false,
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
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить тип товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async postProductTypes(postProductTypeDto: PostProductTypeDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const lastRank = await queryRunner.manager.count(ProductTypes, {
        where: {
          deletedAt: IsNull()
        }
      });
      const createProductType = queryRunner.manager.create(ProductTypes, {
        title: postProductTypeDto.title,
        description: postProductTypeDto.description,
        rank: lastRank + 1
      });
      await queryRunner.manager.save(ProductTypes, createProductType);
      let rank = 1;
      for (const attribute of postProductTypeDto.attributes) {
        const createAttribute = queryRunner.manager.create(ProductAttributes, {
          title: attribute.title,
          typeId: createProductType.id,
          isRequired: attribute.isRequired,
          isDisabled: attribute.isDisabled,
          fieldType: attribute.fieldType,
          rank
        });
        //ЕСли селект, то брать все уже
        await queryRunner.manager.save(ProductAttributes, createAttribute);
        if (
          attribute.fieldType === ProductFieldTypes.select ||
          attribute.fieldType === ProductFieldTypes.slider
        ) {
          if (!attribute.values.length)
            throw new BadRequestException('Необходимо передать массив значений поля');
          for (const value of attribute.values) {
            const createValue = queryRunner.manager.create(AttributeValues, {
              value,
              attributeId: createAttribute.id
            });
            await queryRunner.manager.save(AttributeValues, createValue);
          }
        } else {
          const createValue = queryRunner.manager.create(AttributeValues, {
            value: '',
            attributeId: createAttribute.id
          });
          await queryRunner.manager.save(AttributeValues, createValue);
        }
        rank++;
      }
      await queryRunner.commitTransaction();
      return {
        id: createProductType.id
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать тип товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProductTypes(id: string, updateProductTypeDto: UpdateProductTypeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager.findOne(ProductTypes, {
        where: {
          id,
          deletedAt: IsNull()
        }
      });
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      await queryRunner.manager.update(
        ProductTypes,
        { id },
        {
          title: updateProductTypeDto.title,
          description: updateProductTypeDto.description
        }
      );
      await queryRunner.commitTransaction();
      return {
        id
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать тип товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProductType(productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager
        .createQueryBuilder(ProductTypes, 'productTypes')
        // .leftJoinAndSelect('productTypes.attributes', 'attributes', 'attributes.deletedAt IS NULL')
        // .leftJoinAndSelect('productTypes.products', 'products', 'products.deletedAt is NULL')
        .where('productTypes.id = :id', { id: productId })
        .andWhere('productTypes.deletedAt IS NULL')
        .getOne();
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      if (findProductType.deletedByAdminAt) {
        throw new BadRequestException(['Тип товара уже помечен на удаление']);
      }
      // if (findProductType.products.length) {
      //   throw new NotFoundException('Невозможно удалить тип товара, т.к. по нему созданы товары');
      // }
      await queryRunner.manager.update(ProductTypes, findProductType.id, { deletedByAdminAt: new Date() });
      // for (const attribute of findProductType.attributes) {
      // await queryRunner.manager.update(ProductAttributes, attribute.id, { deletedAt: new Date() });
      // await queryRunner.manager.update(
      //   AttributeValues,
      //   { attributeId: attribute.id },
      //   { deletedAt: new Date() }
      // );
      // }
      await queryRunner.commitTransaction();
      return { id: productId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог удалить тип товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async restoreProductTypes(productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager
        .createQueryBuilder(ProductTypes, 'productTypes')
        // .leftJoinAndSelect('productTypes.attributes', 'attributes', 'attributes.deletedAt IS NULL')
        // .leftJoinAndSelect('productTypes.products', 'products', 'products.deletedAt is NULL')
        .where('productTypes.id = :id', { id: productId })
        .andWhere('productTypes.deletedAt IS NULL')
        .getOne();
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      if (!findProductType.deletedByAdminAt) {
        throw new BadRequestException(['Тип товара еще не помечен на удаление']);
      }
      await queryRunner.manager.update(ProductTypes, findProductType.id, { deletedByAdminAt: null });
      await queryRunner.commitTransaction();
      return { id: productId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог удалить тип товара');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProductTypeAttribute(productId: string, attributeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager.findOne(ProductTypes, {
        where: {
          id: productId,
          deletedAt: IsNull()
        }
      });
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      const findProductAttribute = await queryRunner.manager.findOne(ProductAttributes, {
        where: {
          id: attributeId,
          typeId: productId,
          deletedAt: IsNull()
        },
        relations: {
          productAttributeValues: true
        }
      });
      if (!findProductAttribute) {
        throw new NotFoundException('Характеристика не найдена');
      }
      // //@Todo делать deletedAt?
      // if (findProductAttribute.productAttributeValues.length) {
      //   throw new BadRequestException('За данной характеристикой уже закреплены товары');
      // }
      //Обновление рангов всем другим характеристикам
      const currentRank = findProductAttribute.rank;
      const allProductAttributes = await queryRunner.manager.find(ProductAttributes, {
        where: {
          typeId: productId,
          deletedAt: IsNull()
        }
      });
      if (findProductAttribute.rank !== allProductAttributes.length) {
        for (const attribute of allProductAttributes) {
          if (attribute.rank > currentRank) {
            await queryRunner.manager.update(
              ProductAttributes,
              { id: attribute.id },
              { rank: attribute.rank - 1 }
            );
          }
        }
      }
      await queryRunner.manager.update(ProductAttributes, findProductAttribute.id, { deletedAt: new Date() });
      await queryRunner.manager.update(
        AttributeValues,
        { attributeId: findProductAttribute.id },
        { deletedAt: new Date() }
      );
      await queryRunner.commitTransaction();
      return { id: attributeId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог удалить характеристику у товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProductTypeAttribute(
    productId: string,
    attributeId: string,
    updateProductTypeAttributeDto: UpdateProductTypeAttributeDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager
        .createQueryBuilder(ProductTypes, 'productTypes')
        .where('productTypes.id = :id', { id: productId })
        .andWhere('productTypes.deletedAt IS NULL')
        .getOne();
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      const findProductAttribute = await queryRunner.manager
        .createQueryBuilder(ProductAttributes, 'pa')
        .leftJoinAndSelect('pa.productAttributeValues', 'pav', 'pav.deletedAt IS NULL')
        .leftJoinAndSelect('pa.attributeValues', 'av', 'av.deletedAt IS NULL')
        .where('pa.id = :attributeId', { attributeId })
        .andWhere('pa.typeId = :productId', { productId })
        .andWhere('pa.deletedAt IS NULL')
        .getOne();

      if (!findProductAttribute) {
        throw new NotFoundException('Характеристика не найдена');
      }

      // //@Todo поправить, чтобы делать deletedAt?
      // //@TODO по сути ничего страшного не будет, если убрать эту проверку
      // //@TODO т.к. у нас value у товара сохраняется строкой, а не цепляется за id
      // if (findProductAttribute.productAttributeValues.length) {
      //   throw new BadRequestException('За данной характеристикой уже закреплены товары');
      // }

      if (
        (findProductAttribute.fieldType === ProductFieldTypes.input &&
          updateProductTypeAttributeDto.fieldType === ProductFieldTypes.textArea) ||
        (findProductAttribute.fieldType === ProductFieldTypes.textArea &&
          updateProductTypeAttributeDto.fieldType === ProductFieldTypes.input)
      ) {
        throw new BadRequestException(['Нельзя изменить тип поля']);
      }

      if (
        findProductAttribute.fieldType === ProductFieldTypes.slider &&
        updateProductTypeAttributeDto.fieldType === ProductFieldTypes.select
      ) {
        if (
          !updateProductTypeAttributeDto.oldValues.length &&
          !updateProductTypeAttributeDto.newValues.length
        ) {
          throw new BadRequestException('Нельзя остаить поле с типом select пустым');
        }
        for (const value of findProductAttribute.attributeValues) {
          const findValue = updateProductTypeAttributeDto.oldValues.find(el => el.id === value.id);
          if (findValue) {
            await queryRunner.manager.update(
              AttributeValues,
              { id: findValue.id },
              { value: findValue.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2') }
            );
            //Старым товарам заменяем значение атрибута, которому что то поменяли
            if (findValue.value !== value.value) {
              await queryRunner.manager.update(
                ProductAttributesValues,
                {
                  productAttributePropertyId: value.attributeId,
                  value: value.value
                },
                { value: findValue.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2') }
              );
            }
          } else {
            await queryRunner.manager.update(AttributeValues, { id: value.id }, { deletedAt: new Date() });
          }
        }
      } else if (
        findProductAttribute.fieldType === ProductFieldTypes.select &&
        updateProductTypeAttributeDto.fieldType === ProductFieldTypes.slider
      ) {
        if (
          !updateProductTypeAttributeDto.oldValues.length &&
          !updateProductTypeAttributeDto.newValues.length
        ) {
          throw new BadRequestException('Нельзя остаить поле с типом slider пустым');
        }
        const isNewValid = updateProductTypeAttributeDto.newValues.every(v => typeof v === 'number');
        const isOldValid = updateProductTypeAttributeDto.oldValues.every(v => typeof v === 'number');

        if (!isNewValid || !isOldValid) {
          throw new Error('Для типо поля slider все значения должны быть числовыми');
        }
        for (const value of findProductAttribute.attributeValues) {
          const findValue = updateProductTypeAttributeDto.oldValues.find(el => el.id === value.id);
          if (findValue) {
            await queryRunner.manager.update(
              AttributeValues,
              { id: findValue.id },
              { value: findValue.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2') }
            );
            //Старым товарам заменяем значение атрибута, которому что то поменяли
            if (findValue.value !== value.value) {
              await queryRunner.manager.update(
                ProductAttributesValues,
                {
                  productAttributePropertyId: value.attributeId,
                  value: value.value
                },
                { value: findValue.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2') }
              );
            }
          } else {
            await queryRunner.manager.update(AttributeValues, { id: value.id }, { deletedAt: new Date() });
          }
        }
      } else if (
        findProductAttribute.fieldType === updateProductTypeAttributeDto.fieldType &&
        updateProductTypeAttributeDto.fieldType !== ProductFieldTypes.textArea &&
        updateProductTypeAttributeDto.fieldType !== ProductFieldTypes.input
      ) {
        if (
          !updateProductTypeAttributeDto.oldValues.length &&
          !updateProductTypeAttributeDto.newValues.length
        ) {
          throw new BadRequestException('Нельзя остаить поле с типом slider/select пустым');
        }
        for (const value of findProductAttribute.attributeValues) {
          const findValue = updateProductTypeAttributeDto.oldValues.find(el => el.id === value.id);
          if (findValue) {
            await queryRunner.manager.update(
              AttributeValues,
              { id: findValue.id },
              { value: findValue.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2') }
            );
            //Старым товарам заменяем значение атрибута, которому что то поменяли
            if (findValue.value !== value.value) {
              await queryRunner.manager.update(
                ProductAttributesValues,
                {
                  productAttributePropertyId: value.attributeId,
                  value: value.value
                },
                { value: findValue.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2') }
              );
            }
          } else {
            await queryRunner.manager.update(AttributeValues, { id: value.id }, { deletedAt: new Date() });
          }
        }
      }

      for (const value of updateProductTypeAttributeDto.newValues) {
        const createValue = queryRunner.manager.create(AttributeValues, {
          value: value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2'),
          attributeId: findProductAttribute.id
        });
        await queryRunner.manager.save(AttributeValues, createValue);
      }

      await queryRunner.manager.update(
        ProductAttributes,
        { id: attributeId },
        {
          isRequired: updateProductTypeAttributeDto.isRequired,
          isDisabled: updateProductTypeAttributeDto.isDisabled,
          title: updateProductTypeAttributeDto.title,
          fieldType: updateProductTypeAttributeDto.fieldType
        }
      );

      await queryRunner.commitTransaction();
      return { id: attributeId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог изменить характеристику у товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addProductTypeAttribute(
    productId: string,
    createProductAttributesDto: CreateProductAttributesDto
  ): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager
        .createQueryBuilder(ProductTypes, 'productTypes')
        .leftJoinAndSelect('productTypes.attributes', 'attributes', 'attributes.deletedAt IS NULL')
        //Беру все товары, если вдруг захотят какой нибудь восстановить, а я им не добавлял новые поля, тогда будет гг
        .leftJoinAndSelect('productTypes.products', 'products')
        .where('productTypes.id = :id', { id: productId })
        .andWhere('productTypes.deletedAt IS NULL')
        .getOne();
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }

      let rank = findProductType.attributes.length;
      const createAttributesId: string[] = [];
      for (const attribute of createProductAttributesDto.attributes) {
        rank += 1;
        const createAttribute = queryRunner.manager.create(ProductAttributes, {
          title: attribute.title,
          typeId: findProductType.id,
          isRequired: attribute.isRequired,
          isDisabled: attribute.isDisabled,
          fieldType: attribute.fieldType,
          rank
        });
        await queryRunner.manager.save(ProductAttributes, createAttribute);
        createAttributesId.push(createAttribute.id);
        if (
          attribute.fieldType === ProductFieldTypes.select ||
          attribute.fieldType === ProductFieldTypes.slider
        ) {
          if (!attribute.values.length)
            throw new BadRequestException('Необходимо передать массив значений поля');
          for (const value of attribute.values) {
            const createValue = queryRunner.manager.create(AttributeValues, {
              value: value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2'),
              attributeId: createAttribute.id
            });
            await queryRunner.manager.save(AttributeValues, createValue);
          }
        } else {
          const createValue = queryRunner.manager.create(AttributeValues, {
            value: '',
            attributeId: createAttribute.id
          });
          await queryRunner.manager.save(AttributeValues, createValue);
        }
      }
      //Для всех старых товаров добавляем новый атрибут с пустым значением
      for (const product of findProductType.products) {
        for (const attribute of createAttributesId) {
          const createAttributeValue = queryRunner.manager.create(ProductAttributesValues, {
            productId: product.id,
            value: '',
            productAttributePropertyId: attribute
          });
          await queryRunner.manager.save(ProductAttributesValues, createAttributeValue);
        }
      }

      await queryRunner.commitTransaction();
      return { id: productId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог добавить характеристику к товару');
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
        .leftJoinAndSelect('productTypes.attributes', 'attributes', 'attributes.deletedAt IS NULL')
        .leftJoinAndSelect(
          'attributes.attributeValues',
          'attributeValues',
          'attributeValues.deletedAt is NULL'
        )
        .orderBy('attributes.rank', 'ASC')
        .where('productTypes.id = :id', { id })
        .andWhere('productTypes.deletedAt IS NULL')
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
      this.logger.error('Не смог получить инфо о типе товара');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getItem(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findProduct = await queryRunner.manager.findOne(Products, {
        where: {
          id,
          deletedAt: IsNull(),
          type: { deletedAt: IsNull(), deletedByAdminAt: IsNull() },
          productAttributeValues: {
            deletedAt: IsNull(),
            productAttributeProperty: {
              deletedAt: IsNull()
            }
          }
        },
        relations: {
          type: true,
          productAttributeValues: {
            productAttributeProperty: true
          }
        }
      });
      if (!findProduct) {
        throw new NotFoundException('Товар не найден');
      }
      return GetProductDto.mapModel(findProduct);
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить товар');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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

        filteredIdsQuery.andWhere(
          new Brackets(qb => {
            attributes.forEach((attr, index) => {
              qb.orWhere(`(pap.title = :title${index} AND pav.value ILIKE :value${index})`, {
                [`title${index}`]: attr.title,
                [`value${index}`]: `%${attr.value}%`
              });
            });
          })
        );

        filteredIdsQuery.groupBy('products.id');

        filteredIdsQuery.having('COUNT(DISTINCT pap.title) = :attrCount', {
          attrCount: attributes.length
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
      this.logger.error('Не смог получить список товаров');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createItemFromWeb(createItemDto: CreateItemDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.checkProductAttributes(createItemDto, queryRunner);
      const createProduct = queryRunner.manager.create(Products, {
        title: createItemDto.title,
        typeId: createItemDto.typeId,
        article: createItemDto.article
      });
      await queryRunner.manager.save(Products, createProduct);
      for (const attribute of createItemDto.attributes) {
        const createProductAttributes = queryRunner.manager.create(ProductAttributesValues, {
          value: attribute.value,
          productAttributePropertyId: attribute.attributeId,
          productId: createProduct.id
        });
        await queryRunner.manager.save(ProductAttributesValues, createProductAttributes);
      }
      await queryRunner.commitTransaction();
      return { id: createProduct.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать товар');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateItemFromWeb(id: string, updateItemDto: UpdateItemDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProduct = await queryRunner.manager
        .createQueryBuilder(Products, 'product')
        .leftJoinAndSelect(
          'product.productAttributeValues',
          'productAttributeValues',
          'productAttributeValues.deletedAt IS NULL'
        )
        .where('product.id = :id', { id })
        .andWhere('product.deletedAt IS NULL')
        .getOne();
      if (!findProduct) {
        throw new NotFoundException('Товар не найден');
      }
      await this.checkProductAttributes({ typeId: findProduct.typeId, ...updateItemDto }, queryRunner);
      await queryRunner.manager.update(
        Products,
        {
          id
        },
        { title: updateItemDto.title, article: updateItemDto.article }
      );
      await queryRunner.manager.update(
        ProductAttributesValues,
        { productId: findProduct.id },
        { deletedAt: new Date() }
      );
      for (const attribute of updateItemDto.attributes) {
        const createProductAttributes = queryRunner.manager.create(ProductAttributesValues, {
          value: attribute.value,
          productAttributePropertyId: attribute.attributeId,
          productId: findProduct.id
        });
        await queryRunner.manager.save(ProductAttributesValues, createProductAttributes);
      }
      await queryRunner.commitTransaction();
      return { id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать товар');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkProductAttributes(createItemDto: CreateItemDto, queryRunner: QueryRunner): Promise<void> {
    const findProductType = await queryRunner.manager.findOne(ProductTypes, {
      where: {
        id: createItemDto.typeId,
        deletedAt: IsNull(),
        attributes: {
          deletedAt: IsNull(),
          attributeValues: {
            deletedAt: IsNull()
          }
        }
      },
      relations: {
        attributes: {
          attributeValues: true
        }
      }
    });
    if (!findProductType) {
      throw new NotFoundException('Не удалось найти тип продукта');
    }
    const incomingProperties = createItemDto.attributes.map(attribute => attribute.attributeId);
    //Получаем список возможных значений для материала
    const itemValues = findProductType.attributes.flatMap(attribute =>
      attribute.attributeValues.map(v => v.value)
    );
    //Сравниваем что все свойства переданы корректно
    for (const attribute of findProductType.attributes) {
      const compareProperties = incomingProperties.find(
        incomingProperty => incomingProperty === attribute.id
      );
      if (!compareProperties && attribute.isRequired) {
        throw new BadRequestException('Не совпадают атрибуты доступные товару');
      }
    }
    //Сравниваем что все значения свойств переданы корректно
    const selectPropertyValues = findProductType.attributes.reduce((acc, attribute) => {
      if (attribute.fieldType === 'select') {
        const findSelectProperties = createItemDto.attributes.find(
          attributeDto => attributeDto.attributeId === attribute.id
        );
        if (findSelectProperties) {
          acc.push(findSelectProperties.value.trim().replace(/^(\d+)\.(\d+)$/, '$1,$2'));
        }
      }
      return acc;
    }, []);
    for (const value of selectPropertyValues) {
      const compareValues = itemValues.find(incomingValue => incomingValue === value);
      if (!compareValues) {
        throw new BadRequestException('Не совпадают значения доступные товару');
      }
    }
    return;
  }

  async checkProductAttributesByTitle(
    checkAttributesByTitle: CheckAttributesByTitle,
    queryRunner: QueryRunner,
    index: string
  ): Promise<{ id: string; value: string }[]> {
    const findProductType = await queryRunner.manager.findOne(ProductTypes, {
      where: {
        id: checkAttributesByTitle.typeId,
        deletedAt: IsNull(),
        attributes: {
          deletedAt: IsNull(),
          attributeValues: {
            deletedAt: IsNull()
          }
        }
      },
      relations: {
        attributes: {
          attributeValues: true
        }
      }
    });
    if (!findProductType) {
      throw new NotFoundException('Не удалось найти тип продукта');
    }
    //Получаем список доступных свойств по названию
    const incomingProperties = checkAttributesByTitle.attributes.map(attribute => attribute.title);
    //Получаем список возможных значений для материала
    const itemValues = findProductType.attributes.flatMap(attribute =>
      attribute.attributeValues.map(v => v.value)
    );
    //Сравниваем что все свойства переданы корректно
    for (const attribute of findProductType.attributes) {
      const compareProperties = incomingProperties.find(
        incomingProperty => incomingProperty === attribute.title
      );
      if (!compareProperties && attribute.isRequired) {
        throw new BadRequestException(
          `Не совпадают атрибуты доступные товару, характеристика ${attribute.title}, проблемная строка ${Number(index) + 1}`
        );
      }
    }
    //Сравниваем что все значения свойств переданы корректно
    //Подготавливаем список для добавления в БД
    const attributesValues: { id: string; value: string }[] = [];
    const selectPropertyValues: string[] = findProductType.attributes.reduce((acc, attribute) => {
      const findSelectProperties = checkAttributesByTitle.attributes.find(
        attributeDto => attributeDto.title === attribute.title
      );
      if (!findSelectProperties && attribute.isRequired) {
        throw new BadRequestException(`Не найден атрибут ${attribute.title}`);
      }
      if (!findSelectProperties && !attribute.isRequired) {
        return acc;
      }
      if (!findSelectProperties.value) {
        throw new BadRequestException(`Поле ${attribute.title} не может быть пустым`);
      }
      if (attribute.fieldType === 'select') {
        acc.push(findSelectProperties.value);
        attributesValues.push({
          id: attribute.id,
          value: findSelectProperties.value
        });
      } else {
        attributesValues.push({
          id: attribute.id,
          value: findSelectProperties.value
        });
      }
      return acc;
    }, []);
    for (const value of selectPropertyValues) {
      const compareValues = itemValues.find(incomingValue => incomingValue === value);
      if (!compareValues) {
        throw new BadRequestException(
          `Не совпадают значения доступные товару, строка ${Number(index) + 1}, значение ${value}`
        );
      }
    }
    return attributesValues;
  }

  async deleteItem(user: JwtPayload, id: string): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findItem = await queryRunner.manager.findOne(Products, {
        where: {
          id,
          deletedAt: IsNull()
        }
      });
      if (!findItem) {
        throw new NotFoundException('Товар не найден');
      }
      const findProductAssemblies = await queryRunner.manager.find(ProductsAssemblies, {
        where: {
          productId: id,
          deletedAt: IsNull()
        }
      });
      if (findProductAssemblies.length) {
        throw new ConflictException('Товар невозможно удалить, он участвует в сборке');
      }
      await queryRunner.manager.update(Products, { id }, { deletedAt: new Date() });
      await queryRunner.manager.update(ProductAttributesValues, { productId: id }, { deletedAt: new Date() });
      await queryRunner.commitTransaction();
      return { id: findItem.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог удалить товар');
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
        .leftJoinAndSelect('products.productAttributeValues', 'productAttributeValues')
        .leftJoinAndSelect('productAttributeValues.productAttributeProperty', 'productAttributeProperty')
        .where('type.id = :productTypeId', { productTypeId: productTypeId })
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

  async uploadExcelWithItems(user: JwtPayload, file: Express.Multer.File, uploadFileDto: UploadFileDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Нет доступа');
      }
      const findProductType = await queryRunner.manager.findOne(ProductTypes, {
        where: {
          id: uploadFileDto.productTypeId,
          deletedAt: IsNull()
        }
      });
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      const fileInfo = read(file.buffer);
      const productsData = utils.sheet_to_json(fileInfo.Sheets[fileInfo.SheetNames[0]], { raw: false });
      const mappedProducts = productsData.map((product, index) => ({
        title: String(index + 1),
        attributes: Object.entries(product).map(([column, value]) => ({
          title: column.trim(),
          value: String(String(value).trim()).replace(/^(\d+)\.(\d+)$/, '$1,$2')
        }))
      }));
      for (const product of mappedProducts) {
        const findTitle = product.attributes.find(el => el.title === 'Наименование');
        if (!findTitle) {
          throw new NotFoundException('Не найдено наименование');
        }
        const findArticle = product.attributes.find(el => el.title === 'Артикул');
        if (!findArticle) {
          throw new NotFoundException('Не найден артикул');
        }
        const result = await this.checkProductAttributesByTitle(
          {
            typeId: uploadFileDto.productTypeId,
            attributes: product.attributes
          },
          queryRunner,
          product.title
        );
        const createProduct = queryRunner.manager.create(Products, {
          title: findTitle.value,
          typeId: uploadFileDto.productTypeId,
          article: findArticle.value
        });
        await queryRunner.manager.save(Products, createProduct);
        for (const attribute of result) {
          const createProductAttributes = queryRunner.manager.create(ProductAttributesValues, {
            value: attribute.value,
            productAttributePropertyId: attribute.id,
            productId: createProduct.id
          });
          await queryRunner.manager.save(ProductAttributesValues, createProductAttributes);
        }
      }
      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог спарсить файл');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
