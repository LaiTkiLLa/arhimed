import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Users } from './entities/users.entity';
import { UserRoles } from '../common/enums/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from './entities/roles.entity';
import { MailService } from '../mail/mail.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    private mailService: MailService
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
        .getOne();
      if (userExist) {
        throw new BadRequestException('Пользователь с такими данными уже существует');
      }
      const password = 'QQ66yy@@';
      const saltOrRounds = 10;
      const salt = await bcrypt.genSalt(saltOrRounds);
      const hash = await bcrypt.hash(password, salt);
      const createUser = await queryRunner.manager.create(Users, {
        phone: createUserDto.phone,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastname,
        middleName: createUserDto.middleName,
        email: createUserDto.email,
        isActive: true
      });
      await queryRunner.manager.insert(Users, createUser);
      await this.mailService.sendVerificationLink(createUserDto.email, createUser.id);
      return { id: createUser.id };
    } catch (error) {
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
      return { id: findUser.id };
    } catch (error) {
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
