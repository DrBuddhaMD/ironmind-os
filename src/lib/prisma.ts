import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path';
import Database from 'better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prevent multiple instances in development
if (!globalForPrisma.prisma) {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    console.log(`[Prisma] Initializing database at: ${dbPath}`);
    const adapter = new PrismaBetterSqlite3({
        url: `file:${dbPath}`
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
