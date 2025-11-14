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
import { Brackets, DataSource, QueryRunner } from 'typeorm';
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
      const lastRank = await queryRunner.manager.count(ProductTypes);
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
        //@Todo нужно сделать логику, если инпут то только 1 поле создавать в БД
        //ЕСли селект, то брать все уже
        await queryRunner.manager.save(ProductAttributes, createAttribute);
        for (const value of attribute.values) {
          const createValue = queryRunner.manager.create(AttributeValues, {
            value,
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
          id
        },
        relations: {
          attributes: true
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
      //@Todo если удалять атрибуты, которые уже используются???
      for (const attribute of findProductType.attributes) {
        await queryRunner.manager.delete(ProductAttributes, attribute.id);
      }
      let rank = 1;
      for (const attribute of updateProductTypeDto.attributes) {
        const createAttribute = queryRunner.manager.create(ProductAttributes, {
          title: attribute.title,
          typeId: findProductType.id,
          isRequired: attribute.isRequired,
          isDisabled: attribute.isDisabled,
          fieldType: attribute.fieldType,
          rank
        });
        //@Todo нужно сделать логику, если инпут то только 1 поле создавать в БД
        //ЕСли селект, то брать все уже
        await queryRunner.manager.save(ProductAttributes, createAttribute);
        for (const value of attribute.values) {
          const createValue = queryRunner.manager.create(AttributeValues, {
            value,
            attributeId: createAttribute.id
          });
          await queryRunner.manager.save(AttributeValues, createValue);
        }
        rank++;
      }
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

  async deleteProductTypeAttribute(productId: string, attributeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findProductType = await queryRunner.manager.findOne(ProductTypes, {
        where: {
          id: productId
        }
      });
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      const findProductAttribute = await queryRunner.manager.findOne(ProductAttributes, {
        where: {
          id: attributeId,
          typeId: productId
        },
        relations: {
          productAttributeValues: true
        }
      });
      if (!findProductAttribute) {
        throw new NotFoundException('Характеристика не найдена');
      }
      if (findProductAttribute.productAttributeValues.length) {
        throw new BadRequestException('За данной характеристикой уже закреплены товары');
      }
      //Обновление рангов всем другим характеристикам
      const currentRank = findProductAttribute.rank;
      const allProductAttributes = await queryRunner.manager.find(ProductAttributes, {
        where: {
          typeId: productId
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
      await queryRunner.manager.delete(ProductAttributes, findProductAttribute.id);
      await queryRunner.commitTransaction();
      return attributeId;
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
      const findProductType = await queryRunner.manager.findOne(ProductTypes, {
        where: {
          id: productId
        },
        relations: {
          attributes: true
        }
      });
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      const findProductAttribute = await queryRunner.manager.findOne(ProductAttributes, {
        where: {
          id: attributeId,
          typeId: productId
        },
        relations: {
          productAttributeValues: true,
          attributeValues: true
        }
      });
      if (!findProductAttribute) {
        throw new NotFoundException('Характеристика не найдена');
      }

      if (findProductAttribute.productAttributeValues.length) {
        throw new BadRequestException('За данной характеристикой уже закреплены товары');
      }

      if (findProductAttribute.fieldType !== updateProductTypeAttributeDto.fieldType) {
        throw new BadRequestException('Невозможно изменить тип поля');
      }

      //Найденные характеристики, чтобы удалить потом те, которые не нашлись
      const foundedValues: string[] = [];

      for (const values of findProductAttribute.attributeValues) {
        const findValue = updateProductTypeAttributeDto.oldValues.find(el => el.id === values.id);
        if (findValue) {
          foundedValues.push(findValue.id);
          await queryRunner.manager.update(AttributeValues, { id: findValue.id }, { value: findValue.value });
        }
      }

      //Удаляем те, которые не нашли
      const notFoundedValues = findProductAttribute.attributeValues.filter(
        el => !foundedValues.includes(el.id)
      );

      for (const value of notFoundedValues) {
        await queryRunner.manager.delete(AttributeValues, value.id);
      }

      for (const value of updateProductTypeAttributeDto.newValues) {
        const createValue = queryRunner.manager.create(AttributeValues, {
          value,
          attributeId: findProductAttribute.id
        });
        await queryRunner.manager.save(AttributeValues, createValue);
      }

      await queryRunner.commitTransaction();
      return attributeId;
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
          id
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
        article: 'Какой то артикул'
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
      const findProduct = await queryRunner.manager.findOne(Products, {
        where: {
          id
        },
        relations: {
          productAttributeValues: true
        }
      });
      if (!findProduct) {
        throw new NotFoundException('Товар не найден');
      }
      await this.checkProductAttributes({ typeId: findProduct.typeId, ...updateItemDto }, queryRunner);
      await queryRunner.manager.update(
        Products,
        {
          id
        },
        { title: updateItemDto.title }
      );
      await queryRunner.manager.delete(ProductAttributesValues, { productId: findProduct.id });
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
        id: createItemDto.typeId
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
          acc.push(findSelectProperties.value);
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
        id: checkAttributesByTitle.typeId
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
      if (attribute.fieldType === 'select') {
        const findSelectProperties = checkAttributesByTitle.attributes.find(
          attributeDto => attributeDto.title === attribute.title
        );
        if (findSelectProperties) {
          acc.push(findSelectProperties.value);
        }
        //@Todo проверить как будет работать с инпутами и text
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
          id
        },
        relations: {
          assemblies: true
        }
      });
      if (!findItem) {
        throw new NotFoundException('Товар не найден');
      }
      if (findItem.assemblies.length) {
        throw new ConflictException('Товар невозможно удалить, он участвует в сборке');
      }
      await queryRunner.manager.delete(Products, { id });
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
          id: uploadFileDto.productTypeId
        }
      });
      if (!findProductType) {
        throw new NotFoundException('Тип товара не найден');
      }
      const fileInfo = read(file.buffer);
      const productsData = utils.sheet_to_json(fileInfo.Sheets[fileInfo.SheetNames[0]]);
      const mappedProducts = productsData.map((product, index) => ({
        title: String(index + 1),
        attributes: Object.entries(product).map(([column, value]) => ({
          title: column,
          value: String(value)
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
