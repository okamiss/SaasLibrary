import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ChatLogUncheckedCreateInput) {
    return this.prisma.chatLog.create({
      data
    });
  }

  findManyByCompany(companyId: string) {
    return this.prisma.chatLog.findMany({
      where: {
        companyId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
  }
}
