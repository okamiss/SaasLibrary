import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CompanyCreateInput) {
    return this.prisma.company.create({ data });
  }

  findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id }
    });
  }
}
