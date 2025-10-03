export interface GetUsersList {
  id: string;
  name: string;
  surname: string;
  patronymic: string;
  role: string;
  isActive: boolean;
  createdAt: Date | string
  email: string;
}
