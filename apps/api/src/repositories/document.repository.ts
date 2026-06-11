import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentUncheckedCreateInput) {
    return this.prisma.document.create({ data });
  }

  findManyByCompany(companyId: string) {
    return this.prisma.document.findMany({
      where: {
        companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  findByCompanyAndId(companyId: string, id: string) {
    return this.prisma.document.findUnique({
      where: {
        id_companyId: {
          id,
          companyId
        }
      }
    });
  }

  markUploadedForReparse(companyId: string, id: string) {
    return this.prisma.document.update({
      where: {
        id_companyId: {
          id,
          companyId
        }
      },
      data: {
        status: DocumentStatus.UPLOADED,
        errorMessage: null
      }
    });
  }

  markParsing(companyId: string, id: string) {
    return this.prisma.document.update({
      where: {
        id_companyId: {
          id,
          companyId
        }
      },
      data: {
        status: DocumentStatus.PARSING,
        errorMessage: null
      }
    });
  }

  markCompleted(companyId: string, id: string) {
    return this.prisma.document.update({
      where: {
        id_companyId: {
          id,
          companyId
        }
      },
      data: {
        status: DocumentStatus.COMPLETED,
        errorMessage: null
      }
    });
  }

  markFailed(companyId: string, id: string, errorMessage: string) {
    return this.prisma.document.update({
      where: {
        id_companyId: {
          id,
          companyId
        }
      },
      data: {
        status: DocumentStatus.FAILED,
        errorMessage
      }
    });
  }

  deleteWithChunks(companyId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({
        where: {
          companyId,
          documentId: id
        }
      });

      return tx.document.delete({
        where: {
          id_companyId: {
            id,
            companyId
          }
        }
      });
    });
  }
}
