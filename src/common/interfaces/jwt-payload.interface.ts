import { UserRoles } from '../enums/roles.enum';

export interface JwtPayload {
  id: string;
  role: UserRoles;
}
