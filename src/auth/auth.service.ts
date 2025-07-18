import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { DataSource } from 'typeorm';
import { Users } from '../users/entities/users.entity';
import { LoginResponse } from './interfaces/login-response.interface';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findUser = await queryRunner.manager.findOne(Users, {
        where: {
          email: loginDto.email
        },
        relations: { role: true }
      });
      if (!findUser) {
        throw new ForbiddenException('Проверьте email');
      }
      if (!findUser.isActive) {
        throw new ForbiddenException('Профиль заблокирован');
      }
      if (!findUser.emailVerified) {
        throw new ForbiddenException('Email Не подтвержден');
      }

      const token = await this.generateToken({
        id: findUser.id,
        role: findUser.role.title
      });
      return {
        id: findUser.id,
        token,
        role: findUser.role.title
      };
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateToken(accessPayload: JwtPayload): Promise<string> {
    const { id, role } = accessPayload;
    return await this.genAccessJwt({
      id,
      role
    });
  }

  private genAccessJwt(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.signOptions.expiresIn')
    });
  }
}
