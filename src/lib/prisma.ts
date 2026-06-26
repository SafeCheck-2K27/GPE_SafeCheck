import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 ships a Rust-free client (query compiler), so a driver adapter is
// required to connect. `PrismaPg` uses the `pg` driver under the hood.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting database connections (Next.js re-evaluates modules on each reload).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
