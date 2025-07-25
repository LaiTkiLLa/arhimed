import { UserRoles } from "../../common/enums/roles.enum";
import { LoginResponse } from "../interfaces/login-response.interface";

export const LoginByEmailResponse: LoginResponse = {
  id: 'f2a4cd15-16bd-4b32-8025-94da716984af',
  role: UserRoles.admin,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjOTMzYTJlLWI3ODYtNGIxOS04ZDI3LTUyZjE0ZTdjNjcxZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzExMTIyMywiZXhwIjoxNzUzMTEyMTIzfQ.raw6dTBi8ucWU5Wu_eusH78GDEA8z9dr711onz74iJk'
}