import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    // Optimisations pour Vercel / serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Éviter de créer trop de connexions en dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
