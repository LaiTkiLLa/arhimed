import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { DataSource } from 'typeorm';
import { Users } from '../users/entities/users.entity';
import { LoginResponse } from './interfaces/login-response.interface';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private logger: Logger = new Logger(AuthService.name);

  async sendEmailCode(sendEmailCodeDto: SendEmailCodeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const findUser = await queryRunner.manager.findOne(Users, {
        where: {
          email: sendEmailCodeDto.email
        }
      });
      if (!findUser) throw new NotFoundException('Проверьте email');
      if (!findUser.isActive) throw new ForbiddenException('Профиль заблокирован');
      if (!findUser.emailVerified) throw new ForbiddenException('Email не подтвержден');
      const findCode = await this.cacheManager.get(`${findUser.email}_login_email_code`);
      if (findCode) {
        const codeTtl = await this.cacheManager.ttl(`${findUser.email}_login_email_code`);
        const leftTime = codeTtl - Date.now();
        if (Math.ceil(leftTime/1000) > 60) throw new BadRequestException('Проверьте код на почте');
      }
      const generateCode = Math.round(Math.random() * (99_999 - 10_000) + 10_000);
      await this.cacheManager.set(`${findUser.email}_login_email_code`, generateCode, 120_000);
      // await this.mailService.sendMailCode(findUser.email, generateCode);
      return;
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог отправить email код');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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
      if (!findUser) throw new NotFoundException('Проверьте email');
      if (!findUser.isActive) throw new ForbiddenException('Профиль заблокирован');
      if (!findUser.emailVerified) throw new ForbiddenException('Email не подтвержден');
      const findCode = await this.cacheManager.get(`${findUser.email}_login_email_code`);
      if (!findCode) throw new NotFoundException('Код не найден');
      if (findCode !== Number(loginDto.code)) throw new BadRequestException('Неверный код');
      const token = await this.generateToken({
        id: findUser.id,
        role: findUser.role.title
      });
      await queryRunner.manager.update(Users, { id: findUser.id }, { lastLogin: new Date() });
      await this.cacheManager.del(`${findUser.email}_login_email_code`);
      return {
        id: findUser.id,
        token,
        role: findUser.role.title
      };
    } catch (error) {
      if (error.status === 400 || 403 || 404) {
        throw error;
      }
      this.logger.error(error);
      this.logger.error('Не смог авторизоваться по email');
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
