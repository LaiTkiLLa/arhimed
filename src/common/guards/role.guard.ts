import { CanActivate, ExecutionContext, ForbiddenException, Injectable, mixin, Type } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRoles } from '../enums/roles.enum';

export const RoleGuard = (...roles: UserRoles[]): Type<CanActivate> => {
  @Injectable()
  class RoleGuardVerification implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user: JwtPayload = request.user;
      const findRole = roles.find(role => role === user.role);
      if (findRole) {
        return true;
      }
      throw new ForbiddenException('Данный запрос недоступен для роли');
    }
  }
  return mixin(RoleGuardVerification);
};
