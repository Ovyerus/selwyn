/* eslint-disable @typescript-eslint/no-namespace, import/no-mutable-exports, prefer-destructuring */
import { PrismaClient } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface Global {
      db?: PrismaClient;
    }
  }
}

let db: PrismaClient;

if (process.env.NODE_ENV === "production") db = new PrismaClient();
else {
  // Attached to global in development to prevent db connection limit.
  if (!global.db) global.db = new PrismaClient();
  db = global.db;
}

export default db;
