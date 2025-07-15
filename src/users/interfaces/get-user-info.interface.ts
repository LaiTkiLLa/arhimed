import { UserRoles } from '../../common/enums/roles.enum';

export interface GetUserInfoResponse {
  id: number;
  role: UserRoles;
}
