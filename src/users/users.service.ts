import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { Brackets, DataSource } from 'typeorm';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Users } from './entities/users.entity';
import { UserRoles } from '../common/enums/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from './entities/roles.entity';
import { MailService } from '../mail/mail.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetUsersList } from './interfaces/get-users-list.interface';
import { GetUsersListDto } from './dto/get-users-list.dto';
import { GetUsersStatistic } from './interfaces/get-users-statistic.interface';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    private mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

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

  async getUsersList(getUsersListDto: GetUsersListDto): Promise<GetUsersList[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const queryBuilder = queryRunner.manager
        .createQueryBuilder(Users, 'users')
        .leftJoinAndSelect('users.role', 'role');
      if (getUsersListDto.roleId) {
        queryBuilder.andWhere('users.roleId = :roleId', { roleId: getUsersListDto.roleId });
      }
      if (getUsersListDto.isActive !== undefined && getUsersListDto.isActive !== null) {
        queryBuilder.andWhere('users.isActive = :isActive', { isActive: getUsersListDto.isActive });
      }
      if (getUsersListDto.searchString) {
        const searchString = `%${getUsersListDto.searchString}%`;
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('users.firstName ILIKE :searchString', { searchString }).orWhere(
              'users.email ILIKE :searchString',
              {
                searchString
              }
            );
          })
        );
      }
      const findUsers = await queryBuilder.take(getUsersListDto.limit).skip(getUsersListDto.offset).getMany();
      return findUsers.map(user => {
        return {
          id: user.id,
          name: user.firstName,
          surname: user.lastName,
          patronymic: user.middleName,
          role: user.role.title,
          isActive: user.isActive,
          createdAt: user.createdAt,
          email: user.email
        };
      });
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог получить список пользователей');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUsersStatistic(): Promise<GetUsersStatistic> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const allUsers = await queryRunner.manager.count(Users);
      const activeUsers = await queryRunner.manager.count(Users, {
        where: {
          isActive: true
        }
      });
      const adminUsers = await queryRunner.manager.count(Users, {
        where: {
          role: {
            title: UserRoles.admin
          }
        }
      });
      return {
        all: allUsers,
        active: activeUsers,
        admins: adminUsers
      };
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог получить список пользователей');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createUser(createUserDto: CreateUserDto, user: JwtPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findAdmin = await queryRunner.manager.findOne(Users, {
        where: {
          id: user.id,
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
      const findRole = await queryRunner.manager.findOne(Roles, {
        where: { id: createUserDto.roleId }
      });
      if (!findRole) {
        throw new NotFoundException('Роль не найдена');
      }
      const userExist = await queryRunner.manager
        .createQueryBuilder(Users, 'users')
        .where('users.phone = :phone', { phone: createUserDto.phone })
        .orWhere('users.email = :email', { email: createUserDto.email })
        .orWhere("CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name) = :fullName", {
          fullName: `${createUserDto.lastName} ${createUserDto.firstName} ${createUserDto.middleName}`
        })
        .getOne();
      if (userExist) {
        throw new ConflictException('Пользователь с такими данными уже существует в системе');
      }
      const createUser = queryRunner.manager.create(Users, {
        phone: createUserDto.phone,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        middleName: createUserDto.middleName,
        email: createUserDto.email,
        isActive: true,
        roleId: findRole.id
      });
      await queryRunner.manager.insert(Users, createUser);
      //Отправка на почту ссылку для верификации аккаунта
      await this.mailService.sendVerificationLink(createUserDto.email, createUser, findRole.title);
      //5 минут на подтверждение Email
      await this.cacheManager.set(`${createUser.email}_registry`, true, 300_000);
      return { id: createUser.id };
    } catch (error) {
      if (error.status === 400 || 403 || 404 || 409) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог создать пользователя');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const decodeToken = await this.mailService.decodeMailToken(confirmEmailDto.token);
      const findUser = await queryRunner.manager.findOne(Users, {
        where: {
          email: decodeToken.email,
          id: decodeToken.id
        }
      });
      if (!findUser) {
        throw new NotFoundException('Пользователь не найден');
      }
      if (findUser.emailVerified) {
        throw new ConflictException('Email уже подтвержден');
      }
      await queryRunner.manager.update(Users, { id: findUser.id }, { emailVerified: true });
      await this.cacheManager.del(`${findUser.email}_registry`);
      return { id: findUser.id };
    } catch (error) {
      if (error.status === 400 || 403 || 404 || 409) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог подтвердить email');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(id: string, user: JwtPayload, updateUserDto: UpdateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findUser = await queryRunner.manager.findOne(Users, {
        where: {
          id
        }
      });
      if (user.role !== UserRoles.admin && id !== findUser.id) {
        throw new BadRequestException('Можно редактировать только свой профиль');
      }
      if (!findUser) {
        throw new NotFoundException('Пользователь не найден');
      }
      await queryRunner.manager.update(Users, { id }, { ...updateUserDto });
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог изменить пользователя');
    } finally {
      await queryRunner.release();
    }
  }

  async blockUser(id: string, user: JwtPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findAdmin = await queryRunner.manager.findOne(Users, {
        where: {
          id: user.id,
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
      const findUser = await queryRunner.manager.findOne(Users, {
        where: {
          id
        }
      });
      if (!findUser) {
        throw new NotFoundException('Пользователь не найден');
      }
      if (findUser.isActive) {
        await queryRunner.manager.update(
          Users,
          { id: findUser.id },
          {
            isActive: false
          }
        );
      } else {
        await queryRunner.manager.update(
          Users,
          { id: findUser.id },
          {
            isActive: true
          }
        );
      }
      return { id };
    } catch (error) {
      this.logger.error(error);
      this.logger.error('Не смог заблокировать пользователя');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
