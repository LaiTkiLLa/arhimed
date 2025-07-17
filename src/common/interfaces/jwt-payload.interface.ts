import { UserRoles } from '../enums/roles.enum';

export interface JwtPayload {
  uuid: string;
  role: UserRoles;
}
