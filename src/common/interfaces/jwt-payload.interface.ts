import { UserRoles } from '../enums/roles.enum';

export interface JwtPayload {
  id: number;
  login: string
  role: UserRoles;
}
