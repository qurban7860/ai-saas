import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prismaClientSingleton = () => {
  // Prevent Prisma from initializing in non-Node environments (like the browser or Edge)
  if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "edge") {
    return null as unknown as PrismaClient;
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3("file:./dev.db"),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });
};



declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
