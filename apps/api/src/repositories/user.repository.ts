import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserUncheckedCreateInput) {
    return this.prisma.user.create({ data });
  }

  findById(companyId: string, id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        companyId
      }
    });
  }

  findByEmail(companyId: string, email: string) {
    return this.prisma.user.findFirst({
      where: {
        companyId,
        email
      }
    });
  }
}
