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
import { DataSource, QueryRunner } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductTypes } from './entities/product-types.entity';
import { GetProductTypesDto } from './dto/get-product-types.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { ProductAttributesValues } from './entities/product-attributes-values.entity';
import { GetProductDto } from './dto/get-product.dto';
import { LoggerService } from '../logger/logger.service';
import { CreateAssemblyDto } from './dto/create-assembly.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { Assemblies } from './entities/assemblies.entity';
import { ProductsAssemblies } from './entities/products-assemblies.entity';

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

  async createItemFromWeb(createItemDto: CreateItemDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.checkProductAttributes(createItemDto, queryRunner);
      const createProduct = queryRunner.manager.create(Products, {
        title: 'Какой то товар',
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

  async createAssembly(user: JwtPayload, createAssemblyDto: CreateAssemblyDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createAssembly = queryRunner.manager.create(Assemblies, {
        article: 'Какой то артикул'
      });
      await queryRunner.manager.save(Assemblies, createAssembly);
      for (const product of createAssemblyDto.products) {
        const findProduct = await queryRunner.manager.findOne(Products, {
          where: {
            id: product.id
          }
        });
        if (!findProduct) {
          throw new NotFoundException('Товар не найден');
        }
        //@Todo сделать обработку, чтобы были только уникальные объекты в products
        const createRelationship = queryRunner.manager.create(ProductsAssemblies, {
          productId: findProduct.id,
          assemblyId: createAssembly.id,
          quantity: product.quantity
        });
        await queryRunner.manager.insert(ProductsAssemblies, createRelationship);
      }
      //@Todo в 1 сборке нельзя больше 1 привода Bad Requests
      await queryRunner.commitTransaction();
      return { id: createAssembly.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать сборку');
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
      const mappedProducts: { title: string; attributes: { column: string; value: string }[] }[] = [];
      let i = 0;
      for (const product of productsData) {
        i++;
        mappedProducts.push({
          title: String(i),
          attributes: []
        });
        for (const [column, value] of Object.entries(product)) {
          const findProduct = mappedProducts.find(el => el.title === String(i));
          findProduct.attributes.push({
            column,
            value
          });
        }
      }
      console.log(mappedProducts);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать сборку');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
