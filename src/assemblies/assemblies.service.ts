import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateAssemblyDto } from './dto/create-assembly.dto';
import { Assemblies } from './entities/assemblies.entity';
import { Products } from '../items/entities/products.entity';
import { ProductsAssemblies } from './entities/products-assemblies.entity';
import { DataSource } from 'typeorm';
import { GetAssembliesListDto } from './dto/get-assemblies-list.dto';
import { GetAssembliesList } from './interfaces/get-assemblies-list.interface';
import { GetAssemblyInfoDto } from './dto/get-assembly-info.dto';
import { UpdateAssemblyDto } from './dto/update-assembly.dto';
import { AddProductToAssemblyDto } from './dto/add-product-to-assembly.dto';
import { UpdateProductInAssemblyDto } from './dto/update-product-in-assembly.dto';

@Injectable()
export class AssembliesService {
  constructor(private dataSource: DataSource) {}

  private logger: Logger = new Logger(AssembliesService.name);

  async createAssembly(user: JwtPayload, createAssemblyDto: CreateAssemblyDto): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createAssembly = queryRunner.manager.create(Assemblies, {
        article: createAssemblyDto.article,
        title: createAssemblyDto.title,
        description: createAssemblyDto.description
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

  async updateAssembly(id: string, user: JwtPayload, updateAssemblyDto: UpdateAssemblyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findAssembly = await queryRunner.manager.findOne(Assemblies, {
        where: {
          id
        }
      });
      if (!findAssembly) {
        throw new NotFoundException('Сборка не найдена');
      }
      await queryRunner.manager.update(
        Assemblies,
        {
          id
        },
        {
          article: updateAssemblyDto.article,
          title: updateAssemblyDto.title,
          description: updateAssemblyDto.description
        }
      );
      // for (const product of updateAssemblyDto.products) {
      //   const findProduct = await queryRunner.manager.findOne(Products, {
      //     where: {
      //       id: product.id
      //     }
      //   });
      //   if (!findProduct) {
      //     throw new NotFoundException('Товар не найден');
      //   }
      //   //@Todo сделать обработку, чтобы были только уникальные объекты в products
      //   const createRelationship = queryRunner.manager.create(ProductsAssemblies, {
      //     productId: findProduct.id,
      //     assemblyId: findAssembly.id,
      //     quantity: product.quantity
      //   });
      //   await queryRunner.manager.insert(ProductsAssemblies, createRelationship);
      // }
      //@Todo в 1 сборке нельзя больше 1 привода Bad Requests
      await queryRunner.commitTransaction();
      return { id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог обновить сборку');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addProductToAssembly(
    user: JwtPayload,
    assemblyId: string,
    addProductToAssemblyDto: AddProductToAssemblyDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findAssembly = await queryRunner.manager.findOne(Assemblies, {
        where: {
          id: assemblyId
        }
      });
      if (!findAssembly) {
        throw new NotFoundException('Сборка не найдена');
      }
      const findProduct = await queryRunner.manager.findOne(Products, {
        where: {
          id: addProductToAssemblyDto.productId
        }
      });
      if (!findProduct) {
        throw new NotFoundException('Товар не найден');
      }
      const findRelationShip = await queryRunner.manager.findOne(ProductsAssemblies, {
        where: {
          productId: findProduct.id,
          assemblyId: findAssembly.id
        }
      });
      if (findRelationShip) {
        throw new ConflictException('Товар уже существует в сборке');
      }
      const createRelationship = queryRunner.manager.create(ProductsAssemblies, {
        productId: findProduct.id,
        assemblyId: findAssembly.id,
        quantity: addProductToAssemblyDto.quantity
      });
      await queryRunner.manager.insert(ProductsAssemblies, createRelationship);
      await queryRunner.commitTransaction();
      return { id: assemblyId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог добавить товар к сборке');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProductInAssembly(
    user: JwtPayload,
    assemblyId: string,
    productId: string,
    updateProductInAssemblyDto: UpdateProductInAssemblyDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findAssembly = await queryRunner.manager.findOne(Assemblies, {
        where: {
          id: assemblyId
        }
      });
      if (!findAssembly) {
        throw new NotFoundException('Сборка не найдена');
      }
      const findProduct = await queryRunner.manager.findOne(Products, {
        where: {
          id: productId
        }
      });
      if (!findProduct) {
        throw new NotFoundException('Товар не найден');
      }
      const findRelationShip = await queryRunner.manager.findOne(ProductsAssemblies, {
        where: {
          productId: findProduct.id,
          assemblyId: findAssembly.id
        }
      });
      if (!findRelationShip) {
        throw new ConflictException('Товара нет в сборке');
      }
      await queryRunner.manager.update(
        ProductsAssemblies,
        { productId: findProduct.id, assemblyId: findAssembly.id },
        { quantity: updateProductInAssemblyDto.quantity }
      );
      await queryRunner.commitTransaction();
      return { id: assemblyId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог обновить сборку');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProductFromAssembly(user: JwtPayload, assemblyId: string, productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findAssembly = await queryRunner.manager.findOne(Assemblies, {
        where: {
          id: assemblyId
        }
      });
      if (!findAssembly) {
        throw new NotFoundException('Сборка не найдена');
      }
      const findProduct = await queryRunner.manager.findOne(Products, {
        where: {
          id: productId
        }
      });
      if (!findProduct) {
        throw new NotFoundException('Товар не найден');
      }
      const countProductsInAssembly = await queryRunner.manager.count(ProductsAssemblies, {
        where: {
          assemblyId
        }
      });
      if (countProductsInAssembly === 1) {
        throw new ConflictException('Нельзя удалить последний товар из сборки');
      }
      await queryRunner.manager.softDelete(ProductsAssemblies, {
        productId,
        assemblyId
      });
      await queryRunner.commitTransaction();
      return { id: assemblyId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог удалить товар из сборки');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAssembliesList(): Promise<GetAssembliesList> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findAssemblies = await queryRunner.manager
        .createQueryBuilder(Assemblies, 'assemblies')
        .leftJoinAndSelect('assemblies.products', 'products')
        .getManyAndCount();
      const mappedModels = GetAssembliesListDto.mapModels(findAssemblies[0]);
      return { count: findAssemblies[1], rows: mappedModels };
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить список сборок');
    } finally {
      await queryRunner.release();
    }
  }

  async getAssemblyInfo(assemblyId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findAssembly = await queryRunner.manager
        .createQueryBuilder(Assemblies, 'assemblies')
        .leftJoinAndSelect('assemblies.products', 'products')
        .leftJoinAndSelect('products.type', 'type')
        .leftJoinAndSelect('products.productAttributeValues', 'productAttributeValues')
        .leftJoinAndSelect('productAttributeValues.productAttributeProperty', 'productAttributeProperty')
        .where('assemblies.id = :assemblyId', { assemblyId })
        .andWhere('assemblies.deletedAt IS NULL')
        .andWhere(qb => {
          const subQuery = qb
            .subQuery()
            .select('pa.product_id')
            .from('products_assemblies', 'pa')
            .where('pa.deletedAt IS NULL')
            .getQuery();
          return 'products.id IN ' + subQuery;
        })
        .getOne();
      if (!findAssembly) {
        throw new NotFoundException('Сборка не найдена');
      }
      console.log('findAssembly', findAssembly);
      const findRelationships = await queryRunner.manager
        .createQueryBuilder(ProductsAssemblies, 'productsAssemblies')
        .where('productsAssemblies.assemblyId = :assemblyId', { assemblyId })
        .andWhere('productsAssemblies.deletedAt IS NULL')
        .getMany();
      console.log('findRelationships', findRelationships);
      return GetAssemblyInfoDto.mapModel(findAssembly, findRelationships);
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог получить список сборок');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAssembly(user: JwtPayload, assemblyId: string): Promise<{ id: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findAssembly = await queryRunner.manager.findOne(Assemblies, {
        where: {
          id: assemblyId
        }
      });
      if (!findAssembly) {
        throw new NotFoundException('Сборка не найдена');
      }
      await queryRunner.manager.softDelete(ProductsAssemblies, { assemblyId });
      await queryRunner.manager.softDelete(Assemblies, { id: assemblyId });
      await queryRunner.commitTransaction();
      return { id: assemblyId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог удалить сборку');
    } finally {
      await queryRunner.release();
    }
  }
}
