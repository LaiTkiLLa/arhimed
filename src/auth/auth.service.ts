import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { DataSource } from 'typeorm';
import { Users } from '../users/entities/users.entity';
import { LoginResponse } from './interfaces/login-response.interface';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
//
@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}
  //
  //   async login(loginDto: LoginDto): Promise<LoginResponse> {
  //     const queryRunner = this.dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     try {
  //       const findUser = await queryRunner.manager.findOne(Users, {
  //         where: {
  //           login: loginDto.username,
  //         },
  //         relations: { role: true },
  //       });
  //       if (!findUser) {
  //         throw new ForbiddenException('Проверьте логин');
  //       }
  //       const hashedPassword = await bcrypt.compare(
  //         loginDto.password,
  //         findUser.password,
  //       );
  //       if (!hashedPassword) {
  //         throw new ForbiddenException('Проверьте пароль');
  //       }
  //       const token = await this.generateToken({
  //         id: findUser.id,
  //         login: findUser.login,
  //         role: findUser.role.title,
  //       });
  //       return {
  //         id: findUser.id,
  //         token,
  //         role: findUser.role.title,
  //       };
  //     } catch (error) {
  //       throw error;
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   }
  //
  //   private async generateToken(accessPayload: JwtPayload): Promise<string> {
  //     const { id, login, role } = accessPayload;
  //     return await this.genAccessJwt({
  //       id,
  //       login,
  //       role,
  //     });
  //   }
  //
  //   private genAccessJwt(payload: JwtPayload): Promise<string> {
  //     return this.jwtService.signAsync(payload, {
  //       secret: this.configService.get<string>('jwt.secret'),
  //       expiresIn: this.configService.get<string>('jwt.signOptions.expiresIn'),
  //     });
}
// }
