import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['TEST_DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/ulica_test?schema=public',
    },
  },
});

export { prisma };
