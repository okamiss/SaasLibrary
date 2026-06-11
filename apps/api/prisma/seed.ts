import { PrismaClient, UserRole } from '@prisma/client';

process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/ai_company_assistant';

const prisma = new PrismaClient();

async function main() {
  const alpha = await prisma.company.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Alpha Company'
    }
  });

  const beta = await prisma.company.upsert({
    where: { id: '22222222-2222-4222-8222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Beta Company'
    }
  });

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: alpha.id,
        email: 'admin@alpha.example'
      }
    },
    update: {},
    create: {
      companyId: alpha.id,
      name: 'Alpha Admin',
      email: 'admin@alpha.example',
      passwordHash: 'phase-2-seed-placeholder',
      role: UserRole.ADMIN
    }
  });

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: beta.id,
        email: 'admin@beta.example'
      }
    },
    update: {},
    create: {
      companyId: beta.id,
      name: 'Beta Admin',
      email: 'admin@beta.example',
      passwordHash: 'phase-2-seed-placeholder',
      role: UserRole.ADMIN
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
