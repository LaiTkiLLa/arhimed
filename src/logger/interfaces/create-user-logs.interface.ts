import { Users } from '../../users/entities/users.entity';

export interface CreateUserLogs {
  user: Users;
  method: string;
  body: object;
}
