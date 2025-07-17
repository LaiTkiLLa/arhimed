import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Users } from './entities/users.entity';
import { GetUserInfoResponse } from './interfaces/get-user-info.interface';
import { UserRoles } from '../common/enums/roles.enum';
import { GetUserListByCurator } from './interfaces/get-managers-list.interface';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from './entities/roles.entity';
import { GetUsersListByAdmin } from './interfaces/get-users-list-by-admin.interface';

@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}

  private logger: Logger = new Logger(UsersService.name);

  // async getUserInfo(user: JwtPayload): Promise<GetUserInfoResponse> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   try {
  //     const findUser = await queryRunner.manager.findOne(Users, {
  //       where: { id: user.id },
  //       relations: { role: true }
  //     });
  //     if (!findUser) {
  //       throw new NotFoundException('Пользователь не найден');
  //     }
  //     return { id: findUser.id, role: findUser.role.title };
  //   } catch (error) {
  //     this.logger.error(error);
  //     this.logger.error('Не смог получить данные пользователя');
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
  //
  // async getUsersListByCurator(user: JwtPayload): Promise<GetUserListByCurator[]> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   try {
  //     const findCurator = await queryRunner.manager.findOne(Users, {
  //       where: {
  //         id: user.id,
  //         role: {
  //           title: UserRoles.curator
  //         }
  //       }
  //     });
  //     if (!findCurator) {
  //       throw new NotFoundException('Пользователь не найден');
  //     }
  //     const findUsers = await queryRunner.manager.find(Users, {
  //       where: {
  //         role: {
  //           title: In([UserRoles.curator, UserRoles.manager])
  //         }
  //       }
  //     });
  //     return findUsers.map(user => ({
  //       id: user.id,
  //       name: user.name,
  //       surname: user.surname,
  //       patronymic: user.patronymic
  //     }));
  //   } catch (error) {
  //     this.logger.error(error);
  //     this.logger.error('Не смог получить список пользователей куратором');
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
  //
  // async getUsersList(): Promise<GetUsersListByAdmin[]> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   try {
  //     const findUsers = await queryRunner.manager.find(Users, {
  //       relations: {
  //         role: true
  //       },
  //       order: { id: 'DESC' }
  //     });
  //     return findUsers.map(user => {
  //       return {
  //         id: user.id,
  //         name: user.name,
  //         surname: user.surname,
  //         patronymic: user.patronymic,
  //         role: user.role.title,
  //         isBlocked: user.isBlocked
  //       };
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     this.logger.error('Не смог получить список пользователей');
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
  //
  async createUser(createUserDto: CreateUserDto, user: JwtPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findAdmin = await queryRunner.manager.findOne(Users, {
        where: {
          id: user.uuid,
          role: {
            title: UserRoles.admin
          }
        },
        relations: {
          role: true
        }
      });
      if (!findAdmin) {
        throw new ForbiddenException('Нет доступа');
      }
      // const findRole = await queryRunner.manager.findOne(Roles, {
      //   where: { id: createUserDto.roleId }
      // });
      // if (!findRole) {
      //   throw new NotFoundException('Роль не найдена');
      // }
      const userExist = await queryRunner.manager
        .createQueryBuilder(Users, 'users')
        .where('users.phone = :phone', { phone: createUserDto.phone })
        .orWhere('users.email = :email', { email: createUserDto.email })
        .getOne();
      if (userExist) {
        throw new BadRequestException('Пользователь с такими данными уже существует');
      }
      const createUser = await queryRunner.manager.create(Users, {
        phone: createUserDto.phone,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastname,
        middleName: createUserDto.middleName
      });
      await queryRunner.manager.insert(Users, createUser);
      return { id: createUser.id };
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог создать пользователя');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  //
  // async blockUser(id: number, user: JwtPayload) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   try {
  //     const findAdmin = await queryRunner.manager.findOne(Users, {
  //       where: {
  //         id: user.id,
  //         role: {
  //           title: UserRoles.admin
  //         }
  //       },
  //       relations: {
  //         role: true
  //       }
  //     });
  //     if (!findAdmin) {
  //       throw new ForbiddenException('Нет доступа');
  //     }
  //     const findUser = await queryRunner.manager.findOne(Users, {
  //       where: {
  //         id
  //       }
  //     });
  //     if (!findUser) {
  //       throw new NotFoundException('Пользователь не найден');
  //     }
  //     if (findUser.isBlocked) {
  //       await queryRunner.manager.update(
  //         Users,
  //         { id: findUser.id },
  //         {
  //           isBlocked: false
  //         }
  //       );
  //     } else {
  //       await queryRunner.manager.update(
  //         Users,
  //         { id: findUser.id },
  //         {
  //           isBlocked: true
  //         }
  //       );
  //     }
  //     return { id };
  //   } catch (error) {
  //     this.logger.error(error);
  //     this.logger.error('Не смог создать пользователя');
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
