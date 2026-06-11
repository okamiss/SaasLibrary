import { UserRole } from '@prisma/client';

export interface CurrentUser {
  id: string;
  companyId: string;
  email: string;
  role: UserRole | string;
}
