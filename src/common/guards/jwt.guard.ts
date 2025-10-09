import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { DataSource } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      if (
        request.route.path === '/auth/login-by-email' ||
        request.route.path === '/users/confirm-email' ||
        request.route.path === '/auth/email-code' ||
        request.route.path.includes('public')
      ) {
        return true;
      }
      const token = this.extractTokenFromHeader(request);
      if (!token) throw new ForbiddenException('Отсутвует токен');
      let jwtPayload: JwtPayload;
      try {
        jwtPayload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('jwt.secret'),
          ignoreExpiration: false
        });
      } catch {
        throw new UnauthorizedException('Некорректный токен');
      }
      const findUser = await this.dataSource.manager.findOne(Users, {
        where: {
          id: jwtPayload.id
        },
        relations: { role: true }
      });
      if (!findUser) throw new ForbiddenException('Нет доступа');
      if (!findUser.isActive) throw new ForbiddenException('Профиль заблокирован');
      request.user = {
        id: findUser.id,
        role: findUser.role.title
      };
      return true;
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException('Токен просрочен');
      }
      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
