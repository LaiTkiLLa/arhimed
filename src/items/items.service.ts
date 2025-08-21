import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { read, utils } from 'xlsx';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { DataSource } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductTypes } from './entities/product-types.entity';
import { GetProductTypesDto } from './dto/get-product-types.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { ProductAttributesValues } from './entities/product-attributes-values.entity';
import { GetProductDto } from './dto/get-product.dto';

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

  async createItem(createItemDto: CreateItemDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
      const createProduct = queryRunner.manager.create(Products, {
        title: 'Какой то товар',
        typeId: findProductType.id
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
