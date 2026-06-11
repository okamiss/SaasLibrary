import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WecomRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.WecomBotUncheckedCreateInput) {
    return this.prisma.wecomBot.create({ data });
  }

  findManyByCompany(companyId: string) {
    return this.prisma.wecomBot.findMany({
      where: {
        companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  findByCompanyAndId(companyId: string, id: string) {
    return this.prisma.wecomBot.findUnique({
      where: {
        id_companyId: {
          id,
          companyId
        }
      }
    });
  }

  deleteByCompanyAndId(companyId: string, id: string) {
    return this.prisma.wecomBot.delete({
      where: {
        id_companyId: {
          id,
          companyId
        }
      }
    });
  }
}
