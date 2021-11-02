/* eslint-disable @typescript-eslint/no-namespace, import/no-mutable-exports, prefer-destructuring */
import { PrismaClient } from ".prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}
let db: PrismaClient;

if (process.env.NODE_ENV === "production") db = new PrismaClient();
else {
  // Attached to global in development to prevent db connection limit.
  if (!global.__db) global.__db = new PrismaClient();
  db = global.__db;
}

export default db;
