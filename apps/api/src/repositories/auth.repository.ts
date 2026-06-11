import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface RegisterCompanyWithAdminInput {
  companyName: string;
  admin: {
    name: string;
    email: string;
    passwordHash: string;
  };
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  registerCompanyWithAdmin(input: RegisterCompanyWithAdminInput) {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: input.companyName
        }
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: input.admin.name,
          email: input.admin.email,
          passwordHash: input.admin.passwordHash,
          role: UserRole.ADMIN
        }
      });

      return {
        company,
        user
      };
    });
  }
}
