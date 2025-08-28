import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateAssemblyDto } from './dto/create-assembly.dto';
import { Assemblies } from './entities/assemblies.entity';
import { Products } from '../items/entities/products.entity';
import { ProductsAssemblies } from './entities/products-assemblies.entity';
import { DataSource } from 'typeorm';
import * as querystring from 'node:querystring';

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

  async getAssembliesList() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
    } catch (error) {
      await queryRunner.rollbackTransaction();
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
